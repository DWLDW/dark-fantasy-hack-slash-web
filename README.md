# ⚔️ Dark Fantasy Turn-Based Hack & Slash Loot RPG

> 턴제의 명확한 판단과 핵앤슬래시의 시원한 대량 학살(Overkill Chain)을 결합한 PC 웹 브라우저용 다크 판타지 파밍 RPG.

---

## 🎮 주요 게임 특징

1. **5-Lane 턴제 전장 & 확정형 오버킬(Overkill) 엔진**
   - 5개 레인 × 6 깊이 큐 전장
   - 공격 전 **오버킬 잔여 피해 전이 경로**와 **예상 처치 수**를 실시간으로 시각화
   - 외곽 레인 집중 타격으로 6~10마리 이상 연쇄 관통 처치(Massacre)
   - 방패 전열과 엘리트(Elite) 몬스터의 **체인 저지점(Chain Stopper)** 돌파 전략

2. **Wait ATB & 적 군단(Horde) 반격**
   - 플레이어 행동 후 회복 시간 동안 몬스터 군단(Horde)이 전열에서 플레이어를 반격
   - 체력 포션 복용과 레인 이동, 방어의 의미가 살아있는 턴제 긴장감

3. **디아블로 2 (Diablo II) 스타일 파밍 & 제작 시스템**
   - **소켓팅 & 룬워드 (Rune Words)**: 노멀 베이스 장비에 룬을 순서대로 박아 `강철(Steel)`, `스텔스(Stealth)`, `전승(Lore)`, `수수께끼(Enigma)` 완성
   - **호라드릭 큐브 (Horadric Cube)**: 룬 3개 합성, 노멀 장비 소켓 뚫기
   - **기드의 도박 상점 (Gamble)**: 골드로 미확인 장비 대박 뽑기
   - **데커드 케인의 감정소 (Identify)**: *"Stay awhile and listen!"* 1클릭 전리품 일괄 식별

4. **Web Audio API 절차적 사운드 연출**
   - 외부 파일 없이 브라우저 내장 Web Audio API로 구현된 쇳소리 슬래시, 묵직한 타격음, 연쇄 킬 수에 따른 피치 상승 사운드, 대량 처치 서브 베이스 폭발음

---

## ⌨️ 조작법 (Controls)

| 단축키 | 기능 |
|---|---|
| **`[ ← / → ]`** | 전장 5개 레인 좌/우 이동 (`Lane 1 ~ Lane 5`) |
| **`[ Q / W / E / R ]`** | 스킬 선택 (`Q: 가르기`, `W: 처형`, `E: 휩쓸기`, `R: 휠윈드`) |
| **`[ 1 / 2 / 3 / 4 ]`** | 소모품 퀵슬롯 즉시 복용 (`1: HP물약`, `2: 분노영약`, `3: 철갑묘약`, `4: 질풍비약`) |
| **`[ Space / Enter ]`** | 공격 명령 실행 (마을에서는 던전 빠른 진입) |
| **`[ C / I / K ]`** | 공통 팝업 (`C: 스탯`, `I: 인벤토리/장비`, `K: 룬/스킬`) |
| **`[ ESC ]`** | 열려있는 팝업 창 닫기 |

---

## 🚀 로컬 실행 방법 (Getting Started)

### 요구 사항
- Node.js 18+ 이상

### 설치 및 실행
```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 브라우저에서 접속
http://localhost:3000
```

---

## 🛠️ 기술 스택 (Tech Stack)
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark Fantasy High-Contrast Theme)
- **Icons**: Lucide React
- **Audio**: Web Audio API Procedural Synthesizer
