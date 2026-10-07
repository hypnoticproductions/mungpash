// Web Audio API Synthesizer for Authentic Tibetan Bowl & Table Chimes

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a resonant harmonic Tibetan singing bowl tone
 * Ideal for phase transitions on the massage table
 */
export function playPhaseBellChime(pitch: 'low' | 'mid' | 'high' = 'mid') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const baseFreq = pitch === 'low' ? 216 : pitch === 'mid' ? 324 : 432; // A4 harmonic tuning
    const now = ctx.currentTime;

    // Harmonic frequencies simulating metal singing bowl
    const harmonics = [
      { freq: baseFreq, gain: 0.35, decay: 4.5 },
      { freq: baseFreq * 2.76, gain: 0.18, decay: 3.2 },
      { freq: baseFreq * 5.4, gain: 0.08, decay: 2.1 },
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Soft gentle attack to avoid clicks
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });
  } catch (err) {
    console.warn('Audio chime playback omitted:', err);
  }
}

/**
 * Play a gentle tactile click/tone for timer start/pause
 */
export function playSoftTick(type: 'start' | 'pause') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(type === 'start' ? 528 : 396, now);
    if (type === 'start') {
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
    }

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    // Graceful fallback
  }
}
