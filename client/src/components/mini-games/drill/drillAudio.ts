const AudioCtxClass =
  typeof window !== "undefined"
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;

export class DrillAudio {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audioInitialized = false;
  private _isMuted = false;
  private pinkNoiseBuf: AudioBuffer | null = null;
  private gravelBuf: AudioBuffer | null = null;
  private drillNodes: {
    all: (OscillatorNode | AudioBufferSourceNode)[];
    pistonGain?: GainNode;
    metalGain?: GainNode;
    airGain?: GainNode;
    grindGain?: GainNode;
    subGain?: GainNode;
  } | null = null;
  private lastHitTime = 0;
  isDrilling = false;

  get isMuted() {
    return this._isMuted;
  }

  init() {
    if (this.audioInitialized || !AudioCtxClass) return;
    this.audioCtx = new AudioCtxClass();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(1, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);
    this.pinkNoiseBuf = this.createPinkNoiseBuffer(2);
    this.gravelBuf = this.createGravelBuffer(0.15);
    this.audioInitialized = true;
  }

  toggleMute(): boolean {
    this.init();
    this._isMuted = !this._isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.linearRampToValueAtTime(
        this._isMuted ? 0 : 1,
        this.audioCtx.currentTime + 0.05
      );
    }
    if (this._isMuted && this.drillNodes) {
      this.cleanupDrillNodes();
    }
    if (!this._isMuted && this.isDrilling && !this.drillNodes) {
      this.startDrillSound();
    }
    return this._isMuted;
  }

  startDrillSound() {
    if (!this.audioCtx || this._isMuted || this.drillNodes) return;
    const t = this.audioCtx.currentTime;
    const nodes: any = { all: [] };

    // Master softening LP — tames harsh highs across all layers
    const masterLP = this.audioCtx.createBiquadFilter();
    masterLP.type = "lowpass";
    masterLP.frequency.setValueAtTime(2800, t);
    masterLP.Q.setValueAtTime(0.4, t);
    masterLP.connect(this.masterGain!);

    // Layer 1: Pneumatic piston — softer triangle wave, mild distortion
    const pistonOsc = this.audioCtx.createOscillator();
    pistonOsc.type = "triangle";
    pistonOsc.frequency.setValueAtTime(30, t);
    const pistonLFO = this.audioCtx.createOscillator();
    pistonLFO.frequency.setValueAtTime(16, t); // slower rhythm, more realistic
    const pistonLFOGain = this.audioCtx.createGain();
    pistonLFOGain.gain.setValueAtTime(12, t);
    pistonLFO.connect(pistonLFOGain);
    pistonLFOGain.connect(pistonOsc.frequency);
    const pistonGain = this.audioCtx.createGain();
    pistonGain.gain.setValueAtTime(0, t);
    pistonGain.gain.linearRampToValueAtTime(0.045, t + 0.25); // slower fade-in, lower volume
    const pistonWS = this.audioCtx.createWaveShaper();
    pistonWS.curve = this.makeDistCurve(40); // much less distortion
    const pistonLP = this.audioCtx.createBiquadFilter();
    pistonLP.type = "lowpass";
    pistonLP.frequency.setValueAtTime(400, t);
    pistonLP.Q.setValueAtTime(0.5, t);
    pistonOsc.connect(pistonWS);
    pistonWS.connect(pistonLP);
    pistonLP.connect(pistonGain);
    pistonGain.connect(masterLP);
    pistonOsc.start(t);
    pistonLFO.start(t);
    nodes.all.push(pistonOsc, pistonLFO);
    nodes.pistonGain = pistonGain;

    // Layer 2: Body resonance — gentle triangle, narrower band
    const metalOsc = this.audioCtx.createOscillator();
    metalOsc.type = "triangle";
    metalOsc.frequency.setValueAtTime(140, t);
    const metalLFO = this.audioCtx.createOscillator();
    metalLFO.frequency.setValueAtTime(16, t);
    const metalLFOGain = this.audioCtx.createGain();
    metalLFOGain.gain.setValueAtTime(30, t);
    metalLFO.connect(metalLFOGain);
    metalLFOGain.connect(metalOsc.frequency);
    const metalBP = this.audioCtx.createBiquadFilter();
    metalBP.type = "bandpass";
    metalBP.frequency.setValueAtTime(280, t);
    metalBP.Q.setValueAtTime(2, t); // less resonant
    const metalGain = this.audioCtx.createGain();
    metalGain.gain.setValueAtTime(0, t);
    metalGain.gain.linearRampToValueAtTime(0.018, t + 0.2);
    metalOsc.connect(metalBP);
    metalBP.connect(metalGain);
    metalGain.connect(masterLP);
    metalOsc.start(t);
    metalLFO.start(t);
    nodes.all.push(metalOsc, metalLFO);
    nodes.metalGain = metalGain;

    // Layer 3: Air exhaust — softer, narrower band
    const airNoise = this.audioCtx.createBufferSource();
    airNoise.buffer = this.pinkNoiseBuf;
    airNoise.loop = true;
    const airHP = this.audioCtx.createBiquadFilter();
    airHP.type = "highpass";
    airHP.frequency.setValueAtTime(1800, t);
    airHP.Q.setValueAtTime(0.3, t);
    const airLP = this.audioCtx.createBiquadFilter();
    airLP.type = "lowpass";
    airLP.frequency.setValueAtTime(4500, t); // cut more highs
    const airGain = this.audioCtx.createGain();
    airGain.gain.setValueAtTime(0, t);
    airGain.gain.linearRampToValueAtTime(0.022, t + 0.3); // quieter, slower fade
    const airLFO = this.audioCtx.createOscillator();
    airLFO.frequency.setValueAtTime(16, t);
    const airLFOGain = this.audioCtx.createGain();
    airLFOGain.gain.setValueAtTime(0.008, t);
    airLFO.connect(airLFOGain);
    airLFOGain.connect(airGain.gain);
    airNoise.connect(airHP);
    airHP.connect(airLP);
    airLP.connect(airGain);
    airGain.connect(masterLP);
    airNoise.start(t);
    airLFO.start(t);
    nodes.all.push(airNoise, airLFO);
    nodes.airGain = airGain;

    // Layer 4: Stone contact texture — lower, warmer
    const grindNoise = this.audioCtx.createBufferSource();
    grindNoise.buffer = this.pinkNoiseBuf; // pink noise instead of white for warmth
    grindNoise.loop = true;
    const grindBP = this.audioCtx.createBiquadFilter();
    grindBP.type = "bandpass";
    grindBP.frequency.setValueAtTime(600, t); // lower center frequency
    grindBP.Q.setValueAtTime(0.8, t); // wider, less harsh
    const grindLP = this.audioCtx.createBiquadFilter();
    grindLP.type = "lowpass";
    grindLP.frequency.setValueAtTime(2000, t);
    const grindGain = this.audioCtx.createGain();
    grindGain.gain.setValueAtTime(0, t);
    grindGain.gain.linearRampToValueAtTime(0.025, t + 0.35);
    grindNoise.connect(grindBP);
    grindBP.connect(grindLP);
    grindLP.connect(grindGain);
    grindGain.connect(masterLP);
    grindNoise.start(t);
    nodes.all.push(grindNoise);
    nodes.grindGain = grindGain;

    // Layer 5: Sub bass rumble — gentle body vibration
    const subOsc = this.audioCtx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(24, t);
    const subGain = this.audioCtx.createGain();
    subGain.gain.setValueAtTime(0, t);
    subGain.gain.linearRampToValueAtTime(0.05, t + 0.2);
    subOsc.connect(subGain);
    subGain.connect(masterLP);
    subOsc.start(t);
    nodes.all.push(subOsc);
    nodes.subGain = subGain;

    this.drillNodes = nodes;
  }

  stopDrillSound() {
    if (!this.audioCtx || !this.drillNodes) return;
    const t = this.audioCtx.currentTime;
    const gains = [
      this.drillNodes.pistonGain,
      this.drillNodes.metalGain,
      this.drillNodes.airGain,
      this.drillNodes.grindGain,
      this.drillNodes.subGain,
    ];
    gains.forEach((g) => {
      if (g) {
        try {
          g.gain.cancelScheduledValues(t);
          g.gain.linearRampToValueAtTime(0, t + 0.08);
        } catch (_) {}
      }
    });
    const nodesToClean = this.drillNodes;
    this.drillNodes = null;
    setTimeout(() => this.cleanupNodes(nodesToClean), 120);
  }

  playHitSound() {
    if (!this.audioCtx || this._isMuted) return;
    const t = this.audioCtx.currentTime;
    if (t - this.lastHitTime < 0.055) return;
    this.lastHitTime = t;

    // 1) Heavy impact body — the "chunk" of metal hitting stone
    //    Two sine layers pitched down fast = meaty thump
    const impactFreq = 110 + Math.random() * 30;
    const impact = this.audioCtx.createOscillator();
    impact.type = "sine";
    impact.frequency.setValueAtTime(impactFreq, t);
    impact.frequency.exponentialRampToValueAtTime(35, t + 0.06);
    const impactGain = this.audioCtx.createGain();
    impactGain.gain.setValueAtTime(0.18, t);
    impactGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    impact.connect(impactGain);
    impactGain.connect(this.masterGain!);
    impact.start(t);
    impact.stop(t + 0.12);

    // 2) Mid-body resonance — gives the hit "weight" and stone character
    const body = this.audioCtx.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(200 + Math.random() * 40, t);
    body.frequency.exponentialRampToValueAtTime(80, t + 0.05);
    const bodyGain = this.audioCtx.createGain();
    bodyGain.gain.setValueAtTime(0.07, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    body.connect(bodyGain);
    bodyGain.connect(this.masterGain!);
    body.start(t);
    body.stop(t + 0.09);

    // 3) Stone crumble texture — short burst of filtered noise
    //    Sounds like bits of rock chipping off
    const crumble = this.audioCtx.createBufferSource();
    crumble.buffer = this.pinkNoiseBuf;
    const crumbleLP = this.audioCtx.createBiquadFilter();
    crumbleLP.type = "lowpass";
    crumbleLP.frequency.setValueAtTime(1800 + Math.random() * 400, t);
    crumbleLP.Q.setValueAtTime(0.6, t);
    const crumbleHP = this.audioCtx.createBiquadFilter();
    crumbleHP.type = "highpass";
    crumbleHP.frequency.setValueAtTime(200, t);
    const crumbleGain = this.audioCtx.createGain();
    crumbleGain.gain.setValueAtTime(0, t);
    crumbleGain.gain.linearRampToValueAtTime(0.08, t + 0.005); // tiny attack
    crumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    crumble.connect(crumbleHP);
    crumbleHP.connect(crumbleLP);
    crumbleLP.connect(crumbleGain);
    crumbleGain.connect(this.masterGain!);
    crumble.start(t);
    crumble.stop(t + 0.11);

    // 4) Gritty tail — very short gravel rattle after impact
    const tail = this.audioCtx.createBufferSource();
    tail.buffer = this.gravelBuf;
    const tailLP = this.audioCtx.createBiquadFilter();
    tailLP.type = "lowpass";
    tailLP.frequency.setValueAtTime(1200, t + 0.015);
    const tailGain = this.audioCtx.createGain();
    tailGain.gain.setValueAtTime(0, t);
    tailGain.gain.linearRampToValueAtTime(0.04, t + 0.015);
    tailGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    tail.connect(tailLP);
    tailLP.connect(tailGain);
    tailGain.connect(this.masterGain!);
    tail.start(t);
    tail.stop(t + 0.1);
  }

  playCoinPopSound() {
    if (!this.audioCtx || this._isMuted) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    const g = this.audioCtx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.14);

    const sh = this.audioCtx.createOscillator();
    sh.type = "triangle";
    sh.frequency.setValueAtTime(4000, t);
    const sg = this.audioCtx.createGain();
    sg.gain.setValueAtTime(0.02, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    sh.connect(sg);
    sg.connect(this.masterGain!);
    sh.start(t);
    sh.stop(t + 0.08);
  }

  playCoinCollectSound() {
    if (!this.audioCtx || this._isMuted) return;
    const t = this.audioCtx.currentTime;
    [880, 1175, 1568].forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.05);
      const g = this.audioCtx!.createGain();
      g.gain.setValueAtTime(0.07, t + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.18);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.2);
    });
  }

  playRockBreakSound() {
    if (!this.audioCtx || this._isMuted) return;
    const t = this.audioCtx.currentTime;

    // Initial crack — softer transient
    const crack = this.audioCtx.createBufferSource();
    crack.buffer = this.pinkNoiseBuf;
    const crackBP = this.audioCtx.createBiquadFilter();
    crackBP.type = "bandpass";
    crackBP.frequency.setValueAtTime(1200, t);
    crackBP.Q.setValueAtTime(1, t);
    const crackGain = this.audioCtx.createGain();
    crackGain.gain.setValueAtTime(0.12, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    crack.connect(crackBP);
    crackBP.connect(crackGain);
    crackGain.connect(this.masterGain!);
    crack.start(t);
    crack.stop(t + 0.08);

    // Deep bass boom — gentler
    const boom = this.audioCtx.createOscillator();
    boom.type = "sine";
    boom.frequency.setValueAtTime(50, t + 0.01);
    boom.frequency.exponentialRampToValueAtTime(15, t + 0.4);
    const boomGain = this.audioCtx.createGain();
    boomGain.gain.setValueAtTime(0.15, t + 0.01);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    boom.connect(boomGain);
    boomGain.connect(this.masterGain!);
    boom.start(t);
    boom.stop(t + 0.5);

    // Rock avalanche cascade — warmer
    const rockfall = this.audioCtx.createBufferSource();
    rockfall.buffer = this.pinkNoiseBuf;
    const rfLP = this.audioCtx.createBiquadFilter();
    rfLP.type = "lowpass";
    rfLP.frequency.setValueAtTime(1800, t + 0.02);
    rfLP.frequency.exponentialRampToValueAtTime(300, t + 0.5);
    const rfGain = this.audioCtx.createGain();
    rfGain.gain.setValueAtTime(0.09, t + 0.02);
    rfGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    rockfall.connect(rfLP);
    rfLP.connect(rfGain);
    rfGain.connect(this.masterGain!);
    rockfall.start(t);
    rockfall.stop(t + 0.6);

    // Fewer debris crackles, softer
    for (let i = 0; i < 3; i++) {
      const delay = 0.04 + i * 0.06 + Math.random() * 0.03;
      const deb = this.audioCtx.createBufferSource();
      deb.buffer = this.gravelBuf;
      const debBP = this.audioCtx.createBiquadFilter();
      debBP.type = "bandpass";
      debBP.frequency.setValueAtTime(600 + Math.random() * 1200, t + delay);
      debBP.Q.setValueAtTime(1.5, t);
      const debGain = this.audioCtx.createGain();
      debGain.gain.setValueAtTime(0.04, t + delay);
      debGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
      deb.connect(debBP);
      debBP.connect(debGain);
      debGain.connect(this.masterGain!);
      deb.start(t + delay);
      deb.stop(t + delay + 0.12);
    }

    // Stone resonance — quieter
    [100, 180].forEach((freq) => {
      const res = this.audioCtx!.createOscillator();
      res.type = "sine";
      res.frequency.setValueAtTime(freq, t + 0.01);
      res.frequency.exponentialRampToValueAtTime(freq * 0.3, t + 0.3);
      const rg = this.audioCtx!.createGain();
      rg.gain.setValueAtTime(0.025, t + 0.01);
      rg.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      res.connect(rg);
      rg.connect(this.masterGain!);
      res.start(t);
      res.stop(t + 0.3);
    });
  }

  playCrackSound() {
    if (!this.audioCtx || this._isMuted) return;
    const t = this.audioCtx.currentTime;
    const snap = this.audioCtx.createBufferSource();
    snap.buffer = this.gravelBuf;
    const snapBP = this.audioCtx.createBiquadFilter();
    snapBP.type = "bandpass";
    snapBP.frequency.setValueAtTime(800 + Math.random() * 600, t);
    snapBP.Q.setValueAtTime(1.5, t);
    const snapGain = this.audioCtx.createGain();
    snapGain.gain.setValueAtTime(0.055, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    snap.connect(snapBP);
    snapBP.connect(snapGain);
    snapGain.connect(this.masterGain!);
    snap.start(t);
    snap.stop(t + 0.09);
  }

  playLevelUpSound() {
    if (!this.audioCtx || this._isMuted) return;
    const t = this.audioCtx.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      const g = this.audioCtx!.createGain();
      g.gain.setValueAtTime(0.09, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.35);
    });
  }

  playRockEmergeSound() {
    if (!this.audioCtx || this._isMuted) return;
    const t = this.audioCtx.currentTime;

    const rumble = this.audioCtx.createOscillator();
    rumble.type = "sine";
    rumble.frequency.setValueAtTime(25, t);
    rumble.frequency.linearRampToValueAtTime(50, t + 0.3);
    rumble.frequency.linearRampToValueAtTime(30, t + 0.6);
    const rGain = this.audioCtx.createGain();
    rGain.gain.setValueAtTime(0, t);
    rGain.gain.linearRampToValueAtTime(0.12, t + 0.15);
    rGain.gain.linearRampToValueAtTime(0.06, t + 0.4);
    rGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    rumble.connect(rGain);
    rGain.connect(this.masterGain!);
    rumble.start(t);
    rumble.stop(t + 0.75);

    const grind = this.audioCtx.createBufferSource();
    grind.buffer = this.pinkNoiseBuf;
    const gLP = this.audioCtx.createBiquadFilter();
    gLP.type = "lowpass";
    gLP.frequency.setValueAtTime(300, t);
    gLP.frequency.linearRampToValueAtTime(1500, t + 0.4);
    gLP.frequency.linearRampToValueAtTime(600, t + 0.7);
    const gGain = this.audioCtx.createGain();
    gGain.gain.setValueAtTime(0, t);
    gGain.gain.linearRampToValueAtTime(0.08, t + 0.2);
    gGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    grind.connect(gLP);
    gLP.connect(gGain);
    gGain.connect(this.masterGain!);
    grind.start(t);
    grind.stop(t + 0.7);
  }

  destroy() {
    this.cleanupDrillNodes();
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (_) {}
    }
    this.audioCtx = null;
    this.masterGain = null;
  }

  private createPinkNoiseBuffer(duration: number): AudioBuffer {
    const sr = this.audioCtx!.sampleRate;
    const len = sr * duration;
    const buf = this.audioCtx!.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    return buf;
  }

  private createGravelBuffer(duration: number): AudioBuffer {
    const sr = this.audioCtx!.sampleRate;
    const len = sr * duration;
    const buf = this.audioCtx!.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.exp(-i / (sr * 0.03));
      const crackle = Math.random() > 0.7 ? Math.random() * 2 - 1 : 0;
      const base = Math.random() * 2 - 1;
      d[i] = (base * 0.3 + crackle * 0.7) * env;
    }
    return buf;
  }

  private makeDistCurve(amount: number): Float32Array<ArrayBuffer> {
    const n = 256;
    const curve = new Float32Array(new ArrayBuffer(n * 4));
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  private cleanupDrillNodes() {
    if (!this.drillNodes) return;
    const nodes = this.drillNodes;
    this.drillNodes = null;
    this.cleanupNodes(nodes);
  }

  private cleanupNodes(nodes: any) {
    if (!nodes) return;
    nodes.all.forEach((n: any) => {
      try {
        n.stop();
        n.disconnect();
      } catch (_) {}
    });
  }
}
