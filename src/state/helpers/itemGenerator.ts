import { GameItem, ItemStats, EquipSlot } from '../../types/game';
import { GAME_ITEMS_POOL } from '../../data/items';

export interface GambleResult {
  item: GameItem;
  isHighRarity: boolean;
}

export type GambleCategory = 'weapon' | 'armor' | 'shield' | 'helm' | 'gloves' | 'boots' | 'ring' | 'amulet';

export function generateGambleItem(
  gambleType: GambleCategory,
  gambleLevel: number = 1,
  cost: number
): GambleResult {
  const effLevel = gambleLevel >= 10 ? 75 : gambleLevel >= 5 ? 50 : gambleLevel === 4 ? 38 : gambleLevel === 3 ? 26 : gambleLevel === 2 ? 15 : 1;
  const roll = Math.random() * 100;
  let rarity: GameItem['rarity'] = 'magic';
  if (roll > 98.5) rarity = 'legendary';
  else if (roll > 91) rarity = 'unique';
  else if (roll > 83) rarity = 'set';
  else if (roll > 65) rarity = 'rare';

  let baseItemName = '도검';
  let baseMinDmg = 5;
  let baseMaxDmg = 10;
  let baseDefense = 5;
  let baseAtbPercent = 50;
  let speedCategory: GameItem['speedCategory'] = 'normal';
  let icon = 'Sword';
  let slot: EquipSlot = 'weapon';

  if (gambleType === 'weapon') {
    slot = 'weapon';
    icon = 'Sword';
    if (effLevel >= 38) {
      const pool = [
        { name: '페이즈 블레이드', min: 35, max: 55, atb: 85, spd: 'very_fast' as const },
        { name: '츠바이핸더', min: 25, max: 48, atb: 60, spd: 'fast' as const },
        { name: '콜로서스 블레이드', min: 60, max: 115, atb: 65, spd: 'fast' as const },
        { name: '쓰레셔', min: 25, max: 80, atb: 70, spd: 'fast' as const }
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseMinDmg = pick.min;
      baseMaxDmg = pick.max;
      baseAtbPercent = pick.atb;
      speedCategory = pick.spd;
    } else if (effLevel >= 15) {
      const pool = [
        { name: '크리스탈 소드', min: 15, max: 28, atb: 70, spd: 'fast' as const },
        { name: '배틀 소드', min: 18, max: 35, atb: 55, spd: 'normal' as const },
        { name: '에인션트 소드', min: 20, max: 40, atb: 50, spd: 'normal' as const }
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseMinDmg = pick.min;
      baseMaxDmg = pick.max;
      baseAtbPercent = pick.atb;
      speedCategory = pick.spd;
    } else {
      const pool = [
        { name: '숏소드', min: 4, max: 8, atb: 65, spd: 'fast' as const },
        { name: '시미터', min: 3, max: 7, atb: 75, spd: 'very_fast' as const },
        { name: '롱소드', min: 6, max: 15, atb: 45, spd: 'slow' as const },
        { name: '브로드소드', min: 8, max: 14, atb: 55, spd: 'normal' as const }
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseMinDmg = pick.min;
      baseMaxDmg = pick.max;
      baseAtbPercent = pick.atb;
      speedCategory = pick.spd;
    }
  } else if (gambleType === 'armor') {
    slot = 'armor';
    icon = 'Shield';
    if (effLevel >= 38) {
      const pool = [{ name: '아콘 플레이트', def: 120 }, { name: '더스크 슈라우드', def: 105 }, { name: '세이크리드 아머', def: 145 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else if (effLevel >= 15) {
      const pool = [{ name: '메이지 플레이트', def: 55 }, { name: '고스트 아머', def: 45 }, { name: '오네이트 플레이트', def: 75 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else {
      const pool = [{ name: '가죽 갑옷', def: 12 }, { name: '하드 레더 아머', def: 16 }, { name: '체인 메일', def: 24 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    }
  } else if (gambleType === 'shield') {
    slot = 'shield';
    icon = 'Shield';
    if (effLevel >= 38) {
      const pool = [{ name: '모나크', def: 95 }, { name: '이지스', def: 110 }, { name: '워드', def: 125 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else if (effLevel >= 15) {
      const pool = [{ name: '타워 실드', def: 45 }, { name: '고딕 실드', def: 50 }, { name: '스큐텀', def: 55 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else {
      const pool = [{ name: '버클러', def: 10 }, { name: '스몰 실드', def: 14 }, { name: '라지 실드', def: 20 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    }
  } else if (gambleType === 'helm') {
    slot = 'helm';
    icon = 'Crown';
    if (effLevel >= 38) {
      const pool = [{ name: '샤코 (하를리퀸)', def: 85 }, { name: '코로나', def: 95 }, { name: '본 비지즈', def: 90 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else if (effLevel >= 15) {
      const pool = [{ name: '본헬름', def: 35 }, { name: '그랜드 크라운', def: 45 }, { name: '샐릿', def: 40 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else {
      const pool = [{ name: '캡', def: 8 }, { name: '스컬 캡', def: 12 }, { name: '헬름', def: 18 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    }
  } else if (gambleType === 'gloves') {
    slot = 'gloves';
    icon = 'Zap';
    if (effLevel >= 38) {
      const pool = [{ name: '뱀파이어팽 글로브', def: 60 }, { name: '크루세이더 건틀릿', def: 70 }, { name: '오우거 건틀릿', def: 75 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else if (effLevel >= 15) {
      const pool = [{ name: '워 건틀릿', def: 30 }, { name: '헤비 브레이서', def: 25 }, { name: '샤크스킨 글로브', def: 35 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else {
      const pool = [{ name: '가죽 장갑', def: 6 }, { name: '헤비 글로브', def: 10 }, { name: '체인 글로브', def: 14 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    }
  } else if (gambleType === 'boots') {
    slot = 'boots';
    icon = 'ArrowRight';
    if (effLevel >= 38) {
      const pool = [{ name: '미러드 부츠', def: 65 }, { name: '미르미돈 그리브', def: 75 }, { name: '스카라베 쉘 부츠', def: 70 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else if (effLevel >= 15) {
      const pool = [{ name: '워 부츠', def: 32 }, { name: '샤크스킨 부츠', def: 28 }, { name: '배틀 부츠', def: 36 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    } else {
      const pool = [{ name: '가죽 부츠', def: 6 }, { name: '헤비 부츠', def: 10 }, { name: '체인 부츠', def: 14 }];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      baseItemName = pick.name;
      baseDefense = pick.def;
    }
  } else if (gambleType === 'ring') {
    slot = 'ring1';
    icon = 'CircleDot';
    baseItemName = '반지';
  } else {
    slot = 'amulet';
    icon = 'Sparkles';
    baseItemName = '목걸이';
  }

  const isHighRarity = rarity === 'unique' || rarity === 'legendary' || rarity === 'set';

  const item: GameItem = {
    id: `gamble_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: `미확인 [${baseItemName}]`,
    baseItemName,
    rarity,
    tier: effLevel >= 38 ? 'elite' : effLevel >= 15 ? 'exceptional' : 'normal',
    slot,
    speedCategory,
    baseAtbPercent,
    stats: {
      ...(gambleType === 'weapon' ? { minDmg: baseMinDmg, maxDmg: baseMaxDmg } : {}),
      ...(gambleType === 'armor' ? { defense: baseDefense } : {})
    },
    value: Math.floor(cost * 0.4),
    icon,
    isIdentified: false,
    description: `기드의 도박으로 뽑은 신비로운 미확인 [${baseItemName}]입니다. 데커드 케인에게 감정받아 숨겨진 스탯과 옵션을 확인하세요.`
  };

  return { item, isHighRarity };
}

export function identifyItemHelper(item: GameItem, effLevel: number): GameItem {
  if (item.isIdentified) return item;

  // 1. 고유 유니크 / 세트 / 레전더리 아이템 식별: GAME_ITEMS_POOL에서 원본 고유 스탯 완벽 복원
  if (item.realUniqueName || item.rarity === 'set' || item.rarity === 'unique' || item.rarity === 'legendary') {
    const targetName = item.realUniqueName || item.name;
    const poolItem = GAME_ITEMS_POOL.find(p => p.name === targetName || p.id === item.id || (item.setName && p.setName === item.setName));

    if (poolItem) {
      // 난이도 스케일링 보존: 드랍 시 적용된 배율을 감정 후에도 유지한다.
      // (기준: 풀 원본 대비 min/max/def/hp 비율, 최소 1배 — 하향 없음)
      const ratioOf = (dropped: number | undefined, base: number | undefined): number => {
        if (dropped === undefined || !base || base <= 0) return 1;
        return Math.max(1, dropped / base);
      };
      const dmgRatio = Math.max(
        ratioOf(item.stats.minDmg, poolItem.stats.minDmg),
        ratioOf(item.stats.maxDmg, poolItem.stats.maxDmg)
      );
      const defRatio = ratioOf(item.stats.defense, poolItem.stats.defense);
      const hpRatio = ratioOf(item.stats.hp, poolItem.stats.hp);
      const scale = Math.min(4, Math.max(dmgRatio, defRatio, hpRatio, 1));

      return {
        ...item,
        name: poolItem.name,
        baseItemName: poolItem.baseItemName || item.baseItemName || '장비',
        rarity: poolItem.rarity,
        setName: poolItem.setName || item.setName,
        stats: {
          ...poolItem.stats,
          ...(poolItem.stats.minDmg !== undefined ? { minDmg: Math.floor(poolItem.stats.minDmg * scale) } : {}),
          ...(poolItem.stats.maxDmg !== undefined ? { maxDmg: Math.floor(poolItem.stats.maxDmg * scale) } : {}),
          ...(poolItem.stats.defense !== undefined ? { defense: Math.floor(poolItem.stats.defense * scale) } : {}),
          ...(poolItem.stats.hp !== undefined ? { hp: Math.floor(poolItem.stats.hp * scale) } : {})
        },
        subAffixes: poolItem.subAffixes ? [...poolItem.subAffixes] : [],
        specialEffect: poolItem.specialEffect || item.specialEffect,
        icon: poolItem.icon || item.icon,
        isIdentified: true,
        description: `데커드 케인이 감정한 [${poolItem.name}] 장비입니다.`
      };
    }
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
  const UNIQUE_GLOVES = ["드라큘의 손아귀 (Dracul's Grasp)", '안수 (Laying of Hands)', '메이지피스트 (Magefist)', '챈스 가드 (Chance Guards)', '블러드피스트 (Bloodfist)'];
  const UNIQUE_BOOTS = ['고어 라이더 (Gore Rider)', '전쟁 여행자 (War Traveler)', '물나그네 부츠 (Waterwalk)', '핫스퍼 (Hotspur)', '통과의례'];
  const UNIQUE_RINGS = ['요르단의 반지 (Stone of Jordan)', '나겔링 (Nagelring)', '불카토스의 결혼반지', '왜성의 반지', '칠흑소용돌이 (Raven Frost)'];
  const UNIQUE_AMULETS = ["마라의 만화경 (Mara's Kaleidoscope)", "대군주의 진노 (Highlord's Wrath)", "고양이의 눈 (Cat's Eye)", "아트마의 스카라베"];

  if (item.rarity === 'unique' || item.rarity === 'legendary') {
    const namesList = isWpn
      ? UNIQUE_WEAPONS
      : item.slot === 'gloves'
      ? UNIQUE_GLOVES
      : item.slot === 'boots'
      ? UNIQUE_BOOTS
      : item.slot === 'amulet'
      ? UNIQUE_AMULETS
      : isArm
      ? UNIQUE_ARMORS
      : UNIQUE_RINGS;
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
