# Dark Fantasy Turn-Based Hack & Slash RPG

## Game Design Document v0.3

> 턴제의 판단과 핵앤슬래시의 대량 처치감을 결합한 PC 웹 브라우저용 다크 판타지 파밍 RPG 기획 문서.

---

# 0. 문서 범위

이 문서는 현재까지 확정하거나 잠정 결정한 게임 설정과 시스템 설계를 보존한다.

- 구현 코드와 기술 Stack은 포함하지 않는다.
- 수치는 첫 밸런스 시뮬레이션을 위한 잠정값이다.
- 확정되지 않은 내용은 문서 마지막의 미결정 항목에 기록한다.

## 결정 상태

| 표기 | 의미 |
|---|---|
| 확정 | 프로토타입의 기준으로 사용 |
| 잠정 | 실제 전투 검증 후 조정 가능 |
| 보류 | 초기 범위에서 제외 |

---

# 1. 게임 개요

## 장르

Dark Fantasy Turn-Based Hack & Slash Loot RPG

## 플랫폼

- PC 데스크톱 웹 브라우저
- 마우스 중심 조작
- 모바일 UI는 초기 지원 대상이 아님

## 핵심 장르 조합

- Diablo 2 스타일 반복 파밍
- Dragon Quest 스타일 명확한 명령 선택과 턴 판독성
- 클래식 한국 PC 웹게임 스타일의 고밀도 UI
- Room Graph 기반 랜덤 던전
- 장비·Rune·Unique를 통한 빌드 제작

Dragon Quest의 영향은 밝은 색감이나 SD 캐릭터가 아니라 전투 명령의 명확성, 턴 단위 판단, 정보 전달에 적용한다. 전체 미술 방향은 어두운 중세 다크 판타지다.

## 핵심 문장

> 턴마다 전략적인 선택을 하지만, 성장한 순간 한 번의 공격으로 수십 마리의 적을 쓸어버리는 다크 판타지 파밍 RPG.

---

# 2. 핵심 재미

## 2.1 공격 전에는 판단

- 어느 Lane을 공격할지 결정한다.
- 약한 적을 Overkill의 시작점으로 이용한다.
- 방어형 몬스터와 Elite가 연쇄 경로를 막는다.
- 적의 다음 행동과 Mage의 Casting 완료 시점을 비교한다.
- 공격 전에 예상 경로와 처치 수를 확인할 수 있다.

## 2.2 공격 후에는 폭발

- 한 번의 명령이 빠른 연속 처치로 이어진다.
- 피해 숫자, 타격음, 사망 연출, Chain Count가 단계적으로 커진다.
- 성장한 빌드는 일반 몬스터 30~100마리를 한 행동으로 제거할 수 있다.

## 2.3 전투 밖에서는 빌드 실험

- Level은 기본 능력과 콘텐츠 접근을 제공한다.
- 장비는 기본 위력과 방어력을 결정한다.
- Affix는 전투 효율을 최적화한다.
- Rune은 기존 Skill의 성질을 조정한다.
- Unique와 Legendary는 전투 규칙을 바꾼다.

---

# 3. 비목표

초기 게임은 다음 방향을 목표로 하지 않는다.

- 모바일 가챠 RPG
- 캐릭터 수집형 Lobby
- 자동 전투
- 실시간 액션 조작
- 과도한 Event Banner
- PvP
- 실시간 거래소
- 여러 캐릭터가 동시에 싸우는 Party 전투

Marketplace는 UI 확장 후보지만 초기 기능에서는 제외한다.

---

# 4. 게임 플레이 루프

~~~text
마을 방문
→ 장비 비교 및 교체
→ Rune 장착
→ Skill 구성
→ 추천 Dungeon과 주요 Drop 확인
→ Dungeon 진입
→ Room 선택
→ 전투
→ Loot 획득
→ 다음 Room 또는 귀환
→ 강화 및 Build 변경
→ 다시 Dungeon 진입
~~~

## 목표 진행 시간

