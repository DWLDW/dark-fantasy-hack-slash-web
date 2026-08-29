import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Weapon Group Matrix Verifier
//
// Bundles the TypeScript data tables with esbuild, then cross-checks:
//   1. Every `slot === 'weapon'` item carries a weaponGroup / weaponSuperGroup
//   2. Every runeword recipe that restricts weapon groups still has at least
//      one craftable base item in the pool (dead recipe detection)
//   3. Reports the full recipe -> allowed weapon group matrix
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TMP = path.join(ROOT, '.tmp_verify_wg.mjs');

function bundle(entry) {
  execFileSync(
    process.execPath,
    [
      path.join(ROOT, 'node_modules', 'esbuild', 'bin', 'esbuild'),
      entry,
      '--bundle',
      '--format=esm',
      '--platform=node',
      '--log-level=error',
      `--outfile=${TMP}`,
    ],
    { cwd: ROOT, stdio: 'inherit' }
  );
  const code = fs.readFileSync(TMP, 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const GROUPS = ['sword', 'axe', 'mace', 'polearm', 'bow', 'crossbow'];
const GROUP_LABEL = {
  sword: '검', axe: '도끼', mace: '철퇴',
  polearm: '장창', bow: '활', crossbow: '석궁',
};

let fail = 0;
const line = (s = '') => console.log(s);

function section(t) {
  line();
  line('='.repeat(72));
  line(t);
  line('='.repeat(72));
}

// --------------------------------------------------------------------------
section('1. 무기 베이스 아이템의 weaponGroup 태깅 현황');
// --------------------------------------------------------------------------
const itemsMod = await bundle(path.join(ROOT, 'src', 'data', 'items.ts'));
const POOL = itemsMod.GAME_ITEMS_POOL;

const weapons = POOL.filter(i => i.slot === 'weapon');
// Only `normal` rarity items can be used as runeword bases, so a missing
// weapon group there is a real bug. Uniques/sets/rares are craft-ineligible:
// report them as informational warnings only.
const craftable = weapons.filter(i => i.rarity === 'normal');
const nonCraftable = weapons.filter(i => i.rarity !== 'normal');
const missingGroup = craftable.filter(i => !i.weaponGroup);
const missingSuper = craftable.filter(i => !i.weaponSuperGroup);
const warnGroup = nonCraftable.filter(i => !i.weaponGroup);

line(`전체 아이템: ${POOL.length}개 / 무기 슬롯: ${weapons.length}개 (제작 가능 노말 ${craftable.length}개)`);

const byGroup = {};
for (const g of GROUPS) byGroup[g] = craftable.filter(i => i.weaponGroup === g).length;
line(`노말 베이스 무기군 분포: ${GROUPS.map(g => `${GROUP_LABEL[g]} ${byGroup[g]}`).join(' / ')}`);

if (missingGroup.length) {
  fail++;
  line();
  line(`[실패] 제작 가능 노말 베이스 중 weaponGroup 누락 ${missingGroup.length}개:`);
  for (const i of missingGroup.slice(0, 30)) line(`   - ${i.id}  ${i.name}`);
  if (missingGroup.length > 30) line(`   ... 외 ${missingGroup.length - 30}개`);
} else {
  line('[통과] 모든 노말 무기 베이스에 weaponGroup이 지정되어 있습니다.');
}

if (missingSuper.length) {
  fail++;
  line(`[실패] 제작 가능 노말 베이스 중 weaponSuperGroup 누락 ${missingSuper.length}개`);
  for (const i of missingSuper.slice(0, 30)) line(`   - ${i.id}  ${i.name}`);
} else {
  line('[통과] 모든 노말 무기 베이스에 weaponSuperGroup이 지정되어 있습니다.');
}

if (warnGroup.length) {
  line();
  line(`[정보] 유니크/세트 등 제작 불가 무기 중 weaponGroup 미태깅 ${warnGroup.length}개 (룬워드 제작 대상 아님, 영향 없음):`);
  for (const i of warnGroup.slice(0, 20)) line(`   - ${i.id}  ${i.name}  (${i.rarity})`);
}

// --------------------------------------------------------------------------
section('2. 룬워드 × 무기군 매트릭스');
// --------------------------------------------------------------------------
const rwMod = await bundle(path.join(ROOT, 'src', 'data', 'runeWords.ts'));
const RECIPES = rwMod.RUNEWORD_RECIPES;

line(`전체 룬워드: ${RECIPES.length}개`);
line();

const weaponRecipes = RECIPES.filter(r => r.allowedSlot === 'weapon');
const restricted = weaponRecipes.filter(r => r.allowedWeaponGroups?.length);
const unrestricted = weaponRecipes.filter(r => !r.allowedWeaponGroups?.length);

line(`무기 룬워드: ${weaponRecipes.length}개 (무기군 제한 있음 ${restricted.length} / 제한 없음 ${unrestricted.length})`);
line();

line('--- 무기군 제한이 있는 레시피 ---');
for (const r of restricted) {
  const gs = r.allowedWeaponGroups.map(g => GROUP_LABEL[g] || g).join('/');
  const sg = r.allowedWeaponSuperGroup || '-';
  line(`  ${r.name.padEnd(30)} ${String(r.requiredSockets)}소켓  [${gs}]  (super: ${sg})`);
}

if (unrestricted.length) {
  line();
  line('--- 무기군 제한 없는 레시피 (모든 무기 허용) ---');
  for (const r of unrestricted) line(`  ${r.name.padEnd(30)} ${String(r.requiredSockets)}소켓`);
}

// --------------------------------------------------------------------------
section('3. 제작 불가(죽은) 레시피 검출');
// --------------------------------------------------------------------------
// A recipe is "dead" if no normal-rarity base item in the pool can satisfy
// slot + weapon group + socket count simultaneously.
const dead = [];
for (const r of RECIPES) {
  const candidates = POOL.filter(item => {
    if (item.rarity !== 'normal') return false;
    if ((item.sockets || 0) !== r.requiredSockets) return false;
    // slot compatibility (mirrors isRuneWordSlotCompatible)
    const slotOk =
      r.allowedSlot === item.slot ||
      (r.allowedSlot === 'weapon' && (item.slot === 'weapon' || item.slot === 'shield'));
    if (!slotOk) return false;
    // weapon group compatibility (mirrors isWeaponGroupCompatible)
    if (r.allowedWeaponGroups?.length) {
      if (!item.weaponGroup) return false;
      if (!r.allowedWeaponGroups.includes(item.weaponGroup)) return false;
    }
    if (r.allowedWeaponSuperGroup) {
      if (item.weaponSuperGroup !== r.allowedWeaponSuperGroup) return false;
    }
    return true;
  });
  if (candidates.length === 0) dead.push(r);
}

if (dead.length) {
  fail++;
  line(`[실패] 제작 가능한 베이스가 없는 레시피 ${dead.length}개:`);
  for (const r of dead) {
    const gs = r.allowedWeaponGroups?.map(g => GROUP_LABEL[g] || g).join('/') || '제한없음';
    line(`   - ${r.name}  (${r.allowedSlot}, ${r.requiredSockets}소켓, 무기군: ${gs})`);
  }
} else {
  line('[통과] 모든 레시피에 제작 가능한 노말 베이스가 1개 이상 존재합니다.');
}

// --------------------------------------------------------------------------
section('4. 무기군별 제작 가능 레시피 수 (커버리지)');
// --------------------------------------------------------------------------
for (const g of GROUPS) {
  const n = weaponRecipes.filter(r =>
    !r.allowedWeaponGroups?.length || r.allowedWeaponGroups.includes(g)
  ).length;
  const bases = craftable.filter(i => i.weaponGroup === g).length;
  line(`  ${GROUP_LABEL[g].padEnd(4)} (${g.padEnd(9)}) 베이스 ${String(bases).padStart(3)}개  →  제작 가능 룬워드 ${String(n).padStart(2)}개`);
}

// --------------------------------------------------------------------------
line();
line('='.repeat(72));
if (fail) {
  line(`검증 실패: ${fail}개 항목`);
} else {
  line('검증 통과: 모든 항목 정상');
}
line('='.repeat(72));

if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
process.exit(fail ? 1 : 0);
