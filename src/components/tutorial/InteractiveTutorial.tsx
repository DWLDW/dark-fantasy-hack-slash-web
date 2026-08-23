import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../../state/gameStore';
import {
  Compass,
  ArrowRight,
  BookOpen,
  Dices,
  Sparkles,
  Shield,
  Zap,
  Backpack,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export interface TutorialStepConfig {
  id: string;
  target: string;
  title: string;
  category: string;
  desc: string;
  tip?: string;
  icon: React.ElementType;
  accentColor: string;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    id: 'dungeon_select',
    target: 'dungeon_select',
    title: '1. 던전 선택 (Dungeon Gate)',
    category: '원정 탐험',
    desc: '1막(지하묘지)부터 5막(세계석 성채)까지 도전할 액트를 선택합니다. 이전 막을 클리어해야 상위 막이 해금됩니다.',
    tip: '💡 액트마다 고유한 몬스터 패턴과 유니크 드랍 테이블이 존재합니다.',
    icon: Compass,
    accentColor: '#ef4444'
  },
  {
    id: 'deploy',
    target: 'deploy',
    title: '2. 즉시 출격 (Instant Deploy)',
    category: '전투 진입',
    desc: '최근 공략 중인 던전으로 즉시 출격합니다. 마을에서 [Space] 키를 누르면 즉시 다음 전투에 돌입할 수 있습니다.',
    tip: '💡 적 무리를 소탕하며 전진하고 최종 13번째 방에서 보스를 격살하세요!',
    icon: ArrowRight,
    accentColor: '#f59e0b'
  },
  {
    id: 'cain',
    target: 'cain',
    title: '3. 데커드 케인 (일괄 감정)',
    category: '마을 시설',
    desc: '던전에서 수집한 미확인 유니크, 세트, 레어 장비를 한 번의 클릭으로 무료 감정하고 잠든 강력한 옵션을 개방합니다.',
    tip: '💡 "Stay awhile and listen!" — 감정된 유니크 장비는 고유 특수 효과를 발휘합니다.',
    icon: BookOpen,
    accentColor: '#60a5fa'
  },
  {
    id: 'gheed',
    target: 'gheed',
    title: '4. 기드의 암시장 도박 (Gamble)',
    category: '마을 시설',
    desc: '골드를 투자하여 무기, 방어구, 반지, 목걸이를 도박으로 구매합니다. 일정 확률로 대박 유니크/전설 장비가 출현합니다.',
    tip: '💡 여유 골드가 생기면 기드의 도박소에서 슬롯 업그레이드를 노려보세요.',
    icon: Dices,
    accentColor: '#fbbf24'
  },
  {
    id: 'runewords',
    target: 'runewords',
    title: '5. 룬워드 & 호라드릭 큐브 (Crafting)',
    category: '마을 시설',
    desc: '룬(El ~ Zod)을 소켓 장비에 정확한 순서로 각인하여 전설 룬워드(강철, 통찰, 잠행 등)를 제작하거나 상위 룬으로 변환합니다.',
    tip: '💡 2소켓 숏소드에 [Tir + El] 룬을 박으면 초반 종결 무기 "강철(Steel)" 완성!',
    icon: Sparkles,
    accentColor: '#a855f7'
  },
  {
    id: 'stats',
    target: 'stats',
    title: '6. 캐릭터 스탯 성장 [C]',
    category: '캐릭터 육성',
    desc: '레벨업으로 획득한 포인트를 힘(공격/방어), 민첩(명중/치명), 활력(생명력), 지혜/지능(마나), 매력(아이템 발견률)에 투자합니다.',
    tip: '💡 단축키 [C]로 언제든지 캐릭터 상세 스탯창을 열 수 있습니다.',
    icon: Shield,
    accentColor: '#f59e0b'
  },
  {
    id: 'skills',
    target: 'skills',
    title: '7. 스킬 슬롯 & 룬 각인 [K]',
    category: '전투 시스템',
    desc: '워리어 스킬을 레벨업하고 Q/W/E/R 단축키 슬롯을 교체하거나 5대 원소 스킬 룬(화염, 서리, 번개, 맹독, 공허)을 각인합니다.',
    tip: '💡 Lv 3에 해금되는 "처형(Execute)"으로 전열을 격살하여 후열을 일격 관통 소탕하세요!',
    icon: Zap,
    accentColor: '#c084fc'
  },
  {
    id: 'inventory',
    target: 'inventory',
    title: '8. 장비 인벤토리 & 일괄 판매 [I]',
    category: '아이템 관리',
    desc: '획득한 장비를 부위별로 장착하고 스탯을 비교합니다. 40칸 상한에 도달하기 전 일반 장비 일괄 판매로 골드를 수급하세요.',
    tip: '💡 단축키 [I]로 가방을 열고, 승리 화면의 "추천 장착"으로 더 좋은 장비를 바로 착용하세요.',
    icon: Backpack,
    accentColor: '#34d399'
  }
];

