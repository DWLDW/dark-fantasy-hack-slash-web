# AI 순차 작업 지시서

저장소: 이 폴더 (다크 판타지 턴제 핵앤슬래시 웹 RPG)  
기준 커밋: `92856ae` (`recovery: restore Codex snapshot 2026-08-23 20:40:37`) — 이 스냅샷이 라이브  
스택: React 18 + TypeScript + Vite + Tailwind CSS  
상태: `src/state/gameStore.tsx` (Context). 테스트 스크립트 없음.  
호스트: **1 vCPU / 6GB nginx 정적 배포**. Node는 빌드 머신에서만 돌린다. 서버에서 `vite`/`node` 실행 금지.

이 문서는 **새 AI에게 한 번에 전부 주지 말고**, 끝난 뒤에 다음 번호만 붙여 넣기 위한 지시서다.

---

## 이미 적용된 최적화 — 되돌리지 마라

루프 TASK(01~17)를 하면서 아래를 풀거나 “원래대로” 되돌리지 말 것. 1코어 박스 + HTTP/1.1 전제다.

**로딩**
- `index.html` 인라인 부트 스플래시. `#root`를 빈 채로 두지 마라. 흰 화면 금지.
- 웹폰트는 **async** (`media="print" onload`). Cinzel 700 + Noto Sans KR 400/700만. JetBrains Mono / 나머지 웨이트를 다시 동기 로드하지 마라.
- 본문 폰트는 시스템 한글이 먼저 (`Malgun Gothic`, `Apple SD Gothic Neo`). Google Fonts가 막혀도 글자가 보여야 한다.
- `public/favicon.svg` 유지. 404 파비콘 요청을 되살리지 마라.
- `App.tsx`: 마을은 eager, 전투/던전선택은 `lazy` + idle prefetch. 세 뷰를 다시 한 청크에 묶지 마라. HTTP/1.1이라 청크를 더 잘게 쪼개지도 마라.
- `WARRIOR_SKILLS`는 `src/data/skills.ts`에서 import. `gameData.ts` barrel로 되돌리면 엔트리가 아이템 풀 전체를 기다린다.

**런타임**
- 전역 키 리스너는 `keysRef` + `useEffect([])`. `monsters`를 effect deps에 넣어 매 타격마다 `addEventListener` 하지 마라.
- BGM은 `bgmMode` 문자열만 의존. `currentDungeon` 객체 전체를 effect deps에 넣지 마라. 첫 입력 오디오 init은 마운트 1회.
- 세이브는 450ms 디바운스 + `beforeunload`/`visibilitychange` flush. 매 HP 틱마다 `JSON.stringify` + `localStorage` 하지 마라.
- `gameStore`를 Zustand/Jotai로 옮기는 것은 이 문서의 명시적 금지. 컨텍스트 분할도 TASK 범위 밖.

**빌드 / 1코어 nginx**
- `npm run build` = `tsc && vite build && node scripts/precompress.js`. precompress를 빌드에서 빼지 마라.
- `scripts/nginx-site.conf`: `gzip_static on`, `/assets/` immutable 1년, `index.html` no-cache, `open_file_cache`, `gzip_comp_level 4`.
- 워커는 1개. `worker_processes auto`로 올리지 마라.
- 서버에서 온더플라이 gzip level 9, brotli 동적 압축, SSR, `vite preview` 상시 구동 금지.
- HTTPS/HTTP2는 별도 인프라 작업. 이 패스는 HTTP 80. 청크를 많이 늘리면 HTTP/1.1에서 더 느려진다.

**TASK 08 참고:** autosave 객체/deps에 `currentDifficulty`·`maxUnlockedDifficulty`는 이미 들어가 있다. TASK 08은 세이브 버전, F5=원정 포기, 마이그레이션만 하면 된다.

---

## 오케스트레이터 사용법