| 구간 | 목표 |
|---|---:|
| 마을 진입 후 같은 Dungeon 재입장 | 10초 이내 |
| 일반 Room | 플레이어 결정 3~8회 |
| Elite Room | 플레이어 결정 6~12회 |
| Boss | 의미 있는 플레이어 결정 10~15회 |
| 초기 Dungeon 1회 | 8~12분 |
| 파밍 Build의 동일 Dungeon | 3~6분 |

---

# 5. 주요 화면

1. Town
2. Dungeon Select
3. Dungeon Exploration
4. Battle
5. Character
6. Inventory
7. Skill
8. Rune Management
9. Crafting
10. Storage

---

# 6. 전체 UI 방향

## 목표 스타일

- PC 브라우저에 최적화된 높은 정보 밀도
- 어두운 철, 낡은 목재, 황동과 절제된 금색 Frame
- 중앙에는 환경 Illustration
- 좌우에는 작은 Icon과 Text 중심 기능 Panel
- 캐릭터보다 파밍 준비와 정보 확인이 중심
- 명확한 계층과 작은 기능 Button

## 피해야 할 스타일

- 모바일 수집형 RPG Lobby
- 화면을 차지하는 대형 캐릭터 일러스트
- 큰 원형 재화 Button
- 과도한 Glow
- 반복되는 동일한 둥근 Card
- 출석·Event Banner
- Emoji를 실제 게임 Icon으로 사용하는 구성
- 기능보다 장식이 우선되는 화면

---

# 7. Town

## 역할

Town은 전투 공간이 아니라 파밍 준비와 빌드 변경을 위한 Hub다.

## 기본 Layout

~~~text
┌─────────────────────────────────────────────────────┐
│ Character / Level / Gold / Rune Currency / Notice  │
├────────────┬───────────────────────┬────────────────┤
│ Character  │ Town Illustration     │ Recommended    │
│ Equipment  │ Blacksmith            │ Dungeon        │
│ Quest      │ Rune Forge            │ Monster        │
│ Summary    │ Storage / Shop / Gate │ Expected Loot  │
├────────────┴───────────────────────┴────────────────┤
│ Character · Inventory · Skill · Rune · Craft · Gate│
└─────────────────────────────────────────────────────┘
~~~

## 주요 시설

### Blacksmith

- 장비 강화
- 옵션 변경
- Socket 추가

### Rune Forge

- Rune 합성
- Rune 장착
- Rune 제거

### Storage

- 장비 보관
- Rune 보관
- 재료 보관

### Item Shop

- 기본 장비 구매
- 불필요한 Loot 판매
- CHA 기반 가격 보정

### Dungeon Gate

- Dungeon Select 이동
- 최근 Dungeon 빠른 재입장

## Town 완료 기준

- 장비 비교까지 최대 2 Click
- Rune 화면까지 1 Click
- 추천 Dungeon 진입까지 1 Click
- 우측에서 권장 Level, Monster, Unique, Rune Drop 확인 가능

---

# 8. Dungeon Select

각 Dungeon은 다음 정보를 표시한다.

- 이름과 Theme
- 권장 Level
- Difficulty
- 주요 Monster
- 예상 Formation
- 주요 Element와 Resistance
- 일반 Drop
- Unique Drop
- Rune Drop
- 최근 최고 Clear Time

Dungeon마다 Monster와 Drop Pool이 달라 원하는 Build의 목표 파밍이 가능해야 한다.

---

# 9. Dungeon 구조

## Room Graph

한 Dungeon Run은 분기형 Room Graph로 구성한다.

~~~text
Entrance

   □
   |
□──□──□
   |   |
   □   □
       |
      Boss
~~~

## 잠정 구성

- 전체 Room 8~12개
- Boss까지 필수 경로 5~7개
- 선택 Branch 2~4개
- 동일 Room Type 3회 연속 금지
- Boss Room은 마지막 Depth
- Treasure 또는 Rune Room 최소 1개 보장

