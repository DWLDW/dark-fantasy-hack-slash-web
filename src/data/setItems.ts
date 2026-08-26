import { ItemStats } from '../types/game';

export interface SetBonusStage {
  piecesRequired: number;
  description: string;
  stats: ItemStats;
}

export interface SetDefinition {
  setName: string;
  totalPieces: number;
  pieceNames: string[];
  bonuses: SetBonusStage[];
}

export const SET_DEFINITIONS: Record<string, SetDefinition> = {
  '시곤의 온전한 강철': {
    setName: '시곤의 온전한 강철',
    totalPieces: 3,
    pieceNames: [
      "시곤의 수호방패 (Sigon's Guard)",
      "시곤의 안식처 (Sigon's Shelter)",
      "시곤의 나막신 (Sigon's Sabots)"
    ],
    bonuses: [
      {
        piecesRequired: 2,
        description: '방어력 +100, 생명력 흡수(Life Steal) +5%',
        stats: { defense: 100, lifeSteal: 5 }
      },
      {
        piecesRequired: 3,
        description: '공격 속도(IAS) +30%, 모든 저항 +25%, 물리 피해 감소 +15%',
        stats: { attackSpeed: 30, allResist: 25, damageReduction: 15 }
      }
    ]
  },
  '고아의 부름': {
    setName: '고아의 부름',
    totalPieces: 2,
    pieceNames: [
      "기욤의 얼굴 (Guillaume's Face)",
      "빌헬름의 자부심 (Wilhelm's Pride)"
    ],
    bonuses: [
      {
        piecesRequired: 2,
        description: '모든 저항 +25%, 힘 +20, 회피율 +10%, 치명타율 +10%',
        stats: { allResist: 25, str: 20, evasion: 10, critChance: 10 }
      }
    ]
  },
  '사라진 제자': {
    setName: '사라진 제자',
    totalPieces: 2,
    pieceNames: [
      "안수 (Laying of Hands)",
      "통과의례 (Rite of Passage)"
    ],
    bonuses: [
      {
        piecesRequired: 2,
        description: '모든 저항 +30%, 최대 분노/마나 +30, 오버킬 효율 +25%',
        stats: { allResist: 30, mana: 30, overkillEfficiency: 25 }
      }
    ]
  }
};
