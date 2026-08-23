import { GameItem, ItemStats } from '../../types/game';
import { GAME_ITEMS_POOL } from '../../data/items';

export interface GambleResult {
  item: GameItem;
  isHighRarity: boolean;
}

export function generateGambleItem(
  gambleType: 'weapon' | 'armor' | 'ring' | 'amulet',
  gambleLevel: number = 1,
  cost: number
): GambleResult {
  const effLevel = gambleLevel >= 5 ? 50 : gambleLevel === 4 ? 38 : gambleLevel === 3 ? 26 : gambleLevel === 2 ? 15 : 1;
  const roll = Math.random() * 100;
  let rarity: GameItem['rarity'] = 'magic';
  if (roll > 99) rarity = 'legendary';
  else if (roll > 93) rarity = 'unique';
  else if (roll > 86) rarity = 'set';
  else if (roll > 70) rarity = 'rare';

  let baseItemName = '도검';
  let baseMinDmg = 5;
  let baseMaxDmg = 10;
  let baseDefense = 5;
  let baseAtbPercent = 50;
  let speedCategory: GameItem['speedCategory'] = 'normal';
  let icon = 'Sword';

  if (gambleType === 'weapon') {
    icon = 'Sword';
    const effLevel = gambleLevel >= 4 ? 35 : gambleLevel === 3 ? 26 : gambleLevel === 2 ? 15 : 1;
    if (effLevel >= 26) {
      const pool = [
        { name: '페이즈 블레이드', min: 35, max: 55, atb: 85, spd: 'very_fast' as const },
        { name: '츠바이핸더', min: 25, max: 48, atb: 60, spd: 'fast' as const },
        { name: '콜로서스 블레이드', min: 60, max: 115, atb: 65, spd: 'fast' as const },
        { name: '쓰레셔', min: 25, max: 65, atb: 75, spd: 'very_fast' as const }
      ];
      const choice = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = choice.name;
      baseMinDmg = choice.min;
      baseMaxDmg = choice.max;
      baseAtbPercent = choice.atb;
      speedCategory = choice.spd;
    } else if (effLevel >= 11) {
      const pool = [
        { name: '롱소드', min: 12, max: 22, atb: 55, spd: 'normal' as const },
        { name: '크리스탈 소드', min: 15, max: 28, atb: 60, spd: 'fast' as const },
        { name: '프레일', min: 10, max: 24, atb: 70, spd: 'very_fast' as const }
      ];
      const choice = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = choice.name;
      baseMinDmg = choice.min;
      baseMaxDmg = choice.max;
      baseAtbPercent = choice.atb;
      speedCategory = choice.spd;
    } else {
      const pool = [
        { name: '숏소드', min: 4, max: 8, atb: 65, spd: 'fast' as const },
        { name: '시미터', min: 3, max: 7, atb: 75, spd: 'very_fast' as const },
        { name: '브로드소드', min: 6, max: 13, atb: 55, spd: 'normal' as const }
      ];
      const choice = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = choice.name;
      baseMinDmg = choice.min;
      baseMaxDmg = choice.max;
      baseAtbPercent = choice.atb;
      speedCategory = choice.spd;
    }
  } else if (gambleType === 'armor') {
    icon = 'Shield';
    if (effLevel >= 26) {
      const pool = [
        { name: '아칸 플레이트', def: 180, slot: 'armor' as const },
        { name: '샤코', def: 90, slot: 'helm' as const, icon: 'HardHat' },
        { name: '모나크', def: 120, slot: 'shield' as const, icon: 'Shield' }
      ];
      const choice = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = choice.name;
      baseDefense = choice.def;
      icon = choice.icon || 'Shield';
    } else if (effLevel >= 11) {
      const pool = [
        { name: '메이지 플레이트', def: 95, slot: 'armor' as const },
        { name: '본 헬름', def: 40, slot: 'helm' as const, icon: 'HardHat' },
        { name: '타워 실드', def: 45, slot: 'shield' as const, icon: 'Shield' }
      ];
      const choice = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = choice.name;
      baseDefense = choice.def;
      icon = choice.icon || 'Shield';
    } else {
      const pool = [
        { name: '가죽 갑옷', def: 25, slot: 'armor' as const },
        { name: '캡', def: 12, slot: 'helm' as const, icon: 'HardHat' },
        { name: '카이트 실드', def: 20, slot: 'shield' as const, icon: 'Shield' }
      ];
      const choice = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = choice.name;
      baseDefense = choice.def;
      icon = choice.icon || 'Shield';
    }
  } else if (gambleType === 'ring') {
    icon = 'CircleDot';
    baseItemName = '반지';
  } else {
    icon = 'Sparkles';
    baseItemName = '목걸이';
  }

  let realUniqueName: string | undefined = undefined;
  let targetSetName: string | undefined = undefined;
  let assignedSlot: GameItem['slot'] = gambleType === 'ring' ? 'ring1' : gambleType;

  if (rarity === 'unique' || rarity === 'legendary' || rarity === 'set') {
    const matchingPool = GAME_ITEMS_POOL.filter(p => {
      if (p.rarity !== 'unique' && p.rarity !== 'set' && p.rarity !== 'legendary') return false;
      if (gambleType === 'weapon') return p.slot === 'weapon';
      if (gambleType === 'armor') return p.slot === 'armor' || p.slot === 'shield' || p.slot === 'helm';
      if (gambleType === 'ring') return p.slot === 'ring1' || p.slot === 'ring2' || p.slot === 'ring';
      return p.slot === 'amulet';
    });

    if (matchingPool.length > 0) {
      const picked = matchingPool[Math.floor(Math.random() * matchingPool.length)];
      realUniqueName = picked.name;
      baseItemName = picked.baseItemName || baseItemName;
      targetSetName = picked.setName;
      assignedSlot = picked.slot;
      if (picked.icon) icon = picked.icon;
      if (picked.speedCategory) speedCategory = picked.speedCategory;
      if (picked.baseAtbPercent) baseAtbPercent = picked.baseAtbPercent;
    }
  }

  const newItem: GameItem = {
    id: `gamble_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: `미확인 [${baseItemName}]`,
    baseItemName,
    rarity,
    slot: assignedSlot,
    isIdentified: false,
    speedCategory,
    baseAtbPercent,
    realUniqueName,
    setName: targetSetName,
    stats: {
      ...(gambleType === 'weapon' ? { minDmg: baseMinDmg, maxDmg: baseMaxDmg, attackSpeed: speedCategory === 'very_fast' ? 20 : speedCategory === 'fast' ? 10 : 0 } : {}),
      ...(gambleType === 'armor' ? { defense: baseDefense } : {})
    },
    value: cost,
    icon,
    description: `기드의 상점에서 도박으로 획득한 미확인 [${baseItemName}]. 데커드 케인의 식별을 통해 숨겨진 잠재력을 개방하세요!`
  };

  const isHighRarity = rarity === 'unique' || rarity === 'legendary' || rarity === 'set';
  return { item: newItem, isHighRarity };
}

export function identifyItemHelper(item: GameItem, effLevel: number): GameItem {
  if (item.isIdentified) return item;

  // 0. Predefined drop with a locked unique name (treasure/victory loot): reveal the REAL item, never re-roll.
  if (item.realUniqueName) {
    const poolItem = GAME_ITEMS_POOL.find(p => p.name === item.realUniqueName || p.id === item.id);
    const revealed: GameItem = {
      ...item,
      name: item.realUniqueName,
      baseItemName: poolItem?.baseItemName || item.baseItemName || '장비',
      specialEffect: poolItem?.specialEffect || item.specialEffect,
      isIdentified: true
    };
    if (poolItem && Object.keys(item.stats || {}).length === 0) {
      revealed.stats = { ...poolItem.stats };
      revealed.subAffixes = poolItem.subAffixes ? [...poolItem.subAffixes] : [];
      revealed.icon = poolItem.icon;
    }
    revealed.description = `데커드 케인이 감정한 [${revealed.name}] 장비입니다.`;
    return revealed;
  }

  const baseName = item.baseItemName || (item.slot === 'ring1' || item.slot === 'ring2' || item.slot === 'ring' ? '반지' : item.slot === 'amulet' ? '목걸이' : item.slot === 'weapon' ? '도검' : '갑옷');
  const isWpn = item.slot === 'weapon';
  const isArm = item.slot === 'armor' || item.slot === 'shield' || item.slot === 'helm';

  const baseMin = item.stats.minDmg || (isWpn ? Math.max(5, effLevel * 2) : 0);
  const baseMax = item.stats.maxDmg || (isWpn ? Math.max(10, effLevel * 3.5) : 0);
  const baseDef = item.stats.defense || (isArm ? Math.max(10, effLevel * 3) : 0);

  const AFFIX_POOL = [
    { id: 'crit', name: '예리함', value: Math.floor(6 + Math.random() * 8), label: '치명타 확률' },
    { id: 'critDmg', name: '치명타 피해', value: Math.floor(25 + Math.random() * 35), label: '치명타 피해 %' },
    { id: 'overkill', name: '도륙', value: Math.floor(15 + Math.random() * 25), label: '오버킬 전이율 %' },
    { id: 'life', name: '흡혈', value: Math.floor(5 + Math.random() * 6), label: '타격 시 생명력 흡수 %' },
    { id: 'str', name: '거인의', value: Math.floor(8 + Math.random() * 15), label: '힘(STR)' },
    { id: 'dex', name: '민첩한', value: Math.floor(8 + Math.random() * 15), label: '민첩(DEX)' },
    { id: 'atk_spd', name: '질풍의', value: Math.floor(15 + Math.random() * 15), label: '공격 속도(IAS) %' },
    { id: 'fortune', name: '행운의', value: Math.floor(20 + Math.random() * 30), label: '매직 아이템 발견 확률(MF) %' },
    { id: 'allResist', name: '수호의', value: Math.floor(15 + Math.random() * 25), label: '모든 저항 %' }
  ];

  const pickAffixes = (count: number) => {
    const shuffled = [...AFFIX_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  let finalName = item.name;
  let finalStats: ItemStats = { ...item.stats };
  let chosenAffixes: { id: string; name: string; value: number; label: string }[] = [];

  const UNIQUE_WEAPONS = ['할배검 (The Grandfather)', '바람살 (Windforce)', '광란의 집행관 (Lightsabre)', '도살자의 절구통', '알리바바의 칼날', '마법사의 쐐기검'];
  const UNIQUE_ARMORS = ['독사마술사의 가죽 (구교복)', '샤프트스톱', '티리엘의 권능', '할리퀸 관모 (샤코)', '폭풍막이 (모나크)', '자카룸의 전령'];
  const UNIQUE_RINGS = ['요르단의 반지 (Stone of Jordan)', '나겔링 (Nagelring)', '불카토스의 결혼반지', '왜성의 반지', '칠흑소용돌이 (Raven Frost)'];
  const UNIQUE_AMULETS = ["마라의 만화경 (Mara's Kaleidoscope)", "대군주의 진노 (Highlord's Wrath)", "고양이의 눈 (Cat's Eye)", "아트마의 스카라베"];

  if (item.rarity === 'unique' || item.rarity === 'legendary') {
    const namesList = isWpn ? UNIQUE_WEAPONS : isArm ? UNIQUE_ARMORS : item.slot === 'amulet' ? UNIQUE_AMULETS : UNIQUE_RINGS;
    finalName = item.realUniqueName || namesList[Math.floor(Math.random() * namesList.length)];
    chosenAffixes = pickAffixes(3);

    const edMult = 2.0 + (effLevel * 0.05);
    finalStats = {
      ...finalStats,
      ...(isWpn ? { minDmg: Math.floor(baseMin * edMult) + 15, maxDmg: Math.floor(baseMax * edMult) + 30, attackSpeed: (finalStats.attackSpeed || 10) + 15 } : {}),
      ...(isArm ? { defense: Math.floor(baseDef * edMult) + 30 } : {}),
      str: (finalStats.str || 0) + 15,
      dex: (finalStats.dex || 0) + 15,
      critChance: (finalStats.critChance || 0) + 12,
      allResist: (finalStats.allResist || 0) + 20
    };
  } else if (item.rarity === 'rare') {
    const prefixes = ['핏빛의', '광전사의', '용맹한', '혹한의', '화염의', '불멸의'];
    const suffixes = ['도륙', '예리함', '파괴', '흡혈', '거인', '철벽', '신속'];
    const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
    const sfx = suffixes[Math.floor(Math.random() * suffixes.length)];
    finalName = `${pfx} ${baseName} (${sfx})`;
    chosenAffixes = pickAffixes(2);

    const edMult = 1.5 + (effLevel * 0.03);
    finalStats = {
      ...finalStats,
      ...(isWpn ? { minDmg: Math.floor(baseMin * edMult) + 5, maxDmg: Math.floor(baseMax * edMult) + 12, attackSpeed: (finalStats.attackSpeed || 0) + 10 } : {}),
      ...(isArm ? { defense: Math.floor(baseDef * edMult) + 15 } : {}),
      str: (finalStats.str || 0) + 8,
      critChance: (finalStats.critChance || 0) + 6
    };
  } else {
    const prefixes = ['예리한', '견고한', '신속한', '강화된', '마법의'];
    const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
    finalName = `${pfx} ${baseName}`;
    chosenAffixes = pickAffixes(1);

    const edMult = 1.25;
    finalStats = {
      ...finalStats,
      ...(isWpn ? { minDmg: Math.floor(baseMin * edMult), maxDmg: Math.floor(baseMax * edMult) } : {}),
      ...(isArm ? { defense: Math.floor(baseDef * edMult) } : {})
    };
  }

  chosenAffixes.forEach(aff => {
    if (aff.id === 'crit') finalStats.critChance = (finalStats.critChance || 0) + aff.value;
    if (aff.id === 'critDmg') finalStats.critDamage = (finalStats.critDamage || 0) + aff.value;
    if (aff.id === 'overkill') finalStats.overkillEfficiency = (finalStats.overkillEfficiency || 0) + aff.value;
    if (aff.id === 'life') finalStats.lifeSteal = (finalStats.lifeSteal || 0) + aff.value;
    if (aff.id === 'str') finalStats.str = (finalStats.str || 0) + aff.value;
    if (aff.id === 'dex') finalStats.dex = (finalStats.dex || 0) + aff.value;
    if (aff.id === 'atk_spd') finalStats.attackSpeed = (finalStats.attackSpeed || 0) + aff.value;
    if (aff.id === 'fortune') finalStats.fortune = (finalStats.fortune || 0) + aff.value;
    if (aff.id === 'allResist') finalStats.allResist = (finalStats.allResist || 0) + aff.value;
  });

  return {
    ...item,
    name: finalName,
    isIdentified: true,
    stats: finalStats,
    subAffixes: chosenAffixes,
    description: `데커드 케인이 감정한 신비로운 [${finalName}] 장비입니다.`
  };
}

