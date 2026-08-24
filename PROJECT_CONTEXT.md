# PROJECT_CONTEXT.md

## 프로젝트 개요
Dark Fantasy Turn-Based Hack & Slash Loot RPG. React 18 + TypeScript + Vite + Tailwind CSS 기반 모바일 & PC 크로스플랫폼 웹 게임.
Dragon Quest 식 턴제 전투 기반 + Diablo II 식 오버킬 체인, 룬워드 크래프팅 및 파밍 루팅 시스템.

## 핵심 아키텍처
- **전투 엔진**: [combatEngine.ts](file:///c:/GAMEGAME/src/combat/combatEngine.ts) — `resolveAttack()`, 보스 저지(Break)/그로기/약점 타격 연산, `createDungeonFormation()`, `resolveHordeCounterAttack()`
- **스킬 및 패시브**: [skills.ts](file:///c:/GAMEGAME/src/data/skills.ts) & [passiveSkills.ts](file:///c:/GAMEGAME/src/data/passiveSkills.ts) — 7종 액티브 스킬(Lv.30 한도) + 8대 워리어 패시브 마스터리 트리
- **스킬 관리 헬퍼**: [skillManager.ts](file:///c:/GAMEGAME/src/state/helpers/skillManager.ts) — 스킬 레벨업, 패시브 레벨업, 통합 SP 전액 초기화
- **스킬 UI 모달**: [SkillRuneModal.tsx](file:///c:/GAMEGAME/src/components/modals/SkillRuneModal.tsx) — 액티브 스킬 & 룬 슬롯 탭 / 패시브 스킬 마스터리 트리 탭
- **인벤토리 & 보관함 UI**: [InventoryModal.tsx](file:///c:/GAMEGAME/src/components/modals/InventoryModal.tsx) — 소지품 / 📦 보관함(Stash) / 🔮 룬 보관함 3대 탭, [전부 팔기] 및 🔒 아이템 잠금 보호
- **전투 헬퍼**: [combatActionHelper.ts](file:///c:/GAMEGAME/src/state/helpers/combatActionHelper.ts) — 액션 경험치, 생명력 흡수, 분노/보호막 계산
- **던전/루팅 헬퍼**: [dungeonEventHelper.ts](file:///c:/GAMEGAME/src/state/helpers/dungeonEventHelper.ts) — 던전 드롭 생성, 난이도별 스케일링, 승리 전리품
- **게임 상태 관리**: [gameStore.tsx](file:///c:/GAMEGAME/src/state/gameStore.tsx) — 중앙 React Context + 안전한 persistence 타이머 + 보스 인터랙티브 턴 제어 + 보관함/잠금/전부 팔기
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

## 🌟 최근 완료된 핵심 작업 (2026-08-25)

### 1. 아이템 보관함(Stash), 아이템 잠금(Item Lock), 전부 팔기(Sell All) 시스템 구축
- 📦 **모험가 개인 보관함(Stash) 신설**:
  - 인벤토리 모달 상단 탭 `[소지품] / [📦 보관함] / [🔮 룬 보관함]` 분리.
  - 인벤토리 ↔ 보관함 간 자유로운 보관(`depositToStash`) 및 꺼내기(`withdrawFromStash`) 지원 (LocalStorage 영속 저장).
- 🔒 **아이템 잠금(Item Lock) 보호 기능**:
  - 장착 장비, 소지품, 보관함의 모든 아이템에 🔒 잠금 토글 버튼 지원.
  - 잠금된 아이템은 카드 우상단에 🔒 금색 자물쇠 배지가 표시되며, 판매 및 소실로부터 철저히 보호.
- 💰 **전부 팔기(Sell All) 시스템 전면 개편**:
  - 기존 일반/마법 일괄 판매를 [전부 팔기]로 변경.
  - 잠금되지 않은 모든 미장착 장비의 수량과 획득 골드를 실시간 계산하여 원클릭 일괄 판매. (🔒 잠금된 아이템과 장착 장비는 100% 안전하게 보호).

### 2. 스킬 레벨 30 확장 & 8대 패시브 스킬 마스터리 트리 구축
- ⚔️ 가르기, 처형, 휩쓸기, 방패 강타 등 7종 액티브 스킬 레벨 한도 30 확장 (Lv.30 달성 시 535% 위력).
- 🧬 8대 워리어 패시브 마스터리 트리 신설 (무기 숙련, 강철 피부, 치명적 타격, 피의 갈증, 광전사의 분노, 오버킬 분쇄, 원소 친화, 거인의 불굴).
- 🎨 스킬창 상단 `[액티브 스킬 & 룬] / [패시브 스킬 트리]` 탭 분리, Shift+클릭 일괄 투자 및 100% 통합 SP 환급 지원.

### 3. 보스 UI 2줄 중복 해결 & 보스 전용 비주얼 & 3대 파훼 기믹 시스템 구축
- 🚨 보스 이름/HP 바 2줄 중복 노출 버그 완벽 해결 (`BattleFieldLanes.tsx` 중복 패널 제거 ➔ 상단 `BossHUD` 일원화).
- 🎨 심연의 진홍 & 흑마법 퍼플-골드 전용 보스 체력바 및 6대 속성 오라 구현.
- 💥 멸망기 차징 & 저지(Break / Stagger ➔ 1턴 그로기), 약점 레인 타격(2.5x 치명타 + 결계 분쇄), 광역기 회피 기믹.

---

## 향후 백로그 및 예정 작업
- 신규 직업(소서리스/팔라딘) 및 직업별 고유 스킬트리 확장
- 엔드게임 무한의 탑 / 지옥불 균열 레이드 콘텐츠
- 대장간(Blacksmith) 전용 UI 모달 및 룬 추출/강화 기능 구현
