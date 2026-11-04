import { G } from "./uniforms";

/** Generative spatial audio engine — pure Web Audio, zero assets. */
class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  filter: BiquadFilterNode | null = null;
  panner: StereoPannerNode | null = null;
  on = false;

  init() {
    if (this.ctx) return;
    const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.panner = this.ctx.createStereoPanner();

    // --- infinite sub-aquatic drone ---
    const oscA = this.ctx.createOscillator();
    oscA.type = "sine"; oscA.frequency.value = 54;
    const oscB = this.ctx.createOscillator();
    oscB.type = "sine"; oscB.frequency.value = 81.3;
    const oscC = this.ctx.createOscillator();
    oscC.type = "triangle"; oscC.frequency.value = 27;
    const droneGain = this.ctx.createGain(); droneGain.gain.value = 0.16;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass"; this.filter.frequency.value = 160; this.filter.Q.value = 6;

    oscA.connect(droneGain); oscB.connect(droneGain); oscC.connect(droneGain);
    droneGain.connect(this.filter);
    this.filter.connect(this.panner);
    this.panner.connect(this.master);
    this.master.connect(this.ctx.destination);
    oscA.start(); oscB.start(); oscC.start();

    // LFO breathing on filter
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.05;
    const lfoGain = this.ctx.createGain(); lfoGain.gain.value = 55;
    lfo.connect(lfoGain); lfoGain.connect(this.filter.frequency); lfo.start();

    this.loop();
  }

  loop = () => {
    requestAnimationFrame(this.loop);
    if (!this.ctx || !this.filter || !this.panner) return;
    // scroll distance modulates filter cutoff
    const target = 120 + G.scroll * 780 + Math.min(Math.abs(G.scrollVel) * 4000, 400);
    this.filter.frequency.value += (target - this.filter.frequency.value) * 0.05;
    // camera-linked panner drift
    this.panner.pan.value += ((G.mouse.x * 0.6) - this.panner.pan.value) * 0.03;
  };

  toggle(next?: boolean): boolean {
    this.init();
    if (!this.ctx || !this.master) return false;
    this.on = next !== undefined ? next : !this.on;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.linearRampToValueAtTime(this.on ? 0.075 : 0, t + 0.4);
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.on;
  }

  blip(freq = 880, dur = 0.05, vol = 0.08, type: OscillatorType = "square") {
    if (!this.ctx || !this.master || !this.on) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  transmit() {
    // data-package launch: rising sweep + ping
    this.blip(1200, 0.3, 0.1, "sawtooth");
    setTimeout(() => this.blip(1800, 0.18, 0.09, "square"), 120);
    setTimeout(() => this.blip(2400, 0.12, 0.07, "sine"), 240);
  }

  fracture() {
    if (!this.ctx || !this.master || !this.on) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sawtooth";
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 1.4);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 1.7);
  }
}

export const audio = new AudioEngine();