## Room Type

| Room | 내용 | 주요 보상 |
|---|---|---|
| Normal | 일반 Formation | Gold, Material, 장비 |
| Elite | Elite + Formation | Rare, Rune |
| Treasure | 비전투 또는 짧은 위험 | 장비, 재료 |
| Rune | Rune 선택 또는 전투 | Rune |
| Shrine | Run 한정 Buff | Build 강화 |
| Curse | 위험 선택 | 보상 배율 |
| Boss | 고유 Pattern | Unique, Legendary 가능 |

---

# 10. 초기 Dungeon

## 10.1 Goblin Cave

### Theme

절벽 아래로 이어진 고블린 채굴 동굴과 조잡한 방어 요새.

### Monster

- Goblin Scout
- Goblin Warrior
- Goblin Shaman
- Orc Enforcer

### 전투 특징

- 낮은 HP의 다수 Goblin
- Guarded Formation
- 방패 전열과 약한 Backline
- Overkill 경로와 Chain 재미 학습

### 주요 Drop

- Wind Rune
- Goblin Blade
- Raider Leather

## 10.2 Forgotten Crypt

### Theme

봉인된 왕실 묘지와 지하 납골당.

### Monster

- Skeleton Warrior
- Zombie
- Bone Mage
- Grave Knight

### 전투 특징

- Dense Wave
- 방패와 Armor
- 부활
- Target 우선순위와 Chain Stopper 학습

### 주요 Drop

- Bone Rune
- Ancient Bone Fragment
- Bone King Shield

## 10.3 Inferno Mine

### Theme

마력이 폭주한 용암 광산과 붕괴 직전의 제련소.

### Monster

- Ember Fiend
- Lava Spider
- Fire Golem

### 전투 특징

- Fire Hazard
- 원거리 Casting 방해
- 높은 Fire Resistance
- 위치와 Casting Timing 검증

### 주요 Drop

- Flame Rune
- Molten Hammer
- Dragon Heart Fragment

---

# 11. 전투 전장

## 11.1 기본 구조

전장은 5개의 Lane으로 구성한다.

~~~text
후방

Lane 1  Lane 2  Lane 3  Lane 4  Lane 5
[ 5 ]   [ 5 ]   [ 5 ]   [ 5 ]   [ 5 ]
[ 4 ]   [ 4 ]   [ 4 ]   [ 4 ]   [ 4 ]
[ 3 ]   [ 3 ]   [ 3 ]   [ 3 ]   [ 3 ]
[ 2 ]   [ 2 ]   [ 2 ]   [ 2 ]   [ 2 ]
[ 1 ]   [ 1 ]   [ 1 ]   [ 1 ]   [ 1 ]
[ 0 ]   [ 0 ]   [ 0 ]   [ 0 ]   [ 0 ]

              Player
전방
~~~

- 각 Lane은 깊이 순서가 있는 Monster Queue다.
- Depth 0이 Player와 가장 가까운 적이다.
- 화면에는 Lane마다 앞의 6마리를 표시한다.
- 일곱 번째 이후 적은 Reserve 수와 실루엣으로 표시한다.
- 한 전투에는 논리적으로 100마리 이상 등장할 수 있다.

## 11.2 위치 갱신

- 하나의 Skill이 처리되는 동안 적 위치를 압축하지 않는다.
- 해당 Skill의 Damage, Death, Trigger가 모두 끝난 뒤 사망자를 제거한다.
- 이후 Lane을 전방으로 압축한다.
- 따라서 폭발 도중 적이 당겨져 같은 공격에 중복 피격되지 않는다.

## 11.3 Target

- Warrior 기본 근접 공격은 현재 Lane의 가장 가까운 적을 공격한다.
- Player는 Lane을 이동할 수 있으며 이동에도 행동 시간이 필요하다.
- Mage는 화면에 보이는 Cell을 지정한다.
- Cell Target Spell은 Casting 완료 시점에 해당 Cell을 차지한 적을 공격한다.
- 공격 전 경로, 예상 처치 수, Chain을 막을 적을 표시한다.

