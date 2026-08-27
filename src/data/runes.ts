// 1. Diablo II Runes Definition (El to Zod - Complete 33 Runes)
export interface D2RuneDef {
  id: string;
  name: string;
  number: number;
  weaponBonus: string;
  armorBonus: string;
  statsWeapon: Record<string, number>;
  statsArmor: Record<string, number>;
}

export const D2_RUNES: Record<string, D2RuneDef> = {
  El: { id: 'El', name: '엘 (El) 룬', number: 1, weaponBonus: '공격력 +5, 치명타율 +2%', armorBonus: '방어력 +15', statsWeapon: { minDmg: 5, maxDmg: 5, critChance: 2 }, statsArmor: { defense: 15 } },
  Eld: { id: 'Eld', name: '엘드 (Eld) 룬', number: 2, weaponBonus: '오버킬 효율 +25%, 공격력 +6', armorBonus: '회피율 +7%, 방어력 +20', statsWeapon: { minDmg: 6, maxDmg: 6, overkillEfficiency: 25 }, statsArmor: { defense: 20, evasion: 7 } },
  Tir: { id: 'Tir', name: '티르 (Tir) 룬', number: 3, weaponBonus: '매 턴 분노 회복 +2, 공격력 +4', armorBonus: '매 턴 분노 회복 +2, 생명력 +15', statsWeapon: { minDmg: 4, maxDmg: 4, turnRageRegen: 2 }, statsArmor: { hp: 15, turnRageRegen: 2 } },
  Nef: { id: 'Nef', name: '네프 (Nef) 룬', number: 4, weaponBonus: '적 밀쳐내기 (Knockback), 공격력 +5', armorBonus: '원거리 방어력 +30', statsWeapon: { minDmg: 5, maxDmg: 5, knockback: 1, overkillEfficiency: 20 }, statsArmor: { defense: 30 } },
  Eth: { id: 'Eth', name: '에드 (Eth) 룬', number: 5, weaponBonus: '목표물 방어력 -25% 관통', armorBonus: '분노 소모량 -10%, 분노 회복 +3', statsWeapon: { minDmg: 5, maxDmg: 10, targetDefenseReduction: 25 }, statsArmor: { defense: 15, rageCostReduction: 10, turnRageRegen: 3 } },
  Ith: { id: 'Ith', name: '아이드 (Ith) 룬', number: 6, weaponBonus: '최대 대미지 +9', armorBonus: '피격 시 분노 전환, 생명력 +25', statsWeapon: { maxDmg: 9 }, statsArmor: { hp: 25, turnRageRegen: 2 } },
  Tal: { id: 'Tal', name: '탈 (Tal) 룬', number: 7, weaponBonus: '독 피해 10~20 추가', armorBonus: '독/모든 저항 +15%, 방어력 +20', statsWeapon: { minDmg: 10, maxDmg: 20 }, statsArmor: { defense: 20, allResist: 15 } },
  Ral: { id: 'Ral', name: '랄 (Ral) 룬', number: 8, weaponBonus: '화염 피해 5~30 추가', armorBonus: '화염/모든 저항 +15%, 방어력 +20', statsWeapon: { minDmg: 5, maxDmg: 30 }, statsArmor: { defense: 20, allResist: 15 } },
  Ort: { id: 'Ort', name: '오르트 (Ort) 룬', number: 9, weaponBonus: '번개 피해 1~50 추가', armorBonus: '번개/모든 저항 +15%, 방어력 +20', statsWeapon: { minDmg: 1, maxDmg: 50 }, statsArmor: { defense: 20, allResist: 15 } },
  Thul: { id: 'Thul', name: '주울 (Thul) 룬', number: 10, weaponBonus: '냉기 피해 3~14, 오버킬 +15%', armorBonus: '냉기/모든 저항 +15%, 방어력 +20', statsWeapon: { minDmg: 3, maxDmg: 14, overkillEfficiency: 15 }, statsArmor: { defense: 20, allResist: 15 } },
  Amn: { id: 'Amn', name: '앰 (Amn) 룬', number: 11, weaponBonus: '타격 시 생명력 4% 흡수', armorBonus: '방어력 +35', statsWeapon: { lifeSteal: 4 }, statsArmor: { defense: 35 } },
  Sol: { id: 'Sol', name: '솔 (Sol) 룬', number: 12, weaponBonus: '최소 대미지 +9', armorBonus: '받는 피해 7% 감소, 방어력 +35', statsWeapon: { minDmg: 9 }, statsArmor: { defense: 35, damageReduction: 7 } },
  Shael: { id: 'Shael', name: '샤엘 (Shael) 룬', number: 13, weaponBonus: '공격 속도 +20%, 치명타 +8%', armorBonus: '타격 회복(회피 +5%), 방어력 +35', statsWeapon: { attackSpeed: 20, critChance: 8, overkillEfficiency: 15 }, statsArmor: { defense: 35, evasion: 5 } },
  Dol: { id: 'Dol', name: '돌 (Dol) 룬', number: 14, weaponBonus: '적중 시 몬스터 제압, 공격력 +15', armorBonus: '생명력 회복 및 최대 생명력 +60', statsWeapon: { minDmg: 12, maxDmg: 18, critChance: 5 }, statsArmor: { hp: 60, con: 5 } },
  Hel: { id: 'Hel', name: '헬 (Hel) 룬', number: 15, weaponBonus: '착용 부담 경감 (치명타 +10%)', armorBonus: '착용 부담 경감 (회피 +8%, 방어력 +40)', statsWeapon: { critChance: 10 }, statsArmor: { defense: 40, evasion: 8 } },
  Io: { id: 'Io', name: '이오 (Io) 룬', number: 16, weaponBonus: '활력(CON) +10, 공격력 +10', armorBonus: '활력(CON) +10, 생명력 +40', statsWeapon: { con: 10, minDmg: 8, maxDmg: 14 }, statsArmor: { con: 10, hp: 40 } },
  Lum: { id: 'Lum', name: '룸 (Lum) 룬', number: 17, weaponBonus: '지능/지혜 +10, 분노 회복 +3', armorBonus: '지능/지혜 +10, 모든 저항 +10%', statsWeapon: { int: 10, wis: 10, turnRageRegen: 3 }, statsArmor: { int: 10, wis: 10, allResist: 10 } },
  Ko: { id: 'Ko', name: '코 (Ko) 룬', number: 18, weaponBonus: '민첩(DEX) +10, 공속 +10%', armorBonus: '민첩(DEX) +10, 회피 +5%', statsWeapon: { dex: 10, attackSpeed: 10 }, statsArmor: { dex: 10, evasion: 5 } },
  Fal: { id: 'Fal', name: '팔 (Fal) 룬', number: 19, weaponBonus: '힘(STR) +10, 공격력 +15', armorBonus: '힘(STR) +10, 방어력 +45', statsWeapon: { str: 10, minDmg: 12, maxDmg: 18 }, statsArmor: { str: 10, defense: 45 } },
  Lem: { id: 'Lem', name: '렘 (Lem) 룬', number: 20, weaponBonus: '괴물로부터 얻는 골드 +75%', armorBonus: '괴물로부터 얻는 골드 +50%', statsWeapon: { goldFind: 75 }, statsArmor: { goldFind: 50 } },
  Pul: { id: 'Pul', name: '풀 (Pul) 룬', number: 21, weaponBonus: '악마/엘리트 피해 +30%, 공격력 +25', armorBonus: '방어력 +50, 회피율 +5%', statsWeapon: { minDmg: 20, maxDmg: 30, damageToDemons: 30 }, statsArmor: { defense: 50, evasion: 5 } },
  Um: { id: 'Um', name: '움 (Um) 룬', number: 22, weaponBonus: '상처 악화 (치명타 +15%, 오버킬 +25%)', armorBonus: '모든 저항 +15%, 방어력 +60', statsWeapon: { minDmg: 20, maxDmg: 30, critChance: 15, openWounds: 25 }, statsArmor: { defense: 60, allResist: 15 } },
  Mal: { id: 'Mal', name: '말 (Mal) 룬', number: 23, weaponBonus: '괴물 회복 저지, 공격력 +35', armorBonus: '받는 피해 7% 감소, 방어력 +70', statsWeapon: { minDmg: 30, maxDmg: 40 }, statsArmor: { defense: 70, damageReduction: 7 } },
  Ist: { id: 'Ist', name: '이스트 (Ist) 룬', number: 24, weaponBonus: '매직 아이템 발견 확률 +30%', armorBonus: '매직 아이템 발견 확률 +25%', statsWeapon: { fortune: 30 }, statsArmor: { fortune: 25 } },
  Gul: { id: 'Gul', name: '굴 (Gul) 룬', number: 25, weaponBonus: '공격 등급 +20% (치명타 +20%)', armorBonus: '모든 저항 +15%, 방어력 +80', statsWeapon: { critChance: 20 }, statsArmor: { defense: 80, allResist: 15 } },
  Vex: { id: 'Vex', name: '벡스 (Vex) 룬', number: 26, weaponBonus: '타격 시 분노 대량 충전, 공격력 +40', armorBonus: '모든 저항 +15%, 방어력 +90', statsWeapon: { minDmg: 35, maxDmg: 55, turnRageRegen: 8, rageCostReduction: 15 }, statsArmor: { defense: 90, allResist: 15 } },
  Ohm: { id: 'Ohm', name: '옴 (Ohm) 룬', number: 27, weaponBonus: '피해량 대폭 증가 (+50급 강화)', armorBonus: '방어력 +100, 모든 저항 +15%', statsWeapon: { minDmg: 50, maxDmg: 85, overkillEfficiency: 35 }, statsArmor: { defense: 100, allResist: 15 } },
  Lo: { id: 'Lo', name: '로 (Lo) 룬', number: 28, weaponBonus: '치명적 공격 20% (치명타율 +20%, 피해 +50%)', armorBonus: '방어력 +120, 피해 감소 5%', statsWeapon: { critChance: 20, critDamage: 50 }, statsArmor: { defense: 120, damageReduction: 5 } },
  Sur: { id: 'Sur', name: '수르 (Sur) 룬', number: 29, weaponBonus: '목표물 무력화, 공격력 +70', armorBonus: '최대 분노 회복 +10, 생명력 +100', statsWeapon: { minDmg: 60, maxDmg: 90, critChance: 15 }, statsArmor: { hp: 100, turnRageRegen: 10 } },
  Ber: { id: 'Ber', name: '베르 (Ber) 룬', number: 30, weaponBonus: '강타 확률 20% (Crushing Blow)', armorBonus: '피해 감소 8%, 방어력 +150, 생명력 +120', statsWeapon: { minDmg: 70, maxDmg: 110, crushingBlow: 20 }, statsArmor: { defense: 150, hp: 120, damageReduction: 8 } },
  Jah: { id: 'Jah', name: '자 (Jah) 룬', number: 31, weaponBonus: '목표물 방어 완전 무시 (ITD)', armorBonus: '최대 생명력 대폭 증가 (+180), 방어력 +150', statsWeapon: { minDmg: 90, maxDmg: 140, ignoreTargetDefense: 1 }, statsArmor: { hp: 180, defense: 150 } },
  Cham: { id: 'Cham', name: '참 (Cham) 룬', number: 32, weaponBonus: '빙결 면역 및 대상 동결 (공속 +20%)', armorBonus: '빙결 면역 (Cannot be Frozen), 회피 +15%', statsWeapon: { minDmg: 100, maxDmg: 150, attackSpeed: 20, cannotBeFrozen: 1 }, statsArmor: { defense: 180, cannotBeFrozen: 1, evasion: 15, allResist: 25 } },
  Zod: { id: 'Zod', name: '조드 (Zod) 룬', number: 33, weaponBonus: '파괴 불가 (Indestructible) - 절대 파멸의 힘', armorBonus: '파괴 불가 (Indestructible) - 절대 불멸의 수호', statsWeapon: { minDmg: 140, maxDmg: 220, critChance: 25, overkillEfficiency: 60 }, statsArmor: { defense: 250, hp: 250, allResist: 35, damageReduction: 10 } }
};
