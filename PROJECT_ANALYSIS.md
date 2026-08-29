# 프로젝트 분석 보고서 — Dark Fantasy Turn-Based Hack & Slash Loot RPG

> 분석 기준 시점: 2026-08-29 / 커밋 `fb9ceac` (main) / 작업 트리 더티 상태
> 분석 대상: `C:\game` — 소스 74개 파일, **25,199줄**

---

## 1. 프로젝트의 주요 목적

**한 문장 정의**: 디아블로 2의 아이템 파밍·룬워드 크래프팅 시스템과, 5레인 그리드 위에서 적을 연쇄 관통 처치하는(Overkill Chain) 턴제 핵앤슬래시 전투를 결합한 PC/모바일 크로스플랫폼 웹 게임.

### 핵심 재미 요소 (3축)

| 축 | 내용 | 담당 모듈 |
|---|---|---|
| **전투 (Combat)** | 5레인 × 6깊이 전장. 공격 전 잔여 피해 전이 경로와 예상 처치 수를 미리 시각화하고, 외곽 레인 집중 타격으로 6~10마리 이상 연쇄 관통. Wait-ATB 방식으로 플레이어 행동 후 몬스터 군단(Horde)이 반격 | `combat/combatEngine.ts`, `state/helpers/combatActionHelper.ts` |
| **파밍 (Loot)** | 5개 액트 20개 던전 + 무한 반복 엔드콘텐츠 '대균열(Endless Rift)'. 등급별 드랍 테이블, MF(행운) 연동 소켓 생성 | `data/dungeons.ts`, `state/helpers/dungeonEventHelper.ts` |
| **제작 (Crafting)** | D2 정통 33종 룬(El~Zod) + 33종 룬워드 + 호라드릭 큐브 합성 + 기드 도박 + 케인 감정 | `data/runeWords.ts`, `state/helpers/runeWordCalculator.ts`, `cubeCraftingHelper.ts` |