export const InteractiveTutorial: React.FC = () => {
  const { isTutorialOpen, tutorialStep, setTutorialStep, completeTutorial } = useGame();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [boxStyle, setBoxStyle] = useState<React.CSSProperties>({});
  const updateTimeoutRef = useRef<number | null>(null);

  const step = TUTORIAL_STEPS[tutorialStep] || TUTORIAL_STEPS[0];
  const isFirst = tutorialStep === 0;
  const isLast = tutorialStep === TUTORIAL_STEPS.length - 1;

  const updatePosition = useCallback(() => {
    if (!isTutorialOpen) return;
    const el = document.querySelector(`[data-tutorial="${step.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Calculate ideal popover position
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cardWidth = Math.min(380, viewportWidth - 32);
      
      let top = rect.bottom + 14;
      let left = rect.left + (rect.width / 2) - (cardWidth / 2);

      // Adjust horizontal overflow
      if (left < 16) left = 16;
      if (left + cardWidth > viewportWidth - 16) left = viewportWidth - cardWidth - 16;

      // Adjust vertical overflow (if target is near bottom, position card above)
      if (top + 240 > viewportHeight) {
        top = Math.max(16, rect.top - 250);
      }

      setBoxStyle({
        position: 'fixed',
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        width: `${cardWidth}px`,
        zIndex: 9999
      });
    } else {
      // Fallback: center of screen if element not in DOM
      setTargetRect(null);
      setBoxStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(380px, calc(100vw - 32px))',
        zIndex: 9999
      });
    }
  }, [isTutorialOpen, step.target]);

  useEffect(() => {
    updatePosition();
    const handleResize = () => {
      if (updateTimeoutRef.current) window.clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = window.setTimeout(updatePosition, 80);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (updateTimeoutRef.current) window.clearTimeout(updateTimeoutRef.current);
    };
  }, [updatePosition]);

  if (!isTutorialOpen) return null;

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-[9990] select-none pointer-events-auto">
      {/* 1. Backdrop with Spotlight Hole Cutout */}
      {targetRect ? (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out rounded-lg"
          style={{
            top: `${targetRect.top - 5}px`,
            left: `${targetRect.left - 5}px`,
            width: `${targetRect.width + 10}px`,
            height: `${targetRect.height + 10}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.82), 0 0 20px rgba(251, 191, 36, 0.6)',
            border: `2px solid ${step.accentColor}`
          }}
        >
          {/* Subtle pulsating beacon animation */}
          <span
            className="absolute -inset-1 rounded-lg animate-ping opacity-30"
            style={{ backgroundColor: step.accentColor }}
          />
        </div>
      ) : (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
      )}

      {/* 2. Interactive Tooltip Popover Card */}
      <div
        className="bg-gradient-to-b from-iron-900 via-iron-950 to-iron-950 border-2 rounded-xl p-4 sm:p-5 shadow-[0_0_40px_rgba(0,0,0,0.9)] animate-fade-in text-gray-200"
        style={{
          ...boxStyle,
          borderColor: step.accentColor
        }}
      >
        {/* Step Category & Close / Skip */}
        <div className="flex items-center justify-between pb-2 border-b border-iron-800 mb-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold" style={{ color: step.accentColor }}>
            <GraduationCap className="w-4 h-4" />
            <span>초기 온보딩 가이드 ({tutorialStep + 1} / {TUTORIAL_STEPS.length})</span>
          </div>

          <button
            onClick={completeTutorial}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer flex items-center gap-1 text-[10px] font-mono"
            title="튜토리얼 건너뛰기"
          >
            <span>건너뛰기</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Title & Icon */}
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow flex-shrink-0"
            style={{
              backgroundColor: `${step.accentColor}20`,
              border: `1px solid ${step.accentColor}60`,
              color: step.accentColor
            }}
          >
            <StepIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">
              {step.category}
            </span>
            <h3 className="font-cinzel font-black text-sm text-white leading-snug">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Step Description */}
        <p className="text-xs text-gray-300 leading-relaxed font-sans mb-2">
          {step.desc}
        </p>

        {/* Step Tip */}
        {step.tip && (
          <div className="p-2 rounded bg-iron-900/80 border border-iron-800 text-[11px] text-amber-200 font-mono mb-3">
            {step.tip}
          </div>
        )}

        {/* Step Indicator Dots & Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-iron-800">
          {/* Step Progress Dots */}
          <div className="flex items-center gap-1">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTutorialStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === tutorialStep
                    ? 'w-5 bg-amber-400'
                    : idx < tutorialStep
                    ? 'bg-emerald-500'
                    : 'bg-iron-700'
                }`}
              />
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-1.5">
            {!isFirst && (
              <button
                onClick={() => setTutorialStep(tutorialStep - 1)}
                className="px-2.5 py-1.5 rounded bg-iron-900 hover:bg-iron-800 text-gray-300 hover:text-white border border-iron-700 text-xs font-bold font-mono flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>이전</span>
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => setTutorialStep(tutorialStep + 1)}
                className="px-3.5 py-1.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 text-xs font-black flex items-center gap-1 transition shadow cursor-pointer transform active:scale-95"
              >
                <span>다음</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={completeTutorial}
                className="px-3.5 py-1.5 rounded bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-iron-950 text-xs font-black flex items-center gap-1 transition shadow cursor-pointer transform active:scale-95 animate-pulse"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>게임 시작!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
