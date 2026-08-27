// Web Audio API procedural sound synthesizer for Dark Fantasy Hack & Slash

let audioCtx: AudioContext | null = null;
let masterVolume = 0.8;
let isAudioMuted = false;

export function setMasterVolume(v: number): void {
  masterVolume = Math.max(0, Math.min(1, v));
}

export function getMasterVolume(): number {
  return masterVolume;
}

export function setAudioMuted(muted: boolean): void {
  isAudioMuted = muted;
}

export function getAudioMuted(): boolean {
  return isAudioMuted;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function initAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    const unlock = () => {
      ctx.resume().then(() => {
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      }).catch(() => {});
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }
}

/**
 * 1. Blade Slash Sound (Fast metal slicing noise with bandpass filter)
 */
export function playSlashSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);
  filter.Q.setValueAtTime(3.0, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.15);
}

/**
 * 2. Heavy Hit Impact Sound (Low punch + noise crunch)
 */
export function playHitSound(depth = 0): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;
  // Randomize frequency ±15% for less repetitive hits
  const randomFactor = 0.85 + Math.random() * 0.30;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  const startFreq = (160 - Math.min(60, depth * 15)) * randomFactor;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, 30 * randomFactor), now + 0.15);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.4 * masterVolume, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * 3. Sequential Kill Sound (Pitch rises with chain count to give escalating rush!)
 */
export function playKillSound(chainStep = 1): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';

  const baseFreq = 120;
  const pitchStep = Math.min(24, chainStep);
  const targetFreq = baseFreq * Math.pow(1.06, pitchStep);

  osc.frequency.setValueAtTime(targetFreq * 1.5, now);
  osc.frequency.exponentialRampToValueAtTime(targetFreq * 0.7, now + 0.12);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.005, now + 0.14);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * 4. Massive Overkill Explosion Rumble (Sub-bass + Fire roar)
 */
export function playExplosionSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.55 * masterVolume, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.5);
}

/**
 * 5. Horde Enemy Counter-Attack Sound (Heavy monster punch to player)
 */
export function playHordeAttackSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.25);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.45 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * 6. RuneWord Chime Sound (Victory fanfare)
 */
export function playRuneWordSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;
  const notes = [440, 554.37, 659.25, 880];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25 * masterVolume, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.65);
  });
}

/**
 * 7. Deckard Cain Magic Identification Sound
 */
export function playIdentifySound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * masterVolume, now + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.06 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.55);
  });
}

/**
 * 8. Legendary / Unique Loot Drop Sound (Golden Pillar & Beam of Light Fanfare)
 */
export function playLegendaryDropSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;

  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(90, now);
  subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.5 * masterVolume, now);
  subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.45);

  const celestialNotes = [587.33, 739.99, 880, 1174.66, 1479.98, 1760];
  celestialNotes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.07);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35 * masterVolume, now + idx * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.07);
    osc.stop(now + idx * 0.07 + 0.85);
  });
}

/**
 * 9. Chain Kill Milestone Sound (escalating fanfare for x10/x25/x50/x100)
 */
export function playMilestoneSound(milestone: 10 | 25 | 50 | 100): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;

  // Sub-bass impact
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(milestone >= 50 ? 50 : 70, now);
  sub.frequency.exponentialRampToValueAtTime(20, now + 0.5);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.5 * masterVolume, now);
  subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.55);

  // Escalating note sequence
  const noteSequences: Record<number, number[]> = {
    10: [440, 554, 659],              // A4 C#5 E5 (A major triad)
    25: [523, 659, 784, 1047],        // C5 E5 G5 C6
    50: [587, 740, 880, 1175, 1480],  // D5 F#5 A5 D6 F#6
    100: [659, 831, 988, 1319, 1568, 1976] // E5 G#5 B5 E6 G#6 B6
  };

  const notes = noteSequences[milestone] || noteSequences[10];
  const noteDelay = milestone >= 50 ? 0.06 : 0.08;
  const volume = milestone >= 50 ? 0.4 : 0.3;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = milestone >= 50 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * noteDelay);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * masterVolume, now + idx * noteDelay);
    gain.gain.exponentialRampToValueAtTime(0.005, now + idx * noteDelay + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * noteDelay);
    osc.stop(now + idx * noteDelay + 0.85);
  });
}