1. 아래 **TASK 00**부터 **한 개만** 붙여 넣는다.
2. AI가 “완료 보고”를 주면 해당 TASK의 검증과, 문서 끝의 공통 스모크를 확인한다.
3. 통과하면 다음 TASK만 붙여 넣는다. **두 개를 합치지 않는다.**
4. 어느 TASK든 범위 밖을 시작하면 되돌려라.
   - Mage / 방 개수 증가 / Wait ATB 재구현 / 클라우드 세이브 / 전 유니크 이펙트 / Zustand 이전 / README 장문 작성 / IP 전체 치환을 루프 TASK에 섞기
   - 폰트 동기 로드 복구, 뷰 lazy 해제, 매 프레임 localStorage, nginx gzip_static 제거, 청크 과분할
5. IP 명칭 치환은 **TRACK IP**로, 루프 TASK와 같은 PR에 넣지 마라.
6. TASK 11(드랍)은 01~10이 끝나기 전에 주지 마라. 구멍을 연 채로 보상만 올리면 인플레만 커진다.

### 매 TASK 앞에 붙여도 되는 공통 제약

```
이 게임은 React 18 + TS + Vite + Tailwind 웹 RPG다.
요청한 파일만 최소 수정하라. 리팩터·새 시스템·주석 나열·문서 파일을 만들지 마라.
기존 한국어 UI 톤을 유지하라. npm test는 없다. 검증은 npx tsc --noEmit 와 명시된 수동 스모크다.
완료 보고: 변경 파일, 한 줄 요약, 남은 리스크, 다음 TASK 번호.
```

### 새 AI가 범위 밖으로 나가면 자를 문장

```
지금은 TASK NN만 한다. Mage, 방 개수 증가, Wait ATB 재구현, 클라우드 세이브, 모든 유니크 이펙트, Zustand 이전, README 작성, 폰트/nginx/lazy 로딩 되돌리기는 하지 마라. 완료 보고만 하고 멈춰라.
```

`NN`을 현재 번호로 바꿔 붙인다.

---

## TASK 00 — 읽기만 (구현 금지)

```
역할: 코드만 읽고 이후 작업을 위한 지형도를 확인한다. 파일을 수정하지 마라.

읽을 것:
- src/App.tsx (Space 키: 마을에서 enterDungeon, 클리어 후 connections[0], 성소는 fortune 고정)
- src/state/gameStore.tsx (enterDungeon 스냅샷, returnToTown, confirmDeathAndReturnToTown, executeAttack 끝 findBestLaneForSkill, selectSkillOrExecute, identifyAllVictoryLoot, autosave useEffect)
- src/components/layout/BottomDock.tsx (전투 중 setViewMode('town') — 루팅 유지)
- src/components/layout/TopHUD.tsx (캐릭터 초기화 버튼)
- src/components/views/BattleView.tsx (resetBattleFormation 버튼)
- src/state/helpers/dungeonEventHelper.ts (makeDungeonDrop rarity 강제 normal, claimTreasureHelper fortune 0, generateVictoryLoot +5 점프)
- src/combat/combatEngine.ts (resolveAttack forceDeterministic, findBestLaneForSkill, createDungeonFormation else 분기)
- src/state/helpers/saveManager.ts

보고만 해라:
1) 위 동작이 코드에 있는지 파일:라인
2) 이후 TASK가 건드리면 안 되는 이유(있다면)
구현하지 마라.
```

---

## TASK 01 — 첫 실행 온보딩 + 마을 Space 출격 차단

```
목표: 신규가 Space를 눌러도 즉시 던전에 안 들어가고, 첫 실행에 3장짜리 짧은 안내가 뜬다.

현재:
- src/App.tsx 마을에서 Space/Enter → enterDungeon(currentDungeon.id, currentDifficulty)
- 튜토리얼 없음

할 일:
1) saveManager SaveDataPayload에 hasSeenIntro?: boolean 추가. 기본 false. autosave/export/import에 포함.
2) 마을에서 Space는 enterDungeon을 직접 호출하지 않는다.
   - hasSeenIntro === false 이면 온보딩만 연다(또는 다음 장).
   - hasSeenIntro === true 이면 “최근 던전 재입장” 확인 UI를 연다. 확인 버튼/두 번째 Space만 enterDungeon.
3) 온보딩 오버레이 3장, 스킵 가능. 닫으면 hasSeenIntro=true.
   - 1: ←/→ 레인
   - 2: QWER 스킬, Space 공격
   - 3: 마을에서 장비 후 출격
4) TownView 기존 [Space] 즉시 출격 버튼은 남겨도 되지만, 신규(hasSeenIntro false)에게는 비활성 + “먼저 안내를 보세요” 또는 온보딩을 연다.

금지:
- 던전/전투 로직 변경, 드랍 변경, 새 라우터.

검증:
- tsc
- 세이브 삭제 후 실행 → 마을에서 Space → 전투 화면이 아님
- 온보딩 스킵 후 출격 버튼으로 1막 진입 가능

완료 조건: 신규 Space ≠ 던전 진입.
```

