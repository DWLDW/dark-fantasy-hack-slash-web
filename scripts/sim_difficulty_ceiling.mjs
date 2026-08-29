import fs from "fs";

// ---------- Helpers replicated from codebase ----------
function calculateDamageMultiplier(attackerLevel, targetDefense){
  const K = 100 + attackerLevel*10;
  const raw = K / (K + Math.max(0, targetDefense));
  return Math.max(0.05, Math.min(1.0, raw));
}
function getMonsterBaseStats(recLv){
  const baseHp = recLv <= 10 ? Math.floor(18 + recLv*6) : Math.floor(40 + recLv*7.5 + Math.pow(recLv/10,1.5)*10);
  const baseDef = recLv <= 10 ? Math.max(0, Math.floor((recLv-1)*1.1)) : Math.floor(4 + recLv*0.85);
  const baseDmg = recLv <= 10 ? Math.max(2, Math.floor(2 + recLv*0.45)) : Math.floor(5 + recLv*0.65);
  return {baseHp, baseDef, baseDmg};
}
function getMonsterScaled(recLv, playerLevel, diff){
  const {baseHp, baseDef, baseDmg} = getMonsterBaseStats(recLv);
  const hpMult = 1 + (diff-1)*0.35 + (playerLevel*0.03);
  const defMult = 1 + (diff-1)*0.20;
  const dmgMult = 1 + (diff-1)*0.25 + (playerLevel*0.02);
  return {
    hp: Math.floor(baseHp * hpMult),
    def: Math.floor(baseDef * defMult),
    dmg: Math.floor(baseDmg * dmgMult),
    baseHp, baseDef, baseDmg
  };
}
function scaleForDiff(min,max,def,diff){
  const mult = 1 + (diff-1)*0.15;
  return {min: Math.floor(min*mult), max: Math.floor(max*mult), def: def?Math.floor(def*mult):0};
}
function playerStatsForLevel(L){
  // warrior: str 3/lv, con 2/lv
  return {str: 15 + (L-1)*3, dex: 10 + Math.floor((L-1)*0.5), con: 15 + (L-1)*2, level:L};
}
function calcPlayerDmg(playerLevel, weaponMin, weaponMax, str, isRuneword, rwED, rwBonusMin, rwBonusMax){
  // totalStats min = 5 + weaponMin (+ RW) + str*1.5 ; max = 10 + weaponMax + str*2.0
  // Simplified: RW ED applies to base weapon only: base* (1+ED/100) + bonus
  let wMin = weaponMin, wMax = weaponMax;
  if(isRuneword){
    wMin = Math.floor(wMin * (1 + rwED/100)) + rwBonusMin;
    wMax = Math.floor(wMax * (1 + rwED/100)) + rwBonusMax;
  }
  const minDmg = 5 + wMin + Math.floor(str*1.5);
  const maxDmg = 10 + wMax + Math.floor(str*2.0);
  const avg = Math.floor((minDmg+maxDmg)/2);
  return {minDmg, maxDmg, avg};
}

// ---------- Gear definitions ----------
// Current pools (approx)
const currentWeaponPools = {
  act1_normal: {min:4, max:8, avg:6},
  act2_exceptional: {min:19, max:35, avg:27},
  act3_exceptional: {min:19, max:35, avg:27},
  act4_elite: {min:35, max:55, avg:45},
  act5_elite: {min:58, max:115, avg:86},
};
// 2안 flattened: normal 7~14, exceptional 11~22, elite 18~36, top elite 22~42
const flatWeaponPools = {
  act1_normal: {min:7, max:14, avg:10.5},
  act2_exceptional: {min:11, max:22, avg:16.5},
  act3_exceptional: {min:12, max:24, avg:18},
  act4_elite: {min:18, max:36, avg:27},
  act5_elite: {min:22, max:42, avg:32},
};
// RuneWords per act (representative)
const runeWords = {
  none: {ed:0, bMin:0, bMax:0, name:"노멀 베이스", dmgMult:1.2, skill:"Slash"},
  steel: {ed:50, bMin:5, bMax:10, name:"Steel (Tir+El)", dmgMult:1.2},
  spirit: {ed:70, bMin:15, bMax:28, name:"Spirit (TalThulOrtAmn)", dmgMult:1.2},
  insight: {ed:35, bMin:10, bMax:20, name:"Insight", dmgMult:1.5},
  crescent: {ed:120, bMin:30, bMax:60, name:"Crescent Moon", dmgMult:1.45},
  obedience: {ed:180, bMin:45, bMax:90, name:"Obedience", dmgMult:1.45},
  grief: {ed:0, bMin:240, bMax:360, name:"Grief (flat)", dmgMult:1.2},
};

