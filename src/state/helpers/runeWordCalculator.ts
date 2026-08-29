import { GameItem, ItemStats, RuneWordRecipe } from '../../types/game';
import { RUNEWORD_RECIPES } from '../../data/runeWords';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
// D2_RUNE_ORDER single-sourced from src/data/runes.ts — do not duplicate here

export function calculateRuneWordItem(targetItem: GameItem, recipe: RuneWordRecipe): GameItem {
  const baseMin = targetItem.stats.minDmg || 0;
  const baseMax = targetItem.stats.maxDmg || 0;
  const baseDef = targetItem.stats.defense || 0;

  const ed = recipe.enhancedDamage || 0;
  const edDef = recipe.enhancedDefense || 0;

  const finalMinDmg = baseMin > 0 ? Math.floor(baseMin * (1 + ed / 100)) + (recipe.bonusStats.minDmg || 0) : (recipe.bonusStats.minDmg || 0);
  const finalMaxDmg = baseMax > 0 ? Math.floor(baseMax * (1 + ed / 100)) + (recipe.bonusStats.maxDmg || 0) : (recipe.bonusStats.maxDmg || 0);
  const finalDef = baseDef > 0 ? Math.floor(baseDef * (1 + edDef / 100)) + (recipe.bonusStats.defense || 0) : (recipe.bonusStats.defense || 0);

  const finalStats: ItemStats = {
    ...targetItem.stats,
    ...recipe.bonusStats,
    ...(finalMinDmg > 0 ? { minDmg: finalMinDmg } : {}),
    ...(finalMaxDmg > 0 ? { maxDmg: finalMaxDmg } : {}),
    ...(finalDef > 0 ? { defense: finalDef } : {})
  };

  return {
    ...targetItem,
    name: recipe.name,
    rarity: 'runeword',
    isRuneWord: true,
    runeWordName: recipe.name,
    socketedRunes: recipe.requiredRunes,
    stats: finalStats,
    specialEffect: recipe.specialEffect,
    description: `[룬워드: ${recipe.requiredRunes.join(' + ')}] ${recipe.description}`
  };
}

export interface CraftRuneWordResult {
  success: boolean;
  message: string;
  updatedItem?: GameItem;
  newVault?: Record<string, number>;
}

export function isRuneWordSlotCompatible(targetSlot: string, recipe: RuneWordRecipe): boolean {
  if (targetSlot === recipe.allowedSlot) return true;
  // 1. 스피리트 (Spirit / 영혼): 도검(Weapon) & 방패(Shield) 모두 제작 가능
  if (recipe.id === 'rw_spirit' && (targetSlot === 'weapon' || targetSlot === 'shield')) return true;
  // 2. 불사조 (Phoenix): 무기(Weapon) & 방패(Shield) 모두 제작 가능
  if (recipe.id === 'rw_phoenix' && (targetSlot === 'weapon' || targetSlot === 'shield')) return true;
  // 3. 인내 (Fortitude): 갑옷(Armor) & 무기(Weapon) 모두 제작 가능
  if (recipe.id === 'rw_fortitude' && (targetSlot === 'armor' || targetSlot === 'weapon')) return true;
  // 4. 용 (Dragon): 갑옷(Armor) & 방패(Shield) 모두 제작 가능
  if (recipe.id === 'rw_dragon' && (targetSlot === 'armor' || targetSlot === 'shield')) return true;
  return false;
}

/** B안 무기군 호환 검사: allowedWeaponGroups가 있으면 weaponGroup이 그 중 하나여야 함 */
export function isWeaponGroupCompatible(item: { weaponGroup?: string; weaponSuperGroup?: string }, recipe: RuneWordRecipe): boolean {
  if (recipe.allowedWeaponGroups && recipe.allowedWeaponGroups.length > 0) {
    if (!item.weaponGroup) return false;
    if (!recipe.allowedWeaponGroups.includes(item.weaponGroup as any)) return false;
  }
  if (recipe.allowedWeaponSuperGroup) {
    if (!item.weaponSuperGroup) return false;
    if (item.weaponSuperGroup !== recipe.allowedWeaponSuperGroup) return false;
  }
  return true;
}