### 부가 시스템
- **성장**: 7종 액티브 스킬(만렙 20) + 8종 패시브 마스터리(만렙 10), SP 배분 및 샤드 기반 초기화
- **계정**: ID/PW 회원가입·로그인, 멀티 디바이스 클라우드 세이브 동기화 (게스트 로컬 저장 병행)
- **연출**: Web Audio API 절차적 BGM/SFX (액트별 5곡 + 보스 5곡 + 대균열 가속 신스). 외부 오디오 파일 0개
- **배포**: `https://193.122.127.129.sslip.io` (Oracle Cloud Ubuntu 24.04, Nginx + Let's Encrypt SSL)

---

## 2. 디렉토리 구조

```
C:\game\
├── src/                          # 소스 루트 (74파일, 25,199줄)
│   ├── main.tsx                  # 엔트리
│   ├── App.tsx                   # 루트 레이아웃 + 전역 키보드 리스너 (357줄)
│   ├── index.css                 # 전역 스타일 + 커스텀 키프레임 60+개 (1,159줄)
│   │
│   ├── types/game.ts             # 전역 타입 정의 (307줄) — GameItem, Monster, DungeonInfo 등
│   │
│   ├── data/                     # 정적 데이터 레이어 (순수 데이터, 로직 최소)
│   │   ├── items.ts              # 2,031줄 — GAME_ITEMS_POOL, getActDropPool()
│   │   ├── dungeons.ts           # 1,206줄 — 20개 던전, 보스 메타데이터, 몬스터 템플릿, 진형 생성
│   │   ├── runes.ts              # D2_RUNES 33종
│   │   ├── runeWords.ts          # RUNEWORD_RECIPES 33종
│   │   ├── skills.ts             # SKILL_RUNES_DATA, ALL_AVAILABLE_SKILLS
│   │   ├── passiveSkills.ts      # WARRIOR_PASSIVE_SKILLS 8종
│   │   ├── setItems.ts           # SET_DEFINITIONS
│   │   ├── achievements.ts       # ACHIEVEMENTS
│   │   └── gameData.ts           # 재수출 배럴 (items/dungeons re-export)
│   │
│   ├── combat/
│   │   └── combatEngine.ts       # 723줄 — resolveAttack() 전투 해소 코어
│   │
│   ├── state/
│   │   ├── gameStore.tsx         # ★ 3,396줄 — 전역 상태 + 게임 로직의 사실상 전부
│   │   └── helpers/              # 순수 함수 로직 분리 (8개 모듈)
│   │       ├── statCalculator.ts      # 장비/세트/룬/패시브 총합 스탯 계산
│   │       ├── combatActionHelper.ts  # 데미지 이득, 흡혈, 군단 반격
│   │       ├── dungeonEventHelper.ts  # 드랍 생성, 난이도 스케일링, 전리품
│   │       ├── itemGenerator.ts       # 도박 아이템 생성, 케인 감정
│   │       ├── runeWordCalculator.ts  # 룬워드 제작, 소켓 호환 검증
│   │       ├── cubeCraftingHelper.ts  # 룬 소켓팅, 판매가, 큐브 합성, 시설 강화
│   │       ├── skillManager.ts        # 스킬/패시브 레벨업, SP 초기화
│   │       ├── achievementManager.ts  # 업적 판정/보상
│   │       └── saveManager.ts         # localStorage 인코딩/디코딩, 만렙 경험치 곡선
│   │
│   ├── components/
│   │   ├── layout/               # TopHUD, BottomDock, MiniRoomGraph
│   │   ├── views/                # 화면 단위
│   │   │   ├── TownView.tsx           # 1,068줄 (마을)
│   │   │   ├── DungeonSelectView.tsx  # 358줄 (월드맵)
│   │   │   ├── BattleView.tsx         # 209줄 (전투)
│   │   │   ├── battle/                # BattleFieldLanes, BossHUD, BattleSkillsBar, BattleStatusDock, BattleTacticalPreview, BattleHeader, BossSkillCutin, PlayerHitFlash
│   │   │   └── town/TownMapCanvas.tsx
│   │   ├── modals/               # GlobalModalHost + 11개 모달 (전부 lazy)
│   │   │   └── inventory/        # EquippedPaperdoll, ItemDetailCard, RuneCraftPanel, SingleSocketRunePanel, RuneVaultTab, InventoryItemsGrid, ItemCompareTable, InventoryFilterBar
│   │   ├── fx/                   # 연출 레이어 (CombatFxLayer, CombatJackpotOverlay, GodlyDropJackpot, ExtraTurnCutin, BossUltimateFxLayer, AtmosphereLayer, MonsterPortrait, BossPixelPortrait, PlayerChampion)
│   │   └── tutorial/InteractiveTutorial.tsx
│   │
│   ├── services/authApi.ts       # 백엔드 API 클라이언트 (145줄)
│   └── utils/                    # audio.ts(1,196줄), actThemes.ts, itemScoring.ts, monsterVisuals.ts, runeCrafting.ts, useHoldAction.ts
│
├── server/index.js               # Express 백엔드 (JSON 파일 저장소)
├── scripts/                      # 빌드/배포/이미지/시뮬레이션 도구 (18개)
├── public/images/                # WebP 최적화 에셋 (액트5, 보스6, UI 10)
├── dist/                         # 빌드 산출물 (Brotli+Gzip 사전 압축)
├── _audit_shots/  _review_shots/ # Playwright 캡처 스크린샷 (감사/리뷰용)
├── GAME_DESIGN_DOCUMENT.md
├── PROJECT_CONTEXT.md            # 작업 이력 1~38단계 (488줄) — 필독
└── DROP_TABLE_IMPROVEMENT_REPORT.md
```

> **참고**: `PROJECT_CONTEXT.md`는 이 프로젝트에서 가장 정보 밀도가 높은 문서입니다. 1~38단계까지의 작업 이력과 각 단계에서 건드린 파일이 모두 기록되어 있어, 어떤 기능이 왜 그렇게 생겼는지 추적할 때 반드시 먼저 읽어야 합니다.

---

## 3. 기술 스택

### 프론트엔드
| 구분 | 사용 기술 | 버전 | 비고 |
|---|---|---|---|
| 프레임워크 | React | 18.3.1 | Context API 기반 상태 관리 (Redux 없음) |
| 언어 | TypeScript | 5.6.3 | `strict` 모드, 현재 **타입체크 100% 클린** |
| 빌드 | Vite | 5.4.10 | target es2022, 수동 청크 분할 |
| 스타일 | Tailwind CSS | 3.4.14 | 커스텀 팔레트(void/iron/blood/brass/rarity) |
| 아이콘 | lucide-react | 1.16.0 | |
| 오디오 | Web Audio API | — | 절차적 합성. 오디오 파일 **0개** |

### 백엔드 / 인프라
| 구분 | 내용 |
|---|---|
| 서버 | Node.js + Express (raw http 아님), `server/index.js` |
| 저장소 | **JSON 파일** (`server/data/users.json`, `sessions.json`, `saves/<username>.json`). DB 없음 |
| 인증 | `crypto.pbkdf2Sync` (10,000 iterations, sha512) + 랜덤 32바이트 세션 토큰 |
| 웹서버 | Nginx (HTTPS 443, HTTP→HTTPS 301 리다이렉트, `gzip_static`, `/assets/` 1년 immutable 캐시) |
| 배포 | systemd `dark-fantasy-backend.service` + `node scripts/deploy.js` |
| SSL | Let's Encrypt (sslip.io 도메인) |

### 개발 도구
- **Playwright** 1.62.1 — 스크린샷 캡처/감사 자동화 (`scripts/audit_capture.mjs`)
- **sharp** 0.35.3 — 이미지 WebP 변환·리사이징 (`scripts/optimize_images.js`)
- **수동 압축**: `scripts/precompress.js` — Gzip(Lv9) + Brotli(Lv11) 듀얼 사전 압축

### 빌드 파이프라인
```
npm run dev     → vite (localhost:3000)
npm run build   → tsc --noEmit && vite build && node scripts/precompress.js
npm run preview → vite preview
npm run deploy  → node scripts/deploy.js  (서버 업로드)
```
번들 청크 분할: `vendor-react` / `vendor-icons` / `vendor-libs` / `game-data` / `combat-engine`
운영 빌드 시 `console`/`debugger` 자동 제거 (`esbuild.drop`)

### API 엔드포인트
| 메서드 | 경로 | 인증 | 용도 |
|---|---|---|---|
| GET | `/api/health` | — | 헬스체크 |
| POST | `/api/auth/register` | — | 회원가입 (pbkdf2 해싱) |
| POST | `/api/auth/login` | — | 로그인 → 세션 토큰 발급 |
| GET | `/api/save/load` | Bearer | 클라우드 세이브 로드 |
| POST | `/api/save/sync` | Bearer | 클라우드 세이브 동기화 |
| POST | `/api/auth/logout` | Bearer | 세션 삭제 |

---

## 4. 핵심 모듈 간의 의존 관계

### 4.1 전체 흐름

```
                        ┌─────────────────┐
                        │    main.tsx     │
                        └────────┬────────┘
                                 ▼
   ┌──────────────────────────────────────────────────────┐
   │  App.tsx  (GameProvider wraps MainLayout)            │
   │  • viewMode: 'town' | 'dungeon_select' | 'battle'    │
   │  • 전역 keydown 리스너 1개 (keysRef 패턴, 의존성 [])  │
   │  • TownView(eager) / DungeonSelect·Battle(lazy)      │
   └───────────────────────────┬──────────────────────────┘
                               ▼
   ┌──────────────────────────────────────────────────────┐
   │  state/gameStore.tsx   ★ 3,396줄 — 중앙 허브          │
   │  • GameContextType 인터페이스 105~293줄 (약 190개 필드)│
   │  • useState 60개 / useRef 10개 / useEffect 6개        │
   │  • useReducer 아님 → useState + useCallback 조합       │
   └───┬──────────────┬───────────────┬───────────────┬───┘
       │              │               │               │
       ▼              ▼               ▼               ▼
  ┌────────┐   ┌────────────┐   ┌──────────┐   ┌──────────┐
  │ data/  │   │  helpers/  │   │ combat/  │   │ services/│
  │ (정적) │   │ (순수로직) │   │combatEng.│   │ authApi  │
  └────────┘   └─────┬──────┘   └────┬─────┘   └────┬─────┘
       ▲             │               │               │
       └─────────────┴───────────────┘               │
         helpers → data (단방향)                      ▼
                                            Express 백엔드
       ┌──────────────────────────────────────────────┐
       │  components/  (26개 컴포넌트가 useGame() 구독) │
       └──────────────────────────────────────────────┘
```

### 4.2 계층 구조와 호출 방향

**원칙적으로는 3계층 단방향 구조입니다.**

```
 types/game.ts  (모든 계층이 참조 — 의존 없음)
       ▲
  data/*.ts     (정적 데이터. types만 참조)
       ▲
 helpers/*.ts   (순수 함수. data + types 참조. ★ gameStore를 참조하지 않음)
       ▲
combatEngine.ts (전투 해소. data + types 참조)
       ▲
 gameStore.tsx  (모든 것을 조합. helpers + combat + data + utils + services 참조)
       ▲
 components/*   (useGame()으로 구독. 퍼블리시)
```

### 4.3 모듈별 역할과 호출 관계

| 모듈 | 역할 | 호출자 |
|---|---|---|
| `combatEngine.ts` | `resolveAttack()` — 오버킬 전이, 보스 저지/그로기, 약점 타격, 방어 계산. `findBestLaneForSkill()`, `createGoblin30Formation()`. `createDungeonFormation`은 `data/dungeons`에서 **재수출** | gameStore |
| `statCalculator.ts` | `calculateTotalStats()` — 장비/세트/룬워드/패시브/스탯 총합. `CalculatedTotalStats` 반환 | gameStore, UI |
| `combatActionHelper.ts` | `calculateAttackGains()` (경험치·골드·흡혈·분노), `resolveHordeCounterAttack()` (군단 반격), `compressLaneSurvivors()` | gameStore |
| `dungeonEventHelper.ts` | `rollDynamicSockets()` (MF 연동 소켓), `scaleItemForDifficulty()`, `generateVictoryLoot()`, `claimTreasureHelper()`, `prepareDungeonRun()` | gameStore |
| `runeWordCalculator.ts` | `craftRuneWordHelper()`, `isRuneWordSlotCompatible()`, `isWeaponGroupCompatible()`, `transmuteRuneInVaultHelper()` | gameStore, InventoryModal, TownView |
| `cubeCraftingHelper.ts` | `socketRuneHelper()`, `getItemSellPrice()`, `bulkSellHelper()`, `cubeTransmuteHelper()`, 시설 강화 비용 계산 | gameStore |
| `itemScoring.ts` | `calculateItemScore()`, `findBestEquipmentPlan()` — 추천 자동 장착 | gameStore |
| `saveManager.ts` | `SAVE_KEY = 'DARK_FANTASY_SAVE_V1'`, Base64 인코딩/디코딩, `calculateMaxExp()` | gameStore |
| `authApi.ts` | 세션 토큰 저장/조회, 5개 API 호출 | gameStore, AuthModal, SettingsModal, TopHUD |

### 4.4 발견된 의존성 이상 (주의)

**① 상태 계층 → 뷰 컴포넌트 역방향 참조 (의존성 역전)**
```ts
// src/state/gameStore.tsx:36-39
import { AttackSummaryEvent } from '../components/fx/CombatJackpotOverlay';
import { ExtraTurnEvent } from '../components/fx/ExtraTurnCutin';
import { BossUltimateFxEvent } from '../components/fx/BossUltimateFxLayer';
import { isGodlyDropItem } from '../components/fx/GodlyDropJackpot';  // ← 런타임 함수까지
```
상태 스토어가 연출용 컴포넌트에 의존합니다. `isGodlyDropItem`은 **런타임 함수**이므로 단순 타입 참조가 아닙니다. 다행히 해당 fx 컴포넌트들은 `gameStore`를 재참조하지 않아 **순환 참조는 발생하지 않습니다**. 다만 이 구조 때문에 fx 컴포넌트를 수정하면 스토어까지 리빌드됩니다.

**② `gameStore.tsx`로의 과도한 집중**
- 3,396줄 / 약 190개 컨텍스트 필드 / `useState` 60개
- **26개 컴포넌트**가 `useGame()`을 구독
- Context 값이 갱신될 때마다 구독 컴포넌트 전부가 리렌더 후보가 됩니다. 이미 `keysRef` 패턴과 `useMemo` 최적화가 적용되어 있으나, 새 상태를 추가할 때 성능 회귀 위험이 있습니다.

**③ `data/dungeons.ts`의 이중 역할**
던전 정적 데이터(`DUNGEONS_DATA`)와 로직(`createDungeonFormation()`, `generateEndlessRiftDungeon()`)이 한 파일에共存하며, `combatEngine.ts`가 `createDungeonFormation`을 재수출(`:723`)합니다. 데이터 레이어가 전투 로직을 일부 품고 있는 형태입니다.

---

## 5. 추가 개발·수정 전 반드시 파악해야 할 주의 사항

### ⚠️ 5-1. 최우선: 작업 트리가 커밋되지 않은 상태입니다

```
 M src/data/items.ts                       | 212 +++++++++++++---
 M src/data/runeWords.ts                   |  24 +++
 M src/state/helpers/dungeonEventHelper.ts |  64 ++--
 M src/state/helpers/runeWordCalculator.ts |  31 ++-
 M src/types/game.ts                       |   8 +
?? scripts/add_bases.mjs  patch_items.mjs
?? scripts/sim_difficulty_ceiling.mjs  sim_rift_ceiling.mjs  sim_rift_clean.mjs
?? scripts/audit_capture.mjs  cap_post.mjs
?? _audit_shots/
```
**300줄 추가 / 39줄 삭제가 미커밋 상태입니다.** 내용은 "**B안 무기군(Weapon Group) 시스템**" — 룬워드에 무기군 제한(sword/axe/mace/polearm/bow)을 추가하는 D2 정통 규칙 작업입니다.

- `GameItem.weaponGroup` / `weaponSuperGroup` 필드 신설
- `RuneWordRecipe.allowedWeaponGroups` / `allowedWeaponSuperGroup` 필드 신설
- `isWeaponGroupCompatible()` 신규 함수 추가

**→ 새 작업을 시작하기 전에 반드시 커밋 여부를 먼저 결정하세요.** 이 변경분을 모른 채 다른 작업을 하면 충돌 가능성이 높습니다.

### ⚠️ 5-2. 실제 버그: 무기군 검증이 UI에 누락되어 있습니다 (B안 미완성)

신규 추가된 `isWeaponGroupCompatible()`는 **제작 실행부에만** 적용되고, **UI 필터에는 적용되지 않았습니다**:

```ts
// ✅ 제작 시에는 검증함 (runeWordCalculator.ts:82, :135)
const isSlotMatch = isRuneWordSlotCompatible(targetItem.slot, recipe)
                 && isWeaponGroupCompatible(targetItem as any, recipe);

// ❌ UI 목록 필터는 슬롯만 검사함
//    src/components/modals/InventoryModal.tsx:164
const isSlotMatching = isRuneWordSlotCompatible(activeCandidateItem.slot, recipe);
//    src/components/views/TownView.tsx:744, :748
const isSlotMatch = isRuneWordSlotCompatible(selectedBaseItem.slot, r);
```

**증상**: 예컨대 활(bow) 베이스에서 룬워드 목록을 열면 `슬픔(Grief)` 같은 근접 무기 전용 레시피가 **제작 가능한 것처럼 표시**되지만, 실제로 버튼을 누르면 조건 불일치로 **제작이 거부**됩니다.

**→ B안을 완성하려면 `InventoryModal.tsx:164`와 `TownView.tsx:744/748`에 `isWeaponGroupCompatible` 호출을 추가해야 합니다.**

### ⚠️ 5-3. 배포 절차가 엄격하게 정해져 있습니다

`PROJECT_CONTEXT.md`에 명시된 **프로젝트 철칙**:

> 로컬 빌드 검증 ➔ Git 커밋 ➔ `origin/main` 푸시 ➔ `node scripts/deploy.js`

순서를 어기면 로컬·원격·실서버(193.122.127.129) 상태가 어긋납니다. **절대 `deploy.js`를 먼저 실행하지 마세요.**

### ⚠️ 5-4. UI 레이아웃의 암묵적 제약 (100dvh 제로 스크롤)

이 프로젝트는 "스크롤 0px"를 목표로 전체 레이아웃이 짜여 있습니다. 새 UI를 추가할 때 이 규칙을 어기면 즉시 레이아웃이 깨집니다.

| 제약 | 위치 | 내용 |
|---|---|---|
| 100dvh 고정 | `App.tsx:319` | `h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none` |
| main 컨테이너 | `App.tsx:322` | `flex-1 min-h-0 overflow-hidden` |
| 모달 | `InventoryModal` 등 | `h-[96dvh] max-h-[96dvh] overflow-hidden` |
| Safe Area | `BottomDock.tsx` | `env(safe-area-inset-bottom)`, 42px+ 터치 타겟 |
| z-index | `GlobalModalHost.tsx` | 모달 레이어 `z-[100]`, 승리/사망 `z-[120]`, ConfirmDialog `z-[999999]` |

**모바일 360px 폭에서 1행 압축**이 기본 전제이므로, 새 요소를 추가할 때 세로 공간을 추가로 소비하지 않도록 주의해야 합니다.

### ⚠️ 5-5. 코드 수정 시 주의 구역

| 대상 | 위험도 | 이유 |
|---|---|---|
| `gameStore.tsx` | **최고** | 3,396줄, 26개 컴포넌트가 구독. `preview`·`totalStats`는 `useMemo`로 계산되므로 의존성 배열 수정 시 무한 루프 위험 |
| `combatEngine.ts` `resolveAttack()` | **높음** | 데미지/오버킬/보스 기믹이 모두 얽힘. 과거에 방어력 복리 폭증·턴카운터 이중 증가 등 치명적 버그가 여기서 발생 (PROJECT_CONTEXT 5번, 27번 항목 참조) |
| `statCalculator.ts` | **높음** | 과거 소켓 룬 스탯 200% 중복 합산(Double Dipping) 버그 발생 이력 |
| `data/items.ts` | 중간 | 2,031줄. 드랍 풀과 직결 |
| `index.css` | 중간 | 키프레임 60+개. 이름 충돌 주의 |

### ✅ 5-6. 현재 건강 상태 (양호)

| 항목 | 상태 |
|---|---|
| `tsc --noEmit` | **통과, 에러 0건** |
| `console.log` 잔존 | **0건** (운영 빌드에서도 자동 제거됨) |
| TODO/FIXME/HACK 마커 | 실질 0건 (유일한 "HACK"은 `gameStore.tsx:1176`의 "HACK & SLASH" 게임플레이 주석) |
| 타입 정의 | `strict` 모드 준수 |

### ✅ 5-7. 활용 가능한 개발 도구

- **`scripts/sim_*.mjs` (3개)** — 밸런스 시뮬레이터. 난이도 상한·대균열 티어 스케일링을 수치로 검증. **npm 스크립트에 연결되어 있지 않으므로 직접 실행**해야 합니다 (`node scripts/sim_rift_clean.mjs`)
- **`scripts/audit_capture.mjs`** — Playwright로 주요 화면을 자동 캡처 → `_audit_shots/`. UI 회귀 검증에 활용
- **`scripts/add_bases.mjs` / `patch_items.mjs`** — `items.ts`에 신규 베이스 아이템·무기군 태그를 일괄 삽입하는 코드 생성기

---

## 6. 후속 작업을 위한 요약 정리

### 🎯 즉시 결정해야 할 사항 (작업 전)

1. **미커밋 변경분 처리** — B안 무기군 시스템 300줄. 완성할지 / 되돌릴지 / 별도 브랜치로 뺄지 결정
2. **B안 완성 여부** — 완성한다면 **5-2 버그 수정(UI 필터 3곳)이 필수**

### 📋 권장 작업 순서

| 순서 | 작업 | 관련 파일 | 예상 난이도 |
|---|---|---|---|
| 1 | 미커밋 변경분 커밋 또는 브랜치 분리 | 5개 파일 + 7개 스크립트 | 낮음 |
| 2 | 무기군 검증을 UI 필터에 적용 (버그 수정) | `InventoryModal.tsx:164`, `TownView.tsx:744/748` | **낮음** |
| 3 | 33종 룬워드 × 무기군 매트릭스 검증 | `data/runeWords.ts` | 중간 |
| 4 | `npm run build` 검증 → 커밋 → 푸시 → `deploy.js` | — | 낮음 |

### 🏗 중장기 리팩터링 제안 (우선순위순)

1. **`gameStore.tsx` 분할** (3,396줄 → 권장 800줄 이하)
   - 도메인별 커스텀 훅으로 추출: `useCombatState`, `useInventoryState`, `useDungeonState`, `useCraftingState`
   - 또는 `useReducer` 전환으로 액션 단위 업데이트 정리
2. **의존성 역전 해소** — `gameStore.tsx:36-39`의 fx 컴포넌트 참조를 `types/` 또는 `state/events.ts`로 이전
3. **Context 분리** — 상태용 Context와 액션용 Context를 분리하면 `useGame()` 구독 26개 컴포넌트의 불필요한 리렌더 대폭 감소
4. **시뮬레이터 정비** — `sim_*.mjs` 3개가 로직을 중복 구현(`calculateDamageMultiplier` 등이 3곳에 복사됨). 실제 모듈을 import하도록 통합하고 npm 스크립트에 연결

### 💡 새 기능 추가 시 체크리스트

- [ ] `viewMode` 전환 흐름 확인 (`App.tsx:323-333`)
- [ ] 100dvh 제로 스크롤 제약 준수 (세로 공간 추가 금지)
- [ ] 전역 키보드 리스너 충돌 확인 (`App.tsx:207-316` — 오버레이 열림 시 자동 차단됨)
- [ ] 모달 z-index 확인 (일반 100 / 승리·사망 120 / Confirm 999999)
- [ ] 새 상태 추가 시 `SaveDataPayload`(`saveManager.ts:40`)에 포함 여부 결정 — **누락 시 저장되지 않음**
- [ ] `npm run build` (tsc 포함) 통과 확인
- [ ] 배포 순서 준수: 빌드 검증 → 커밋 → 푸시 → `deploy.js`

### 🔑 핵심 파일 5개 (이것만 읽어도 전체가 보입니다)

| 파일 | 줄 수 | 읽어야 하는 이유 |
|---|---|---|
| `PROJECT_CONTEXT.md` | 488 | 1~38단계 작업 이력. 모든 설계 결정의 근거 |
| `src/state/gameStore.tsx` | 3,396 | 게임 로직의 사실상 전부 |
| `src/combat/combatEngine.ts` | 723 | 전투 해소 규칙 |
| `src/types/game.ts` | 307 | 전체 데이터 모델 |
| `src/App.tsx` | 357 | 화면 전환 + 전역 입력 처리 |
