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
- **오디오 합성기**: [audio.ts](file:///c:/GAMEGAME/src/utils/audio.ts) — Web Audio API 절차적 음향 및 자동 언락 제스처
- **업적 시스템**: [achievements.ts](file:///c:/GAMEGAME/src/data/achievements.ts) — 1막~5막 클리어 및 16개 업적 판정

## 배포 및 Git 운영 원칙
- **서버 배포 프로세스**: 서버 업로드 시 반드시 **로컬 빌드 검증 ➔ Git 커밋 ➔ `origin/main` 푸시 ➔ `npm run deploy`** 순서로 자동 연계하여 로컬과 원격, 실서버가 완벽하게 일치하도록 관리.

## 전반적 수정 및 검수 완료 내역 (2026-08-24)

### 1. 치명적 버그 수정 (Core Logic & Data)
- **던전 ID 및 룬 풀 매핑 수정**: `DUNGEON_RUNE_TIERS` 및 `getRunePoolForDungeon()`을 1~5막 20개 전 던전에 완벽 매핑하여 Act 2~5에서 상위 룬 정상 드롭 보장
- **업적 ID 동기화**: `achievements.ts`의 막 클리어 조건을 실제 최종 던전 ID(`act1_4_catacombs`, `act2_4_tomb`, `act3_4_durance`, `act4_4_altar`, `act5_4_throne`)로 수정
- **오버킬 방어력 이중 차감 제거**: `combatEngine.ts`의 `line`, `branch`, `radius` 경로에서 raw overkill payload 방식으로 방어력 이중 적용 방지
- **Whirlwind / Berserk 타격 이월 정상화**: 휠윈드 오버킬 합산 버그 수정 및 버서크 3연타 도중 몬스터 사망 시 다음 타겟으로 잔여 타격 이월
- **Life Steal (생명력 흡수) 연동**: `calculateAttackGains`에 `itemLifeSteal` 수식을 연동하여 타격 시 체력 회복 정상 작동
- **물약 무한 스택 방지 및 귀환 리셋**: `buyPotions`에서 업그레이드 티어별 최대 용량 상한을 적용하고 마을 귀환 시 정량 자동 충전
- **상태 선언 및 타이머 레이스 컨디션 방어**: `persistStateRef`의 렌더 뮤테이션을 `useEffect`로 감싸고, 몬스터 반격 타이머에 `viewMode` 가드 및 클린업 적용

### 2. UI/UX 및 모바일/데스크탑 반응형 개선
- **Z-Index 위계 확립**: 글로벌 모달(`z-[100]`), 던전 출격 모달(`z-[60]`), TopHUD(`z-40`), 전역 컨펌 모달(`z-[999999]`)
- **키보드 이벤트 충돌 방지**: 상위 글로벌 모달 및 컨펌 창이 열려있을 때 하위 페이지 단축키(Space/Enter 등) 무시 처리
- **스크롤 & Sticky 헤더**: `InventoryModal.tsx`, `DungeonSelectView.tsx` 내부 스크롤 시 탭 스위처와 닫기 버튼이 화면 상단에 고정
- **모바일 터치 타겟 확보**: TopHUD 설정/업적/마을 버튼 및 모달 닫기 버튼의 최소 터치 타겟(36px+) 확보
- **AudioContext Autoplay 정책 안전화**: 브라우저 첫 터치/클릭 제스처 시 Web Audio API가 자동 활성화되도록 리스너 보강

### 3. 추가 버그 패치 및 스토리 진행 UX (2026-08-24 최신)
- **ConfirmModal createPortal 최상위 렌더링**: 스킬창/캐릭터창 등 상위 모달이 열려 있어도 `createPortal(..., document.body)`를 통해 확인 팝업(`z-[999999]`)이 모달 창 위로 즉시 노출되도록 개선
- **스토리 순차 진행 연계 (Act 1~5)**: 던전 클리어 시 같은 던전 난이도 강제 상승 대신 다음 스토리 장(`getNextStoryDungeon`)으로 자동 포커스 및 진격 버튼 연계 (Act 5 최종장 클리어 시 상위 난이도 무한 파밍 모드 진입)

### 4. 전투 오버홀 & 시스템 전수 수리 (2026-08-25 최신 기준 커밋: `31d72d5`)
- **Git Commit**: `31d72d5` (Vite 번들: `index-DBZzjM4e`, main ➔ origin/main 푸시 및 실서버 배포 완료)
- **품질 검증 완료**:
  - `npm run build` (tsc) 에러 0건 통과
  - 브라우저 스모크 테스트: 던전 진입 ➔ 공격 ➔ 반격 흐름 콘솔 에러 0건 정상 검증
- **전투 오버홀 (Combat Overhaul)**:
  - **2턴 중첩 보호막 시스템**: 방패 강타 보호막의 턴 수명 및 중첩 로직 확립
  - **차지 텔레그래프 시스템 (Charge Telegraph)**: 강력한 몬스터 차징 공격에 대한 사전 시각적 경고 표시
  - **보스 기믹 고도화**: 포효(Roar), 소환(Summon), 가드(Guard) 패턴 탑재
  - **처형(Execute) 보너스 정밀 스코핑 & 서리(Frost) 프리뷰 정직성**: 데미지 예측 수치와 실제 데미지 일치화
  - **동결 시각적 인디케이터 & 전장의 함성(War Cry) 분노 소모 체계화**
- **시스템 결함 전수 수리**:
  - 큐브 합성 시 보관함 소모 및 룬 조합 순서 갭 해결
  - 소켓 장착 룬 스탯(HP, 지혜, 저항, 치명타, 회피) 누락분 완벽 반영
  - 물약 및 소비 아이템 시설 강화 효과 활성화

## 향후 백로그 및 예정 작업
- 신규 직업(소서리스/팔라딘) 및 직업별 고유 스킬트리 확장
- 엔드게임 무한의 탑 / 지옥불 균열 레이드 콘텐츠
- 전설 장비 세트 효과 다양화 및 룬워드 밸런스 조정
