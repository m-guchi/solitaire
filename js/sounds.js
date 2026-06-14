export class SoundFX {
  constructor() {
    this.unlocked = false;
    this.enabled = true;
    this.ctx = null;
  }

  unlock() {
    if (this.unlocked) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.unlocked = true;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  ensureCtx() {
    if (!this.unlocked || !this.ctx) return null;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  playPlace(delay = 0) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const duration = 0.06;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + duration);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);

    this.playNoiseBurst(ctx, now, {
      duration: 0.035,
      peak: 0.1,
      lowpass: 280,
    });
  }

  playFlip(delay = 0) {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const duration = 0.09;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(72, now + duration);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);

    this.playNoiseBurst(ctx, now + 0.008, {
      duration: 0.04,
      peak: 0.09,
      lowpass: 420,
    });
  }

  playNoiseBurst(ctx, startTime, { duration, peak, lowpass }) {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * (1 - t);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(startTime);
    noise.stop(startTime + duration + 0.01);
  }
}
