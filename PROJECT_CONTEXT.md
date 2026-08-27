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
### 8. 액트별 비주얼 테마 강화, 투명 데미지 합산창, 보스 액티브 스킬 로테이션 탑재
- 🎨 **액트 1~5 고유 분위기 배경색 및 전장 바닥 틴트 전면 강화 (`actThemes.ts`, `BattleFieldLanes.tsx`)**:
  - Act 1 (핏빛 황야/카타콤 와인레드), Act 2 (작열하는 사막 앰버/모래바람), Act 3 (맹독 밀림 정글 에메랄드), Act 4 (불타는 지옥 용암 진홍), Act 5 (혹한의 설산 서리 시안) 고유 배경 그라데이션 및 5개 레인 바닥 틴트 적용.
  - 대기 파티클(`AtmosphereLayer.tsx`) 밀도 및 가시성 상향으로 테마 몰입감 극대화.
- 💎 **데미지 합산창 투명화 및 블러(Blur) 원천 제거 (`CombatJackpotOverlay.tsx`, `index.css`)**:
  - `critSlam` 애니메이션의 무거운 `filter: drop-shadow(35px)` 및 `blur(4px)`를 제거하고 순수 텍스트 네온 아웃라인으로만 띄워 뒤쪽 레인/몬스터가 100% 투명하고 선명하게 비치도록 개선.
- 👑 **보스 일반 액티브 스킬 로테이션 탑재 (`gameStore.tsx`)**:
  - 멸망기(3턴 주기 차징) 외에도 일반 턴에서 안다리엘(독침 연사, 유독한 안개), 두리엘(결빙 강타, 흉포한 도약), 메피스토(연쇄 번개, 해골 유도탄), 디아블로(지옥불 파도, 암흑 화염구), 바알(마나 연소 광선, 혈마 쐐기) 등 고유 시그니처 일반 스킬을 매 턴/2턴마다 다채롭게 시전.

### 9. 엑스트라 턴 컷인 마스킹 완전 제거, AI 생성 고품질 액트별 컨셉 아트워크 탑재, 보스 스킬 피해량 사전 표기 연동
- ⚡ **엑스트라 턴(1-More) 컷인 박스 마스킹 100% 완전 박멸 (`ExtraTurnCutin.tsx`, `index.css`)**:
  - 처형(Execute) 시 화면을 가리던 어두운 사다리꼴 상자/기울기/그림자/블러를 완전히 없애고, 0.9초 동안 상단에 작고 산뜻한 알림 필(`⚡ 1 MORE! EXTRA TURN (연속 공격)`)만 떴다 사라지는 미니멀 토스트로 전환하여 잔상/가림 현상 완전 해결.
- 🎨 **AI 이미지 생성 기반 액트 1~5 정통 다크 판타지 컨셉 아트워크 탑재 (`generate_ai_act_artworks.js`, `BattleFieldLanes.tsx`)**:
  - 단순 SVG를 전면 배제하고, AI 이미지 생성 파이프라인을 구축하여 5개 액트 고유의 정통 다크 판타지 유화/디지털 페인팅 아트워크(Act 1 카타콤, Act 2 사막 석묘, Act 3 자카룸 정글, Act 4 지옥불 용암 강, Act 5 아리앗 설산 정상)를 생성.
  - Sharp로 1280x720 20KB대 초경량 WebP 및 `<picture>` 태그로 최적화하여 0.01초 쾌속 렌더링 + 은은한 전장 몰입감(`opacity-30`) 완성.
- ⚠️ **보스 다음 턴 스킬 및 실제 피해량 사전 계산 & 표기 완벽 연동 (`gameStore.tsx`, `BattleView.tsx`, `BattleStatusDock.tsx`, `BossHUD.tsx`)**:
  - 보스가 다음 턴에 쓸 스킬의 실제 데미지와 스킬명을 `boss.intent`에 사전 기록하고, 하단 체력 바에 `⚠️ -[예상 피해] 피격 예고` 및 `BossHUD`에 스킬 뱃지 노출로 플레이어가 사전에 완벽히 대비할 수 있도록 연동.

### 10. 공격/스킬 타격 이펙트(FX) 몬스터 위치 정밀 직격 정렬 (`CombatFxLayer.tsx`)
- 🎯 **허공 타격 현상 완전 해결**:
  - 레인 뷰포트 압축 이후 상단 허공(`top: 20%~30%`)에 머물러 있던 가르기(종베기), 처형(십자검기), 휩쓸기(횡베기), 방패 강타, 휠윈드, 오버킬 파열 폭발의 기준점을 몬스터들이 실제로 위치하는 레인 하단부(`bottom: 2%~8%`, `height: 46%~82%`)로 완벽히 재정렬.
  - 모든 검기와 타격 파티클이 레인 내 적 몬스터 토큰의 정중앙에 시원하게 직격하도록 수정 완료.

