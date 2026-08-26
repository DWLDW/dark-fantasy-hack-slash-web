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
  El: { id: 'El', name: '엘 (El) 룬', number: 1, weaponBonus: '공격력 +5, 명중률 증가', armorBonus: '방어력 +15, 시야 증가', statsWeapon: { minDmg: 3, maxDmg: 5 }, statsArmor: { defense: 15 } },
  Eld: { id: 'Eld', name: '엘드 (Eld) 룬', number: 2, weaponBonus: '언데드에게 주는 피해 +50%', armorBonus: '방어 성공률 +7%', statsWeapon: { minDmg: 4, maxDmg: 8 }, statsArmor: { defense: 20 } },
  Tir: { id: 'Tir', name: '티르 (Tir) 룬', number: 3, weaponBonus: '적 처치 시 분노/마나 +2', armorBonus: '적 처치 시 분노/마나 +2', statsWeapon: { minDmg: 2, maxDmg: 4 }, statsArmor: { hp: 15 } },
  Nef: { id: 'Nef', name: '네프 (Nef) 룬', number: 4, weaponBonus: '적 밀쳐내기 (Knockback)', armorBonus: '원거리 방어력 +30', statsWeapon: { minDmg: 3, maxDmg: 6 }, statsArmor: { defense: 30 } },
  Eth: { id: 'Eth', name: '에드 (Eth) 룬', number: 5, weaponBonus: '목표물의 방어력 -25%', armorBonus: '분노/마나 회복 속도 +15%', statsWeapon: { overkillEfficiency: 15 }, statsArmor: { defense: 15 } },
  Ith: { id: 'Ith', name: '아이드 (Ith) 룬', number: 6, weaponBonus: '최대 대미지 +9', armorBonus: '받는 피해의 15%를 분노로 전환', statsWeapon: { maxDmg: 9 }, statsArmor: { hp: 25 } },
  Tal: { id: 'Tal', name: '탈 (Tal) 룬', number: 7, weaponBonus: '독 피해 +75', armorBonus: '독 저항 +35%', statsWeapon: { minDmg: 8, maxDmg: 15 }, statsArmor: { defense: 20, allResist: 10 } },
  Ral: { id: 'Ral', name: '랄 (Ral) 룬', number: 8, weaponBonus: '화염 피해 5~30 추가', armorBonus: '화염 저항 +35%', statsWeapon: { minDmg: 5, maxDmg: 30 }, statsArmor: { defense: 20, allResist: 10 } },
  Ort: { id: 'Ort', name: '오르트 (Ort) 룬', number: 9, weaponBonus: '번개 피해 1~50 추가', armorBonus: '번개 저항 +35%', statsWeapon: { minDmg: 1, maxDmg: 50 }, statsArmor: { defense: 20, allResist: 10 } },
  Thul: { id: 'Thul', name: '주울 (Thul) 룬', number: 10, weaponBonus: '냉기 피해 3~14, 빙결', armorBonus: '냉기 저항 +35%', statsWeapon: { minDmg: 3, maxDmg: 14, overkillEfficiency: 10 }, statsArmor: { defense: 20, allResist: 10 } },
  Amn: { id: 'Amn', name: '앰 (Amn) 룬', number: 11, weaponBonus: '타격 시 생명력 4% 흡수', armorBonus: '공격자에게 피해 14 반사', statsWeapon: { lifeSteal: 4 }, statsArmor: { defense: 25 } },
  Sol: { id: 'Sol', name: '솔 (Sol) 룬', number: 12, weaponBonus: '최소 대미지 +9', armorBonus: '받는 피해 7 감소', statsWeapon: { minDmg: 9 }, statsArmor: { defense: 35 } },
  Shael: { id: 'Shael', name: '샤엘 (Shael) 룬', number: 13, weaponBonus: '공격 속도 +20%', armorBonus: '타격 회복 속도 +20%', statsWeapon: { attackSpeed: 20, critChance: 8, overkillEfficiency: 15 }, statsArmor: { defense: 30 } },
  Dol: { id: 'Dol', name: '돌 (Dol) 룬', number: 14, weaponBonus: '적중 시 몬스터 도주 25%', armorBonus: '생명력 회복 +7', statsWeapon: { minDmg: 10, maxDmg: 15 }, statsArmor: { hp: 50 } },
  Hel: { id: 'Hel', name: '헬 (Hel) 룬', number: 15, weaponBonus: '착용 요구치 -20%', armorBonus: '착용 요구치 -15%', statsWeapon: { critChance: 5 }, statsArmor: { defense: 40 } },
  Io: { id: 'Io', name: '이오 (Io) 룬', number: 16, weaponBonus: '활력(Vitality) +10', armorBonus: '활력(Vitality) +10', statsWeapon: { con: 10, minDmg: 6, maxDmg: 12 }, statsArmor: { con: 10, hp: 40 } },
  Lum: { id: 'Lum', name: '룸 (Lum) 룬', number: 17, weaponBonus: '에너지(Energy) +10', armorBonus: '에너지(Energy) +10', statsWeapon: { int: 10, wis: 10 }, statsArmor: { int: 10, allResist: 10 } },
  Ko: { id: 'Ko', name: '코 (Ko) 룬', number: 18, weaponBonus: '민첩(Dexterity) +10, 공속 +10%', armorBonus: '민첩(Dexterity) +10, 회피 +5%', statsWeapon: { dex: 10, attackSpeed: 10 }, statsArmor: { dex: 10, evasion: 5 } },
  Fal: { id: 'Fal', name: '팔 (Fal) 룬', number: 19, weaponBonus: '힘(Strength) +10', armorBonus: '힘(Strength) +10', statsWeapon: { str: 10, minDmg: 12, maxDmg: 18 }, statsArmor: { str: 10, defense: 45 } },
  Lem: { id: 'Lem', name: '렘 (Lem) 룬', number: 20, weaponBonus: '괴물로부터 얻는 골드 +75%', armorBonus: '괴물로부터 얻는 골드 +50%', statsWeapon: { fortune: 20 }, statsArmor: { fortune: 15 } },
  Pul: { id: 'Pul', name: '풀 (Pul) 룬', number: 21, weaponBonus: '악마에 대한 피해 +75%', armorBonus: '방어력 +30%', statsWeapon: { minDmg: 15, maxDmg: 25 }, statsArmor: { defense: 50 } },
  Um: { id: 'Um', name: '움 (Um) 룬', number: 22, weaponBonus: '상처 악화 25% (출혈)', armorBonus: '모든 저항 +15%', statsWeapon: { minDmg: 20, maxDmg: 30, overkillEfficiency: 20 }, statsArmor: { defense: 60, allResist: 15 } },
  Mal: { id: 'Mal', name: '말 (Mal) 룬', number: 23, weaponBonus: '괴물 회복 저지', armorBonus: '마법 피해 7 감소', statsWeapon: { minDmg: 25, maxDmg: 35 }, statsArmor: { defense: 70 } },
  Ist: { id: 'Ist', name: '이스트 (Ist) 룬', number: 24, weaponBonus: '매직 아이템 발견 확률 +30%', armorBonus: '매직 아이템 발견 확률 +25%', statsWeapon: { fortune: 30 }, statsArmor: { fortune: 25 } },
  Gul: { id: 'Gul', name: '굴 (Gul) 룬', number: 25, weaponBonus: '공격 등급 +20%', armorBonus: '최대 독 저항 +5%', statsWeapon: { critChance: 12 }, statsArmor: { defense: 80 } },
  Vex: { id: 'Vex', name: '벡스 (Vex) 룬', number: 26, weaponBonus: '타격 시 마나/분노 4% 흡수', armorBonus: '최대 화염 저항 +5%', statsWeapon: { minDmg: 30, maxDmg: 50, lifeSteal: 4 }, statsArmor: { defense: 90, allResist: 15 } },
  Ohm: { id: 'Ohm', name: '옴 (Ohm) 룬', number: 27, weaponBonus: '피해량 +50% 증가', armorBonus: '최대 냉기 저항 +5%', statsWeapon: { minDmg: 40, maxDmg: 70 }, statsArmor: { defense: 100 } },
  Lo: { id: 'Lo', name: '로 (Lo) 룬', number: 28, weaponBonus: '치명적 공격 20% (Deadly Strike)', armorBonus: '최대 번개 저항 +5%', statsWeapon: { critChance: 20, critDamage: 50 }, statsArmor: { defense: 120 } },
  Sur: { id: 'Sur', name: '수르 (Sur) 룬', number: 29, weaponBonus: '목표물 시야 차단 (실명)', armorBonus: '최대 마나/분노 +5%', statsWeapon: { minDmg: 50, maxDmg: 80 }, statsArmor: { hp: 100 } },
  Ber: { id: 'Ber', name: '베르 (Ber) 룬', number: 30, weaponBonus: '강타 확률 20% (Crushing Blow)', armorBonus: '피해 감소 8%', statsWeapon: { minDmg: 60, maxDmg: 100, critChance: 15 }, statsArmor: { defense: 150, hp: 120 } },
  Jah: { id: 'Jah', name: '자 (Jah) 룬', number: 31, weaponBonus: '목표물의 방어력 완전 무시', armorBonus: '최대 생명력 5% 증가', statsWeapon: { minDmg: 80, maxDmg: 120, overkillEfficiency: 35 }, statsArmor: { hp: 150, defense: 150 } },
  Cham: { id: 'Cham', name: '참 (Cham) 룬', number: 32, weaponBonus: '빙결되지 않음, 대상 동결', armorBonus: '빙결되지 않음', statsWeapon: { minDmg: 90, maxDmg: 140 }, statsArmor: { defense: 180 } },
  Zod: { id: 'Zod', name: '조드 (Zod) 룬', number: 33, weaponBonus: '파괴 불가 (Indestructible)', armorBonus: '파괴 불가', statsWeapon: { minDmg: 120, maxDmg: 200, critChance: 25, overkillEfficiency: 50 }, statsArmor: { defense: 250, hp: 200, allResist: 30 } }
};