---

## TASK 02 — 마을 CTA를 “지금 갈 던전”으로 + 시작 스킬룬 해제

```
전제: TASK 01 머지됨.

목표: 마을 첫 시선이 룬 금고가 아니라 추천 던전 1장이다. 신규 캐릭터 스킬 룬이 비어 있다.

현재:
- TownView 3열이 룬 금고 그리드
- gameStore skillRunes 초기값 slash/execute/cleave/whirlwind 전부 장착
- resetGameSave도 같은 기본값

할 일:
1) TownView 우측(lg:col-span-4)을 “추천/최근 던전” 카드로 바꾼다.
   - 이름, 권장 레벨, 주요 드랍 2~3개, 룬 티어 한 줄, [출격] 버튼
   - 룬 금고는 접힌 섹션 또는 인벤/기존 룬 탭으로 이동. 마을 첫 화면 풀 그리드 금지
2) 신규·리셋 캐릭터 skillRunes = {}
3) 온보딩을 닫거나 1막 첫 클리어 시 스킬 룬 1개를 장착하라는 로그/토스트 한 줄. 자동 장착하지 말 것.

금지: 룬 시스템 재설계, 던전 데이터 변경.

검증:
- 리셋 후 K 스킬창에서 룬이 비어 있음
- 마을 우측에서 1막 출격이 보임

완료 조건: 마을에서 “지금 어디로 가나”가 한 눈에 보임.
```

---

## TASK 03 — 전투 이탈 = 이번 원정 루팅 몰수

```
전제: TASK 02 머지됨.

목표: 보물만 먹고 하단 마을/던전을 눌러 루팅을 가져가는 구멍을 막는다.

현재:
- enterDungeon이 dungeonSnapshot(inventory, runesVault, gold, exp, level) 저장
- confirmDeathAndReturnToTown만 스냅샷 롤백. shards는 롤백 안 함
- returnToTown()은 스냅샷을 버리고 루팅 유지
- BottomDock 마을 버튼, TopHUD 홈이 setViewMode('town')만 호출 → 루팅 유지

할 일:
1) returnToTown(options?: { forfeit?: boolean })로 통일.
   - forfeit true: 사망과 동일하게 snapshot으로 inventory/runesVault/gold/exp/level/shards 복구. dungeonBuffs 클리어. dungeonSnapshot null.
   - snapshot에 shards를 추가해서 enterDungeon 때 같이 찍는다.
2) 전투 중(viewMode==='battle') 마을/던전/홈 클릭 → 확인 모달
   “이번 원정에서 얻은 장비·룬·골드를 잃고 마을로 돌아갑니다”
   확인 시에만 returnToTown({ forfeit: true })
3) 사망 롤백에도 shards 포함
4) setViewMode('town')을 전투에서 직접 쓰지 마라. 경유 함수만.

금지: 사망 페널티를 더 무겁게 만들기, 중도 저장 전투 복구.

검증:
- 보물 개봉 → 하단 마을 → 취소 → 인벤에 아이템 유지, 전투 유지
- 확인 → 마을, 방금 보물 아이템/골드/샤드 없음
- 사망 → 샤드도 입장 전 값

완료 조건: 도망/사망 모두 원정 루팅이 남기지 않음.
```

---

## TASK 04 — 라이브에서 치트/위험 버튼 제거

