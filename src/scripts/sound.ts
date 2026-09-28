// Procedural "arcane" sound palette. Every cue is synthesised on demand with
// the Web Audio API, so there are no audio assets to download and nothing to
// license. The engine stays inert until a user gesture unlocks the AudioContext
// (browser autoplay policy), and it is a no-op while muted.

export type Cue =
  | 'hover'
  | 'click'
  | 'open'
  | 'close'
  | 'select'
  | 'success'
  | 'error'
  | 'transition';

const MASTER_GAIN = 0.75;
const AMBIENT_GAIN = 0.28;

interface NoteOptions {
  freq: number;
  type?: OscillatorType;
  attack?: number;
  decay?: number;
  gain?: number;
  sweepTo?: number;
  delay?: number;
  detune?: number;
  pan?: number;
  send?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverbIn: AudioNode | null = null;
  private muted = false;
  private reverbBuilt = false;
  private ambientGain: GainNode | null = null;
  private ambientBuilt = false;
  private ambientAllowed = true;

  get isMuted(): boolean {
    return this.muted;
  }

  // True once a gesture has unlocked the context and sound is on. Used by the
  // page-transition wiring to decide whether it is worth delaying navigation.
  get isReady(): boolean {
    return !this.muted && !!this.ctx && this.ctx.state === 'running';
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        muted ? 0 : MASTER_GAIN,
        this.ctx.currentTime,
        0.02,
      );
    }
    this.syncAmbient();
  }

  // Ambient is opt-out (e.g. reduced motion) without affecting one-shot cues.
  setAmbientAllowed(allowed: boolean): void {
    this.ambientAllowed = allowed;
    this.syncAmbient();
  }

  // Create/resume the context from a user gesture so later hover cues (which
  // are not gestures) can play.
  unlock(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    this.syncAmbient();
  }

  play(cue: Cue): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master || ctx.state !== 'running') return;
    switch (cue) {
      case 'hover':
        this.note({
          freq: 1560,
          type: 'sine',
          attack: 0.004,
          decay: 0.1,
          gain: 0.18,
        });
        this.sparkle(1500, 0.045);
        break;
      case 'select':
        this.note({
          freq: 620,
          type: 'triangle',
          attack: 0.005,
          decay: 0.18,
          gain: 0.34,
          sweepTo: 500,
        });
        this.note({
          freq: 1710,
          type: 'sine',
          attack: 0.004,
          decay: 0.12,
          gain: 0.12,
        });
        this.sparkle(620, 0.09);
        break;
      case 'click':
        this.note({
          freq: 430,
          type: 'triangle',
          attack: 0.005,
          decay: 0.17,
          gain: 0.42,
          sweepTo: 330,
        });
        this.note({
          freq: 1187,
          type: 'sine',
          attack: 0.004,
          decay: 0.1,
          gain: 0.14,
        });
        this.sparkle(430, 0.11);
        break;
      case 'open':
        this.whoosh(1);
        this.note({
          freq: 523,
          type: 'sine',
          attack: 0.02,
          decay: 0.34,
          gain: 0.18,
          sweepTo: 784,
        });
        this.note({
          freq: 1200,
          type: 'sine',
          attack: 0.01,
          decay: 0.5,
          gain: 0.06,
          sweepTo: 2400,
          send: 0.8,
        });
        this.sparkle(660, 0.09, 0.04);
        this.shimmer(0.05, 0.05);
        break;
      case 'close':
        this.whoosh(-1);
        this.note({
          freq: 620,
          type: 'sine',
          attack: 0.01,
          decay: 0.28,
          gain: 0.15,
          sweepTo: 392,
        });
        this.note({
          freq: 1500,
          type: 'sine',
          attack: 0.01,
          decay: 0.4,
          gain: 0.05,
          sweepTo: 700,
          send: 0.8,
        });
        break;
      case 'success':
        [523.25, 659.25, 783.99, 987.77].forEach((freq, index) =>
          this.note({
            freq,
            type: 'sine',
            attack: 0.006,
            decay: 0.5,
            gain: 0.2,
            delay: index * 0.09,
            pan: index % 2 ? 0.3 : -0.3,
          }),
        );
        this.sparkle(1046.5, 0.12, 0.3);
        this.shimmer(0.05, 0.34);
        break;
      case 'error':
        this.note({
          freq: 233,
          type: 'sine',
          attack: 0.006,
          decay: 0.3,
          gain: 0.4,
          sweepTo: 155,
        });
        this.note({
          freq: 220,
          type: 'triangle',
          attack: 0.006,
          decay: 0.3,
          gain: 0.18,
          sweepTo: 146,
          detune: -8,
        });
        break;
      case 'transition':
        // A brief "seal opens" gesture played before an internal navigation.
        // Kept short on purpose: the page unloads ~110ms later, so only the
        // attack and the rising body are meant to be heard.
        this.whoosh(1, 0.28);
        this.note({
          freq: 392,
          type: 'triangle',
          attack: 0.006,
          decay: 0.24,
          gain: 0.3,
          sweepTo: 660,
        });
        this.note({
          freq: 196,
          type: 'sine',
          attack: 0.008,
          decay: 0.26,
          gain: 0.16,
          sweepTo: 240,
        });
        this.sparkle(587.33, 0.09, 0.02);
        break;
    }
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.ctx = new Ctor();
      } catch {
        return null;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER_GAIN;
      // Gentle limiter so the raised levels (and overlapping cues) never clip.
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      this.master.connect(compressor);
      compressor.connect(this.ctx.destination);
      // Resume can resolve asynchronously after `unlock()`; start the pad then.
      this.ctx.onstatechange = () => this.syncAmbient();
    }
    if (!this.reverbBuilt) {
      this.reverbBuilt = true;
      this.buildReverb(this.ctx);
    }
    return this.ctx;
  }

  // A slow, evolving drone bed. Kept deliberately small (four detuned sines +
  // one filtered noise loop, no per-frame JS) so it can run continuously.
  private buildAmbient(ctx: AudioContext): void {
    this.ambientBuilt = true;
    if (!this.master) return;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(this.master);
    if (this.reverbIn) {
      const send = ctx.createGain();
      send.gain.value = 0.5;
      out.connect(send);
      send.connect(this.reverbIn);
    }
    this.ambientGain = out;

    // Everything sits on a "breath" gain that swells and relaxes slowly.
    const breath = ctx.createGain();
    breath.gain.value = 0.7;
    breath.connect(out);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.3;
    lfo.connect(lfoDepth);
    lfoDepth.connect(breath.gain);
    lfo.start();

    const voices: [number, number, number][] = [
      [110, 0.34, 0],
      [164.81, 0.22, 5],
      [220, 0.16, -6],
      [329.63, 0.08, 4],
    ];
    for (const [freq, amp, detune] of voices) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const gain = ctx.createGain();
      gain.gain.value = amp;
      osc.connect(gain);
      gain.connect(breath);
      osc.start();
    }

    // Filtered noise "wind" whose cutoff drifts even more slowly.
    const length = Math.floor(ctx.sampleRate * 3);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(breath);
    const filterLfo = ctx.createOscillator();
    filterLfo.frequency.value = 0.03;
    const filterDepth = ctx.createGain();
    filterDepth.gain.value = 160;
    filterLfo.connect(filterDepth);
    filterDepth.connect(filter.frequency);
    filterLfo.start();
    noise.start();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.syncAmbient());
    }
  }

  // Target the pad only while sound is on, the context runs and the tab is
  // visible. A slow time constant fades in/out so nothing ever clicks.
  private syncAmbient(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (!this.ambientBuilt) this.buildAmbient(ctx);
    if (!this.ambientGain) return;
    const on =
      this.ambientAllowed &&
      !this.muted &&
      ctx.state === 'running' &&
      !document.hidden;
    this.ambientGain.gain.cancelScheduledValues(ctx.currentTime);
    this.ambientGain.gain.setTargetAtTime(
      on ? AMBIENT_GAIN : 0,
      ctx.currentTime,
      1.2,
    );
  }

  // A procedurally-generated impulse response gives the cues a long, airy
  // "cathedral" tail that reads as magic without shipping a file. A high-pass
  // keeps the wet signal bright so the tail shimmers instead of muddying.
  private buildReverb(ctx: AudioContext): void {
    const length = Math.floor(ctx.sampleRate * 1.5);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.2);
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 300;
    const wet = ctx.createGain();
    wet.gain.value = 0.24;
    convolver.connect(highpass);
    highpass.connect(wet);
    wet.connect(this.master as GainNode);
    this.reverbIn = convolver;
  }

  // Inharmonic bell partials: the signature "crystal chime" of the palette.
  private sparkle(base: number, peak: number, delay = 0): void {
    const ratios = [2.0, 3.01, 4.24, 5.43];
    ratios.forEach((ratio, index) =>
      this.note({
        freq: base * ratio,
        type: 'sine',
        attack: 0.002,
        decay: 0.34 + index * 0.07,
        gain: peak / (index + 1.4),
        delay: delay + index * 0.006,
        detune: index % 2 ? 7 : -7,
        pan: index % 2 ? 0.5 : -0.5,
        send: 0.85,
      }),
    );
  }

  // A short high band-passed noise burst: the "fairy dust" transient.
  private shimmer(peak: number, delay = 0): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const duration = 0.55;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.7;
    const start = ctx.currentTime + delay;
    filter.frequency.setValueAtTime(5200, start);
    filter.frequency.exponentialRampToValueAtTime(9800, start + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    if (this.reverbIn) {
      const send = ctx.createGain();
      send.gain.value = 0.9;
      gain.connect(send);
      send.connect(this.reverbIn);
    }
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  private note(options: NoteOptions): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const attack = options.attack ?? 0.005;
    const decay = options.decay ?? 0.15;
    const peak = options.gain ?? 0.1;
    const start = ctx.currentTime + (options.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = options.type ?? 'sine';
    osc.frequency.setValueAtTime(options.freq, start);
    if (options.detune) osc.detune.value = options.detune;
    if (options.sweepTo) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, options.sweepTo),
        start + attack + decay,
      );
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    if (options.pan && typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, options.pan));
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.master);
    } else {
      osc.connect(gain);
      gain.connect(this.master);
    }
    if (this.reverbIn) {
      const send = ctx.createGain();
      send.gain.value = options.send ?? 0.5;
      gain.connect(send);
      send.connect(this.reverbIn);
    }
    osc.start(start);
    osc.stop(start + attack + decay + 0.03);
  }

  private whoosh(direction: 1 | -1, duration = 0.42): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    const start = ctx.currentTime;
    filter.frequency.setValueAtTime(direction > 0 ? 420 : 2400, start);
    filter.frequency.exponentialRampToValueAtTime(
      direction > 0 ? 2400 : 420,
      start + duration,
    );
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.26, start + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    if (this.reverbIn) {
      const send = ctx.createGain();
      send.gain.value = 0.4;
      gain.connect(send);
      send.connect(this.reverbIn);
    }
    source.start(start);
    source.stop(start + duration + 0.02);
  }
}

export const sound = new SoundEngine();
export default sound;
