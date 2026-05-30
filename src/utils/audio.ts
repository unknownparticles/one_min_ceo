// Web Audio API Retro Chiptune Synthesizer

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmNodes: {
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    gain: GainNode;
    intervalId: any;
  } | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playBGM(style: string) {
    if (this.isMuted) return;
    this.stopBGM();
    this.initCtx();

    if (!this.ctx) return;

    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Dynamic Chiptune Melody loop
    let notes: number[] = [60, 64, 67, 71]; // Cmaj7
    let speed = 250; // beats in ms

    if (style.includes("jazz") || style.includes("corporate")) {
      notes = [57, 60, 64, 67, 59, 62, 66, 69]; // Am7, Bm7
      speed = 300;
    } else if (style.includes("yacht") || style.includes("relax")) {
      notes = [60, 62, 65, 67, 69, 72]; // Pentatonic calm
      speed = 400;
    } else if (style.includes("alpine") || style.includes("speed")) {
      notes = [60, 58, 63, 65, 68, 70]; // Upbeat techno
      speed = 180;
    } else if (style.includes("space") || style.includes("ambient")) {
      notes = [50, 57, 62, 69, 74]; // Deep drone chords
      speed = 800;
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();

    osc1.type = style.includes("speed") ? "sawtooth" : "triangle";
    osc2.type = "sine";

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    const bgmGain = ctx.createGain();
    bgmGain.gain.setValueAtTime(0.4, ctx.currentTime);

    // Pipe
    osc1.connect(bgmGain);
    osc2.connect(bgmGain);
    bgmGain.connect(filter);
    filter.connect(masterGain);

    osc1.start();
    osc2.start();

    let step = 0;
    const intervalId = setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state === "suspended") return;
      const now = ctx.currentTime;
      const n1 = notes[step % notes.length];
      const n2 = notes[(step + 2) % notes.length] - 12; // lower octave harmony

      // Frequencies
      const f1 = 440 * Math.pow(2, (n1 - 69) / 12);
      const f2 = 440 * Math.pow(2, (n2 - 69) / 12);

      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);

      // Simple decay envelope
      bgmGain.gain.setValueAtTime(0.4, now);
      bgmGain.gain.exponentialRampToValueAtTime(0.08, now + (speed / 1000) * 0.9);

      step++;
    }, speed);

    this.bgmNodes = {
      osc1,
      osc2,
      gain: bgmGain,
      intervalId,
    };
  }

  stopBGM() {
    if (this.bgmNodes) {
      try {
        clearInterval(this.bgmNodes.intervalId);
        this.bgmNodes.osc1.stop();
        this.bgmNodes.osc2.stop();
      } catch (e) {
        // Already stopped
      }
      this.bgmNodes = null;
    }
  }

  playSound(cue: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (cue === "bling" || cue === "collect") {
      // Ascending coin pick-up (8-bit style)
      osc.type = "square";
      gain.gain.setValueAtTime(0.08, now);
      osc.frequency.setValueAtTime(523.25, now); // C5
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "square";
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);
      osc.stop(now + 0.15);

    } else if (cue === "laser" || cue === "scifi_laser") {
      // Rapid frequency down sweep
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.1, now);
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);

    } else if (cue === "explosion" || cue === "bomb") {
      // Noise/low rumble explosion
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.2, now);
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);

    } else if (cue === "dog_bark" || cue === "bark") {
      // Brief square pulse double bark
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.12, now);
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "triangle";
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      osc2.frequency.setValueAtTime(130, now + 0.12);
      osc2.frequency.linearRampToValueAtTime(250, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.2);

    } else if (cue === "drink" || cue === "slurp") {
      // Frequency bubbling
      osc.type = "sine";
      gain.gain.setValueAtTime(0.1, now);
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(600, now + 0.05);
      osc.frequency.setValueAtTime(450, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);

    } else if (cue === "alert" || cue === "warn") {
      // Classic siren toggle
      osc.type = "square";
      gain.gain.setValueAtTime(0.08, now);
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);

    } else if (cue === "bump" || cue === "error") {
      // Low thud
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.15, now);
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);

    } else if (cue === "walk") {
      // Very short high click
      osc.type = "sine";
      gain.gain.setValueAtTime(0.02, now);
      osc.frequency.setValueAtTime(1500, now);
      gain.gain.setValueAtTime(0.01, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else {
      // Generic positive cue
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, now);
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }
}

export const audio = new AudioEngine();