```
전제: TASK 03 머지됨.

목표: 전투 리셋·상시 캐릭터 초기화가 플레이 화면에 없다.

현재:
- BattleView resetBattleFormation: HP 풀, rage 75, 몬스터 리스폰
- TopHUD 캐릭터 초기화 확인 모달

할 일:
1) BattleView에서 전장 초기화 버튼과 resetBattleFormation UI 사용 삭제
2) resetBattleFormation이 다른 프로덕션 UI에서 안 불리면 context에서 빼도 됨. 개발용으로 남겨도 UI에는 없음
3) TopHUD 초기화 버튼 삭제. SettingsModal의 기존 초기화만 남김
4) SettingsModal 초기화 카피에 “모든 진행이 삭제됩니다” 유지

금지: 세이브 리셋 기능 자체를 없애기.

검증: 전투 HUD·상단 바에 초기화/전장리셋이 없음. 설정에서만 리셋 가능.

완료 조건: 라이브 화면에서 치트 버튼 0개.
```

---

## TASK 05 — Act 잠금 + 난이도 점프 축소

```
전제: TASK 04 머지됨.

목표: 레벨 1이 5막/고난도에 바로 못 들어간다. 클리어 한 번에 난이도가 +5 뛰지 않는다.

현재:
- DungeonSelectView가 5막 전부 클릭 가능
- generateVictoryLoot: HP>=90 +5, >=70 +3, >=50 +2, else +1
- achievementStats.dungeonClears로 클리어 횟수는 이미 있음

할 일:
1) Act 잠금: actN은 act(N-1) dungeonClears >= 1 일 때만 입장.
   잠긴 카드는 잠금 표시 + “이전 막 클리어 필요”. enterDungeon도 서버 없이 클라에서 거부+로그
2) 권장 레벨보다 player level이 10 이상 낮으면 경고 문구. 막지는 않음 (이미 해금된 막에 한함)
3) generateVictoryLoot 점프: HP>=90 +2, >=70 +1, else +1. +5/+3 삭제
4) maxUnlockedDifficulty 갱신 로직은 기존대로 nextDifficulty 사용

금지: 난이도 공식(몬스터 HP 스케일) 전체 재조정, 새 던전.

검증:
- 신규는 1막만 입장
- 1막 클리어 전에는 2막 클릭이 입장으로 안 이어짐
- 무피 클리어여도 난이도 +2 이하

완료 조건: 게이트가 데이터와 입장 함수 양쪽에 있음.
```

---

## TASK 06 — 자동 레인 스냅 제거

```
전제: TASK 05 머지됨.

목표: 레인 선택은 플레이어만 한다. 오버킬의 핵심 판단을 게임이 대신하지 않는다.

현재 (gameStore.tsx):
- executeAttack → 호드 반격 타임아웃 끝에서 findBestLaneForSkill로 setPlayerLane
- selectSkillOrExecute에서 스킬을 바꾸면 findBestLaneForSkill로 setPlayerLane

할 일:
1) 위 두 호출을 삭제. 플레이어가 둔 레인에 그대로 있는다
2) 선택 스킬 기준으로 다른 레인의 예상 처치가 현재보다 높으면, BattleView 그 레인 헤더에 작은 힌트(예: ↑ 또는 “예상 n”)만. 클릭 없이 이동 금지
3) 같은 스킬 재입력(더블탭) 즉시 시전은 유지
4) ←/→ 와 레인 클릭 이동은 유지

금지: 자동 전투, 프리뷰 공식 개편(그건 TASK 07).

검증:
- 스킬만 바꿔도 레인이 안 움직임
- 한 대 치고 난 뒤에도 레인이 안 움직임
- 약한 레인 vs 엘리트 레인을 직접 골라 결과가 달라짐

완료 조건: findBestLaneForSkill이 플레이어 레인 state를 바꾸지 않음.
```

---

## TASK 07 — 프리뷰 정직화 + 성소 Space