## 11.4 다수 몬스터 행동

- 일반 몬스터는 개별 행동 Gauge 대신 Formation 단위 Horde Gauge를 공유한다.
- Horde 행동 시 전열의 일부 몬스터가 빠르게 행동한다.
- Elite와 Boss만 독립 Gauge를 갖는다.
- 이 방식으로 적이 30마리 이상이어도 대기 시간이 길어지지 않게 한다.

---

# 12. ATB

## 방식

Player의 입력을 기다릴 때 시간이 멈추는 Wait ATB를 사용한다.

~~~text
행동 선택
→ 공격 또는 Casting 시작
→ Timeline 진행
→ 적 행동
→ Skill 발동
→ 다음 행동 선택
~~~

## 속도 구분

| 속성 | 역할 |
|---|---|
| Action Speed | 이동, 방어, Item 등 공통 행동 |
| Attack Speed | Weapon Skill의 행동 회복 |
| Cast Speed | Spell 발동까지 필요한 Casting 시간 |

## 기본 공식

~~~text
Effective Recovery =
Base Recovery / (1 + Action Speed Bonus)

Weapon Recovery =
Base Weapon Recovery / (1 + Attack Speed Bonus)

Effective Cast Time =
Base Cast Time / (1 + Cast Speed Bonus)
~~~

한 Skill에 Attack Speed와 Action Speed를 중복 적용하지 않는다.

---

# 13. Overkill

## 목적

턴제 전투에서도 한 행동으로 다수의 적을 제거하는 핵앤슬래시 감각을 제공한다.

## 기본 공식

~~~text
잔여 피해 =
최대(0, 최종 피해 - Target 현재 HP)

다음 Target 피해 =
잔여 피해 × Overkill Efficiency
~~~

방어력이 다른 적을 통과할 때는 각 Target을 처치하는 데 사용된 Raw Damage를 차감한 뒤 잔여 Damage Budget을 전달한다.

## 예시

~~~text
공격 Raw Damage: 620
Goblin HP: 50
Overkill Efficiency: 100%

결과:
12마리 처치
13번째 Goblin에게 20 Damage
~~~

## 기본 규칙

- 전이 대상은 무작위가 아니라 Skill Route로 결정한다.
- 공격 전에 예상 Route를 표시한다.
- 기본 Chain Count는 피해를 자동으로 증가시키지 않는다.
- Chain당 피해 증가는 Skill, Rune, Item 효과로만 제공한다.
- Critical은 적마다 다시 굴리지 않고 하나의 Damage Payload 단위로 판정한다.
- 같은 Payload는 같은 적을 두 번 공격하지 않는다.
- 일반 Overkill Efficiency 상한은 잠정 125%다.
- 상한 해제는 특정 Legendary 효과에만 허용한다.

## Route

| Route | 처리 |
|---|---|
| Line | 같은 Lane의 다음 Depth로 진행 |
| Adjacent Branch | Payload 일부를 좌우 Lane으로 분기 |
| Nearest Chain | 가장 가까운 Target으로 이동 |
| Radius Convert | 잔여 피해를 주변 폭발로 변환 |
| None | 잔여 피해 폐기 |

## Death Trigger

- Death Explosion은 별도 명시가 없으면 같은 Explosion을 다시 발생시키지 않는다.
- 반복 가능한 Trigger는 세대가 늘어날수록 위력이 감소한다.
- Shadow Copy나 복제 공격은 자신을 다시 복제하지 않는다.

## Chain 연출

- Chain Count는 하나의 Player Action으로 사망한 적의 수다.
- x2부터 표시한다.
- x10, x25, x50, x100에서 명칭과 Sound 단계가 변한다.
- 초기 처치는 순차적으로 보여주고 이후 빠르게 가속한다.
- x100 연출도 1.5초를 넘지 않는 것을 목표로 한다.
- 피해 숫자가 12개를 넘으면 일부를 합산 표시한다.

