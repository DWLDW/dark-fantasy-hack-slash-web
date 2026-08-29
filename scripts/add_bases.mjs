import fs from "fs";
let s = fs.readFileSync("C:/game/src/data/items.ts","utf8");

// Insert 6 new exceptional/mid bases before // ==================== EXPANDED DARK FANTASY
const insert = `  // ==================== B안 신규 무기 베이스 (평탄화 보강 + 무기군 확장) ====================
  {
    id: 'e_battle_sword_3s',
    name: '배틀 소드 (3 소켓)',
    baseItemName: '배틀 소드',
    rarity: 'normal',
    tier: 'exceptional',
    slot: 'weapon',
    sockets: 3,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'normal',
    baseAtbPercent: 55,
    stats: { minDmg: 13, maxDmg: 26, attackSpeed: 5 },
    value: 700,
    icon: 'Sword',
    description: '[익셉셔널 도검] 3개의 빈 소켓. Spirit/Insight 계열의 Act2~3 주력 베이스.',
    weaponGroup: 'sword',
    weaponSuperGroup: 'melee'
  },
  {
    id: 'e_war_axe_4s',
    name: '워 액스 (4 소켓)',
    baseItemName: '워 액스',
    rarity: 'normal',
    tier: 'exceptional',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 65,
    stats: { minDmg: 14, maxDmg: 28, attackSpeed: 10 },
    value: 850,
    icon: 'Sword',
    description: '[익셉셔널 도끼] 4개의 빈 소켓. 액스 전용 룬워드의 Act2~3 베이스.',
    weaponGroup: 'axe',
    weaponSuperGroup: 'melee'
  },
  {
    id: 'e_flail_3s',
    name: '플레일 (3 소켓)',
    baseItemName: '플레일',
    rarity: 'normal',
    tier: 'exceptional',
    slot: 'weapon',
    sockets: 3,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 70,
    stats: { minDmg: 10, maxDmg: 22, attackSpeed: 12 },
    value: 650,
    icon: 'Sword',
    description: '[익셉셔널 둔기] 3개의 빈 소켓. 메이스 전용 룬워드 베이스.',
    weaponGroup: 'mace',
    weaponSuperGroup: 'melee'
  },
  {
    id: 'e_hunter_bow_3s',
    name: '헌터 보우 (3 소켓)',
    baseItemName: '헌터 보우',
    rarity: 'normal',
    tier: 'exceptional',
    slot: 'weapon',
    sockets: 3,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 65,
    stats: { minDmg: 13, maxDmg: 29, attackSpeed: 15 },
    value: 900,
    icon: 'Sword',
    description: '[익셉셔널 활] 3개의 빈 소켓. Faith/Harmony 등 활 전용 룬워드 베이스.',
    weaponGroup: 'bow',
    weaponSuperGroup: 'missile'
  },
  {
    id: 'e_composite_bow_4s',
    name: '컴포지트 보우 (4 소켓)',
    baseItemName: '컴포지트 보우',
    rarity: 'normal',
    tier: 'exceptional',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 70,
    stats: { minDmg: 16, maxDmg: 32, attackSpeed: 18 },
    value: 1100,
    icon: 'Sword',
    description: '[익셉셔널 활] 4개의 빈 소켓. 상위 활 룬워드용 베이스.',
    weaponGroup: 'bow',
    weaponSuperGroup: 'missile'
  },
  {
    id: 'e_great_bow_4s',
    name: '그레이트 보우 (4 소켓)',
    baseItemName: '그레이트 보우',
    rarity: 'normal',
    tier: 'elite',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 68,
    stats: { minDmg: 24, maxDmg: 48, attackSpeed: 20 },
    value: 1800,
    icon: 'Sword',
    description: '[엘리트 활] 4개의 빈 소켓. Faith/Ice 등 종결 활 룬워드 베이스.',
    weaponGroup: 'bow',
    weaponSuperGroup: 'missile'
  },

'
;

const marker = "  // ==================== EXPANDED DARK FANTASY ARTIFACTS";
if(s.includes("B안 신규 무기 베이스")){
  console.log("already has bases, skip");
} else {
  s = s.replace(marker, insert + marker);
  fs.writeFileSync("C:/game/src/data/items.ts", s, "utf8");
  console.log("added bases, len", s.length);
}