```
전제: TASK 06 머지됨.

목표: 프리뷰가 “확정 학살”처럼 보이지 않는다. Space가 성소에서 태양만 강제하지 않는다.

현재:
- resolveAttack(..., forceDeterministic=true)가 프리뷰. 치명 50% 이상이면 확정 치명, 피해는 min/max 평균
- App.tsx 클리어 후 성소 Space → claimShrine('fortune') 고정
- 분기 방 Space → connections[0] 고정 (분기는 TASK 13에서. 이번엔 성소만)

할 일:
1) 프리뷰 배너 카피: “예상 n처치” / 가능하면 범위. “전멸” 확정 표현은 실제 비치명 평균으로도 전멸일 때만
2) 치명/연격은 프리뷰에서 켜지 않거나, 배너에 “치명 미포함 예상”을 명시. 배너 숫자와 실제가 크게 어긋나면 안 됨
3) 성소 3버튼에 선택 상태. Space는 선택된 축복만 claim. 기본 선택은 없음(첫 Space는 선택 안내 로그) 또는 마지막 포커스
4) forceDeterministic 자체는 프리뷰용으로 남겨도 됨. UI가 과대 확정만 하지 않으면 됨

금지: 실제 전투 대미지 공식 재작성, 드랍.

검증:
- 치명 빌드가 아닌데 프리뷰가 전멸, 실제 3킬인 상황이 줄어듦
- 성소에서 Space가 피의 성소/강철을 선택할 수 있음

완료 조건: 프리뷰 카피가 정직하고, 성소 Space ≠ 항상 태양.
```

---

## TASK 08 — 세이브 스키마·난이도 지속

```
전제: TASK 07 머지됨.

목표: 난이도 해금·온보딩 플래그가 새로고침 후에도 남는다. 전투 중 새로고침은 원정 포기로 처리한다.

현재:
- autosave는 450ms 디바운스이며 currentDifficulty, maxUnlockedDifficulty가 객체와 deps에 이미 포함됨. 디바운스를 동기 매틱 저장으로 되돌리지 마라.
- viewMode 미저장 → 새로고침 시 마을. 인벤은 이미 원정 루팅이 committed 됐을 수 있음

할 일:
1) SAVE_KEY를 V2로 올리거나 payload에 saveVersion: 2
2) autosave deps에 currentDifficulty, maxUnlockedDifficulty, hasSeenIntro, (TASK 03의) dungeonSnapshot 관련 필요 필드 포함
3) 구 V1 세이브는 기본값으로 마이그레이션. 깨지지 않게
4) 전투 중(스냅샷이 있는 채) 새로고침되면 로드 시 스냅샷으로 롤백하고 마을에서 시작. 전투 복구 만들지 마라
5) importSaveData도 새 필드를 반영

금지: 서버 세이브, 암호화.

검증:
- 난이도 해금 후 새로고침 → 해금 유지
- 던전 들어가 아이템 줍고(커밋된 방) 새로고침 → 그 런 루팅이 스냅샷 기준으로 되돌아감
  정책: 원정 미종료는 몰수. 스냅샷이 있으면 로드=스냅샷 복구+town.
  승리 모달 전에 이미 inventory에 넣은 보물은 스냅샷 시점이 입장 시라 몰수됨. 이게 의도.

완료 조건: 난이도 저장 버그 없음. 전투 중 F5 = 포기.
```

---

## TASK 09 — 승리 감정 버그 수정

```
전제: TASK 08 머지됨.

목표: 승리 일괄 감정이 고유 이름을 열고, 인벤 전체를 감정 처리하지 않는다.

현재 identifyAllVictoryLoot:
- dungeonVictoryLoot.items에 isIdentified:true만 찍음 (realUniqueName 미적용 → 이름 “미확인 [도검]” 유지 가능)
- setInventory(prev => prev.map(i => ({ ...i, isIdentified: true }))) 전체 식별 플래그

할 일:
1) 승리 아이템만 identifyItemHelper(item, level)로 처리
2) inventory는 해당 id만 교체
3) 모달 목록도 helper 결과 이름을 보여 줌
4) 마을 케인 identifyAllItems는 기존 helper 경로 유지 (전체 미확인만)

금지: 드랍 테이블 변경.

검증:
- 보스 클리어 후 미확인 유니크 → 일괄 감정 → 잠긴 realUniqueName이 열림
- 인벤에 다른 미확인이 있어도 승리 버튼이 그것을 건드리지 않음 (마을 케인으로만)

완료 조건: 승리 감정 = helper, 대상 = 승리 아이템만.
```

---

## TASK 10 — 에러 바운더리 + 버전 표시