/**
 * 10. Monster Death Sound by Rank
 */
export function playDeathSound(rank: 'normal' | 'champion' | 'elite' | 'boss'): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;

  if (rank === 'normal') {
    // Short crunch (50ms)
    const bufLen = ctx.sampleRate * 0.05;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.06);
  } else if (rank === 'champion') {
    // Medium burst (100ms)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (rank === 'elite') {
    // Heavy explosion (200ms)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.45 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } else {
    // Boss collapse (500ms + echo)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(18, now + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55 * masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    // Echo
    const echo = ctx.createOscillator();
    echo.type = 'sine';
    echo.frequency.setValueAtTime(60, now + 0.3);
    echo.frequency.exponentialRampToValueAtTime(15, now + 0.8);

    const echoGain = ctx.createGain();
    echoGain.gain.setValueAtTime(0.25 * masterVolume, now + 0.3);
    echoGain.gain.exponentialRampToValueAtTime(0.005, now + 0.85);

    echo.connect(echoGain).connect(ctx.destination);
    echo.start(now + 0.3);
    echo.stop(now + 0.9);
  }
}

/**
 * 11. Low-Health Visceral Heartbeat Sound (Lub-Dub rhythm for <25% HP)
 */
export function playHeartbeatSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;

  // First thump (Lub)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(65, now);
  osc1.frequency.exponentialRampToValueAtTime(25, now + 0.12);

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.4 * masterVolume, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.14);

  // Second thump (Dub) - slightly higher & shorter
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(75, now + 0.15);
  osc2.frequency.exponentialRampToValueAtTime(30, now + 0.25);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.3 * masterVolume, now + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.27);
}

/**
 * 12. Potion Drink Chime Sound
 */
export function playPotionSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;

  const now = ctx.currentTime;
  const notes = [659.25, 880, 1318.51]; // E5, A5, E6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25 * masterVolume, now + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.05 + 0.3);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.35);
  });
}

/**
 * 13. Skill-Specific SFX Suite (Q/W/E/R Custom Audio)
 */

// [Q] Slash - Sharp single metal slicing
export function playSkillSlashSound(): void {
  playSlashSound();
}

// [W] Cleave - Broad 3-lane sweeping shockwave
export function playSkillCleaveSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(150, now + 0.22);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.45 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

// [E] Execute - Guillotine heavy bone-crushing impact
export function playSkillExecuteSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  // Metal drop
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(320, now);
  osc1.frequency.exponentialRampToValueAtTime(30, now + 0.3);

  // Sub punch
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(95, now);
  osc2.frequency.exponentialRampToValueAtTime(18, now + 0.35);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.4);
  osc2.stop(now + 0.4);
}

// [R] Whirlwind - Continuous multi-slash cyclone resonance
export function playSkillWhirlwindSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  [0, 0.05, 0.10, 0.15, 0.20].forEach((delay, idx) => {
    const osc = ctx.createOscillator();
    osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(450 - idx * 40, now + delay);
    osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25 * masterVolume, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.13);
  });
}

/**
 * 14. Boss Gimmick & Combat Mechanics SFX
 */

// Boss Ultimate Charge Alert (Siren Pulse)
export function playBossChargeAlertSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.linearRampToValueAtTime(880, now + 0.2);
  osc.frequency.linearRampToValueAtTime(440, now + 0.4);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(650, now);
  filter.Q.setValueAtTime(4, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.48);
}

// Boss Stagger BREAK Success (Glass/Armor Shatter)
export function playBossGroggyBreakSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  [1200, 1850, 2400, 3100, 4200].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.02);
    osc.frequency.exponentialRampToValueAtTime(60, now + idx * 0.02 + 0.25);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * masterVolume, now + idx * 0.02);
    gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.02 + 0.28);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + idx * 0.02);
    osc.stop(now + idx * 0.02 + 0.3);
  });
}

// Dungeon Victory Fanfare (Golden Major Chords)
export function playDungeonVictoryFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  // D Major triumphant arpeggio: D4 -> F#4 -> A4 -> D5 -> A5
  const notes = [293.66, 369.99, 440.00, 587.33, 880.00];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);

    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(freq * 0.5, now + idx * 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35 * masterVolume, now + idx * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + (idx === notes.length - 1 ? 1.5 : 0.4));

    osc.connect(gain).connect(ctx.destination);
    sub.connect(gain).connect(ctx.destination);

    osc.start(now + idx * 0.1);
    sub.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + (idx === notes.length - 1 ? 1.6 : 0.45));
    sub.stop(now + idx * 0.1 + (idx === notes.length - 1 ? 1.6 : 0.45));
  });
}

