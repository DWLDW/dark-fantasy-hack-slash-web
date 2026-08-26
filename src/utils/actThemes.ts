/**
 * Act Themes Helper
 * Defines visual themes (backgrounds, ambient glows, borders, accent colors) for Acts 1-5.
 * Tuned for visual comfort and high readability (deep obsidian & dark iron foundation).
 */

export interface ActTheme {
  act: number;
  name: string;
  subtitle: string;
  bgGradient: string;
  containerBg: string;
  bgImage: string;
  laneBg: string;
  laneBorder: string;
  borderColor: string;
  glowShadow: string;
  ambientGlow: string;
  accentBadge: string;
  bossHudGlow: string;
  themeIcon: string;
}

export const ACT_THEMES: Record<number, ActTheme> = {
  1: {
    act: 1,
    name: '보이지 않는 눈의 자매단',
    subtitle: '핏빛 황야 & 수도원 카타콤',
    bgGradient: 'bg-gradient-to-b from-[#0a0708] via-[#120a0c] to-[#080506]',
    containerBg: 'bg-[#0a0708]/95',
    bgImage: '/images/acts/act1.webp',
    laneBg: 'bg-[#150d0f]/90',
    laneBorder: 'border-rose-950/80 hover:border-rose-800/80',
    borderColor: 'border-rose-900/60',
    glowShadow: 'shadow-[0_0_20px_rgba(225,29,72,0.12)]',
    ambientGlow: 'bg-rose-950/20',
    accentBadge: 'bg-rose-950/90 border-rose-800 text-rose-300',
    bossHudGlow: 'border-rose-800/80 shadow-[0_0_15px_rgba(225,29,72,0.2)]',
    themeIcon: '🩸'
  },
  2: {
    act: 2,
    name: '동방의 보석 루트 골레인',
    subtitle: '작열하는 사막 & 고대 파라오 석묘',
    bgGradient: 'bg-gradient-to-b from-[#0c0906] via-[#140e08] to-[#080604]',
    containerBg: 'bg-[#0c0906]/95',
    bgImage: '/images/acts/act2.webp',
    laneBg: 'bg-[#17110a]/90',
    laneBorder: 'border-amber-950/80 hover:border-amber-800/80',
    borderColor: 'border-amber-900/60',
    glowShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    ambientGlow: 'bg-amber-950/20',
    accentBadge: 'bg-amber-950/90 border-amber-800 text-amber-300',
    bossHudGlow: 'border-amber-800/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    themeIcon: '🏜️'
  },
  3: {
    act: 3,
    name: '자카룸의 심연 쿠라스트',
    subtitle: '맹독 밀림 정글 & 증오의 억류지',
    bgGradient: 'bg-gradient-to-b from-[#060b08] via-[#0a120d] to-[#050806]',
    containerBg: 'bg-[#060b08]/95',
    bgImage: '/images/acts/act3.webp',
    laneBg: 'bg-[#0d1610]/90',
    laneBorder: 'border-emerald-950/80 hover:border-emerald-800/80',
    borderColor: 'border-emerald-900/60',
    glowShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    ambientGlow: 'bg-emerald-950/20',
    accentBadge: 'bg-emerald-950/90 border-emerald-800 text-emerald-300',
    bossHudGlow: 'border-emerald-800/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    themeIcon: '🌿'
  },
  4: {
    act: 4,
    name: '혼돈의 요새와 불지옥',
    subtitle: '용암 지옥 & 저주받은 혼돈의 성역',
    bgGradient: 'bg-gradient-to-b from-[#0e0606] via-[#160909] to-[#080404]',
    containerBg: 'bg-[#0e0606]/95',
    bgImage: '/images/acts/act4.webp',
    laneBg: 'bg-[#180b0b]/90',
    laneBorder: 'border-red-950/80 hover:border-red-800/80',
    borderColor: 'border-red-900/60',
    glowShadow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    ambientGlow: 'bg-red-950/20',
    accentBadge: 'bg-red-950/90 border-red-800 text-orange-300',
    bossHudGlow: 'border-red-800/80 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    themeIcon: '🔥'
  },
  5: {
    act: 5,
    name: '아리앗 산의 야만용사들',
    subtitle: '혹한의 설산 정상 & 파멸의 세계석',
    bgGradient: 'bg-gradient-to-b from-[#060a0f] via-[#0a1017] to-[#05080c]',
    containerBg: 'bg-[#060a0f]/95',
    bgImage: '/images/acts/act5.webp',
    laneBg: 'bg-[#0c141d]/90',
    laneBorder: 'border-cyan-950/80 hover:border-cyan-800/80',
    borderColor: 'border-cyan-900/60',
    glowShadow: 'shadow-[0_0_20px_rgba(6,182,212,0.12)]',
    ambientGlow: 'bg-cyan-950/20',
    accentBadge: 'bg-cyan-950/90 border-cyan-800 text-cyan-300',
    bossHudGlow: 'border-cyan-800/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    themeIcon: '❄️'
  }
};

/**
 * Resolves Act number (1-5) from dungeonId (e.g. 'act1_3_tower' -> 1)
 */
export function getActNumberFromDungeonId(dungeonId?: string): number {
  if (!dungeonId) return 1;
  const match = dungeonId.match(/act([1-5])/i);
  if (match) return parseInt(match[1], 10);
  return 1;
}

export function getActTheme(dungeonId?: string, overrideAct?: number): ActTheme {
  if (overrideAct && overrideAct >= 1 && overrideAct <= 5) {
    return ACT_THEMES[overrideAct] || ACT_THEMES[1];
  }
  const actNum = getActNumberFromDungeonId(dungeonId);
  return ACT_THEMES[actNum] || ACT_THEMES[1];
}
