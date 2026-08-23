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
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudio(): void {
  getAudioContext();
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

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  const startFreq = 160 - Math.min(60, depth * 15);
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

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