---

# 14. 피해 공식

## 기본 공격력

~~~text
Physical Power =
Weapon Damage + STR × 2

Spell Power =
Focus Damage + INT × 2
~~~

## Skill 피해

~~~text
Raw Damage =
Power
× Skill Coefficient
× (1 + Increased Damage 합계)
× More Damage 배율
~~~

- Increased Damage는 합산 후 한 번 곱한다.
- More Damage는 출처별로 곱한다.
- More Damage는 Skill과 고유 효과 위주로 제한한다.

## 방어

~~~text
K = 100 + 공격자 Level × 10

Damage Multiplier =
K / (K + Target Defense)

Final Damage =
Raw Damage × Damage Multiplier
~~~

Physical은 Armor, Element는 해당 Resistance를 사용한다.

## Critical

~~~text
Base Critical Chance = 5%
Base Critical Damage = 150%
~~~

---

# 15. Character Stat

| Stat | 전투 효과 | 비전투 효과 |
|---|---|---|
| STR | Physical Power | 무기·중장비 요구조건 |
| DEX | Attack Speed, Critical, Evasion | 일부 함정 대응 |
| CON | HP, Armor, Status Resistance | 없음 |
| INT | Spell Power, Max Mana | 마법 장비 요구조건 |
| WIS | Magic Resistance, Cast Stability, Rune Scaling | Rune 선택지 |
| CHA | 직접 전투 효과 없음 | Fortune, 상점, NPC Event |

## CHA와 Fortune

- CHA는 파밍형 Stat이다.
- Fortune은 장비 Drop 횟수보다 Rare 이상 Rarity Weight에 영향을 준다.
- Dungeon 입장 시 Fortune을 고정한다.
- Dungeon 안에서 장비를 바꿔도 해당 Run의 Fortune은 변하지 않는다.
- 상점 할인은 30%를 넘지 않는다.

---

# 16. Warrior

## 역할

- 근거리 위험 감수
- 높은 HP와 Armor
- 지속 전투
- Line Overkill
- Rage를 모은 뒤 물리 연쇄 폭발

## 주요 Stat

- STR
- CON
- DEX

## Rage

- 범위: 0~100
- 공격 시 획득
- 적 타격과 처치 시 추가 획득
- 피해를 받으면 획득
- 강력한 광역·처형 Skill에 사용
- Room 사이에는 일부 감소

## 초기 Skill

### Slash

- 기본 근접 공격
- 선택 Lane을 앞에서 뒤로 진행
- Overkill Efficiency 100%

### Execute

- 높은 단일 피해
- 낮은 HP Target에게 추가 피해
- 높은 Overkill Efficiency
- Rage 소비

### Cleaving Sweep

- 주 Lane 공격
- 잔여 Payload 일부를 좌우 Lane으로 분기
- 밀집 Formation에 강함

### Whirlwind

- Player Lane과 좌우 Lane 공격
- 여러 개의 독립 Payload 생성
- Rage를 크게 소비
- 전사 Build의 대표적인 대량 처치 Skill

## 전투 흐름

~~~text
접근 및 Rage 축적
→ 약한 Target을 시작점으로 선택
→ Overkill 경로 확보
→ Execute 또는 Whirlwind
→ 대규모 연쇄 처치
~~~

---

# 17. Mage

## 역할

- 원거리 Cell Target
- Casting Timeline 계산
- 원소별 Overkill 변환
- 낮은 생존력과 높은 폭발력

## 주요 Stat

- INT
- WIS
- DEX

## Mana

- 강력한 Spell에 사용
- 기본 Spell과 Item, Rune으로 회복
- Casting과 Mana를 동시에 관리

## Casting Queue

- 기본적으로 하나의 Spell만 준비할 수 있다.
- Spell 선택 후 Timeline에 Casting 완료 시점이 표시된다.
- Casting 중 강한 피해나 상태이상으로 지연 또는 취소될 수 있다.
- 추가 Queue는 Rune 또는 Legendary Build로 확장한다.

