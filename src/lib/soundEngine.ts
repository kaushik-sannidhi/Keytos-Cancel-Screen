"use client";

class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  // Continuous sad violin nodes
  private violinOsc1: OscillatorNode | null = null;
  private violinOsc2: OscillatorNode | null = null;
  private vibratoOsc: OscillatorNode | null = null;
  private vibratoGain: GainNode | null = null;
  private violinGain: GainNode | null = null;
  private violinFilter: BiquadFilterNode | null = null;

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopSadViolin();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Obnoxious multi-horn stadium airhorn for accidental contract upgrades */
  public playAirhorn(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [392, 466.16, 587.33, 783.99];
    const blasts = [
      { start: 0, dur: 0.14 },
      { start: 0.18, dur: 0.14 },
      { start: 0.36, dur: 0.48 },
    ];

    for (const blast of blasts) {
      const master = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(950, now + blast.start);
      filter.Q.setValueAtTime(1.4, now + blast.start);

      master.gain.setValueAtTime(0.001, now + blast.start);
      master.gain.exponentialRampToValueAtTime(0.18, now + blast.start + 0.02);
      master.gain.setValueAtTime(0.16, now + blast.start + blast.dur - 0.04);
      master.gain.exponentialRampToValueAtTime(
        0.0001,
        now + blast.start + blast.dur
      );

      filter.connect(master);
      master.connect(ctx.destination);

      for (const f of freqs) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f * 0.97, now + blast.start);
        osc.frequency.linearRampToValueAtTime(f, now + blast.start + 0.04);
        osc.connect(filter);
        osc.start(now + blast.start);
        osc.stop(now + blast.start + blast.dur + 0.02);
      }
    }
  }

  /** Harsh game-show / compliance error buzzer */
  public playErrorBuzzer(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    gain.connect(ctx.destination);

    for (const freq of [110, 116.5]) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.88, now + 0.35);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.37);
    }
  }

  /** Police radar speed-trap siren when scrolling > 180 px/s */
  public playRadarSiren(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";

    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.34);
    osc.frequency.exponentialRampToValueAtTime(1240, now + 0.52);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.56);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.58);
  }

  /** Corporate Slack/Teams ping for Chad from Enterprise Retention */
  public playChatPing(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 880, start: 0, dur: 0.11 },
      { freq: 1174.66, start: 0.09, dur: 0.22 },
    ];

    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(n.freq, now + n.start);
      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.exponentialRampToValueAtTime(0.12, now + n.start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.02);
    }
  }

  /** Mechanical servo whir when the robotic arm reaches out to uncheck */
  public playRoboticServo(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(380, now + 0.12);
    osc.frequency.linearRampToValueAtTime(190, now + 0.26);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Heavy thud for Matter.js concrete blocks or YubiKey smash */
  public playHeavyThud(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.18);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  /** Crisp stage completion / nuclear latch chime */
  public playStageAdvance(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const t = now + idx * 0.07;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  /**
   * Continuous pitch-bending sad violin tied to the Stage 2 intern-firing slider (0..1).
   * Bends mournfully down a D-minor lament with expressive 5.8Hz vibrato.
   */
  public updateSadViolin(progress0to1: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const clamped = Math.max(0, Math.min(1, progress0to1));
    const now = ctx.currentTime;

    // D minor lament notes from hopeful D5 down to tragic D4
    const lamentScale = [587.33, 523.25, 466.16, 440.0, 392.0, 349.23, 329.63, 293.66];
    const scaledIdx = clamped * (lamentScale.length - 1);
    const lowIdx = Math.floor(scaledIdx);
    const highIdx = Math.min(lamentScale.length - 1, lowIdx + 1);
    const frac = scaledIdx - lowIdx;
    const targetFreq =
      lamentScale[lowIdx] * (1 - frac) + lamentScale[highIdx] * frac;

    if (!this.violinOsc1 || !this.violinGain) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const vibOsc = ctx.createOscillator();
      const vibGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(targetFreq, now);
      osc2.frequency.setValueAtTime(targetFreq * 1.003, now);

      vibOsc.type = "sine";
      vibOsc.frequency.setValueAtTime(5.8, now);
      vibGain.gain.setValueAtTime(5.5, now);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1150, now);
      filter.Q.setValueAtTime(1.1, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.08);

      vibOsc.connect(vibGain);
      vibGain.connect(osc1.frequency);
      vibGain.connect(osc2.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      vibOsc.start(now);

      this.violinOsc1 = osc1;
      this.violinOsc2 = osc2;
      this.vibratoOsc = vibOsc;
      this.vibratoGain = vibGain;
      this.violinFilter = filter;
      this.violinGain = gain;
    } else {
      this.violinOsc1.frequency.setTargetAtTime(targetFreq, now, 0.04);
      this.violinOsc2?.frequency.setTargetAtTime(targetFreq * 1.003, now, 0.04);
      // Increase vibrato sorrow as Toby approaches 100% termination
      this.vibratoGain?.gain.setTargetAtTime(4 + clamped * 6, now, 0.05);
      this.violinGain.gain.setTargetAtTime(0.08 + clamped * 0.06, now, 0.05);
    }
  }

  public stopSadViolin(): void {
    if (!this.ctx || !this.violinGain) return;
    const now = this.ctx.currentTime;
    try {
      this.violinGain.gain.cancelScheduledValues(now);
      this.violinGain.gain.setTargetAtTime(0.0001, now, 0.05);
      const o1 = this.violinOsc1;
      const o2 = this.violinOsc2;
      const vo = this.vibratoOsc;
      setTimeout(() => {
        try {
          o1?.stop();
          o2?.stop();
          vo?.stop();
          o1?.disconnect();
          o2?.disconnect();
          vo?.disconnect();
        } catch {
          // ignore already-stopped oscillators
        }
      }, 180);
    } catch {
      // ignore teardown errors
    } finally {
      this.violinOsc1 = null;
      this.violinOsc2 = null;
      this.vibratoOsc = null;
      this.vibratoGain = null;
      this.violinFilter = null;
      this.violinGain = null;
    }
  }
}

export const soundEngine = new ProceduralSoundEngine();