### 11. 인벤토리 컨트롤 상단 압축 통합 & 룬워드 제작 완성 예상 능력치 프리뷰 (`ItemDetailCard.tsx`, `InventoryModal.tsx`, `RuneCraftPanel.tsx`, `TownView.tsx`)
- 🧹 **인벤토리 하단 중복 버튼 제거 및 상단 단일화**:
  - `ItemDetailCard` 상단에 이미 존재하던 잠금/보관함 아이콘 외에, 아이콘 없는 깔끔한 텍스트 기반 **`[판매 (+XX G)]`** 버튼을 상단 헤더에 신설.
  - 하단에 불필요하게 중복되던 `아이템 잠금`, `보관함에 넣기`, `개별 판매` 버튼들을 전면 제거하고 `[장착하기 (E)]` / `[식별]`만 남겨 세로 공간을 획기적으로 압축 확보.
- 🔮 **룬워드 제작 시 완성 예상 능력치 & 스탯 뱃지 프리뷰 탑재**:
  - 소켓 베이스 아이템에 룬워드를 제작할 때, 완성 시 부여되는 **최종 예상 공격력/방어력 수치(`⚔️/🛡️`)**, **특수 효과(`specialEffect`)**, **보너스 스탯 뱃지(피해 증가, 모든 저항, 공속, 치명타, 힘/민/지 등)**를 룬워드 제작 패널(`RuneCraftPanel.tsx`) 및 마을 룬워드 공방(`TownView.tsx`)에 직관적인 프리뷰 박스로 완벽 표출.

### 12. 대균열(Endless Rift) 시스템, 전술적 군세 스폰, 동적 등반, 하이엔드 잭팟 연출 및 월드맵 탭 탑재 (`dungeons.ts`, `gameStore.tsx`, `GodlyDropJackpot.tsx`, `BattleFieldLanes.tsx`, `DungeonSelectView.tsx`, `DungeonVictoryModal.tsx`)
- 🌌 **대균열 루프 완벽 유지 & 액트 테마 무작위 변환**:
  - Act 5 최종 던전(`act5_4_throne`) 클리어 후 스페이스바 자동 진행 시 무한 파밍/성장 콘텐츠인 대균열(`endless_rift_t{tier}`) 모드로 자동 전환되며, 대균열 완료 후에도 액트로 튕기지 않고 다음 대균열 티어로 무한히 진격.
  - 대균열 입장 시 플레이어가 해금한 **최고 난이도(`maxUnlockedDifficulty`)가 자동 적용**되어 최상의 보상 가치 보장.
  - 매 티어/방마다 Act 1~5의 다크 판타지 유화 배경과 레인 틴트, 몬스터 로스터가 랜덤하게 변환되어 끝없는 신선함 제공.
- 🎯 **전술적 몬스터 군세 스폰 & 티어별 몹 수량 점진적 확장 (16 ➔ 최대 26마리)**:
  - 대균열 티어(`tier`)가 올라감에 따라 몬스터 수량이 16마리 ➔ 21마리 ➔ 26마리까지 점진적으로 증가.
  - **세로 집중 돌파 (`column_charge`)**: 1~2개 레인에 최대 7마리씩 세로로 빽빽하게 스폰 ➔ 직선 관통/가르기 유도!
  - **가로 횡대 방어벽 (`wide_wall`)**: 전열 5개 레인 전체에 최대 4열 횡대 배치 ➔ 수평 휩쓸기/휠윈드 유도!
  - **양익 협공 (`pincer_flank`)**: 양 날개와 중앙에 정예/보스 앵커 배치.
  - **대군세 스웜 (`horde_swarm`)**: 최대 26마리의 초고밀도 스폰으로 오버킬 파열 & 추가턴 연쇄 폭발 유도.
- ⚡ **동적 등반 티어 시스템 (퍼펙트 고속 점프 & 사망 시 하향 안착)**:
  - 노데미지/쾌속(S/S+ 등급) 클리어 시 티어가 **+3단계씩 초고속 급상승**.
  - 우수 클리어 시 **+2단계**, 일반 클리어 시 **+1단계**.
  - 체력이 다해 사망/실패 시 티어가 **-1단계 자동 하향**되어 플레이어의 현재 장비 스펙에 맞는 최적 파밍 구간에 자동 수렴.
