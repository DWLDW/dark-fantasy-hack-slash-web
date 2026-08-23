# 드롭테이블 & 감정 시스템 개선 보고서

생성일: 2026-08-23 | 검증: npx tsc --noEmit 0 에러, npm run build 성공

## 1. 발견 및 수정한 논리 오류

### 오류 1 (치명): 미확인 아이템인데 실제로는 이미 정해진 유니크가 들어있는 문제
- 현상: 보물방/보스 드랍 시 "미확인 [나겔링]"처럼 베이스명만 보이고, 케인에게 감정하면 realUniqueName에 저장된 유니크가 나오는 게 아니라 identifyItemHelper가 이를 무시하고 랜덤 유니크 풀에서 다시 뽑아버림.
- 원인: identifySingleItem()에는 realUniqueName 처리 로직이 있었지만, gameStore의 identifyItem / identifyAllItems가 실제 호출하는 함수는 identifyItemHelper()였고 이 함수에는 해당 분기가 없었음.
- 수정: identifyItemHelper 최상단에 realUniqueName 우회 로직 추가. 드랍 시점에 결정된 유니크가 감정 시 100% 동일하게 공개됨.

### 오류 2: 노멀 장비까지 불필요하게 "미확인" 상태로 드랍
- 현상: 숏소드, 가죽갑옷 같은 일반 아이템도 전부 "미확인 [숏소드]"로 드랍되어 케인에게 갔다 와야 했음. 디아블로 원작에서도 노말은 즉시 식별 상태.
- 수정: claimTreasureHelper / generateVictoryLoot에서 rarity가 unique/set/legendary인 경우에만 미확인 마스킹 적용. 노말은 식별된 상태로 즉시 드랍.

### 오류 3: 던전 드랍테이블 fallback 인덱스 불일치 (22곳)
- 현상: dungeons.ts에서 GAME_ITEMS_POOL.find(i => i.id === ...) 실패 시 || GAME_ITEMS_POOL[N] 폴백이 슬롯이 다른 아이템을 가리킴. 예: u_soj(반지) 폴백이 e_thresher(무기).
- 수정: items.ts 풀 재구성으로 모든 find()가 반드시 매칭되도록 하고 남은 직접 인덱스 참조 제거. 현재 33개 던전 참조 모두 ID 기반 정확 매칭 (폴백 0건).

### 오류 4: "미확인 미확인 [...]" 이중 접두사 버그
- 위치: DungeonVictoryModal.tsx (승리 화면), gameStore.tsx (로그 메시지)
- 수정: 두 곳 모두 이중 접두사 제거.

## 2. 추가로 확인이 필요한 잠재 이슈 (권장 사항)

1. identifySingleItem 미사용 코드 - itemGenerator에 정의되어 있으나 UI 어디서도 호출하지 않음. 제거하거나 단일 아이템 우클릭 감정 기능으로 활용 권장.
2. 도박(gamble) 결과에 realUniqueName 없음 - generateGambleItem이 rarity=unique를 뽑아도 어떤 유니크인지 사전 확정하지 않아 감정 시점에 무작위 배정됨. 도박 시점에 미리 확정하면 D2 철학에 부합.
3. MF(Magic Find)가 아이템 등급 상승 확률에 미반영 - playerFortune은 룬 드랍 수에만 영향. generateVictoryLoot에 fortune 비례 unique/set 가중치 추가 권장.
4. scaleItemForDifficulty가 attackSpeed/critChance/MF 등 미스케일 - minDmg/maxDmg/defense/hp/str/dex/con만 스케일링됨. 고난도 체감을 위해 추가 권장.
5. sockets 소켓 수 스케일링 누락 - 고난도에서 소켓 증가 로직 없음. T5 이상 소켓 +1 기회 부여 검토.
6. set 아이템 세트 효과 부재 - Sigon's Guard, Guillaume's Face 등 set 아이템이 있으나 세트 보너스 미구현.
7. requiredLevel 미사용 - GameItem 타입에 필드만 존재하고 착용 제한 미적용. 고난도 유니크에 적용 권장.

## 3. 수정된 파일 목록

- src/state/helpers/itemGenerator.ts — identifyItemHelper realUniqueName 우선 처리 추가
- src/state/helpers/dungeonEventHelper.ts — claimTreasureHelper & generateVictoryLoot 드랍 논리 재설계
- src/components/modals/DungeonVictoryModal.tsx — 이중 접두사 제거
- src/state/gameStore.tsx — 로그 이중 접두사 제거

## 4. 검증 결과

- TypeScript 타입체크(npx tsc --noEmit): 0 에러 통과
- 프로덕션 빌드(npm run build): 1860 모듈 변환 성공
- 드랍테이블 ID 매칭 검증: 33/33 정확 매칭, 슬롯 불일치 0건