```
전제: TASK 09 머지됨.

목표: 런타임 예외 시 흰 화면 대신 복구 UI. 설정에 빌드 식별자가 있다.

할 일:
1) React Error Boundary로 MainLayout을 감싼다.
   Fallback: “문제가 발생했습니다”, [페이지 새로고침]을 주 버튼으로.
   크래시 시 상태 불명일 수 있으니 returnToTown forfeit를 자동 호출하지 마라.
2) SettingsModal에 버전: package.json 0.1.0 + 가능하면 짧은 날짜/커밋. 하드코드 문자열이면 충분
3) 설정 세이브 안내 한 줄: “진행은 이 브라우저에만 저장됩니다. 설정에서 백업하세요.”

금지: Sentry 등 외부 서비스, 큰 레이아웃 개편.

검증: 설정에서 버전 보임. (에러 바운더리는 코드 존재 확인)

완료 조건: 크래시가 빈 화면이 아님.
```

---

## TASK 11 — 방 타입별 드랍 + MF 고정

```
전제: TASK 10 머지됨. 여기부터 보상 증가. 1~10이 없으면 이 TASK를 주지 마라.

목표: 일반/엘리트 방에서도 장비가 나온다. magic/rare가 실제로 나온다. MF는 입장 때 고정된다.

현재:
- 일반 방 클리어 = 골드/경험만
- makeDungeonDrop이 비스페셜을 rarity 'normal'로 강제
- claimTreasureHelper(..., playerFortune: 0)
- Fortune이 런 중 장비 교체에 즉시 반응

할 일:
1) enterDungeon 때 runFortune = totalStats.fortune 스냅샷. 런 종료까지 generateVictoryLoot/treasure/room drop은 이 값만 사용
2) 방 클리어 시(보스 제외) 드랍 함수 추가:
   - normal: 낮은 확률 1 roll, normal/magic
   - elite: 1~2 roll 보장, magic/rare + 룬 소량 가능
   - treasure: 기존 헬퍼 + 스냅샷 fortune
   - rune/shrine 방은 기존 이벤트 유지, 장비 roll은 넣지 않는 쪽 권장
3) makeDungeonDrop
   - 비스페셜을 전부 normal로 강제하지 말 것
   - magic/rare는 itemGenerator 접사 로직으로 생성
   - unique/set/legendary만 미확인 마스킹
4) 드랍 아이템은 inventory에 넣고, latestRoomLootEvent에 실어서 UI는 TASK 12가 담당. 이번엔 이벤트 데이터만이라도 채움
5) 골드 인플레를 위해 일반 방 장비 가치를 작게. 보스 드랍은 기존 유지

금지: 난이도 스케일 공식 전체 재작성, 새 아이템 30개.

검증:
- 1막 일반 방 여러 번 → magic이 한 번은 나옴
- CHA를 올려도 던전 안에서 장비 교체 전후 드랍 가중치가 안 바뀜 (입장 스냅샷)
- 보물방이 fortune 0이 아님

완료 조건: 보스가 아니어도 장비가 나오고, rarity 계층이 존재함.
```

---

## TASK 12 — 방 클리어 Loot Tray + 즉시 비교

```
전제: TASK 11 머지됨.

목표: 줍는 순간에 착용분과 한 줄 비교가 된다.

할 일:
1) BattleView 일반 방 소탕 오버레이에도 드랍 목록 (보스/보물 히어로 카드와 같은 패턴, 더 작게)
2) 장비 한 줄: 이름, 등급색, 착용 슬롯 대비 “공격 ↑n” 또는 “방어 ↓n” 또는 “동등/비교불가”
   ItemCompareTable의 핵심 스탯만 재사용. 모달 전체를 열지 말 것
3) Rare 이상만 강한 테두리. normal은 압축
4) Space = 다음 방 (분기 없으면). I = 인벤 (기존)

금지: 인벤 UX 전면 개편.

검증: 일반 방 클리어 후 장비가 필드에서 보이고, 업그레이드 여부가 한 줄로 읽힘.

완료 조건: 드랍이 로그가 아니라 화면 보상이다.
```

---

## TASK 13 — 6방 분기 가독성 (방 수 늘리지 말 것)

