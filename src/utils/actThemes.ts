/**
 * Act Themes Helper
 * Defines visual themes (backgrounds, ambient glows, borders, accent colors) for Acts 1-5.
 */

export interface ActTheme {
  act: number;
  name: string;
  subtitle: string;
  bgGradient: string;
  containerBg: string;
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
    bgGradient: 'bg-gradient-to-b from-slate-950 via-red-950/20 to-black',
    containerBg: 'bg-gradient-to-b from-iron-950/95 via-red-950/25 to-iron-950/95',
    borderColor: 'border-red-900/60',
    glowShadow: 'shadow-[0_0_35px_rgba(153,27,27,0.2)]',
    ambientGlow: 'bg-red-600/10',
    accentBadge: 'bg-red-950/80 border-red-700 text-red-300',
    bossHudGlow: 'border-red-700/80 shadow-[0_0_25px_rgba(220,38,38,0.35)]',
    themeIcon: '🩸'
  },
  2: {
    act: 2,
    name: '동방의 보석 루트 골레인',
    subtitle: '작열하는 사막 & 고대 파라오 석묘',
    bgGradient: 'bg-gradient-to-b from-stone-950 via-amber-950/25 to-zinc-950',
    containerBg: 'bg-gradient-to-b from-stone-950/95 via-amber-950/30 to-stone-950/95',
    borderColor: 'border-amber-700/60',
    glowShadow: 'shadow-[0_0_35px_rgba(217,119,6,0.22)]',
    ambientGlow: 'bg-amber-500/10',
    accentBadge: 'bg-amber-950/80 border-amber-600 text-amber-300',
    bossHudGlow: 'border-amber-600/80 shadow-[0_0_25px_rgba(245,158,11,0.35)]',
    themeIcon: '🏜️'
  },
  3: {
    act: 3,
    name: '자카룸의 심연 쿠라스트',
    subtitle: '맹독 밀림 정글 & 증오의 억류지',
    bgGradient: 'bg-gradient-to-b from-slate-950 via-emerald-950/25 to-stone-950',
    containerBg: 'bg-gradient-to-b from-slate-950/95 via-emerald-950/30 to-slate-950/95',
    borderColor: 'border-emerald-700/60',
    glowShadow: 'shadow-[0_0_35px_rgba(5,150,105,0.22)]',
    ambientGlow: 'bg-emerald-500/10',
    accentBadge: 'bg-emerald-950/80 border-emerald-600 text-emerald-300',
    bossHudGlow: 'border-emerald-600/80 shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    themeIcon: '🌿'
  },
  4: {
    act: 4,
    name: '타오르는 불타는 지옥',
    subtitle: '용암 강 협곡 & 혼돈의 성역',
    bgGradient: 'bg-gradient-to-b from-black via-red-950/40 to-black',
    containerBg: 'bg-gradient-to-b from-black/95 via-orange-950/35 to-black/95',
    borderColor: 'border-red-600/70',
    glowShadow: 'shadow-[0_0_40px_rgba(239,68,68,0.28)]',
    ambientGlow: 'bg-orange-600/15',
    accentBadge: 'bg-red-950/90 border-red-500 text-orange-300',
    bossHudGlow: 'border-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.45)]',
    themeIcon: '🔥'
  },
  5: {
    act: 5,
    name: '아리앗 산의 야만용사들',
    subtitle: '혹한의 설산 정상 & 파멸의 세계석',
    bgGradient: 'bg-gradient-to-b from-slate-950 via-cyan-950/25 to-indigo-950/40',
    containerBg: 'bg-gradient-to-b from-slate-950/95 via-indigo-950/30 to-slate-950/95',
    borderColor: 'border-cyan-600/60',
    glowShadow: 'shadow-[0_0_40px_rgba(6,182,212,0.25)]',
    ambientGlow: 'bg-cyan-500/12',
    accentBadge: 'bg-cyan-950/80 border-cyan-500 text-cyan-300',
    bossHudGlow: 'border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.4)]',
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

export function getActTheme(dungeonId?: string): ActTheme {
  const actNum = getActNumberFromDungeonId(dungeonId);
  return ACT_THEMES[actNum] || ACT_THEMES[1];
}