// Cain Identify All (Triple Crystal Chimes)
export function playCainIdentifyAllSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * masterVolume, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.6);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.65);
  });
}

// Rune Socketing Inscription Sound
export function playRuneSocketSound(): void {
  const ctx = getAudioContext();
  if (!ctx || isAudioMuted || masterVolume <= 0) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(560, now + 0.18);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * 15. Comprehensive Procedural BGM Suite (Acts 1-5, Rift, Bosses, Town)
 */

let bgmIntervalId: ReturnType<typeof setInterval> | null = null;
let currentBgmKey = '';

// Note Frequencies (Hz)
const NOTE: Record<string, number> = {
  C2: 65.41, Cs2: 69.30, D2: 73.42, Ds2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, Gs2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Gs3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00
};

// Instrument 1: Acoustic Lute Pluck (Act 1 / Town)
function playAcousticPluck(ctx: AudioContext, freq: number, time: number, vol = 0.22): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(freq * 0.5, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1600, time);
  filter.frequency.exponentialRampToValueAtTime(300, time + 0.8);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(v, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  sub.connect(gain).connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 1.25);
  sub.start(time);
  sub.stop(time + 0.65);
}

// Instrument 2: Oriental Oud / Sitar Pluck (Act 2 Desert)
function playOudPluck(ctx: AudioContext, freq: number, time: number, vol = 0.20): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq * 1.02, time);
  osc.frequency.linearRampToValueAtTime(freq, time + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq * 1.8, time);
  filter.Q.setValueAtTime(4.0, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(v, time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.95);
}

// Instrument 3: Tabla / Desert Percussion (Act 2)
function playTablaBeat(ctx: AudioContext, time: number, vol = 0.22): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(v, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.22);
}

// Instrument 4: Tribal Jungle Bongo / Tom (Act 3)
function playTribalDrum(ctx: AudioContext, time: number, pitch = 140, vol = 0.25): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pitch, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.25);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(v, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.32);
}

// Instrument 5: Distorted Hellfire Bass (Act 4 Chaos)
function playHellBass(ctx: AudioContext, freq: number, time: number, vol = 0.28): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, time);
  filter.frequency.exponentialRampToValueAtTime(160, time + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(v, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.38);
}

// Instrument 6: Epic Viking Brass Horn (Act 5 Worldstone)
function playVikingHorn(ctx: AudioContext, freq: number, time: number, vol = 0.24): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(freq, time);

  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 1.005, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, time);
  filter.frequency.exponentialRampToValueAtTime(400, time + 0.9);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(v, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.1);

  osc1.connect(filter).connect(gain).connect(ctx.destination);
  osc2.connect(filter).connect(gain).connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 1.15);
  osc2.stop(time + 1.15);
}

// Instrument 7: Cosmic Rift Pulse (Endless Rift)
function playCosmicPulse(ctx: AudioContext, freq: number, time: number, vol = 0.20): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq * 2, time);
  filter.Q.setValueAtTime(5, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(v, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.45);
}

// Instrument 8: Dungeon Bell & War Drum
function playDungeonBell(ctx: AudioContext, freq: number, time: number, vol = 0.18): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, time);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.76, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq * 1.5, time);
  filter.Q.setValueAtTime(3, time);

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(v, time);
  gain1.gain.exponentialRampToValueAtTime(0.001, time + 2.0);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(v * 0.35, time);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(filter).connect(gain2).connect(ctx.destination);

  osc1.start(time);
  osc1.stop(time + 2.05);
  osc2.start(time);
  osc2.stop(time + 0.95);
}

function playWarDrum(ctx: AudioContext, time: number, vol = 0.25): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, time);
  osc.frequency.exponentialRampToValueAtTime(32, time + 0.35);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(v, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.55);
}

export interface BgmOptions {
  mode: 'town' | 'dungeon' | 'boss';
  act?: number;
  isRift?: boolean;
  riftTier?: number;
  bossName?: string;
}