```
전제: TASK 12 머지됨.

목표: 같은 6방에서 보물 vs 엘리트를 고르는 선택이 보인다. Space가 항상 왼쪽 길을 강제하지 않는다.

현재:
- MiniRoomGraph가 rooms 배열을 가로 일렬 + chevron
- App.tsx Space → connections[0]
- 두 다음 방 버튼이 같은 pulse 스타일

할 일:
1) MiniRoomGraph를 분기 형태로 (2에서 3과 4가 갈라져 5로 합류). 방 데이터 connections는 유지. 방 추가 금지
2) 클리어 후 다음 방이 2개면 Space로 진행하지 않음. ←/→ 또는 클릭으로 하이라이트 후 Space
   다음 방이 1개면 지금처럼 Space 진행
3) 보물/엘리트/보스 버튼 색과 카피를 다르게
4) 성소 Space는 TASK 07 규칙 유지

금지: 랜덤 맵 생성기, 방 8~12.

검증:
- 2번 방 클리어 시 두 길이 보이고 Space만으로 안 넘어감
- 고른 길로만 selectNextRoom

완료 조건: 매 런의 중간 선택이 눈에 보임.
```

---

## TASK 14 — 4·5막 포메이션 + 보스 페이즈 실효과

```
전제: TASK 13 머지됨.

목표: 고난도 막이 “카오스 악마 15마리”가 아니다. 보스 30% 페이즈가 숫자로 작동한다.

현재:
- createDungeonFormation else: 카오스 악마 15 + 보스 이름만
- BattleView 페이즈2 문구. bossGimmick 필드 미설정. 공격력 배율 없음

할 일:
1) act4_chaos / act5_worldstone 전용 포메이션 (1막 밀도 수준)
   - 4막: 전열 가드, 후열 캐스터, 엘리트 스토퍼
   - 5막: 밀집 웨이브 + 중앙 엘리트
2) 보스 HP <= 30%이면 이후 호드/보스 intent.damage에 배율 (예: 1.5). 문구와 일치
3) 새 스킬·새 던전·새 아이템 없음

검증: 4막 일반 방이 1막과 구성이 다름. 보스 30% 이후 받는 피해가 커짐.

완료 조건: else 폴백에 5막이 삼켜지지 않음.
```

---

## TASK 15 — 전투 규칙을 바꾸는 유니크 3개만

```
전제: TASK 14 머지됨.

목표: 유니크 3개가 스킬 사용 순서를 바꾼다. 나머지 specialEffect 텍스트는 그대로 둔다.

할 일:
1) GameItem 또는 계산 스탯에 플래그 3개 (문자열 includes 남발 금지)
   A) slash 잔여 피해가 좌우 레인 40% 분기
   B) 처치 시 감소 위력 폭발 1회(같은 폭발 재귀 금지)
   C) 엘리트/보스에게만 처형 계수 증가
2) combatEngine.resolveAttack이 플래그를 읽게
3) 기존 풀에서 2/3/4막 보스 드랍에 이 3개를 하나씩 매핑. 새 아이템을 만들면 id/이름을 고유하게 (원작 이름 복사 금지)
4) 아이템 설명은 실제 효과와 일치

금지: 모든 unique specialEffect 구현, 새 스킬.

검증:
- A 장착 시 가르기가 옆 레인을 죽임
- B가 폭발을 한 세대만 일으킴
- C 없이 처형 vs 있으면 엘리트 킬 차이

완료 조건: 3개만 코드로 작동. 나머지 유니크는 스탯+텍스트.
```

---

## TASK 16 — 샤드 싱크 + 인벤 상한 + 자동물약 기본 Off

```
전제: TASK 15 머지됨.

목표: 샤드를 쓸 곳이 있다. 가방이 무한히 안 불어난다. 자동 물약이 기본이 아니다.

할 일:
1) 샤드 소모: 노말 장비 소켓 +1 (최대 6) 또는 무소켓→2소켓. 비용은 명확한 상수. 큐브 소켓 레시피와 효과 중복이면 비용을 맞추고 UI는 인벤 상세에 “샤드로 소켓”
2) 인벤 장비 상한 40. 초과면 enterDungeon 거부 + 일괄 판매 CTA. 룬 금고는 제외
3) 창고 모달 최소 구현 (ModalType 'storage' 이미 있음): 20칸 이동만. 강화 없음
4) 자동 HP 물약 기본 Off. Settings에 토글, localStorage. On이면 기존 combatActionHelper 로직

금지: 풀 대장간, 강화 실패, 거래소.

검증:
- 샤드 감소와 소켓 증가가 함께 일어남
- 40개 넘으면 입장 안 됨
- 기본 설정에서 HP 50%가 되어도 물약이 안 까짐

완료 조건: 넣기(드랍) 대비 빼기(샤드/가방)가 있음.
```

