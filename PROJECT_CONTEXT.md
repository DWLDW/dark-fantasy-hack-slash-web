# PROJECT_CONTEXT.md

## 프로젝트 개요
Dark Fantasy Turn-Based Hack & Slash Loot RPG. React 18 + TypeScript + Vite + Tailwind CSS 기반 모바일 & PC 크로스플랫폼 웹 게임.
Dragon Quest 식 턴제 전투 기반 + Diablo II 식 오버킬 체인, 룬워드 크래프팅 및 파밍 루팅 시스템.

## 핵심 아키텍처
- **전투 엔진**: [combatEngine.ts](file:///c:/GAMEGAME/src/combat/combatEngine.ts) — `resolveAttack()`, `createDungeonFormation()`, `resolveHordeCounterAttack()`
- **전투 헬퍼**: [combatActionHelper.ts](file:///c:/GAMEGAME/src/state/helpers/combatActionHelper.ts) — 액션 경험치, 생명력 흡수, 분노/보호막 계산
- **던전/루팅 헬퍼**: [dungeonEventHelper.ts](file:///c:/GAMEGAME/src/state/helpers/dungeonEventHelper.ts) — 던전 드롭 생성, 난이도별 스케일링, 승리 전리품
- **게임 상태 관리**: [gameStore.tsx](file:///c:/GAMEGAME/src/state/gameStore.tsx) — 중앙 React Context + 안전한 persistence 타이머
- **스탯 연산기**: [statCalculator.ts](file:///c:/GAMEGAME/src/state/helpers/statCalculator.ts) — 장비/세트/룬/스탯 총합 계산
- **큐브/경제 헬퍼**: [cubeCraftingHelper.ts](file:///c:/GAMEGAME/src/state/helpers/cubeCraftingHelper.ts) — 룬/큐브 합성, 판매 가격 계산, 시설 강화
- **아이템 생성기**: [itemGenerator.ts](file:///c:/GAMEGAME/src/state/helpers/itemGenerator.ts) — 도박 및 장비 감정 스탯 복원
- **룬워드 계산기**: [runeWordCalculator.ts](file:///c:/GAMEGAME/src/state/helpers/runeWordCalculator.ts) — 스마트 룬워드 제작 및 소켓 검증
- **오디오 합성기**: [audio.ts](file:///c:/GAMEGAME/src/utils/audio.ts) — Web Audio API 절차적 음향 및 자동 언락 제스처
- **업적 시스템**: [achievements.ts](file:///c:/GAMEGAME/src/data/achievements.ts) — 1막~5막 클리어 및 16개 업적 판정

## 배포 및 Git 운영 원칙
- **서버 배포 프로세스**: 서버 업로드 시 반드시 **로컬 빌드 검증 ➔ Git 커밋 ➔ `origin/main` 푸시 ➔ `node scripts/deploy.js`** 순서로 자동 연계하여 로컬과 원격, 실서버가 완벽하게 일치하도록 관리.

## 🌟 최근 완료된 핵심 작업 (2026-08-25)

### 1. 프로젝트 전수 정밀 감사 및 치명적 결함 전면 수리
1. **전투 엔진 & 보스 기믹 (Combat & Boss)**:
   - 🚨 **보스 시그니처 스킬 피해 무효화 버그 수정**: 보스 스킬 피해가 일반 반격 체력으로 덮어씌워지던 문제를 `calculatedHp`로 통합 차감 및 치명 시 즉시 사망 모달 연결.
   - 🚨 **보스 50% 체력 하수인 소환 시 몬스터 2배 복제 버그 수정**: `[...prev, ...compressLaneSurvivors(...)]` 중복 스프레드를 제거하여 전장 몬스터 및 보스 복제 완벽 방지.
   - 🚨 **방패 강타 보호막 클로저 Stale State 소멸 버그 수정**: 방패 강타 생성 쉴드를 최신 `currentShieldLayers`로 캡처하여 당일 턴 반격 피해 흡수 정상화.
   - 🔴 **Single 루트(처형/방패강타) 오버킬 전이 이중 방어력 감면 결함 수정**: 미감면 원시 피해량(`requiredRawToKill`) 단위로 연쇄 전이되도록 공식 정상화.
   - 🔴 **보스 결계 방어력 복리 영구 증폭 버그 수정**: 결계 발동 시 일시 계산용 배열로 분리하여 영구 누적 방지.
   - 🟡 **라이프스틸 허수 데미지 흡혈 결함 수정**: `result.totalDamage` 대신 실제 유효 타격량인 `result.appliedDamage` 기반 흡혈 적용.

2. **아이템, 룬워드 & 경제 시스템 (Economy & Items)**:
   - 🚨 **`Eld(엘드)` 룬의 `El(엘)` 룬 오인식 문자열 충돌 버그 수정**: `extractRuneKey` 정규식 기반 룬 식별 도입으로 큐브 3:1 합성 및 룬워드 오인식 완벽 해결.
   - 🚨 **도박 유니크/세트 및 미식별 장비 감정 시 고유 옵션 증발/매직 전락 버그 수정**: `identifyItemHelper`에서 `GAME_ITEMS_POOL`의 원본 고유 스탯, 특수 효과, 서브 접사를 100% 복원.
   - 🚨 **아이템 상점 판매 가격 극단적 하드코딩(5G~500G) 정상화**: `getItemSellPrice`를 `item.value * 0.25` (최소 10G) 기반으로 현실화하여 파밍-경제 순환 체계 복원.
   - 🔴 **룬워드 제작 소켓 수 불일치 허용 버그(`<` 버그) 수정**: `targetItem.sockets !== recipe.requiredSockets` 엄격 일치 검증 적용.
   - 🔴 **큐브 소켓 뚫기 슬롯 미검증 버그 수정**: `['weapon', 'armor', 'helm', 'shield']`로 슬롯 제한.
   - 🟡 **스피리트(Spirit) 방패 제작 지원**: 무기뿐만 아니라 모나크 등 4소켓 방패에도 스피리트 룬워드 발동 지원.

3. **UI/UX, 키보드 단축키, 오디오 & 업적 (Frontend & Systems)**:
   - 🔴 **모달/오버레이 활성화 시 백그라운드 단축키 누수 방지**: `App.tsx`에서 승리/사망/튜토리얼/컨펌 모달 시 Space, 1~4, Q~R 단축키 완전 차단.
   - 🔴 **`AchievementModal` 던전 ID 불일치 수정 및 신규 6종 업적 진행도 계산 추가**: 액트 클리어 진척도 0/1 고정 버그 해결 및 T10/T50/T100, Lv.50, 10만골드, 룬워드 5개 게이지 구현.
   - 🟡 **아이템 판매 수익 골드의 `totalGoldEarned` 누적 가산**.
   - 🟡 **모바일 `touchstart` AudioContext unlock 리스너 추가 및 설정에서 음소거 해제 시 BGM 자동 재개**.

4. **장비류 9대 슬롯 드랍 테이블 전수 점검 및 균형 드랍 개편 완료**:
   - 누락되었던 방패, 장갑, 신발, 반지, 목걸이 18종 베이스 아이템 추가 및 `getActDropPool(1~5)` 전 던전 적용 완료.

---

## 향후 백로그 및 예정 작업
- 신규 직업(소서리스/팔라딘) 및 직업별 고유 스킬트리 확장
- 엔드게임 무한의 탑 / 지옥불 균열 레이드 콘텐츠
- 대장간(Blacksmith) 전용 UI 모달 및 룬 추출/강화 기능 구현