## 원소별 Overkill

| 원소 | 잔여 피해 처리 |
|---|---|
| Fire | 주변 Explosion으로 변환 |
| Lightning | 가까운 적에게 Chain |
| Frost | Shatter 피해와 ATB 지연 |
| Arcane | 높은 직접 피해, 기본 전이 없음 |

## 초기 Skill

### Arcane Bolt

- 즉시 발동
- Mana를 쓰지 않는 기본 Spell
- 직접 피해 중심

### Fireball

- 지정 Cell에 Casting
- 직접 피해와 3×3 폭발
- 처치 시 잔여 피해가 Explosion을 강화

### Chain Lightning

- 가까운 적에게 순차 이동
- 기본 Jump 수 제한
- Rune과 Item으로 Jump 확장

### Frost Nova

- 전방 다수 적에게 Slow
- Frozen Target의 Shatter 준비
- 적의 행동 순서를 늦추는 제어 Skill

---

# 18. Monster

Monster는 다음 조합으로 정의한다.

~~~text
Monster Type
+ Rank
+ Level
+ Formation
+ Behavior
+ Elite Affix
~~~

## 초기 Monster 역할

| Monster | 역할 |
|---|---|
| Goblin | 낮은 HP, Overkill 학습 |
| Skeleton | Armor와 전열 방어 |
| Zombie | 느린 Dense Wave |
| Orc | 높은 Effective HP의 Chain Stopper |
| Ember Fiend | 원거리 Fire 공격 |

## Rank

| Rank | 역할 |
|---|---|
| Normal | 다수 등장, Horde 행동 |
| Champion | 강화된 일반 적 |
| Elite | 별도 행동과 특수 능력 |
| Boss | 독립 Pattern과 고유 Drop |

Elite는 Overkill 면역이 아니라 높은 Effective HP와 능력으로 Chain을 자연스럽게 막는다.

---

# 19. Formation

## Swarm

### 예시

- Bat
- Small Demon

### 특징

- 산개
- 빠른 행동
- Splash 피해에 강함
- 여러 전열 적이 동시에 행동할 수 있음

## Dense Wave

### 예시

- Zombie

### 특징

- 밀집
- 느린 행동
- 광역과 Branch 공격에 취약
- Overkill Chain을 길게 만들기 좋음

## Guarded Formation

### 예시

- Goblin Shield Wall
- Skeleton Guard

### 특징

- 전열 Armor 증가
- 전열이 살아 있는 동안 Backline 보호
- 전열을 뚫으면 Line Overkill이 정상적으로 이어짐

## Elite Anchor

- Elite가 위치한 Lane은 Chain Stop 위험 표시
- 별도 면역 대신 높은 HP와 Defense 사용
- Elite 위치가 공격 Lane 선택에 영향을 줌

---

# 20. 성장

## 성장 역할 분리

~~~text
Level
→ 기본 생존과 콘텐츠 접근

Weapon / Focus
→ 기본 Damage Budget

Rare Affix
→ 수치 최적화

Rune
→ Skill 조정

Unique / Legendary
→ 새로운 Overkill Route와 Build
~~~

## Chain 성장 목표

| 구간 | 일반 몬스터 Chain 목표 |
|---|---:|
| Level 1~10 | 1~3 |
| Level 11~25 | 3~8 |
| 초기 완성 Build | 10~15 |
| Level 26~40 | 10~30 |
| Level 41~50 최적화 Build | 30~100 |

Level만으로 달성하지 않고 장비와 Skill 조합을 포함한다.

## 잠정 Monster 성장

~~~text
Monster HP =
Base HP × 1.055^(Level - 1)

Monster Damage =
Base Damage × 1.045^(Level - 1)
~~~

정식 Level 1~50 Table은 전투 시뮬레이션 이후 확정한다.

---

# 21. Item

## Rarity

