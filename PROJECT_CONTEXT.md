# PROJECT_CONTEXT.md

## 프로젝트 개요
Dark Fantasy Turn-Based Hack & Slash Loot RPG. React 18 + TypeScript + Vite + Tailwind CSS 기반 모바일 & PC 크로스플랫폼 웹 게임.
Dragon Quest 식 턴제 전투 기반 + Diablo II 식 오버킬 체인, 룬워드 크래프팅 및 파밍 루팅 시스템.

## 핵심 아키텍처
- **전투 엔진**: [combatEngine.ts](file:///c:/GAMEGAME/src/combat/combatEngine.ts) — `resolveAttack()`, 보스 저지(Break)/그로기/약점 타격 연산, `createDungeonFormation()`, `resolveHordeCounterAttack()`
- **던전 시스템**: [dungeons.ts](file:///c:/GAMEGAME/src/data/dungeons.ts) — 20개 던전, 5개 액트, `isDungeonUnlocked()`, `getHighestUnlockedDungeon()`
- **스킬 및 패시브**: [skills.ts](file:///c:/GAMEGAME/src/data/skills.ts) & [passiveSkills.ts](file:///c:/GAMEGAME/src/data/passiveSkills.ts) — 7종 액티브 스킬(Lv.30 한도) + 8대 워리어 패시브 마스터리 트리
- **스킬 관리 헬퍼**: [skillManager.ts](file:///c:/GAMEGAME/src/state/helpers/skillManager.ts) — 스킬 레벨업, 패시브 레벨업, 통합 SP 전액 초기화
- **스킬 UI 모달**: [SkillRuneModal.tsx](file:///c:/GAMEGAME/src/components/modals/SkillRuneModal.tsx) — 액티브 스킬 & 룬 슬롯 탭 / 패시브 스킬 마스터리 트리 탭
- **인벤토리 & 보관함 UI**: [InventoryModal.tsx](file:///c:/GAMEGAME/src/components/modals/InventoryModal.tsx) — 소지품 / 📦 보관함(Stash) / 🔮 룬 보관함 3대 탭, [전부 팔기] 및 🔒 아이템 잠금 보호, 상단 상세 스탯 + 하단 비교표
- **장비 평가 & 자동 장착**: [itemScoring.ts](file:///c:/GAMEGAME/src/utils/itemScoring.ts) — 잠긴 장착 장비 추천 장착 교체 방지 가드
- **전투 헬퍼**: [combatActionHelper.ts](file:///c:/GAMEGAME/src/state/helpers/combatActionHelper.ts) — 액션 경험치, 생명력 흡수, 분노/보호막 계산
- **던전/루팅 헬퍼**: [dungeonEventHelper.ts](file:///c:/GAMEGAME/src/state/helpers/dungeonEventHelper.ts) — 던전 드롭 생성, 난이도별 스케일링, 승리 전리품
- **게임 상태 관리**: [gameStore.tsx](file:///c:/GAMEGAME/src/state/gameStore.tsx) — 중앙 React Context + 안전한 persistence 타이머 + 보스 인터랙티브 턴 제어 + 보관함/잠금/전부 팔기 + 스마트 출격
- **보스 HUD & 비주얼**: [BossHUD.tsx](file:///c:/GAMEGAME/src/components/views/battle/BossHUD.tsx) — 심연의 진홍빛 체력바, BREAK 저지 게이지, 속성 오라, 페이즈 엠블럼
- **전장 레인 뷰**: [BattleFieldLanes.tsx](file:///c:/GAMEGAME/src/components/views/battle/BattleFieldLanes.tsx) — 5개 레인 하수인 스택 & 보스 약점 코어 바닥 인디케이터
- **스탯 연산기**: [statCalculator.ts](file:///c:/GAMEGAME/src/state/helpers/statCalculator.ts) — 장비/세트/룬/패시브/스탯 총합 계산
- **큐브/경제 헬퍼**: [cubeCraftingHelper.ts](file:///c:/GAMEGAME/src/state/helpers/cubeCraftingHelper.ts) — 룬/큐브 합성, 판매 가격 계산, 시설 강화
- **아이템 생성기**: [itemGenerator.ts](file:///c:/GAMEGAME/src/state/helpers/itemGenerator.ts) — 도박 및 장비 감정 스탯 복원
- **룬워드 계산기**: [runeWordCalculator.ts](file:///c:/GAMEGAME/src/state/helpers/runeWordCalculator.ts) — 스마트 룬워드 제작 및 소켓 검증
- **오디오 합성기**: [audio.ts](file:///c:/GAMEGAME/src/utils/audio.ts) — Web Audio API 절차적 음향 및 자동 언락 제스처
- **업적 시스템**: [achievements.ts](file:///c:/GAMEGAME/src/data/achievements.ts) — 1막~5막 클리어 및 16개 업적 판정

## 배포 및 Git 운영 원칙
- **서버 배포 프로세스**: 서버 업로드 시 반드시 **로컬 빌드 검증 ➔ Git 커밋 ➔ `origin/main` 푸시 ➔ `node scripts/deploy.js`** 순서로 자동 연계하여 로컬과 원격, 실서버가 완벽하게 일치하도록 관리.
- **최적화 규칙 준수**: 100dvh 무스크롤, 인라인 부트 스플래시, 비동기 폰트, 한국어 시스템 폰트 우선, 마을 Eager / 전투·던전 Lazy 로딩, 단일 전역 핫키 리스너(`keysRef`), 450ms 세이브 디바운스.

## 🌟 최근 완료된 핵심 작업

### 1. 스킬 해금 순서 및 레벨 리밸런싱 (Skills Rebalancing)
- ⚔️ **스킬 해금 개편**:
  - `가르기 (Slash)`: Lv.1 (단일 기본기, 분노 +15, 기본 장착 `Q`)
  - `휩쓸기 (Cleave)`: Lv.2 (3레인 광역 베기, 분노 15 소모, 타격당 분노 +5, 기본 장착 `W`)
  - `방패 강타 (Shield Bash)`: Lv.5 (보호막 생성 및 보스 저지 게이지 250% 파괴)
  - `처형 (Execute)`: Lv.10 (단일 220% 죽창 일격, 오버킬 90% 후열 전이, 기본 장착 `E`)
  - `휠윈드 (Whirlwind)`: Lv.15 (5개 전 레인 회전 타격 광역기, 기본 장착 `R`)
  - `광전사의 진노 (Berserk)`: Lv.20 (체력 10% 희생, 280% 치명타 폭발)
  - `전장의 함성 (War Cry)`: Lv.25 (전 레인 충격파 및 대량 분노 수급)
- 🎯 **기본 장착 슬롯 일치**: 초기 워리어 스킬셋을 `[가르기(Q), 휩쓸기(W), 처형(E), 휠윈드(R)]`로 동기화.

### 2. 전투 화면 초압축 & 전장 가시구역 극대화 (Battle Screen Ultra-Compact Overhaul)
- 📏 **100dvh Zero Layout Shift & 프레임 고정**:
  - 상단 헤더, 전장, 하단 컨트롤 독의 높이 예산을 엄격히 통제하여 몬스터 소환/처치, 버프/위험 지대 변경 시에도 창 크기나 버튼 위치가 요동치지 않고 전 프레임이 안정적으로 고정.
  - 전장 가시구역(`BattleFieldLanes`)이 남는 모든 뷰포트 높이(`flex-1 min-h-[260px] sm:min-h-[340px]`)를 온전히 활용하도록 확장.
- 🧹 **군더더기 라벨 및 비대한 UI 요소 제거/압축**:
  - 몬스터 토큰의 `D1`, `D2`, `D3`, `D4` 심도 라벨 텍스트 제거 및 깔끔한 초상화/체력바 뷰로 정돈.
  - 레인 헤더의 불필요한 장식과 과도한 라벨 압축.
  - 미니 룸 그래프(`MiniRoomGraph`)를 슬림한 가로형 칩 노드로 압축하여 상단 바로 흡수.
  - 상단 바(`BattleHeader`)를 미니맵 + 신속연계 ATB 게이지 + 처치수 + 귀환 버튼이 한 줄(~34px)에 들어가는 원라인 레이아웃으로 개편.
  - 하단 체력/분노 게이지(`BattleStatusDock`)를 슬림한 듀얼 바(각 18~20px)로 결합하고, 1~4번 포션을 가로형 미니 퀵 벨트로 최적화.
  - 스킬 카드(`BattleSkillsBar`)의 패딩과 텍스트를 콤팩트한 2라인으로 축소하여 모바일 화면에서도 답답함 없이 시원한 전장 뷰 제공.