export function startBGM(optionsOrMode: 'town' | 'dungeon' | 'boss' | BgmOptions): void {
  const opts: BgmOptions = typeof optionsOrMode === 'string' ? { mode: optionsOrMode } : optionsOrMode;
  const mode = opts.mode;
  const act = opts.act || 1;
  const isRift = Boolean(opts.isRift);
  const riftTier = opts.riftTier || 1;
  const bossName = opts.bossName || '';

  const newKey = `${mode}_act${act}_rift${isRift}_tier${riftTier}_boss${bossName}`;
  if (currentBgmKey === newKey && bgmIntervalId !== null) return;

  stopBGM();
  currentBgmKey = newKey;

  const ctx = getAudioContext();
  if (!ctx || isAudioMuted) return;

  let step = 0;

  // 1. TOWN BGM (Tristram Acoustic Lute in D Minor)
  if (mode === 'town') {
    const townMelody: (number | null)[] = [
      NOTE.D3, NOTE.A3, NOTE.D4, NOTE.F4,
      NOTE.A4, NOTE.F4, NOTE.D4, NOTE.C4,
      NOTE.Bb3, NOTE.F3, NOTE.Bb3, NOTE.D4,
      NOTE.F4, NOTE.D4, NOTE.A3, NOTE.E3,
      NOTE.G3, NOTE.D3, NOTE.G3, NOTE.Bb3,
      NOTE.D4, NOTE.Bb3, NOTE.G3, NOTE.F3,
      NOTE.A3, NOTE.E3, NOTE.A3, NOTE.Cs4,
      NOTE.E4, NOTE.Cs4, NOTE.A3, null
    ];
    const stepDurationMs = 280;

    const tick = () => {
      const now = ctx.currentTime;
      const note = townMelody[step % townMelody.length];
      if (note) {
        const vel = 0.18 + Math.random() * 0.05;
        playAcousticPluck(ctx, note, now + 0.02, vel);
      }
      step++;
    };
    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
    return;
  }

  // 2. ENDLESS RIFT BGM (Cosmic Dimensional Pulse)
  if (isRift) {
    const riftSequence = [
      NOTE.Fs3, NOTE.A3, NOTE.Cs4, NOTE.E4,
      NOTE.Fs4, NOTE.E4, NOTE.Cs4, NOTE.A3,
      NOTE.D3, NOTE.Fs3, NOTE.A3, NOTE.D4,
      NOTE.E3, NOTE.Gs3, NOTE.B3, NOTE.E4
    ];
    // Dynamic tempo acceleration based on rift tier
    const stepDurationMs = Math.max(130, 200 - Math.min(70, riftTier * 3));

    const tick = () => {
      const now = ctx.currentTime;
      const note = riftSequence[step % riftSequence.length];
      playCosmicPulse(ctx, note, now + 0.02, 0.22);

      if (step % 4 === 0) {
        playWarDrum(ctx, now + 0.02, 0.30);
      }
      step++;
    };
    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
    return;
  }

  // 3. BOSS BATTLE BGM (High-Impact 160 BPM Raid Metalfest)
  if (mode === 'boss') {
    const bossBassline = [
      NOTE.D2, NOTE.D2, NOTE.F2, NOTE.D2,
      NOTE.Ab2, NOTE.D2, NOTE.F2, NOTE.G2,
      NOTE.Bb2, NOTE.Bb2, NOTE.D3, NOTE.Bb2,
      NOTE.F2, NOTE.Bb2, NOTE.A2, NOTE.G2
    ];
    const stepDurationMs = 175; // Fast 170 BPM

    const tick = () => {
      const now = ctx.currentTime;
      const bassNote = bossBassline[step % bossBassline.length];
      playHellBass(ctx, bassNote, now + 0.02, 0.26);

      if (step % 4 === 0) {
        playWarDrum(ctx, now + 0.02, 0.38);
      }
      if (step % 16 === 0) {
        playDungeonBell(ctx, NOTE.A4, now + 0.02, 0.25);
      }
      step++;
    };
    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
    return;
  }

  // 4. ACT 1~5 REGULAR DUNGEON BGM (Unique Regional Orchestrations)
  if (act === 2) {
    // Act 2: Lut Gholein Desert Hijaz Oriental Scale
    const act2Oud = [
      NOTE.E3, NOTE.F3, NOTE.Gs3, NOTE.A3,
      NOTE.B3, NOTE.A3, NOTE.Gs3, NOTE.F3,
      NOTE.E3, NOTE.D3, NOTE.E3, NOTE.Gs3,
      NOTE.B3, NOTE.C4, NOTE.B3, null
    ];
    const stepDurationMs = 320;

    const tick = () => {
      const now = ctx.currentTime;
      const note = act2Oud[step % act2Oud.length];
      if (note) playOudPluck(ctx, note, now + 0.02, 0.22);

      if (step % 2 === 0) {
        playTablaBeat(ctx, now + 0.02, 0.25);
      }
      step++;
    };
    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
    return;
  }

  if (act === 3) {
    // Act 3: Kurast Jungle Tribal Drums & Mystery Flute
    const act3Pitches = [160, 140, 180, 140, 200, 160, 140, 120];
    const stepDurationMs = 260;

    const tick = () => {
      const now = ctx.currentTime;
      const p = act3Pitches[step % act3Pitches.length];
      playTribalDrum(ctx, now + 0.02, p, 0.26);

      if (step % 8 === 0) {
        playDungeonBell(ctx, NOTE.G4, now + 0.02, 0.18);
      }
      step++;
    };
    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
    return;
  }

  if (act === 4) {
    // Act 4: Chaos Sanctuary Hellfire Distorted Bassline
    const act4Hell = [
      NOTE.C2, NOTE.C2, NOTE.Eb2, NOTE.C2,
      NOTE.Gb2, NOTE.C2, NOTE.Eb2, NOTE.F2,
      NOTE.Ab2, NOTE.Ab2, NOTE.C3, NOTE.Ab2,
      NOTE.Gb2, NOTE.Ab2, NOTE.G2, NOTE.F2
    ];
    const stepDurationMs = 220;

    const tick = () => {
      const now = ctx.currentTime;
      const note = act4Hell[step % act4Hell.length];
      playHellBass(ctx, note, now + 0.02, 0.28);

      if (step % 4 === 0) {
        playWarDrum(ctx, now + 0.02, 0.35);
      }
      step++;
    };
    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
    return;
  }

  if (act === 5) {
    // Act 5: Mount Arreat Epic Viking Horns & Snowstorm Winds
    const act5Horns = [
      NOTE.A2, null, NOTE.E3, null, NOTE.A3, null, NOTE.C4, null,
      NOTE.D4, null, NOTE.C4, null, NOTE.B3, null, NOTE.A3, null,
      NOTE.F3, null, NOTE.A3, null, NOTE.C4, null, NOTE.E4, null,
      NOTE.D4, null, NOTE.B3, null, NOTE.A2, null, null, null
    ];
    const stepDurationMs = 340;

    const tick = () => {
      const now = ctx.currentTime;
      const hornNote = act5Horns[step % act5Horns.length];
      if (hornNote) {
        playVikingHorn(ctx, hornNote, now + 0.02, 0.25);
      }
      if (step % 8 === 0) {
        playWarDrum(ctx, now + 0.02, 0.30);
      }
      step++;
    };
    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
    return;
  }

  // Default: Act 1 Cathedral Bells & Deep Drums
  const dungeonBells: (number | null)[] = [
    NOTE.C4, null, NOTE.Ds4, null, NOTE.G4, null, NOTE.B4, null,
    NOTE.C5, null, NOTE.G4, null, NOTE.Ds4, null, NOTE.D4, null,
    NOTE.Ab3, null, NOTE.C4, null, NOTE.Eb4, null, NOTE.G4, null,
    NOTE.F4, null, NOTE.D4, null, NOTE.B3, null, null, null
  ];
  const stepDurationMs = 380;

  const tick = () => {
    const now = ctx.currentTime;
    const bellNote = dungeonBells[step % dungeonBells.length];
    if (bellNote) {
      playDungeonBell(ctx, bellNote, now + 0.02, 0.18);
    }
    if (step % 8 === 0) {
      playWarDrum(ctx, now + 0.02, 0.28);
    }
    step++;
  };
  tick();
  bgmIntervalId = setInterval(tick, stepDurationMs);
}

export function stopBGM(): void {
  if (bgmIntervalId !== null) {
    clearInterval(bgmIntervalId);
    bgmIntervalId = null;
  }
  currentBgmKey = '';
}