| 등급 | 옵션 | 역할 |
|---|---:|---|
| Normal | 0 | Base Item |
| Magic | 1~2 | 단일 방향 강화 |
| Rare | 3~5 | 수치 Build 완성 |
| Unique | 고정 옵션 + 고유 효과 | 특정 Theme |
| Legendary | 규칙 변경 효과 | Build Anchor |

Unique와 Legendary는 단순한 상하위 관계가 아니다. Legendary는 규칙 변화가 크지만 모든 Rare나 Unique보다 기본 능력치가 높지는 않다.

## 공격 Affix

- Flat Weapon Damage
- Physical Damage
- Critical Chance
- Critical Damage
- Attack Speed
- Overkill Efficiency
- Cleave Branch Ratio
- Chain Count

## 마법 Affix

- Spell Damage
- Cast Speed
- Element Damage
- Explosion Radius
- Chain Jump
- Burn Duration
- Shatter Damage

## 방어 Affix

- HP
- Armor
- Element Resistance
- Block
- Life Steal
- Cast Stability

## 파밍 Affix

- Fortune
- Gold Find
- Material Find
- Movement Speed

## Unique 예시: Blood Cleaver

~~~text
Slash Damage +25%
Life Steal +8%

Slash의 잔여 Payload가
좌우 Lane으로 40%씩 분기된다.
~~~

## Legendary 예시: Ember Heart

~~~text
Fire Damage +20%

Fire Explosion으로 적을 처치하면
감소된 위력의 추가 Explosion이 발생한다.
세대가 늘어날수록 위력이 감소한다.
~~~

---

# 22. Rune

## 역할

- 일반 Rune은 능력치를 조정한다.
- Greater Rune은 수치와 추가 조건을 제공한다.
- Legendary Rune은 Skill 행동을 변경한다.

## 초기 Rune

| Rune | 일반 효과 | 확장 방향 |
|---|---|---|
| Ruby | STR | Execute 분기 |
| Sapphire | INT | 추가 Casting Queue |
| Emerald | DEX | Chain 시 Recovery 환급 |
| Iron | Armor | Block Counter |
| Vital | HP | Overheal Barrier |
| Flame | Fire Damage | Fire Death Explosion |
| Frost | Slow | Frozen Shatter 분기 |
| Shadow | Life Steal | Kill 시 Shadow Copy |
| Wind | Attack Speed | Chain 구간 추가 공격 |
| Swift | Movement Speed | 이동 후 즉시 공격 |
| Fortune | Fortune | 보상 Rarity 보정 |

Rune으로 생성된 복제 공격은 같은 복제 효과를 다시 발생시키지 않는다.

---

# 23. Loot

## Drop 구조

대량 처치에서 Item이 과도하게 쏟아지지 않도록 Drop 여부와 Rarity를 분리한다.

~~~text
1. Equipment Drop 여부
2. Rarity Weight
3. Base Item
4. Affix
5. Socket
~~~

## 잠정 Drop 횟수

| 적 | Equipment Roll |
|---|---:|
| Normal | 낮은 개별 확률 |
| Champion | Normal보다 높은 확률 |
| Elite | 복수 Roll 보장 |
| Boss | 복수 Roll과 Rare 이상 보장 |

## Loot 표시

- Room 종료 시 Loot Tray에 정리한다.
- Rare 이상만 전투 Field에 Beam 또는 명칭 표시
- Item 비교에서 장착 전후 핵심 수치 표시
- 규칙 변경 효과는 일반 Affix와 분리해서 설명

---

# 24. Movement Speed와 파밍 효율

~~~text
Dungeon Clear Time =
Combat Time
+ Base Travel Time / (1 + Movement Speed Bonus)
~~~

Movement Speed는 전투 Animation이나 Player의 판단 시간을 줄이지 않는다.

~~~text
시간당 기대 가치 =
Run당 기대 Loot 가치 / 평균 Clear Time
~~~

강한 Boss Build와 빠른 일반 파밍 Build는 서로 다를 수 있다.

---