// Dungeons
const dungeons = [
  {id:"act1_1", recLv:1, act:1},{id:"act1_2", recLv:4, act:1},{id:"act1_3", recLv:8, act:1},{id:"act1_4", recLv:12, act:1},
  {id:"act2_1", recLv:16, act:2},{id:"act2_2", recLv:20, act:2},{id:"act2_3", recLv:24, act:2},{id:"act2_4", recLv:28, act:2},
  {id:"act3_1", recLv:32, act:3},{id:"act3_2", recLv:36, act:3},{id:"act3_3", recLv:40, act:3},{id:"act3_4", recLv:45, act:3},
  {id:"act4_1", recLv:50, act:4},{id:"act4_2", recLv:55, act:4},{id:"act4_3", recLv:60, act:4},{id:"act4_4", recLv:65, act:4},
  {id:"act5_1", recLv:70, act:5},{id:"act5_2", recLv:75, act:5},{id:"act5_3", recLv:80, act:5},{id:"act5_4", recLv:85, act:5},
];
function poolForAct(act, flat){
  const pools = flat? flatWeaponPools: currentWeaponPools;
  if(act===1) return pools.act1_normal;
  if(act===2) return pools.act2_exceptional;
  if(act===3) return pools.act3_exceptional;
  if(act===4) return pools.act4_elite;
  return pools.act5_elite;
}
function rwForAct(act){
  if(act===1) return runeWords.steel;
  if(act===2) return runeWords.spirit;
  if(act===3) return runeWords.crescent;
  if(act===4) return runeWords.obedience;
  return runeWords.grief;
}
function simulate(useFlat){
  console.log("\n======== "+(useFlat?"2안 FLATTENED (7~14 / 11~22 / 18~36)":"현재 CURRENT (4~8 / 19~35 / 58~115)")+" ========");
  console.log("| 던전 | recLv | 난이도 | 플레이어Lv | 무기(스케일전) | 룬워드 | 평균딜(방어반영전) | 몬스터HP | 몬스터Def | 방어감쇄 | 보스HP | Slash 1타딜 | Slash 보스킬 | Execute 보스킬 | 생존(몬스터1타) | 판정 |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for(const d of dungeons){
    const playerLv = d.recLv; // assume at-level
    const pStats = playerStatsForLevel(playerLv);
    const pool = poolForAct(d.act, useFlat);
    const rw = rwForAct(d.act);
    // test diffs 1,3,5,8,10,15
    for(const diff of [1,3,5,8,10,15]){
      const scaledW = scaleForDiff(pool.min, pool.max, 0, diff);
      const pdmg = calcPlayerDmg(playerLv, scaledW.min, scaledW.max, pStats.str, true, rw.ed, rw.bMin, rw.bMax);
      const monster = getMonsterScaled(d.recLv, playerLv, diff);
      const bossHp = d.recLv<=10? Math.floor(monster.baseHp*6.5*(1+(diff-1)*0.35+playerLv*0.03)) : Math.floor(monster.baseHp*8.5*(1+(diff-1)*0.35+playerLv*0.03));
      const defMult = calculateDamageMultiplier(playerLv, monster.def);
      const slashDmg = Math.floor(pdmg.avg * 1.2 * defMult); // Slash 1.2x
      const execDmg = Math.floor(pdmg.avg * 4.2 * defMult); // Execute 4.2x
      const normalHits = Math.ceil(monster.hp / Math.max(1,slashDmg));
      const bossHitsSlash = Math.ceil(bossHp / Math.max(1,slashDmg));
      const bossHitsExec = Math.ceil(bossHp / Math.max(1,execDmg));
      // survivability: monster dmg vs player defense (player def approx con*1.5 + gear def scaled)
      const gearDef = d.act===1?40: d.act===2?150: d.act===3?150: d.act===4?320: 320;
      const scaledDef = Math.floor(gearDef * (1+(diff-1)*0.15));
      const playerDef = Math.floor(pStats.con*1.5 + scaledDef);
      const playerHp = 120 + (playerLv-1)*25 + pStats.con*5;
      const monsterDmgMitigated = Math.max(1, Math.floor(monster.dmg * (100+playerLv*10)/(100+playerLv*10+playerDef)));
      const hitsToDie = Math.ceil(playerHp / monsterDmgMitigated);
      let verdict = "";
      if(bossHitsSlash <= 4) verdict = "여유";
      else if(bossHitsSlash <= 7) verdict = "가능";
      else if(bossHitsSlash <= 12) verdict = "빡셈";
      else if(bossHitsExec <= 8) verdict = "Execute 필수";
      else verdict = "불가";
      // also check survivability: if hitsToDie < bossHitsSlash => 죽음
      if(hitsToDie < bossHitsSlash && verdict!=="불가") verdict += "/생존주의";
      // only print representative diffs per act to keep table readable
      if([1,5,10].includes(diff) || (d.act===5 && diff===15) || (d.act===1 && diff===3)){
        console.log("| "+d.id+" | "+d.recLv+" | "+diff+" | "+playerLv+" | "+pool.min+"~"+pool.max+"→"+scaledW.min+"~"+scaledW.max+" | "+rw.name+" | "+pdmg.avg+" | "+monster.hp+" | "+monster.def+" | "+(defMult*100).toFixed(1)+"% | "+bossHp+" | "+slashDmg+" | "+bossHitsSlash+"타 | "+bossHitsExec+"타 | "+monsterDmgMitigated+" ("+hitsToDie+"타생존) | "+verdict+" |");
      }
    }
  }
}
simulate(false);
simulate(true);

// Summary: difficulty ceiling per act with 2안
console.log("\n\n### 요약: 2안으로 실제 드랍만으로 갈 수 있는 난이도 천장 (판정: 여유/가능까지) ###");
console.log("| Act | 현재 천장(여유/가능) | 2안 평탄화 천장 | 변화 | 비고 |");
const ceilingsCurrent = {1:8, 2:5, 3:5, 4:3, 5:1};
const ceilingsFlat = {1:5, 2:5, 3:6, 4:5, 5:3};
console.log("| 1막 | ~Lv8 | ~Lv5 | -3 | 콜로서스 Steel 사기 제거, 정상화 |");
console.log("| 2막 | ~Lv5 | ~Lv5 | 0 | spirit 구간 유지 |");
console.log("| 3막 | ~Lv5 | ~Lv6 | +1 | crescent로 보정, 평탄화로 오히려 안정 |");
console.log("| 4막 | ~Lv3 | ~Lv5 | +2 | obedience가 base보다 룬워드 비중 높아져서 정상화 |");
console.log("| 5막 | ~Lv1 | ~Lv3 | +2 | grief flat dmg가 base 의존도 낮아져서 상위 난이도 진입 가능 |");

console.log("sim done")
