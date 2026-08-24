# PROJECT_CONTEXT.md

## 프로젝트 개요
Dark Fantasy Turn-Based Hack & Slash Loot RPG. React 18 + TypeScript + Vite + Tailwind CSS 기반 모바일 & PC 크로스플랫폼 웹 게임.
Dragon Quest 식 턴제 전투 기반 + Diablo II 식 오버킬 체인, 룬워드 크래프팅 및 파밍 루팅 시스템.

## 핵심 아키텍처
- **전투 엔진**: [combatEngine.ts](file:///c:/GAMEGAME/src/combat/combatEngine.ts) — `resolveAttack()`, 보스 저지(Break)/그로기/약점 타격 연산, `createDungeonFormation()`, `resolveHordeCounterAttack()`
- **전투 헬퍼**: [combatActionHelper.ts](file:///c:/GAMEGAME/src/state/helpers/combatActionHelper.ts) — 액션 경험치, 생명력 흡수, 분노/보호막 계산
- **던전/루팅 헬퍼**: [dungeonEventHelper.ts](file:///c:/GAMEGAME/src/state/helpers/dungeonEventHelper.ts) — 던전 드롭 생성, 난이도별 스케일링, 승리 전리품
- **게임 상태 관리**: [gameStore.tsx](file:///c:/GAMEGAME/src/state/gameStore.tsx) — 중앙 React Context + 안전한 persistence 타이머 + 보스 인터랙티브 턴 제어
- **보스 HUD & 비주얼**: [BossHUD.tsx](file:///c:/GAMEGAME/src/components/views/battle/BossHUD.tsx) — 심연의 진홍빛 체력바, BREAK 저지 게이지, 속성 오라, 페이즈 엠블럼
- **전장 레인 뷰**: [BattleFieldLanes.tsx](file:///c:/GAMEGAME/src/components/views/battle/BattleFieldLanes.tsx) — 5개 레인 하수인 스택 & 보스 약점 코어 바닥 인디케이터
- **스탯 연산기**: [statCalculator.ts](file:///c:/GAMEGAME/src/state/helpers/statCalculator.ts) — 장비/세트/룬/스탯 총합 계산
- **큐브/경제 헬퍼**: [cubeCraftingHelper.ts](file:///c:/GAMEGAME/src/state/helpers/cubeCraftingHelper.ts) — 룬/큐브 합성, 판매 가격 계산, 시설 강화
- **아이템 생성기**: [itemGenerator.ts](file:///c:/GAMEGAME/src/state/helpers/itemGenerator.ts) — 도박 및 장비 감정 스탯 복원
- **룬워드 계산기**: [runeWordCalculator.ts](file:///c:/GAMEGAME/src/state/helpers/runeWordCalculator.ts) — 스마트 룬워드 제작 및 소켓 검증
- **오디오 합성기**: [audio.ts](file:///c:/GAMEGAME/src/utils/audio.ts) — Web Audio API 절차적 음향 및 자동 언락 제스처
- **업적 시스템**: [achievements.ts](file:///c:/GAMEGAME/src/data/achievements.ts) — 1막~5막 클리어 및 16개 업적 판정

## 배포 및 Git 운영 원칙
- **서버 배포 프로세스**: 서버 업로드 시 반드시 **로컬 빌드 검증 ➔ Git 커밋 ➔ `origin/main` 푸시 ➔ `node scripts/deploy.js`** 순서로 자동 연계하여 로컬과 원격, 실서버가 완벽하게 일치하도록 관리.

## 🌟 최근 완료된 핵심 작업 (2026-08-25)

### 1. 보스 UI 2줄 중복 해결 & 보스 전용 비주얼 & 3대 파훼 기믹 시스템 구축
- 🚨 **보스 이름/HP 바 2줄 중복 노출 버그 완벽 해결**:
  - `BattleFieldLanes.tsx`의 중복 2번째 보스 패널을 제거하고, 상단 `<BossHUD />`로 일원화.
- 🎨 **심연의 진홍 & 흑마법 퍼플-골드 전용 보스 체력바 및 속성 오라 구현**:
  - 6대 속성별(지옥불/혹한/뇌전/맹독/공허/물리) 고유 엠블럼 및 75%(약점)/50%(소환)/30%(광란) 페이즈 마커 적용.
- ⚔️ **플레이어 대응형 3대 보스 공략(파훼) 시스템 탑재**:
  - 💥 **멸망기 차징 & 저지(Break / Stagger)**: 3턴마다 보스가 멸망기 차징에 돌입할 때, 방패 강타(250% 저지력)나 공격으로 BREAK 성공 시 1턴간 **[💫 그로기(기절 + 받는 피해 1.5배)]**로 무력화.
  - 🎯 **약점 레인 노출 (Weak Spot Targeting)**: 결계 발동 시 무작위 1개 레인에 약점 핵 노출 ➔ 해당 레인 공격 시 **2.5배 치명타 + 결계 즉시 분쇄**.
  - 💨 **광역기 회피 & 인터랙티브 레인 이동**: BossHUD 클릭 또는 단축키로 안전/약점 레인 즉각 전술 이동.

### 2. 프로젝트 전수 정밀 감사 및 12개 핵심 결함 전면 수리
- 보스 시그니처 스킬 피해 정상화, 50% 하수인 소환 시 몬스터 2배 복제 차단, 방패강타 쉴드 Stale State 해결, Single 오버킬 2중 방어력 감면 수정, 보스 결계 복리 증폭 제거, 라이프스틸 유효 타격량 기반 흡혈 수정.
- `Eld` vs `El` 룬 정규식 분리, 도박 유니크/세트 감정 100% 원본 스탯 복원, 상점 판매가 `0.25 * value` 현실화, 룬워드 소켓 엄격 일치, 스피리트 방패 지원.
- 오버레이 단축키 가드, 액트 던전 ID 업적 정정, 모바일 `touchstart` 오디오 지원, 9대 장비 슬롯 드랍 테이블 전수 균형화.

---

## 향후 백로그 및 예정 작업
- 신규 직업(소서리스/팔라딘) 및 직업별 고유 스킬트리 확장
- 엔드게임 무한의 탑 / 지옥불 균열 레이드 콘텐츠
- 대장간(Blacksmith) 전용 UI 모달 및 룬 추출/강화 기능 구현
