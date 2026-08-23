# AI 순차 작업 지시서

저장소: 이 폴더  
스택: React 18 + TypeScript + Vite + Tailwind  
호스트: 1 vCPU / 6GB **nginx 정적**. 서버에서 Node/`vite` 금지.

한 번에 한 TASK만 붙여 넣는다. 튜토리얼 UI(암전·포인팅)는 **만들지 마라.** 첫 던전 클리어 이후 별도 TASK로 남긴다.

---

## 개발 목표 (현재 기준)

1. **런 입력은 이것만:** `Q/W/E/R` 스킬, `1~4` 포션, `←/→` 레인(전투) 또는 다음 방 선택(소탕 후), `Space` 공격/수령/진행.
2. **방 미니맵은 `?`.** 들어가기 전에는 타입을 보여주지 않는다. 들어가면 세 가지 중 하나다.
   - 웨이브 (다수 잡몹)
   - 단독 엘리트
   - 보물 (전투 없음, Space로 수령)
3. **1막은 레벨 1 던전.** 가르기(Q)만으로 항상 클리어 가능.
4. **첫 1막 클리어:** 레벨이 1 오를 경험치 + 2소켓 숏소드(Tir+El 강철용).
5. **스킬은 레벨 해금.** 1~30 안에 전부 열린다. 튜토리얼 오버레이 없음.
   - Q 가르기 Lv.1 / W 처형 Lv.8 / E 휩쓸기 Lv.16 / R 휠윈드 Lv.28
6. **튜토리얼은 나중에.** 첫 던전을 마친 뒤 마을에서 암전+포인팅. 지금 구현 금지.

---

## 이미 적용된 최적화 — 되돌리지 마라

- 인라인 부트 스플래시, 웹폰트 async, 시스템 한글 우선, `favicon.svg`
- 마을 eager / 전투·던전선택 lazy + idle prefetch
- `WARRIOR_SKILLS`는 `src/data/skills.ts`에서 import
- 키 리스너 `keysRef` + `useEffect([])`. 매 타격 `addEventListener` 금지
- 세이브 450ms 디바운스 + hide/unload flush
- `npm run build` = tsc + vite + `scripts/precompress.js`
- nginx `gzip_static`, `/assets/` immutable, `index.html` no-cache

금지: Mage, Zustand, 방 8~12 생성기, 클라우드 세이브, 튜토리얼 오버레이, 폰트 동기화, lazy 해제.

---

## TASK A — 읽기 (구현 금지)

```
코드만 읽고 보고. 수정 금지.
확인할 것: enterDungeon, createDungeonFormation, MiniRoomGraph, App.tsx Space, skills.unlockLevel, prepareDungeonRun.
```

---

## TASK B — 방 안개 + 세 타입 (이 패스에서 착수)

```
DungeonRoom.revealed. 미니맵 미진입 방은 ?.
런 시작 시 첫 전투방은 wave, 분기는 elite vs treasure 셔플.
treasure는 몬스터 0. elite는 단독 1마리. 보스 직전 웨이브 없음(1막은 wave→분기→보스).
```

---

## TASK C — 1막 확정 클리어 + 첫 보상

```
act1 recommendedLevel=1. 난이도 1 + 저레벨에서 잡몹/엘리트/보스 HP·딜을 가르기만으로 깨지게.
첫 act1 클리어: exp로 정확히 1레벨 + 식별된 2소켓 숏소드.
튜토리얼 모달/암전 만들지 마라. 승리 화면 카피 한 줄은 가능.
```

---

## TASK D — Space 런

```
전투 중 Space=공격. 보물 미소령 Space=수령. 소탕 후 출구 1개면 Space=진입.
출구 2개면 ←/→로 하이라이트 후 Space. connections[0] 강제 금지.
마을 Space=출격은 유지하되 신규를 온보딩 슬라이드로 막지 마라.
```

---

## TASK E — 스킬 레벨 해금

```
unlockLevel: slash 1, execute 8, cleave 16, whirlwind 28.
미해금은 전투 버튼/핫키/스킬창에서 잠금. 포인트 투자 불가.
레벨이 오르면 자동으로 열린다. 세이브 필드 추가하지 말고 playerStats.level로 판정.
```

---

## TASK F 이후 (아직 주지 마라)

이탈 몰수, Act 잠금, 자동 레인 제거, 프리뷰 정직화, 세이브 F5 포기, 감정 버그, 일반방 드랍, 유니크 규칙 3개, 샤드 싱크.

## TASK T — 튜토리얼 (콘텐츠 안정 후, 지금 금지)

```
첫 1막 클리어 후 마을에서 암전 + 포인팅.
대상: 스탯(C), 스킬 레벨업(K, 해금된 것만), 룬워드(2소켓+Tir+El).
부트 슬라이드 3장은 만들지 마라.
```

## TRACK IP — 고유 명칭 (별도 브랜치)