export function craftRuneWordHelper(
  targetItem: GameItem | undefined,
  recipeId: string,
  runesVault: Record<string, number>
): CraftRuneWordResult {
  const recipe = RUNEWORD_RECIPES.find(r => r.id === recipeId);
  if (!targetItem || !recipe) {
    return { success: false, message: '제작 대상 아이템 또는 룬워드 레시피를 찾을 수 없습니다.' };
  }

  const isSlotMatch = isRuneWordSlotCompatible(targetItem.slot, recipe) && isWeaponGroupCompatible(targetItem as any, recipe);

  if (targetItem.rarity !== 'normal' || !isSlotMatch || (targetItem.sockets || 0) !== recipe.requiredSockets) {
    return {
      success: false,
      message: (() => {
        const wg = (recipe.allowedWeaponGroups && recipe.allowedWeaponGroups.length)
          ? ` 무기군 [${recipe.allowedWeaponGroups.join('/')}]`
          : '';
        return `[${targetItem.name}]은(는) [${recipe.name}]의 제작 조건(노말 ${recipe.requiredSockets}소켓 ${recipe.allowedSlot}${wg})에 맞지 않습니다.`;
      })()
    };
  }

  const requiredCounts: Record<string, number> = {};
  recipe.requiredRunes.forEach(r => {
    requiredCounts[r] = (requiredCounts[r] || 0) + 1;
  });

  for (const [rKey, reqCount] of Object.entries(requiredCounts)) {
    if ((runesVault[rKey] || 0) < reqCount) {
      return {
        success: false,
        message: `필요한 [${rKey} 룬]이 부족합니다! (보유: ${runesVault[rKey] || 0} / 필요: ${reqCount})`
      };
    }
  }

  const newVault = { ...runesVault };
  Object.entries(requiredCounts).forEach(([rKey, reqCount]) => {
    newVault[rKey] = Math.max(0, (newVault[rKey] || 0) - reqCount);
  });

  const updatedItem = calculateRuneWordItem(targetItem, recipe);

  return {
    success: true,
    message: `✨ 스마트 룬워드 제작 성공! [${recipe.name}] (공격력 ${updatedItem.stats.minDmg || 0}~${updatedItem.stats.maxDmg || 0}, 방어 ${updatedItem.stats.defense || 0})이 완성되었습니다!`,
    updatedItem,
    newVault
  };
}

export function craftRuneWordWithTransmuteHelper(
  targetItem: GameItem | undefined,
  recipeId: string,
  runesVault: Record<string, number>
): CraftRuneWordResult {
  const recipe = RUNEWORD_RECIPES.find(r => r.id === recipeId);
  if (!targetItem || !recipe) {
    return { success: false, message: '제작 대상 아이템 또는 룬워드 레시피를 찾을 수 없습니다.' };
  }

  const isSlotMatch = isRuneWordSlotCompatible(targetItem.slot, recipe) && isWeaponGroupCompatible(targetItem as any, recipe);

  if (targetItem.rarity !== 'normal' || !isSlotMatch || (targetItem.sockets || 0) !== recipe.requiredSockets) {
    return {
      success: false,
      message: (() => {
        const wg = (recipe.allowedWeaponGroups && recipe.allowedWeaponGroups.length)
          ? ` 무기군 [${recipe.allowedWeaponGroups.join('/')}]`
          : '';
        return `[${targetItem.name}]은(는) [${recipe.name}]의 제작 조건(노말 ${recipe.requiredSockets}소켓 ${recipe.allowedSlot}${wg})에 맞지 않습니다.`;
      })()
    };
  }

  const sim = simulateRuneWordCrafting(recipe, runesVault);
  if (!sim.canTransmuteCraft) {
    return {
      success: false,
      message: `하위 룬을 모두 합성해도 [${recipe.name}] 제작에 필요한 룬이 부족합니다!`
    };
  }

  const updatedItem = calculateRuneWordItem(targetItem, recipe);
  const newVault: Record<string, number> = { ...runesVault };
  Object.entries(sim.transmutedRunesCost).forEach(([rKey, count]) => {
    newVault[rKey] = Math.max(0, (newVault[rKey] || 0) - count);
  });

  return {
    success: true,
    message: `🔮 하위 룬 연쇄 합성 및 [${recipe.name}] 룬워드 완성! (공격력 ${updatedItem.stats.minDmg || 0}~${updatedItem.stats.maxDmg || 0}, 방어 ${updatedItem.stats.defense || 0})`,
    updatedItem,
    newVault
  };
}

export function transmuteRuneInVaultHelper(
  runeKey: string,
  runesVault: Record<string, number>
): { success: boolean; message: string; newVault?: Record<string, number>; createdRuneKey?: string } {
  const runeOrder = [
    'El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Thul',
    'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem',
    'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber',
    'Jah', 'Cham', 'Zod'
  ];
  const curIdx = runeOrder.indexOf(runeKey);
  if (curIdx < 0 || curIdx >= runeOrder.length - 1) {
    return { success: false, message: '더 이상 상위 룬으로 합성할 수 없습니다.' };
  }

  const currentCount = runesVault[runeKey] || 0;
  if (currentCount < 3) {
    return { success: false, message: `합성에 필요한 [${runeKey} 룬]이 부족합니다. (3개 필요, 보유: ${currentCount}개)` };
  }

  const nextKey = runeOrder[curIdx + 1];
  const newVault = { ...runesVault };
  newVault[runeKey] = currentCount - 3;
  newVault[nextKey] = (newVault[nextKey] || 0) + 1;

  return {
    success: true,
    message: `🔮 [${runeKey} 룬] 3개를 결합하여 상위 룬 [${nextKey} 룬] 1개를 연성했습니다!`,
    newVault,
    createdRuneKey: nextKey
  };
}
