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

### 3. 아케이드 고타격감 전투 연출 & 룰렛 피드백 시스템 (Arcade Jackpot & Extra Turn FX)
- 🎰 **룰렛 잭팟 총합 데미지 롤러 (`CombatJackpotOverlay.tsx`)**:
  - 타격 1타마다 화면 중앙에서 숫자가 `+120` ➔ `+450` ➔ `+2,450`으로 파파박 치솟으며 실시간 룰렛 카운트업.
  - 치명타(Crit) 발생 시 큼직한 황금빛 네온 스탬프 **`💥 CRITICAL 2,840 TOTAL DMG!`** 슬램 표출.
  - 오버킬 뱃지 (`💀 OVERKILL x3`), 연쇄 체인 킬 (`⚔️ CHAIN x5`) 룰렛 뱃지 동시 노출.
- ⚡ **EXTRA TURN / 1 MORE! 아케이드 컷인 (`ExtraTurnCutin.tsx`)**:
  - `처형(Execute)`으로 적 즉사 격살 시 적의 반격을 무효화하고 추가 턴을 얻었을 때, 화면 중앙을 가로지르는 대각선 골든 라이트닝 배너(`⚡ 1 MORE! EXTRA TURN ⚡`) 팝업.
### 5. 보스 방어력 무한 폭증 버그 수정 및 보스 스킬셋 안정화
- 🛡️ **방어력 복리식 거듭제곱 폭증 버그 원천 차단**:
  - 보스 가드(결계) 기믹 발생 시 `m.defense: m.defense * 3.34`로 기본 스탯을 영구 변조하던 로직을 제거하고, `isGuarding: true` 플래그를 통해 데미지 계산 시에만 70% 감소(`dmg * 0.30`)를 적용하도록 개편.
  - 턴마다 `35 ➔ 116 ➔ 387 ➔ 1,292 ➔ 160,774 ➔ 5,990,390`으로 방어력이 수백만으로 치솟아 데미지가 1로 고정되던 치명적인 이슈를 완벽 해결.
- ⏱️ **턴 카운터 이중 증가 일원화 및 보스 상태 완벽 리셋**:
  - 1 라운드당 1회(적 반격 턴)에만 `bossTurnCountRef`가 증가하도록 통일하여 2턴마다 가드가 남발되던 문제 수정.
  - 던전 입장/룸 이동/마을 귀환 시 보스 턴 카운터, 가드 상태, 지형 장악 지대(`bossHazardLanes`)를 누락 없이 100% 초기화.
### 6. 공격 딜레이 제로화(초고속 핵앤슬래시 템포) 및 전장 직격 보스 궁극기 VFX (`BossUltimateFxLayer.tsx`)
- ⚡ **공격 딜레이 초압축 (0.2초대 쾌속 연속 타격)**:
  - 타격 시퀀스 인터벌(`hitStepDuration`)을 12~25ms로 압축하여 다단히트도 120ms 내에 파파박 타격 완료.
  - 적 턴 반격 대기시간(`counterAttackTimerRef`)을 기존 700ms ➔ **180ms**로 대폭 단축하여 스페이스바/스킬 연타 시 딜레이 없는 쾌속 액션 구현.
- 👹 **전장 직격 GPU 가속 보스 궁극기 VFX (`BossUltimateFxLayer.tsx`)**:
  - 디아블로 붉은 번개 지옥불 레이저 빔 (`RedLightningBeam`), 안다리엘 3중 맹독 확산 파동 링 (`PoisonNovaWaves`), 두리엘 빙결 파쇄 쇄도 (`FreezeChargeShatter`), 바알 공허 차원 균열 (`VoidAbyssRift`).
  - Pure CSS GPU 가속(`transform: translate3d`, `opacity`, `will-change`)을 통해 모바일/PC 모두에서 발열과 렉 없이 60fps 무지연 렌더링 보장.

