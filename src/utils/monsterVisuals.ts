export type MonsterArchetype =
  | 'goblin'
  | 'skeleton'
  | 'zombie'
  | 'orc'
  | 'archer'
  | 'mage'
  | 'spider'
  | 'scorpion'
  | 'ghost'
  | 'demon'
  | 'goat'
  | 'beetle'
  | 'mummy'
  | 'knight'
  | 'worm'
  | 'mosquito'
  | 'vampire'
  | 'beast'
  | 'generic';

export interface ArchetypeVisual {
  id: MonsterArchetype;
  skin: string;
  accent: string;
  glow: string;
  eye: string;
}

export const ARCHETYPE_VISUALS: Record<MonsterArchetype, ArchetypeVisual> = {
  goblin: { id: 'goblin', skin: '#3f7a32', accent: '#1d3d18', glow: '#86efac', eye: '#facc15' },
  skeleton: { id: 'skeleton', skin: '#e7dcc4', accent: '#8b7a5c', glow: '#7dd3fc', eye: '#38bdf8' },
  zombie: { id: 'zombie', skin: '#6b7a3a', accent: '#3f2a1c', glow: '#a3e635', eye: '#fde047' },
  orc: { id: 'orc', skin: '#4d6b2e', accent: '#2a1c12', glow: '#f97316', eye: '#ef4444' },
  archer: { id: 'archer', skin: '#5b4636', accent: '#8b1e1e', glow: '#fca5a5', eye: '#fecaca' },
  mage: { id: 'mage', skin: '#3b2a55', accent: '#7c3aed', glow: '#c084fc', eye: '#e9d5ff' },
  spider: { id: 'spider', skin: '#2a1218', accent: '#7f1d1d', glow: '#fb7185', eye: '#ef4444' },
  scorpion: { id: 'scorpion', skin: '#9a3412', accent: '#431407', glow: '#fdba74', eye: '#facc15' },
  ghost: { id: 'ghost', skin: '#a5f3fc', accent: '#155e75', glow: '#67e8f9', eye: '#ecfeff' },
  demon: { id: 'demon', skin: '#7f1d1d', accent: '#1c0505', glow: '#f97316', eye: '#fde047' },
  goat: { id: 'goat', skin: '#78716c', accent: '#44403c', glow: '#fbbf24', eye: '#facc15' },
  beetle: { id: 'beetle', skin: '#14532d', accent: '#052e16', glow: '#4ade80', eye: '#86efac' },
  mummy: { id: 'mummy', skin: '#d6c29a', accent: '#92400e', glow: '#fbbf24', eye: '#fde68a' },
  knight: { id: 'knight', skin: '#64748b', accent: '#0f172a', glow: '#93c5fd', eye: '#bfdbfe' },
  worm: { id: 'worm', skin: '#9a3412', accent: '#431407', glow: '#fdba74', eye: '#fecaca' },
  mosquito: { id: 'mosquito', skin: '#365314', accent: '#1a2e05', glow: '#a3e635', eye: '#d9f99d' },
  vampire: { id: 'vampire', skin: '#e7d5d5', accent: '#7f1d1d', glow: '#fb7185', eye: '#ef4444' },
  beast: { id: 'beast', skin: '#7c4a1e', accent: '#3f2a14', glow: '#fdba74', eye: '#fbbf24' },
  generic: { id: 'generic', skin: '#57534e', accent: '#1c1917', glow: '#f87171', eye: '#fca5a5' }
};

export function getMonsterArchetype(icon?: string, name?: string): MonsterArchetype {
  const hay = `${icon || ''} ${name || ''}`;
  const ko = name || '';

  if (/👺|고블린/i.test(hay) || /goblin/i.test(hay)) return 'goblin';
  if (/🧛|흡혈|백작/i.test(hay)) return 'vampire';
  if (/💀|해골|뼈 |뼈궁|스켈/i.test(hay) || /skeleton/i.test(hay)) return 'skeleton';
  if (/🧟|좀비|구울|시체/i.test(hay) || /zombie|ghoul/i.test(hay)) return 'zombie';
  if (/👹|오크/i.test(hay) || /orc/i.test(hay)) return 'orc';
  if (/🏹|궁수/i.test(hay) || /archer/i.test(hay)) return 'archer';
  if (/🧙|🔮|주술|마법|사제|흑마|소환/i.test(hay) || /mage|shaman|priest/i.test(hay)) return 'mage';
  if (/🕷|🕷️|거미/i.test(hay) || /spider/i.test(hay)) return 'spider';
  if (/🦂|전갈/i.test(hay) || /scorpion/i.test(hay)) return 'scorpion';
  if (/👻|유령|환영/i.test(hay) || /ghost|wraith/i.test(hay)) return 'ghost';
  if (/👿|악마|마귀|서큐/i.test(hay) || /demon|succubus/i.test(hay)) return 'demon';
  if (/🐐|염소/i.test(hay) || /goat/i.test(hay)) return 'goat';
  if (/🪲|풍뎅|딱정/i.test(hay) || /beetle/i.test(hay)) return 'beetle';
  if (/🏺|미이라|미라/i.test(hay) || /mummy/i.test(hay)) return 'mummy';
  if (/🐛|구더기|유충|벌레|모래벌/i.test(hay) || /worm|larva/i.test(hay)) return 'worm';
  if (/🦟|모기/i.test(hay) || /mosquito/i.test(hay)) return 'mosquito';
  if (/🐆|시라소니|표범|야수/i.test(hay) || /beast|panther/i.test(hay)) return 'beast';
  if (/⚔|🛡|기사|방패|전사|집행/i.test(hay) || /knight|warrior/i.test(hay)) return 'knight';
  if (/오크/.test(ko)) return 'orc';
  return 'generic';
}

export function getElementGlow(element?: string): string {
  switch (element) {
    case 'fire': return '#f97316';
    case 'cold': return '#22d3ee';
    case 'lightning': return '#facc15';
    case 'poison': return '#4ade80';
    case 'void': return '#c084fc';
    default: return '#f87171';
  }
}
