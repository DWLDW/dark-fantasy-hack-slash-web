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
 * 13. Dark Fantasy Procedural BGM Melody Sequencer
 * Replaces monotonous drone buzz with musical acoustic plucks, dungeon bells, and war drums.
 */
let bgmIntervalId: ReturnType<typeof setInterval> | null = null;
let currentBgmMode: 'town' | 'dungeon' | 'boss' | null = null;

// Note Frequencies (Hz)
const NOTE: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
};

// Play warm acoustic guitar/lute pluck (Tristram style)
function playAcousticPluck(ctx: AudioContext, freq: number, time: number, vol = 0.22): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  // Sub harmonic for woody acoustic resonance
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

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(v * 0.4, time);
  subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  sub.connect(subGain).connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 1.25);
  sub.start(time);
  sub.stop(time + 0.65);
}

// Play mystical dungeon bell / chime
function playDungeonBell(ctx: AudioContext, freq: number, time: number, vol = 0.18): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, time);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.76, time); // Non-harmonic metallic overtone

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

// Play deep war drum / timpani
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

// Play fast battle synth bass (Boss)
function playBossBass(ctx: AudioContext, freq: number, time: number, vol = 0.22): void {
  if (isAudioMuted || masterVolume <= 0) return;
  const v = vol * masterVolume;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, time);
  filter.frequency.exponentialRampToValueAtTime(120, time + 0.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(v, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.28);
}

export function startBGM(mode: 'town' | 'dungeon' | 'boss'): void {
  if (currentBgmMode === mode && bgmIntervalId !== null) return;
  stopBGM();
  currentBgmMode = mode;

  const ctx = getAudioContext();
  if (!ctx || isAudioMuted) return;

  let step = 0;

  if (mode === 'town') {
    // Tristram homage: 16-step soothing acoustic lute arpeggio in D minor
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

    const stepDurationMs = 280; // ~107 BPM 8th notes

    const tick = () => {
      const now = ctx.currentTime;
      const note = townMelody[step % townMelody.length];
      if (note) {
        // Humanized slight timing & volume variance
        const jitter = (Math.random() - 0.5) * 0.01;
        const vel = 0.18 + Math.random() * 0.05;
        playAcousticPluck(ctx, note, now + 0.02 + jitter, vel);
      }
      step++;
    };

    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);

  } else if (mode === 'dungeon') {
    // Eerie Dungeon: Slow haunting bell arpeggio + periodic deep war drums
    const dungeonBells: (number | null)[] = [
      NOTE.C4, null, NOTE.Ds4, null, NOTE.G4, null, NOTE.B4, null,
      NOTE.C5, null, NOTE.G4, null, NOTE.Ds4, null, NOTE.D4, null,
      NOTE.Ab3, null, NOTE.C4, null, NOTE.Eb4, null, NOTE.G4, null,
      NOTE.F4, null, NOTE.D4, null, NOTE.B3, null, null, null
    ];

    const stepDurationMs = 380; // Slow, suspenseful 78 BPM

    const tick = () => {
      const now = ctx.currentTime;
      const bellNote = dungeonBells[step % dungeonBells.length];
      if (bellNote) {
        playDungeonBell(ctx, bellNote, now + 0.02, 0.16);
      }
      // War drum beat on every 8 steps (every 2 bars)
      if (step % 8 === 0) {
        playWarDrum(ctx, now + 0.02, 0.28);
      }
      step++;
    };

    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);

  } else if (mode === 'boss') {
    // Boss Battle: Fast 150 BPM pulse bass + dramatic tension beats
    const bossBassline: number[] = [
      NOTE.B2, NOTE.B2, NOTE.D3, NOTE.B2,
      NOTE.F3, NOTE.B2, NOTE.D3, NOTE.E3,
      NOTE.G2, NOTE.G2, NOTE.B2, NOTE.G2,
      NOTE.D3, NOTE.G2, NOTE.Fs3, NOTE.E3
    ];

    const stepDurationMs = 180; // Fast 166 BPM 8th notes

    const tick = () => {
      const now = ctx.currentTime;
      const bassNote = bossBassline[step % bossBassline.length];
      playBossBass(ctx, bassNote, now + 0.02, 0.24);

      // Heavy drum kick on every 4 steps
      if (step % 4 === 0) {
        playWarDrum(ctx, now + 0.02, 0.35);
      }
      // Climax bell chime on bar start
      if (step % 16 === 0) {
        playDungeonBell(ctx, NOTE.Fs4, now + 0.02, 0.22);
      }
      step++;
    };

    tick();
    bgmIntervalId = setInterval(tick, stepDurationMs);
  }
}

export function stopBGM(): void {
  if (bgmIntervalId !== null) {
    clearInterval(bgmIntervalId);
    bgmIntervalId = null;
  }
  currentBgmMode = null;
}