# 25. Battle UI

## Layout

~~~text
┌─────────────────────────────────────────────────────┐
│ Dungeon / Room / Formation / Remaining / Speed     │
├───────────┬────────────────────────┬────────────────┤
│ Character │ 5 Lane × 6 Visible     │ ATB Timeline   │
│ HP/MP     │ Monster Battlefield    │ Enemy Intent   │
│ Stats     │ Chain and VFX          │ Preview Result │
├───────────┴────────────────────────┴────────────────┤
│ Skill Command / Resource / Confirm / Cancel        │
├─────────────────────────────────────────────────────┤
│ Collapsible Battle Log                             │
└─────────────────────────────────────────────────────┘
~~~

## 필수 정보

- Player HP
- Mana 또는 Rage
- 다음 행동 순서
- Enemy Intent
- 선택 Skill 범위
- Overkill Route
- 예상 처치 수
- Chain Stop 위험 Target
- 남은 적 수
- Chain Count

## 전투 정보 원칙

- Preview와 실제 결과가 일치해야 한다.
- 전투 Log는 보조 정보이며 핵심 결과는 Field에서 보여준다.
- Damage Number가 Target과 Enemy Intent를 가리지 않아야 한다.
- 몬스터가 많아도 행동과 사망 Animation을 빠르게 묶는다.

---

# 26. 초기 프로토타입 검증 범위

## 전투 핵심 검증

- Warrior
- Goblin 30마리
- 5 Lane
- Slash
- Execute
- Whirlwind
- Rage
- Overkill
- Chain Kill
- 공격 경로 Preview

## 검증 질문

- 공격 전에 어느 Lane이 유리한지 판단할 수 있는가?
- 약한 적을 시작점으로 선택하는 것이 결과를 바꾸는가?
- 한 번의 입력으로 10마리가 죽을 때 타격감이 있는가?
- 수치가 성장하면 30마리 이상 처치로 자연스럽게 확장되는가?
- Elite가 높은 Effective HP로 Chain을 막는가?
- 적이 많아져도 행동 대기 시간이 길어지지 않는가?
- Preview를 신뢰할 수 있는가?

전투 핵심이 재미있다고 검증된 뒤 Mage, Item, Dungeon, Town 순서로 확장한다.

---

# 27. 현재 확정 사항

- PC 웹 브라우저 중심
- 어두운 다크 판타지와 클래식 웹게임 UI
- Dragon Quest식 명령 판독성
- Wait ATB
- 5 Lane Queue
- 일반 적 Horde 행동
- Skill Route 기반 Overkill
- Warrior와 Mage
- 장비 중심 성장
- Rune의 Skill 변화
- Room Graph Dungeon
- 목표 파밍이 가능한 Dungeon별 Drop Pool

---

# 28. 미결정 항목

- 최종 게임명
- 구체적인 세계관과 Main Story
- 단일 Character 유지 여부와 향후 Party 도입
- Queue 중심 전장과 Grid 이동의 최종 비중
- Unique와 Legendary의 최종 명칭
- Level Up Stat Point 배분 방식
- Death Penalty
- Crafting 강화 실패 여부
- 최종 Character 체형과 Art Style
- 정식 Level 1~50 수치표
- 정식 Drop 확률과 Economy
- Boss별 Pattern
- Endgame Dungeon 구조

---

# 29. 핵심 설계 원칙 요약

1. 턴제 판단이 먼저이고 연쇄 처치 연출은 그 결과다.
2. Overkill Route는 예측 가능해야 한다.
3. 일반 적은 성장의 쾌감을 제공하고 Elite는 Build의 약점을 시험한다.
4. Level보다 장비, Rune, Unique가 플레이 방식을 크게 바꾼다.
5. 마을 UI는 10초 안에 재파밍을 시작할 수 있어야 한다.
6. 모바일 가챠 스타일을 사용하지 않는다.
7. 전투 핵심이 검증되기 전에는 콘텐츠 규모를 늘리지 않는다.