---

## TASK 17 — 런 목표 카피 + pulse 정리 + 클리어타임

```
전제: TASK 16 머지됨.

목표: 마을/관문에서 “이번 런에 뭘 노리나”가 보이고, CTA가 한 개다.

할 일:
1) Town 추천 카드 + DungeonSelect 상세에 고정 문구: 주요 베이스, 룬 구간, (있다면) 유니크 3개 중 이 막 대상
2) bestClearTime 하드코딩 숨김. 가능하면 실제 런 시작~보스 클리어 ms를 저장해 “내 최선”만 표시. 없으면 칸 삭제
3) animate-pulse는 주 출격 버튼 1개만. 감정/합성/다음방 전부 pulse 제거
4) 1막 3런 손으로 플레이하며 밸런스 숫자 조정은 최소만 (몬스터 수 대폭 변경 금지)

검증: 마을에서 출격 버튼만 깜빡임. 던전 카드에 파밍 목적이 텍스트로 있음.

완료 조건: 2주 루프의 UI 마감.
```

---

## TRACK IP — 고유 명칭 (루프와 다른 브랜치, 공개 전 필수)

```
전제: 루프 TASK와 섞지 말 것. 공개 전에 머지.

목표: 디아블로 고유명·대사·유니크명·룬워드명을 이 게임 세계관 이름으로 교체한다. 시스템(소켓, 3:1, 5레인, 오버킬)은 유지.

건드릴 데이터/카피:
- src/data/items.ts, runeWords.ts, dungeons.ts, runes.ts
  룬 이름 El/Tir 자체는 바꿔도 되고, 원작 고유 유니크/NPC만 바꿔도 됨 — 한 정책을 일관 적용
- TownView, DeathModal, DungeonVictoryModal, README, index.html title
- “Stay awhile and listen”, Rogue Encampment, Deckard Cain, Gheed, Horadric, Andariel/Duriel/Mephisto/Diablo/Baal, Shako, SOJ, Enigma 등

할 일:
1) 검색으로 원작 고유명 목록을 만든 뒤 치환
2) id(u_shako 등)는 내부 id라 바꾸면 세이브 호환이 깨짐 → id는 유지하고 name/description만 바꾸는 쪽을 권장
3) 게임 표시 제목을 임시 고유명으로 (확정 전이면 플레이스홀더 금지, 쓸 이름을 하나 정해서)

금지: 전투 공식 변경, 이 TASK에서 밸런스.

검증: 게임 화면/README에 원작 NPC·유니크 병기가 없음.

완료 조건: 공개용 이름만 남음.
```

---

## 매 TASK 후 오케스트레이터 스모크

실패하면 다음 TASK를 주지 말고 같은 번호를 고쳐라.

1. 신규(세이브 삭제)로 켠다 → 던전에 안 떨어진다
2. 1막 한 방 → 레인을 내가 옮긴다 (TASK 06+)
3. 보물 후 마을 버튼 → 확인 없이 장비가 안 남는다 (TASK 03+)
4. 클리어 감정 → 이름이 열린다. 새로고침 → 난이도 남음 (TASK 08–09+)
5. TASK 11+ : 일반 방에서 장비 1개가 보일 수 있다

---

## 순서 한눈에

```
00      읽기만
01~03   온보딩 · 마을 CTA · 이탈 몰수
04~05   치트 버튼 제거 · Act 잠금
06~07   자동 레인 제거 · 프리뷰/성소
08~10   세이브 · 감정 버그 · 에러 바운더리
11~13   방 드랍 · Loot Tray · 분기 UI
14~15   4·5막 포메이션 · 유니크 규칙 3개
16~17   샤드/가방 싱크 · CTA 마감
TRACK IP  고유 명칭 (별도 브랜치, 공개 전)
```