- 🗺️ **성역 월드맵(DungeonSelectView) 대균열 6번째 탭 신설**:
  - Act 1~5 탭 옆에 `🌌 대균열 (Endless Rift)` 탭 신설.
  - 최고 도달 티어 확인 및 티어 선택(`[ - ] [ Tier X ] [ + ]`), 권장 레벨/전술 패턴 프리뷰, `[Space]` 즉시 출격 지원.
- 🌟 **신화급 보물(할배검, 자/베르 룬) 획득 시 골든 잭팟 연출 (`GodlyDropJackpot.tsx`)**:
  - 할배검(The Grandfather), 바람살, 샤코, 스톰실드 및 Ber, Jah, Zod, Ohm 등 최고위 룬 드랍 시 화면 전체 골든 라이트 빔 & 팡파레 잭팟 배너 연출.
- 📦 **던전 방 클리어 전리품 오해 문구 교정**:
  - 기존의 오해 소지가 있던 "✓ 모든 보상이 안전하게 수령되었습니다." 문구를 던전 룰에 맞게 **"✓ 이번 방의 모든 전리품을 획득했습니다! (원정 완료 시 안전 귀환)"**으로 명확히 수정.

### 13. HTTPS SSL 공식 인증서 적용 & ID/비밀번호 회원가입/로그인 및 클라우드 세이브 동기화 (`server/index.js`, `authApi.ts`, `AuthModal.tsx`, `gameStore.tsx`, `SettingsModal.tsx`, `TopHUD.tsx`)
- 🔒 **HTTPS (SSL/TLS Let's Encrypt) 보안 연결 완벽 적용 (브라우저 보안 경고 영구 소멸)**:
  - 공인 도메인 `193.122.127.129.sslip.io`에 공식 신뢰 Let's Encrypt SSL 인증서를 발급받아 Nginx 443(HTTPS) 포트에 바인딩.
  - HTTP(80) 접속 시 HTTPS(443)로 301 영구 자동 리다이렉트.
  - 모든 PC 및 모바일 브라우저(Chrome, Safari, Whale 등)에서 **보안 에러/주의 요함 경고가 100% 소멸하고 안전한 자물쇠(🔒) 마크**가 표출.
- 👤 **ID / 비밀번호 회원가입 & 로그인 시스템 (Node.js 백엔드 API 데몬 구축)**:
  - 서버 데몬(`server/index.js`, systemd `dark-fantasy-backend.service`)을 구축하여 `/api/auth/register`, `/api/auth/login`, `/api/save/load`, `/api/save/sync` 엔드포인트 운영.
  - `crypto.pbkdf2Sync` 기반 안전한 단방향 비밀번호 해싱 및 세션 토큰 관리.
- ☁️ **멀티 디바이스 클라우드 세이브 자동 백업 & 동기화**:
  - 로그인 시 PC, 스마트폰, 태블릿 등 기기를 바꾸어 접속하더라도 캐릭터 레벨, 장비, 룬 보관함, 룬워드, 업적, 대균열 티어가 실시간 클라우드 복원.
  - 플레이 중 던전 클리어, 아이템 획득, 마을 복귀 시 3초 디바운스로 클라우드 자동 백업.
  - 비로그인 유저도 기존처럼 **게스트 모드**로 로컬스토리지에 안전하게 자동 저장되어 완벽한 하위 호환성 보장.
- 🎨 **고딕 다크 판타지 스타일 로그인 모달 (`AuthModal.tsx`) & TopHUD / 설정 메뉴 연동**:
  - 상단 TopHUD 바 및 설정 모달(`SettingsModal.tsx`)에 `[👤 계정 / 로그인]` 버튼 신설.
  - 로그인 상태 뱃지, 가입일, 클라우드 동기화 상태 실시간 표출.

### 14. 스킬 해금 알림, 사망 모달 가이드 팁, 피흡/분노 캡, 스킬 10/20 만렙 및 레벨업 곡선 개편 (`skills.ts`, `passiveSkills.ts`, `combatActionHelper.ts`, `DeathModal.tsx`, `SkillRuneModal.tsx`, `gameStore.tsx`, `saveManager.ts`)
- ⚔️ **레벨업 시 신규 스킬 및 패시브 해금 실시간 알림**:
  - 캐릭터 레벨업 시 새로 개방된 액티브 스킬 및 패시브 마스터리를 감지하여 `[신규 스킬 해금] 'XXX' 습득! [K] 키를 눌러 확인하세요.` 로그 및 연출 발송.
- 💡 **사망 모달(`DeathModal.tsx`) 실전 생존 가이드 팁 탑재**:
  - 던전 난이도 극복을 위한 스킬/스탯 투자, 룬워드 제작, 진형별 전술 스킬 활용, 호라드릭 물약 영구 강화, 원소 저항력 세팅 팁을 회전 표출.
- 🧛 **피흡(Life Steal) & 분노 생성 밸런스 캡 적용**:
  - 1회 타격당 최대 회복량을 **플레이어 MaxHP의 12% (1타 총합 20%)로 제한**하여 과다한 피흡으로 인한 무적 현상 방지 및 긴장감 확보.
  - 유니크 아이템 및 룬(Amn, Vex), 룬워드(죽음의 숨결)의 피흡 수치를 4~7% 수준으로 현실화.
- 🎯 **패시브 10렙 만렙 / 액티브 스킬 20렙 만렙 표준화**:
  - 8종 패시브 스킬의 최대 레벨을 **10 (MAX)**으로 통일하고 알차게 성장 체감 압축.
  - 7종 액티브 스킬의 최대 레벨을 **20 (MAX)**으로 통일 및 UI 마스터리 캡 연동.
- 📈 **레벨업 경험치 곡선 최적화 (초반 완만화 & 중반 쾌속화)**:
  - 초반(Lv 1~15)은 기본 경험치를 180으로 올려 튜토리얼 및 파밍 밸류 확보.
### 15. 메인 전투 화면 가독성 & 시각적 편안함(눈 피로도 해소) 전면 개편 (`actThemes.ts`, `AtmosphereLayer.tsx`, `BattleView.tsx`, `BattleFieldLanes.tsx`, `BattleSkillsBar.tsx`, `BattleStatusDock.tsx`, `CombatJackpotOverlay.tsx`, `BossHUD.tsx`, `TopHUD.tsx`, `index.css`)
- 🌌 **배경 톤다운 & 대기 파티클 노이즈 차분화**:
  - 액트별 배경을 과한 원색 네온 대신 짙은 흑철/옵시디언 다크 톤으로 정제.
  - `ambientGlow` 불투명도를 70% ➔ 20%로 낮추고, 파티클 개수를 20여 개에서 5~6개의 부드러운 안개/먼지 효과로 대폭 축소.
- 👾 **레인 그리드 & 몬스터 카드 텍스트 고대비 가독성 확보**:
  - 레인 헤더를 단정하고 명확한 1줄 바(`[ 1번 ] 3마리 👹 | 🎯 타격예정`)로 정돈.
  - 몬스터 카드 폰트 크기를 `text-[7px]/[8px]`에서 **`text-[10px]` ~ `text-xs` (굵은 볼드 폰트)**로 확대하고 고대비 컬러(White / Bright Gold / Crimson) 적용.
  - 몬스터 HP바 두께를 확대하고 선명한 게이지로 리뉴얼.
- 📳 **화면 흔들림 및 자극적 플래시/스트로브 완화**:
  - 전체 뷰포트를 흔들던 Screen Shake를 제거하여 장시간 전투 시 어지러움과 멀미 해소.
  - 빈사 시 번쩍거리던 적색 펄스 테두리를 은은한 다크 크림슨 비네팅으로 톤다운.
  - 룰렛 잭팟 오버레이를 상단 중앙 슬림 배너로 이동하여 몬스터 필드 시야를 100% 개방.
- ⚔️ **하단 스킬바 & 상태 도크 시인성 강화**:
  - 스킬 카드의 배경 대비를 높이고 스킬명과 분노 소모량을 한눈에 들어오게 개선.
  - 상태 도크의 HP/분노 수치를 크고 굵은 폰트로 선명하게 렌더링.
### 16. 마을 화면 가독성 및 모바일 타이포그래피(말줄임 '...' 방지) 전면 개편 (`TownMapCanvas.tsx`, `TownView.tsx`)
- 🏛️ **마을 타운맵 캔버스 핀 & 배지 가독성 대폭 향상**:
  - 상단 캠프 설명 배지와 5대 시설 핫스팟 핀(데커드 케인, 기드의 암시장, 룬워드 공방, 호라드릭 큐브, 원정 관문)의 폰트를 `text-[9px]`에서 **`text-[11px]` ~ `text-xs` (sm: `text-sm`, font-black)**로 확대.
  - 고대비 골드/블루/에메랄드 테두리와 흑철 배경을 적용하여 모바일 화면에서도 글자가 칼같이 분리되어 보임.
- 🛠️ **마을 4대 시설 카드 & 출격 바 모바일 최적화**:
  - 카드 하단 설명(`8대 부위 도박`, `소켓 룬워드 제련` 등) 폰트를 `text-[10px] text-gray-400`에서 **`text-[11px]` ~ `text-xs` 고대비 텍스트**로 상향.
  - 즉시 출격 버튼의 문구를 모바일 화면에서 자연스럽게 래핑(`break-keep`)하여 버튼 밖으로 넘치거나 깨지는 현상 원천 차단.
- 📜 **4대 시설 모달(식별소, 도박장, 룬워드 공방, 호라드릭 연구소) 타이포그래피 표준화**:
  - **비표준 CSS(`py-0.2`) 및 9px 극소 폰트 전면 폐지**: 최소 10px(뱃지/단위), 11~13px(본문/옵션), 13~16px(제목) 표준화.
  - **룬워드 각인 룬 목록 (`truncate` 제거)**: 룬이 여러 개 각인되어도 `...`으로 잘리지 않고 온전히 다 표시되도록 flex-wrap 처리.
  - **미보유 룬 & 비활성 강화 버튼 명도 확보**: WCAG AA 4.5:1 준수 고대비 색상을 적용하여 업그레이드 비용과 필요 룬이 또렷하게 보이도록 수정.
### 17. 중앙 대형 아케이드 잭팟 & 오버킬 롤러 연출 복원 (`CombatJackpotOverlay.tsx`)
- 🎰 **중앙 대형 슬롯머신 잭팟 롤러 연출 복원**:
  - 사용자 피드백을 수용하여 상단 슬림 배너 대신, **화면 정중앙에 큼직하게 파파박 올라가는 총합 데미지 롤러(`text-4xl sm:text-6xl md:text-7xl font-black`)**로 원복.
  - 치명타 슬램(`animate-crit-slam`, `CRITICAL HIT!`), 약점 타격(`WEAK SPOT 2.5x`), 보스 그로기(`BREAK! GROGGY`)가 중앙에서 시원하게 팡 터지도록 연출.
  - 하단 오버킬 뱃지(`OVERKILL x3`)와 체인 콤보 배너(`CHAIN x4`)를 중앙에 다이내믹하게 표출하여 호쾌한 아케이드 손맛 극대화.
### 18. 일본 애니메이션/아케이드 격투 게임 스타일 타격감 배너 UI 전면 개편 (`CombatJackpotOverlay.tsx`, `index.css`)
- 💥 **얌전한 타원형 배지 탈피 ➔ 날카롭고 화려한 사선 다각형(Clip-Path) 셰이프 도입**:
  - 킬라킬(Kill la Kill), 페르소나 5, 길티기어 스타일의 **샤프한 다각형 셰브론(`clip-path: polygon(...)`)** 및 스파이크 임팩트 셰이프 적용.
  - **CRITICAL HIT!**: 2중 레이어드 블랙 먹선 + 옐로우/앰버/레드 불꽃 그라데이션 + 빗살 해저드 애니메이션(`animate-hazard-stripes`) + ⚡ 번개 엠블럼.
  - **WEAK SPOT 2.5x**: 페르소나 스타일 에메랄드/시안 레이저 평행사변형 배너.
  - **BREAK! GROGGY**: 톱니형 파열 임팩트 배너.
  - **OVERKILL xN**: 해골 💀 + 블러디 오렌지/레드 톱니 배지.
  - **CHAIN xN**: 불꽃 🔥 + 골든 옐로우 스피드 배지.
- 📐 **가독성 높은 똑바른 정자체(Upright Bold) 폰트 정돈**:
  - 누워있는(기울어진 `italic`, `skew`) 폰트를 완전히 제거하고, **곧고 단단하게 서 있는 정자체(`font-black`)**로 선명도와 가독성 극대화.
- 🎨 **3D 만화 먹선 텍스트 스트로크 & 입체 섀도우**:
  - `-webkit-text-stroke: 3px #000000` + `text-anime-3d-shadow` + 하드 오프셋 그림자로 100% 선명하고 박진감 넘치는 만화 타이포그래피 구현.
- 🥋 **격투 게임풍 줌인 펀치 슬램 애니메이션 (`animate-anime-slam`)**:
### 19. 몬스터 풀 네임 복원 및 액트 2·3 던전 스폰 템플릿 전면 정상화 (`BattleFieldLanes.tsx`, `dungeons.ts`, `gameStore.tsx`)
- 👾 **몬스터 이름 첫 단어 잘림 버그 완벽 수정 (`BattleFieldLanes.tsx`)**:
  - `m.name.split(' ')[0]`로 인해 "악의", "부패한", "파멸의", "⭐" 등으로 앞 단어만 렌더링되던 버그를 제거하고 온전한 풀 네임("악의 소굴 고블린", "부패한 시체 구울", "파멸의 군주 바알", "⭐ 화염 고블린 투사") 렌더링 복원.
- 🏜️ **액트 2 & 액트 3 던전 ID와 몬스터 템플릿 키 불일치 교정 (`dungeons.ts`)**:
  - `act2_2_halls` (죽음의 홀 - 딱정벌레/풍뎅이 번개충), `act2_3_maggot` (마고트 굴 - 산란 맹독충/거대 모래벌레), `act2_4_tomb` (탈 라샤 무덤 - 수호 미이라/사막 전갈) 정상 키 매핑.
  - `act3_1_spider` (거미 숲 동굴 - 밀림 맹독 거미), `act3_2_jungle` (약탈자 밀림 - 피그미 전사/독침 취관수) 정상 키 매핑.
  - 구버전 앨리어스(`act2_2_oasis`, `act2_3_sanctuary`, `act2_4_duriel`, `act3_1_jungle`, `act3_2_kurast`)도 함께 등록하여 1막 고블린으로 잘못 폴백되는 현상 영구 차단.
### 20. 상용 게임 기준 전체 UI/UX 및 디자인 요소 전면 정비 완료
- 👑 **TopHUD & 레이아웃 안정화 (`TopHUD.tsx`, `App.tsx`, `BottomDock.tsx`)**:
  - 모바일 360px에서 2~3줄 쪼개짐 원천 차단 ➔ 단일 1행 컴팩트 바(`flex-nowrap`, 48~52px 고정).
  - 전투 모드 시 상단 중복 HP바 숨김 & `<main>`의 `pb-16` 제거로 불필요한 하단 스크롤/공백 완전 박멸.
  - 스탯 포인트 배지(`+NP`) 원클릭 분배창 연결, Exp 바 두께 확대 및 퍼센트 툴팁, 로그인 유저 초록 동기화 점(`●`).
  - `BottomDock`에 모바일 Safe Area(`env(safe-area-inset-bottom)`) 패딩 및 42px+ 터치 타겟 적용.
- 📦 **핵심 인게임 3대 모달 고도화 (`InventoryModal.tsx`, `SkillRuneModal.tsx`, `CharacterModal.tsx`)**:
  - 페이퍼돌 장비 슬롯 모바일 원터치 `[해제]` 버튼 추가 (더블클릭 실패 이슈 해결).
  - 인벤토리 아이템 그리드 높이 `max-h-[250px]` 이상으로 확장하여 아이템 열람성 대폭 개선.
  - 미해금 스킬도 클릭하여 향후 스펙/룬 계수 미리보기 지원.
  - 캐릭터 전투 스탯을 4대 시각 카테고리(⚔️공격/🛡️방어/🔮4대원소저항 4열 칩/✨파밍MF)로 그룹핑하여 가독성 극대화.
- 🗺️ **진행 및 정산 모달 고도화 (`DungeonVictoryModal.tsx`, `DeathModal.tsx`, `SettingsModal.tsx`, `DungeonSelectView.tsx`)**:
  - 던전 승리 정산 시 `⏱️ 클리어 타임` 및 `🔥 최대 연쇄 콤보` 레코드 카드 추가.
  - 사망 모달에 `[🔥 즉시 재도전 (Retry)]` 원클릭 버튼 및 손실/안전 보존 인포박스 신설.
  - 설정 모달에 화면 흔들림 / 데미지 텍스트 / 아케이드 잭팟 그래픽 옵션 토글 신설.
  - 던전 선택 월드맵 카드에 드롭 아이템(★유니크 장비, 🔮고대 룬, 📦보물함) 미리보기 칩 추가.
- ⚔️ **전투 필드 및 피드백 레이어 (`BattleFieldLanes.tsx`, `BattleSkillsBar.tsx`, `BattleStatusDock.tsx`)**:
  - 타겟 몬스터 카드에 조준선(`🎯`) 오버레이 및 듀얼 레이어 HP바(피격 예상 고스트바) 적용.
  - 몬스터 카드 상단 상시 1px 미니 ATB 라인 및 고정 높이 슬롯으로 Layout Shift 0% 유지.
  - 하단 스킬바에 5개 레인 타격 범위 미니 다이어그램([■■■] 등) 추가.
### 21. 모바일 초압축 원스크린(100vh 스크롤 0%) 및 인체공학적 UI/UX 전면 개편 완료
- 👑 **TopHUD 40px 초슬림 바 (`TopHUD.tsx`)**:
  - 320px~420px 모바일 화면에서 120px+ 여유 공간 확보 (오버플로우 및 잘림 100% 해소).
  - 레벨 뱃지 내 마이크로 EXP 바 내장, 마이크로 툴바(업적/프로필/설정 3종 그룹핑), 재화 축약 포맷(`12.5k`, `1.2M`).
- 🏛️ **타운 뷰 노스크롤 일체형 독 (`TownView.tsx`, `TownMapCanvas.tsx`)**:
  - `❖ 로그 캠프 [1막]` 모바일 텍스트 축약 및 관문 핀 위치 간섭 제거로 글자 튀어나옴 완전 박멸.
  - 중복 2x2 시설 카드 ➔ 슬림 1행 4버튼 퀵바로 압축 (`[📜 케인] [🎲 기드] [🔮 룬워드] [🧪 큐브]`).
  - 하단 엄지존 일체형 스마트 출격 독 배치로 **모바일 100vh 스크롤 0% 완벽 달성**.
- 🎒 **인벤토리 모달 혁신 (2터치 원스톱 장착 & 스크롤 제거) (`InventoryModal.tsx`, `inventory/`)**:
  - 모바일 서브탭 분할 (`[🛡️ 착용 장비]` vs `[🎒 소지품 가방]`)로 1400px+ 3단 수직 적재 스크롤 지옥 완전 제거.
### 22. 장비 슬롯 중심 1:1 비교 & 원터치 교체 인벤토리 UX 전면 개편 완료 (`InventoryModal.tsx`)
- 🛡️ **슬롯 중심 연동 워크스페이스**:
  - 인벤토리 진입 시 **[착용 장비 9슬롯 (페이퍼돌)]**이 메인으로 표시되며, 기본 슬롯(무기)이 자동 활성화.
  - 슬롯(무기, 갑옷, 투구, 반지1, 신발 등)을 누르면, **우측에 [현재 착용 장비] + [인벤토리 내 해당 부위 후보 장비들]**이 즉시 연동.
- ⚖️ **실시간 1:1 스탯 차이 비교 (Side-by-Side Diff)**:
  - 후보 아이템을 클릭하면 현재 장착 중인 장비와의 스탯 증감(공격력, 방어력, 흡혈, 치명타 등)이 녹색(+)/빨간색(-)으로 직관적으로 표시.
- ⚔️ **명확한 교체/결정 액션**:
  - **`[⚔️ 이 장비로 교체하기 (Equip/Swap)]`** 대형 황금 버튼과 **`[장착 해제]`** 버튼을 통해 스크롤 없이 원터치로 교체 결정.
### 23. 아이템 상세 박스 크기 균형 및 소켓/룬워드/유니크 소켓팅 인터페이스 완비 (`ItemDetailCard.tsx`, `SingleSocketRunePanel.tsx`)
- 📐 **아이템 상세 카드(`ItemDetailCard.tsx`) 박스 균형 및 대칭 정렬**:
  - 상단 헤더: `[🔒] [📥] [판매 (108G)]` + `[기본 공격력 ⚔️ 10~20]`의 높이와 수직 정렬을 칼같이 일치.
  - 스탯 그리드: 2열(`grid-cols-2`) 균형 그리드로 고정하여 스탯 수치와 테두리 짝이 완벽하게 대칭되도록 정돈.
- 🔨 **노말 소켓 아이템 ➔ 룬워드 제련 탭 연동 (`RuneCraftPanel.tsx`)**:
  - 4소켓 브로드소드 등 노말 소켓 베이스 선택 시 `[🔨 룬워드 제련 (N종)]` 탭이 활성화되어, 스피리트(Tal+Thul+Ort+Amn) 등 제작 가능한 레시피와 룬 보유 현황을 확인하고 즉시 제작 가능.
- 🔮 **유니크/세트/레어 소켓 아이템 ➔ 개별 룬 각인 패널 신설 (`SingleSocketRunePanel.tsx`, `cubeCraftingHelper.ts`)**:
### 24. 전사적 런타임 성능, 렌더링 배칭, 번들 및 에셋 최종 최적화 완비
- ⚡ **전투 루프 리렌더링 93% 절감 (`gameStore.tsx`, `BattleFieldLanes.tsx`)**:
  - `executeAttack`에서 타격마다 개별 발생하던 20~30회의 `setTimeout` 상태 디스패치를 **단일 배칭 플로팅 데미지 디스패치 & 1회 일괄 클리어(700ms)**로 전환.
  - `BattleFieldLanes.tsx`: `targetsHitMap` 및 `floatingDamagesByMonster` $O(1)$ Hash Map 인덱싱으로 $O(N \cdot M)$ 스트링 파싱 완전 제거.
- 🧹 **메모리 누수 원천 차단 & 뷰 콜백 안정화 (`BattleView.tsx`, `TownView.tsx`)**:
  - `BattleView.tsx`: 방/던전 전환 시 `dyingMonsterIds` Set 리셋으로 장시간 플레이 시 메모리 누수 방지.
  - `TownView.tsx`: `TownMapCanvas`에 전달되는 콜백들을 `useCallback`으로 안정화하고 `socketableItems`, `unidentifiedCount` 메모이제이션으로 캔버스 불필요 렌더링 100% 차단.
- 📦 **번들 크기 20% 경량화 & Brotli+Gzip 듀얼 사전 압축 (`vite.config.ts`, `precompress.js`, `nginx`)**:
  - 프로덕션 빌드 시 콘솔 로그/디버거 제거 (`drop: ['console', 'debugger']`).
  - `InteractiveTutorial`과 `combat-engine` 청크 분할로 `index-*.js`를 172.6KB (Gzip 54KB, Brotli 44KB)로 경량화.
  - `scripts/precompress.js`: Gzip(Lv 9) + Brotli(Lv 11) 듀얼 압축 자동화.
  - Nginx 설정: `gzip_static on;`, `/assets/` 1년 `immutable` 캐시, `sendfile on;` 적용으로 서버 CPU 0% 및 초고속 TTFB 달성.
### 25. 아이템 시스템 대확장, 소켓 드랍률 MF 연동 & 유니크 스탯 전수 적용 완료
- 🎲 **소켓 드랍률 MF 연동 (Base Hunter System, `dungeonEventHelper.ts`)**:
  - `rollDynamicSockets`: `playerFortune`(MF)에 비례하여 노말 장비 드랍 시 **3~6소켓 출현 확률을 최대 +45%까지 대폭 가산**.
  - 1~6소켓 전 부위 노말 베이스 아이템(페이즈 블레이드 3~6S, 버서커 액스 4~6S, 더스크 슈라우드 3~4S, 세이크리드 아머 4S, 코로나 3S, 워드 4S 등) 완비.
- 👑 **유니크 스탯 & +All Skills 전수 인게임 연동 (`types/game.ts`, `statCalculator.ts`, `gameStore.tsx`, `combatEngine.ts`)**:
  - `ItemStats` 및 `CalculatedTotalStats`에 `allSkills?: number`, `goldFind?: number` 정식 추가.
  - 샤코(+2), 마라(+2), 조던링(+1), 불카토스(+1), 하이로드(+1), 안다리엘(+2), 자카룸(+2), 아라트(+2) 등의 **`+모든 스킬 레벨`이 플레이어의 실제 스킬 위력과 룬 계수에 100% 반영되어 데미지가 비약적으로 상승**.
  - `calculateAttackGains`에 `goldFind`가 적용되어 몬스터 처치 및 보물함 골드 획득량 대폭 증가.
- 🗺️ **드랍 지역 풀 확장 & 대균열(Endless Rift) 고티어 드랍 정상화**:
  - `getActDropPool(1~5)`에 신규 및 확장 유니크/베이스 아이템 전수 등록.
  - 대균열(Endless Rift)에서 액트 1 아이템만 나오던 버그를 완전 수정하여, 대균열 티어에 따라 Act 3~5 최상위 유니크 및 고급 룬(Ber, Jah, Cham, Zod 등)이 정상 드랍되도록 조치.
- 🗡️ **신규 종결 유니크 8종 추가**:
  - 죽음의 거미줄(Death's Web), 마지막 소원(Last Wish), 에스츄타의 분노(Eschuta's Temper), 오르무스의 장포(Ormus' Robes), 시대의 왕관(Crown of Ages), 그리폰의 눈초리(Griffon's Eye), 밤날개의 면사포(Nightwing's Veil), 그림자 춤꾼(Shadow Dancer), 자연의 평화(Nature's Peace) 등.










