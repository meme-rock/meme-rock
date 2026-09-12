import * as PIXI from "pixi.js";
import { DrillAudio } from "./drillAudio";
import { createSpritesheet } from "./createSpritesheet";
import {
  DrillEngineConfig,
  DrillReward,
  calculateDamage,
  RockColorPalette,
  ROCK_PALETTES,
} from "./drillTypes";
import type { RockSequenceItem } from "../../../redux/services/mini-game/responses";

export interface DrillCallbacks {
  onRockSmashed: (index: number, rewards: DrillReward[]) => void;
  onGameOver: () => void;
  onHPChange: (hp: number, maxHP: number) => void;
  onHideHint: () => void;
}

// Rock polygon vertices
const rockVertices = [
  { x: -85, y: 20 },
  { x: -75, y: -30 },
  { x: -55, y: -55 },
  { x: -25, y: -70 },
  { x: 10, y: -75 },
  { x: 45, y: -68 },
  { x: 70, y: -50 },
  { x: 85, y: -25 },
  { x: 90, y: 15 },
  { x: 80, y: 50 },
  { x: 55, y: 70 },
  { x: 20, y: 75 },
  { x: -20, y: 72 },
  { x: -55, y: 60 },
  { x: -78, y: 40 },
];

// Crack network data
const crackNetwork = [
  {
    threshold: 0.85,
    segments: [
      [
        { x: 5, y: -75 },
        { x: -2, y: -50 },
        { x: 8, y: -30 },
        { x: 0, y: -10 },
      ],
    ],
  },
  {
    threshold: 0.75,
    segments: [
      [
        { x: 40, y: -65 },
        { x: 25, y: -40 },
        { x: 35, y: -15 },
      ],
      [
        { x: 25, y: -40 },
        { x: 45, y: -30 },
      ],
    ],
  },
  {
    threshold: 0.6,
    segments: [
      [
        { x: -70, y: -20 },
        { x: -45, y: -10 },
        { x: -25, y: 5 },
        { x: -10, y: -5 },
      ],
      [
        { x: -45, y: -10 },
        { x: -50, y: 15 },
      ],
    ],
  },
  {
    threshold: 0.45,
    segments: [
      [
        { x: 0, y: -10 },
        { x: 15, y: 20 },
        { x: 5, y: 45 },
      ],
      [
        { x: 0, y: -10 },
        { x: -20, y: 15 },
        { x: -35, y: 35 },
      ],
      [
        { x: 0, y: -10 },
        { x: 30, y: 5 },
        { x: 55, y: 15 },
      ],
    ],
  },
  {
    threshold: 0.3,
    segments: [
      [
        { x: -30, y: 35 },
        { x: -5, y: 50 },
        { x: 20, y: 45 },
        { x: 40, y: 55 },
      ],
      [
        { x: -5, y: 50 },
        { x: -10, y: 70 },
      ],
      [
        { x: 20, y: 45 },
        { x: 25, y: 68 },
      ],
    ],
  },
  {
    threshold: 0.15,
    segments: [
      [
        { x: -60, y: 10 },
        { x: -30, y: 0 },
        { x: 0, y: -10 },
      ],
      [
        { x: 55, y: 15 },
        { x: 70, y: 35 },
        { x: 60, y: 55 },
      ],
      [
        { x: 35, y: -15 },
        { x: 15, y: 20 },
      ],
      [
        { x: -78, y: 40 },
        { x: -55, y: 35 },
        { x: -35, y: 35 },
      ],
    ],
  },
];

function isPointInRock(px: number, py: number): boolean {
  return (px * px) / (85 * 85) + (py * py) / (72 * 72) < 1;
}

function drawRockPoly(g: PIXI.Graphics, offX: number, offY: number) {
  g.moveTo(rockVertices[0].x + offX, rockVertices[0].y + offY);
  for (let i = 1; i < rockVertices.length; i++) {
    g.lineTo(rockVertices[i].x + offX, rockVertices[i].y + offY);
  }
  g.closePath();
}

function drawRockPolyScaled(g: PIXI.Graphics, scale: number, offY: number) {
  g.moveTo(rockVertices[0].x * scale, rockVertices[0].y * scale + offY);
  for (let i = 1; i < rockVertices.length; i++) {
    g.lineTo(rockVertices[i].x * scale, rockVertices[i].y * scale + offY);
  }
  g.closePath();
}

export class DrillEngine {
  private app!: PIXI.Application;
  private audio: DrillAudio;
  private callbacks: DrillCallbacks;
  private destroyed = false;
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  // PIXI objects
  private gameContainer!: PIXI.Container;
  private rockContainer!: PIXI.Container;
  private rockBody!: PIXI.Graphics;
  private crackOverlay!: PIXI.Graphics;
  private drillSprite!: PIXI.AnimatedSprite;
  private hpBarBg!: PIXI.Graphics;
  private hpBarFill!: PIXI.Graphics;
  private impactFlash!: PIXI.Graphics;

  // Textures
  private drillFrames: PIXI.Texture[] = [];
  private coinFrames: PIXI.Texture[] = [];
  private debrisFrames: PIXI.Texture[] = [];

  // Game state
  private rockHP = 80;
  private maxRockHP = 80;
  private isDrilling = false;
  private drillPower = 1;
  private combo = 0;
  private screenShake = 0;
  private drillTimer = 0;
  private drillTickThreshold = 3;
  private rockEmerging = false;
  private rockEmergeProgress = 1;
  private lastCrackLevel = 0;
  private gameOver = false;

  // Rock sequence from server
  private rockSequence: RockSequenceItem[] = [];
  private currentRockIndex = 0;
  private currentPalette: RockColorPalette = ROCK_PALETTES.COMMON;

  // Particle arrays
  private particles: any[] = [];
  private coins: any[] = [];
  private floatingTexts: any[] = [];
  private crackDustParticles: any[] = [];
  private rockFragments: any[] = [];

  // Constants
  private APP_W: number;
  private APP_H: number;
  private ROCK_X: number;
  private ROCK_Y: number;

  // Bound event handlers
  private boundOnDown: (e: Event) => void;
  private boundOnUp: (e: Event) => void;
  private canvas: HTMLCanvasElement | null = null;

  constructor(
    container: HTMLElement,
    callbacks: DrillCallbacks,
    config: DrillEngineConfig,
    rockSequence: RockSequenceItem[]
  ) {
    this.callbacks = callbacks;
    this.audio = new DrillAudio();
    this.rockSequence = rockSequence;

    this.APP_W = Math.min(container.clientWidth || window.innerWidth, 800);
    this.APP_H = container.clientHeight || window.innerHeight;
    this.ROCK_X = this.APP_W / 2;
    this.ROCK_Y = this.APP_H * 0.58;

    this.drillPower = config.drillPower;
    this.drillTickThreshold = Math.max(1, 3 - config.comboSpeed);

    // Set initial rock from sequence
    if (this.rockSequence.length > 0) {
      const firstRock = this.rockSequence[0];
      this.rockHP = firstRock.hp;
      this.maxRockHP = firstRock.hp;
      this.currentPalette = ROCK_PALETTES[firstRock.type] || ROCK_PALETTES.COMMON;
    }

    this.boundOnDown = this.onDown.bind(this);
    this.boundOnUp = this.onUp.bind(this);

    this.init(container);
  }

  // Public methods
  updateConfig(config: DrillEngineConfig) {
    this.drillPower = config.drillPower;
    this.drillTickThreshold = Math.max(1, 3 - config.comboSpeed);
  }

  setRockSequence(sequence: RockSequenceItem[]) {
    this.rockSequence = sequence;
    this.currentRockIndex = 0;
    if (sequence.length > 0) {
      const firstRock = sequence[0];
      this.rockHP = firstRock.hp;
      this.maxRockHP = firstRock.hp;
      this.currentPalette = ROCK_PALETTES[firstRock.type] || ROCK_PALETTES.COMMON;
    }
  }

  resumeGame() {
    this.gameOver = false;
    if (!this.rockContainer.visible && !this.rockEmerging) {
      this.spawnNewRock();
    }
  }

  private spawnNewRock() {
    if (this.currentRockIndex >= this.rockSequence.length) {
      this.gameOver = true;
      this.callbacks.onGameOver();
      return;
    }

    const rock = this.rockSequence[this.currentRockIndex];
    this.maxRockHP = rock.hp;
    this.rockHP = rock.hp;
    this.lastCrackLevel = 0;
    this.currentPalette = ROCK_PALETTES[rock.type] || ROCK_PALETTES.COMMON;
    this.updateHPBar();
    this.callbacks.onHPChange(this.rockHP, this.maxRockHP);
    this.audio.playRockEmergeSound();

    this.rockContainer.visible = true;
    this.rockContainer.alpha = 0;
    this.rockContainer.y = this.ROCK_Y + 120;
    this.rockContainer.scale.set(0.3);
    this.rockEmerging = true;
    this.rockEmergeProgress = 0;

    this.drawRockBody(0);
    this.crackOverlay.clear();

    for (let i = 0; i < 10; i++) {
      const dt = setTimeout(() => {
        if (this.destroyed) return;
        this.spawnDebris(
          this.ROCK_X + (Math.random() - 0.5) * 120,
          this.ROCK_Y + 50,
          1
        );
        this.spawnCrackDust(
          this.ROCK_X + (Math.random() - 0.5) * 100,
          this.ROCK_Y + 60
        );
      }, i * 40);
      this.timeouts.push(dt);
    }
  }

  private init(container: HTMLElement) {
    this.app = new PIXI.Application({
      width: this.APP_W,
      height: this.APP_H,
      backgroundColor: 0x0a0e1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    container.appendChild(this.app.view as HTMLCanvasElement);
    this.canvas = this.app.view as HTMLCanvasElement;
    this.canvas.style.display = "block";
    this.canvas.style.cursor = "pointer";

    const sheetCanvas = createSpritesheet();
    const sheetTexture = PIXI.Texture.from(sheetCanvas);
    const baseTexture = sheetTexture.baseTexture;

    const getFrames = (row: number, count: number, size = 160) => {
      const frames: PIXI.Texture[] = [];
      for (let i = 0; i < count; i++) {
        const rect = new PIXI.Rectangle(i * size, row * size, size, size);
        frames.push(new PIXI.Texture(baseTexture, rect));
      }
      return frames;
    };

    this.drillFrames = getFrames(0, 4);
    this.coinFrames = getFrames(2, 4);
    this.debrisFrames = getFrames(3, 4);

    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);

    this.drawBackground();
    this.initRock();
    this.initHPBar();
    this.initDrill();
    this.initImpactFlash();
    this.setupInput();
    this.startGameLoop();

    this.callbacks.onHPChange(this.rockHP, this.maxRockHP);
  }

  private drawBackground() {
    const bgGfx = new PIXI.Graphics();
    bgGfx.beginFill(0x0a0e1a);
    bgGfx.drawRect(0, 0, this.APP_W, this.APP_H * 0.4);
    bgGfx.endFill();
    bgGfx.beginFill(0x152238);
    bgGfx.drawRect(0, this.APP_H * 0.35, this.APP_W, this.APP_H * 0.65);
    bgGfx.endFill();

    bgGfx.lineStyle(3, 0x3a5a80, 0.5);
    bgGfx.moveTo(0, this.APP_H * 0.55);
    bgGfx.lineTo(this.APP_W, this.APP_H * 0.55);

    for (let i = 0; i < 5; i++) {
      const y = this.APP_H * 0.55 + i * 50;
      bgGfx.lineStyle(1, 0x2a3a50, 0.2);
      bgGfx.moveTo(0, y);
      bgGfx.lineTo(this.APP_W, y);
    }

    bgGfx.lineStyle(0);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.APP_W;
      const y = this.APP_H * 0.6 + Math.random() * this.APP_H * 0.4;
      bgGfx.beginFill(0x2a4060, 0.3);
      bgGfx.drawCircle(x, y, 2 + Math.random() * 4);
      bgGfx.endFill();
    }

    this.gameContainer.addChild(bgGfx);
  }

  private initRock() {
    this.rockContainer = new PIXI.Container();
    this.rockContainer.x = this.ROCK_X;
    this.rockContainer.y = this.ROCK_Y;
    this.gameContainer.addChild(this.rockContainer);

    this.rockBody = new PIXI.Graphics();
    this.rockContainer.addChild(this.rockBody);

    this.crackOverlay = new PIXI.Graphics();
    this.rockContainer.addChild(this.crackOverlay);

    this.drawRockBody(0);
  }

  private drawRockBody(dmgPct: number) {
    const p = this.currentPalette;
    this.rockBody.clear();

    // Ground shadow
    this.rockBody.beginFill(0x000000, 0.2);
    this.rockBody.drawEllipse(0, 78, 92, 18);
    this.rockBody.endFill();
    this.rockBody.beginFill(0x000000, 0.1);
    this.rockBody.drawEllipse(0, 80, 100, 22);
    this.rockBody.endFill();

    // Layer 1: Deepest shadow
    this.rockBody.beginFill(p.shadow);
    this.rockBody.moveTo(rockVertices[0].x + 4, rockVertices[0].y + 5);
    for (let i = 1; i < rockVertices.length; i++) {
      this.rockBody.lineTo(rockVertices[i].x + 4, rockVertices[i].y + 5);
    }
    this.rockBody.closePath();
    this.rockBody.endFill();

    // Layer 2: Dark base
    this.rockBody.beginFill(p.darkBase);
    drawRockPoly(this.rockBody, 0, 0);
    this.rockBody.endFill();

    // Layer 3: Mid-tone
    this.rockBody.beginFill(p.midTone);
    drawRockPolyScaled(this.rockBody, 0.95, -1);
    this.rockBody.endFill();

    // Layer 4: Upper surface
    this.rockBody.beginFill(p.upperSurface);
    drawRockPolyScaled(this.rockBody, 0.85, -3);
    this.rockBody.endFill();

    // Layer 5: Top highlight
    this.rockBody.beginFill(p.topHighlight, 0.7);
    drawRockPolyScaled(this.rockBody, 0.65, -8);
    this.rockBody.endFill();

    // Specular highlights
    this.rockBody.beginFill(p.specular1, 0.4);
    this.rockBody.drawEllipse(-22, -38, 35, 16);
    this.rockBody.endFill();
    this.rockBody.beginFill(p.specular2, 0.25);
    this.rockBody.drawEllipse(-18, -42, 20, 9);
    this.rockBody.endFill();
    this.rockBody.beginFill(p.specular3, 0.12);
    this.rockBody.drawEllipse(-15, -44, 10, 5);
    this.rockBody.endFill();

    // Sediment striations
    this.rockBody.lineStyle(1.2, 0x28354a, 0.35);
    for (let s = 0; s < 5; s++) {
      const sy = -45 + s * 25;
      this.rockBody.moveTo(-65, sy);
      for (let x = -60; x <= 65; x += 10) {
        const wiggle = Math.sin(x * 0.08 + s * 1.5) * 4;
        if (isPointInRock(x, sy + wiggle)) {
          this.rockBody.lineTo(x, sy + wiggle);
        }
      }
    }

    // Texture bumps
    this.rockBody.lineStyle(0);
    for (let i = 0; i < 20; i++) {
      const a = (((42 + i * 137.5) % 360) * Math.PI) / 180;
      const r = 15 + ((i * 19) % 50);
      const bx = Math.cos(a) * r * 0.9;
      const by = Math.sin(a) * r * 0.75;
      if (!isPointInRock(bx, by)) continue;
      const bs = 3 + (i % 5) * 2.5;
      if (i % 3 === 0) {
        this.rockBody.beginFill(p.topHighlight, 0.3);
        this.rockBody.drawEllipse(bx, by - 1, bs, bs * 0.6);
        this.rockBody.endFill();
        this.rockBody.beginFill(p.midTone, 0.2);
        this.rockBody.drawEllipse(bx, by + 1, bs, bs * 0.5);
        this.rockBody.endFill();
      } else {
        this.rockBody.beginFill(p.darkBase, 0.25);
        this.rockBody.drawEllipse(bx, by, bs * 0.8, bs * 0.5);
        this.rockBody.endFill();
      }
    }

    // Mineral veins
    this.rockBody.lineStyle(3, p.vein1, 0.45);
    this.rockBody.moveTo(-40, -35);
    this.rockBody.quadraticCurveTo(-25, -15, -28, 10);
    this.rockBody.quadraticCurveTo(-30, 30, -18, 52);
    this.rockBody.lineStyle(2, p.vein2, 0.35);
    this.rockBody.moveTo(-25, -15);
    this.rockBody.quadraticCurveTo(-10, -8, -5, 10);
    this.rockBody.lineStyle(1.2, p.vein3, 0.3);
    this.rockBody.moveTo(-10, -8);
    this.rockBody.quadraticCurveTo(0, -15, 10, -20);

    this.rockBody.lineStyle(2.5, p.vein1, 0.4);
    this.rockBody.moveTo(35, -50);
    this.rockBody.quadraticCurveTo(42, -25, 30, 0);
    this.rockBody.quadraticCurveTo(20, 20, 35, 45);
    this.rockBody.lineStyle(1.8, p.vein2, 0.3);
    this.rockBody.moveTo(42, -25);
    this.rockBody.quadraticCurveTo(55, -15, 60, 5);
    this.rockBody.lineStyle(1, p.vein3, 0.25);
    this.rockBody.moveTo(30, 0);
    this.rockBody.quadraticCurveTo(15, 8, 5, 5);

    this.rockBody.lineStyle(1.5, p.vein3, 0.3);
    this.rockBody.moveTo(-60, 0);
    this.rockBody.quadraticCurveTo(-40, 12, -20, 8);

    // Crystal clusters
    this.rockBody.lineStyle(0);
    const crystals = [
      { x: -28, y: -5, s: 8, rot: -0.3 },
      { x: 32, y: -22, s: 7, rot: 0.2 },
      { x: -12, y: 38, s: 6, rot: -0.1 },
      { x: 55, y: 8, s: 5, rot: 0.4 },
      { x: -52, y: 22, s: 5, rot: -0.5 },
      { x: 15, y: -52, s: 4, rot: 0.1 },
      { x: 0, y: 15, s: 4, rot: 0.3 },
    ];
    crystals.forEach((cr) => {
      this.rockBody.beginFill(p.crystal, 0.1 + dmgPct * 0.1);
      this.rockBody.drawCircle(cr.x, cr.y, cr.s + 8);
      this.rockBody.endFill();
      this.rockBody.beginFill(p.crystalFace, 0.08 + dmgPct * 0.08);
      this.rockBody.drawCircle(cr.x, cr.y, cr.s + 5);
      this.rockBody.endFill();

      const pts: { x: number; y: number }[] = [];
      for (let v = 0; v < 6; v++) {
        const va = (v / 6) * Math.PI * 2 + cr.rot;
        const vr = cr.s * (v % 2 === 0 ? 1 : 0.7);
        pts.push({
          x: cr.x + Math.cos(va) * vr,
          y: cr.y + Math.sin(va) * vr,
        });
      }
      this.rockBody.beginFill(p.vein1, 0.8);
      this.rockBody.moveTo(pts[0].x, pts[0].y);
      pts.forEach((pt) => this.rockBody.lineTo(pt.x, pt.y));
      this.rockBody.closePath();
      this.rockBody.endFill();

      this.rockBody.beginFill(p.crystalFace, 0.7);
      this.rockBody.moveTo(pts[0].x, pts[0].y);
      this.rockBody.lineTo(pts[1].x, pts[1].y);
      this.rockBody.lineTo(pts[2].x, pts[2].y);
      this.rockBody.lineTo(cr.x, cr.y);
      this.rockBody.closePath();
      this.rockBody.endFill();

      this.rockBody.beginFill(p.crystalHighlight, 0.5);
      this.rockBody.drawCircle(cr.x - cr.s * 0.2, cr.y - cr.s * 0.2, cr.s * 0.3);
      this.rockBody.endFill();

      this.rockBody.lineStyle(1.5, p.shadow, 0.7);
      this.rockBody.moveTo(pts[0].x, pts[0].y);
      pts.forEach((pt) => this.rockBody.lineTo(pt.x, pt.y));
      this.rockBody.closePath();
      this.rockBody.lineStyle(0);
    });

    // Moss patches
    const mossSpots = [
      { x: -60, y: 48, w: 25, h: 12 },
      { x: 50, y: 55, w: 20, h: 10 },
      { x: -30, y: 65, w: 18, h: 8 },
      { x: 70, y: 35, w: 15, h: 9 },
    ];
    mossSpots.forEach((m) => {
      this.rockBody.beginFill(0x2a4a3a, 0.3);
      this.rockBody.drawEllipse(m.x, m.y, m.w, m.h);
      this.rockBody.endFill();
      for (let d = 0; d < 5; d++) {
        const dx = m.x + Math.sin(d * 2.3) * m.w * 0.6;
        const dy = m.y + Math.cos(d * 1.7) * m.h * 0.5;
        this.rockBody.beginFill(0x3a6a4a, 0.25);
        this.rockBody.drawCircle(dx, dy, 2 + (d % 2));
        this.rockBody.endFill();
      }
    });

    // Cartoon outline
    this.rockBody.lineStyle(3.5, p.outline, 0.9);
    this.rockBody.moveTo(rockVertices[0].x, rockVertices[0].y);
    for (let i = 1; i < rockVertices.length; i++) {
      this.rockBody.lineTo(rockVertices[i].x, rockVertices[i].y);
    }
    this.rockBody.closePath();

    // Damage tint
    if (dmgPct > 0.25) {
      const tintAlpha = (dmgPct - 0.25) * 0.12;
      this.rockBody.lineStyle(0);
      this.rockBody.beginFill(p.damageTint, tintAlpha);
      drawRockPoly(this.rockBody, 0, 0);
      this.rockBody.endFill();
    }

    // Crystal glow intensifies with damage
    if (dmgPct > 0.4) {
      crystals.forEach((cr) => {
        this.rockBody.beginFill(p.crystalGlow, (dmgPct - 0.4) * 0.15);
        this.rockBody.drawCircle(cr.x, cr.y, cr.s + 6 + dmgPct * 4);
        this.rockBody.endFill();
      });
    }
  }

  private drawCracks(dmgPct: number) {
    const p = this.currentPalette;
    this.crackOverlay.clear();
    if (dmgPct <= 0) return;

    crackNetwork.forEach((crack) => {
      const crackDmgStart = 1 - crack.threshold;
      if (dmgPct < crackDmgStart) return;

      const crackProgress = Math.min(1, (dmgPct - crackDmgStart) / 0.15);

      crack.segments.forEach((seg) => {
        const pointsToDraw = Math.max(
          2,
          Math.ceil(seg.length * crackProgress)
        );
        const lineW = 1.5 + dmgPct * 2.5;

        this.crackOverlay.lineStyle(lineW, 0x0a0e18, 0.7 + dmgPct * 0.3);
        this.crackOverlay.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < pointsToDraw; i++) {
          this.crackOverlay.lineTo(seg[i].x, seg[i].y);
        }

        if (dmgPct > 0.3) {
          const glowAlpha = (dmgPct - 0.3) * 0.7;
          this.crackOverlay.lineStyle(
            lineW + 4,
            p.crackGlow,
            glowAlpha * 0.3
          );
          this.crackOverlay.moveTo(seg[0].x, seg[0].y);
          for (let i = 1; i < pointsToDraw; i++) {
            this.crackOverlay.lineTo(seg[i].x, seg[i].y);
          }
          this.crackOverlay.lineStyle(
            lineW + 10,
            p.crackGlow,
            glowAlpha * 0.1
          );
          this.crackOverlay.moveTo(seg[0].x, seg[0].y);
          for (let i = 1; i < pointsToDraw; i++) {
            this.crackOverlay.lineTo(seg[i].x, seg[i].y);
          }
        }

        if (dmgPct > 0.5) {
          this.crackOverlay.lineStyle(0.5, p.crackGlowInner, (dmgPct - 0.5) * 0.6);
          this.crackOverlay.moveTo(seg[0].x + 1, seg[0].y + 1);
          for (let i = 1; i < pointsToDraw; i++) {
            this.crackOverlay.lineTo(seg[i].x + 1, seg[i].y + 1);
          }
        }
      });
    });

    // Dust from cracks
    if (dmgPct > 0.5 && this.isDrilling && Math.random() < dmgPct * 0.3) {
      const activeCracks = crackNetwork.filter(
        (c) => dmgPct >= 1 - c.threshold
      );
      if (activeCracks.length > 0) {
        const crack =
          activeCracks[Math.floor(Math.random() * activeCracks.length)];
        const seg =
          crack.segments[Math.floor(Math.random() * crack.segments.length)];
        const pt = seg[Math.floor(Math.random() * seg.length)];
        this.spawnCrackDust(this.ROCK_X + pt.x, this.ROCK_Y + pt.y);
      }
    }
  }

  private spawnCrackDust(x: number, y: number) {
    const g = new PIXI.Graphics();
    const size = 2 + Math.random() * 3;
    g.beginFill(0x5a7090, 0.6);
    g.drawCircle(0, 0, size);
    g.endFill();
    g.x = x;
    g.y = y;
    (g as any).vx = (Math.random() - 0.5) * 2;
    (g as any).vy = -1 - Math.random() * 2;
    (g as any).life = 1;
    this.gameContainer.addChild(g);
    this.crackDustParticles.push(g);
  }

  private updateRock() {
    const dmgPct = 1 - this.rockHP / this.maxRockHP;
    this.drawRockBody(dmgPct);
    this.drawCracks(dmgPct);

    if (this.rockEmerging) {
      this.rockEmergeProgress += 0.025;
      if (this.rockEmergeProgress >= 1) {
        this.rockEmergeProgress = 1;
        this.rockEmerging = false;
      }
      const ep = this.rockEmergeProgress;
      const easeOut = 1 - Math.pow(1 - ep, 3);
      const bounce =
        ep < 0.7
          ? easeOut
          : 1 +
            Math.sin(((ep - 0.7) / 0.3) * Math.PI) * 0.08 * (1 - ep);
      this.rockContainer.y = this.ROCK_Y + (1 - easeOut) * 120;
      this.rockContainer.scale.set(bounce);
      this.rockContainer.alpha = easeOut;

      if (ep < 0.6 && Math.random() < 0.5) {
        const dx = (Math.random() - 0.5) * 160;
        this.spawnCrackDust(this.ROCK_X + dx, this.ROCK_Y + 60);
      }
    }
  }

  private initHPBar() {
    this.hpBarBg = new PIXI.Graphics();
    this.hpBarBg.beginFill(0x1a202c, 0.8);
    this.hpBarBg.drawRoundedRect(-60, -8, 120, 16, 8);
    this.hpBarBg.endFill();
    this.hpBarBg.lineStyle(2, 0x3a5a80);
    this.hpBarBg.drawRoundedRect(-60, -8, 120, 16, 8);
    this.hpBarBg.x = this.APP_W / 2;
    this.hpBarBg.y = this.APP_H * 0.58 + 100;
    this.gameContainer.addChild(this.hpBarBg);

    this.hpBarFill = new PIXI.Graphics();
    this.hpBarFill.x = this.APP_W / 2;
    this.hpBarFill.y = this.APP_H * 0.58 + 100;
    this.gameContainer.addChild(this.hpBarFill);

    this.updateHPBar();
  }

  private updateHPBar() {
    const pct = Math.max(0, this.rockHP / this.maxRockHP);
    this.hpBarFill.clear();
    if (pct > 0) {
      const color = pct > 0.5 ? 0x3a7bd5 : pct > 0.25 ? 0xf0a030 : 0xff4444;
      this.hpBarFill.beginFill(color);
      this.hpBarFill.drawRoundedRect(-58, -6, 116 * pct, 12, 6);
      this.hpBarFill.endFill();
    }
  }

  private initDrill() {
    this.drillSprite = new PIXI.AnimatedSprite(this.drillFrames);
    this.drillSprite.anchor.set(0.5, 0.0);
    this.drillSprite.x = this.APP_W / 2;
    this.drillSprite.y = this.APP_H * 0.28;
    this.drillSprite.scale.set(1.25);
    this.drillSprite.animationSpeed = 0.3;
    this.drillSprite.loop = true;
    this.gameContainer.addChild(this.drillSprite);
  }

  private initImpactFlash() {
    this.impactFlash = new PIXI.Graphics();
    this.impactFlash.alpha = 0;
    this.gameContainer.addChild(this.impactFlash);
  }

  private showImpact(x: number, y: number) {
    this.impactFlash.clear();
    this.impactFlash.beginFill(this.currentPalette.crystal, 0.6);
    this.impactFlash.drawCircle(x, y, 30);
    this.impactFlash.endFill();
    this.impactFlash.beginFill(0xffffff, 0.4);
    this.impactFlash.drawCircle(x, y, 15);
    this.impactFlash.endFill();
    this.impactFlash.alpha = 1;
  }

  private spawnDebris(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.AnimatedSprite(this.debrisFrames);
      sprite.anchor.set(0.5);
      sprite.x = x + (Math.random() - 0.5) * 40;
      sprite.y = y;
      sprite.scale.set(0.3 + Math.random() * 0.4);
      sprite.gotoAndStop(Math.floor(Math.random() * 4));
      (sprite as any).vx = (Math.random() - 0.5) * 8;
      (sprite as any).vy = -3 - Math.random() * 6;
      (sprite as any).life = 1;
      sprite.rotation = Math.random() * Math.PI * 2;
      (sprite as any).vr = (Math.random() - 0.5) * 0.3;
      this.gameContainer.addChild(sprite);
      this.particles.push(sprite);
    }
  }

  private spawnCoin(x: number, y: number) {
    const sprite = new PIXI.AnimatedSprite(this.coinFrames);
    sprite.anchor.set(0.5);
    sprite.x = x + (Math.random() - 0.5) * 60;
    sprite.y = y;
    sprite.scale.set(0.5);
    sprite.animationSpeed = 0.15;
    sprite.play();
    (sprite as any).vx = (Math.random() - 0.5) * 4;
    (sprite as any).vy = -6 - Math.random() * 5;
    (sprite as any).life = 1;
    (sprite as any).collected = false;
    (sprite as any).bobPhase = Math.random() * Math.PI * 2;
    this.gameContainer.addChild(sprite);
    this.coins.push(sprite);
  }

  private spawnCoinBurst(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const t = setTimeout(() => {
        if (!this.destroyed) this.spawnCoin(x, y);
      }, i * 60);
      this.timeouts.push(t);
    }
  }

  private showFloatingText(x: number, y: number, text: string, color = 0xffe066) {
    const t = new PIXI.Text(text, {
      fontFamily: "Bungee, sans-serif",
      fontSize: 24,
      fill: color,
      stroke: 0x000000,
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowDistance: 2,
    });
    t.anchor.set(0.5);
    t.x = x;
    t.y = y;
    (t as any).vy = -2;
    (t as any).life = 1;
    this.gameContainer.addChild(t);
    this.floatingTexts.push(t);
  }

  // Fragment system
  private createFragment(
    cx: number,
    cy: number,
    verts: { x: number; y: number }[],
    color: number
  ) {
    const g = new PIXI.Graphics();
    g.beginFill(color);
    g.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) g.lineTo(verts[i].x, verts[i].y);
    g.closePath();
    g.endFill();
    g.lineStyle(1.5, 0x0a0e18, 0.6);
    g.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) g.lineTo(verts[i].x, verts[i].y);
    g.closePath();

    g.x = cx;
    g.y = cy;
    const angle = Math.atan2(cy - this.ROCK_Y, cx - this.ROCK_X);
    const speed = 4 + Math.random() * 8;
    (g as any).vx =
      Math.cos(angle) * speed + (Math.random() - 0.5) * 3;
    (g as any).vy =
      Math.sin(angle) * speed - 3 - Math.random() * 5;
    (g as any).vr = (Math.random() - 0.5) * 0.25;
    (g as any).life = 1;
    (g as any).gravity = 0.3;
    this.gameContainer.addChild(g);
    this.rockFragments.push(g);
  }

  private shatterRock() {
    const p = this.currentPalette;
    const fragmentColors = [
      p.midTone, p.upperSurface, p.topHighlight, p.shadow, p.darkBase, p.midTone,
    ];
    const numFragments = 12 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numFragments; i++) {
      const angle =
        (i / numFragments) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 15 + Math.random() * 50;
      const cx = this.ROCK_X + Math.cos(angle) * dist * 0.8;
      const cy = this.ROCK_Y + Math.sin(angle) * dist * 0.7;
      const size = 12 + Math.random() * 25;
      const numVerts = 4 + Math.floor(Math.random() * 3);
      const verts: { x: number; y: number }[] = [];
      for (let v = 0; v < numVerts; v++) {
        const va = (v / numVerts) * Math.PI * 2;
        const vr = size * (0.5 + Math.random() * 0.5);
        verts.push({ x: Math.cos(va) * vr, y: Math.sin(va) * vr * 0.8 });
      }
      const color =
        fragmentColors[Math.floor(Math.random() * fragmentColors.length)];
      this.createFragment(cx, cy, verts, color);
    }

    // Crystal fragments
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 40;
      const cx = this.ROCK_X + Math.cos(angle) * dist;
      const cy = this.ROCK_Y + Math.sin(angle) * dist;

      const g = new PIXI.Graphics();
      g.beginFill(p.upperSurface);
      g.drawPolygon([-8, -5, 6, -8, 10, 2, 4, 9, -7, 6]);
      g.endFill();
      g.beginFill(p.crystalFace, 0.8);
      g.drawCircle(1, 0, 4);
      g.endFill();
      g.beginFill(p.crystalHighlight, 0.5);
      g.drawCircle(0, -1, 2);
      g.endFill();

      g.x = cx;
      g.y = cy;
      const a2 = Math.atan2(cy - this.ROCK_Y, cx - this.ROCK_X);
      const sp = 5 + Math.random() * 6;
      (g as any).vx =
        Math.cos(a2) * sp + (Math.random() - 0.5) * 2;
      (g as any).vy =
        Math.sin(a2) * sp - 4 - Math.random() * 4;
      (g as any).vr = (Math.random() - 0.5) * 0.3;
      (g as any).life = 1;
      (g as any).gravity = 0.3;
      this.gameContainer.addChild(g);
      this.rockFragments.push(g);
    }
  }

  // Drilling logic
  private drill(dt: number) {
    if (!this.isDrilling || this.rockEmerging || this.gameOver) return;

    this.drillTimer += dt;
    this.drillSprite.play();
    this.screenShake = 3;

    if (this.drillTimer > this.drillTickThreshold) {
      this.drillTimer = 0;
      this.combo++;

      const dmg = calculateDamage(this.drillPower, this.combo);
      this.rockHP -= dmg;
      this.spawnDebris(this.ROCK_X, this.ROCK_Y - 20, 2);
      this.showImpact(this.ROCK_X, this.ROCK_Y - 40);
      this.audio.playHitSound();
      this.updateHPBar();
      this.callbacks.onHPChange(Math.max(0, this.rockHP), this.maxRockHP);

      const dmgPct = 1 - this.rockHP / this.maxRockHP;
      const currentCrackLevel = crackNetwork.filter(
        (c) => dmgPct >= 1 - c.threshold
      ).length;
      if (currentCrackLevel > this.lastCrackLevel) {
        this.lastCrackLevel = currentCrackLevel;
        this.audio.playCrackSound();
        this.screenShake = 6;
      }

      // Visual coin spawns (decorative only)
      if (Math.random() < 0.08 + this.combo * 0.002) {
        this.spawnCoin(this.ROCK_X, this.ROCK_Y - 30);
        this.audio.playCoinPopSound();
      }

      if (this.rockHP <= 0) {
        this.destroyRock();
      }
    }
  }

  private destroyRock() {
    this.shatterRock();
    this.spawnDebris(this.ROCK_X, this.ROCK_Y, 15);
    this.audio.playRockBreakSound();
    this.screenShake = 15;
    this.rockContainer.visible = false;

    // Flash effect
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.4);
    flash.drawRect(0, 0, this.APP_W, this.APP_H);
    flash.endFill();
    this.gameContainer.addChild(flash);
    let flashLife = 1;
    const flashFade = setInterval(() => {
      flashLife -= 0.08;
      flash.alpha = flashLife;
      if (flashLife <= 0) {
        this.gameContainer.removeChild(flash);
        clearInterval(flashFade);
      }
    }, 16);

    // Visual coin burst
    const coinCount = 3 + Math.floor(Math.random() * 4);
    this.spawnCoinBurst(this.ROCK_X, this.ROCK_Y, coinCount);

    // Notify: pass the current rock index and its pre-calculated rewards
    const rock = this.rockSequence[this.currentRockIndex];
    const rewards: DrillReward[] = rock
      ? (rock.rewards as DrillReward[])
      : [];
    this.callbacks.onRockSmashed(this.currentRockIndex, rewards);

    this.currentRockIndex++;

    // Check game over
    if (this.currentRockIndex >= this.rockSequence.length) {
      this.gameOver = true;
      this.isDrilling = false;
      this.audio.isDrilling = false;
      this.drillSprite.gotoAndStop(0);
      this.audio.stopDrillSound();

      const t = setTimeout(() => {
        if (!this.destroyed) {
          this.callbacks.onGameOver();
        }
      }, 800);
      this.timeouts.push(t);
      return;
    }

    // Spawn next rock
    const t = setTimeout(() => {
      if (this.destroyed) return;
      this.spawnNewRock();
    }, 600);
    this.timeouts.push(t);

    if (this.currentRockIndex % 5 === 0) {
      this.showFloatingText(
        this.APP_W / 2,
        this.APP_H * 0.4,
        `${this.currentRockIndex} Rocks!`,
        0x66aaff
      );
      this.audio.playLevelUpSound();
    }
  }

  // Input
  private setupInput() {
    const cv = this.canvas!;
    cv.addEventListener("pointerdown", this.boundOnDown);
    cv.addEventListener("pointerup", this.boundOnUp);
    cv.addEventListener("pointerleave", this.boundOnUp);
    cv.addEventListener("touchstart", this.boundOnDown, { passive: true });
    cv.addEventListener("touchend", this.boundOnUp, { passive: true });
  }

  private onDown() {
    if (this.gameOver) return;
    this.audio.init();
    this.isDrilling = true;
    this.audio.isDrilling = true;
    this.combo = 0;
    this.audio.startDrillSound();
    this.callbacks.onHideHint();
  }

  private onUp() {
    this.isDrilling = false;
    this.audio.isDrilling = false;
    this.drillSprite.gotoAndStop(0);
    this.combo = 0;
    this.audio.stopDrillSound();
  }

  // Game loop
  private startGameLoop() {
    this.app.ticker.add((delta) => {
      if (this.destroyed) return;

      this.drill(delta);

      // Screen shake
      if (this.screenShake > 0) {
        this.gameContainer.x =
          (Math.random() - 0.5) * this.screenShake * 2;
        this.gameContainer.y =
          (Math.random() - 0.5) * this.screenShake * 2;
        this.screenShake *= 0.85;
        if (this.screenShake < 0.3) {
          this.screenShake = 0;
          this.gameContainer.x = 0;
          this.gameContainer.y = 0;
        }
      }

      // Drill position
      if (this.isDrilling) {
        this.drillSprite.y =
          this.APP_H * 0.28 + 12 + Math.sin(Date.now() * 0.02) * 2;
      } else {
        this.drillSprite.y = this.APP_H * 0.28;
      }

      // Impact flash fade
      if (this.impactFlash.alpha > 0) {
        this.impactFlash.alpha -= 0.08;
      }

      // Update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pa = this.particles[i] as any;
        pa.x += pa.vx;
        pa.y += pa.vy;
        pa.vy += 0.25;
        pa.rotation += pa.vr;
        pa.life -= 0.02;
        pa.alpha = pa.life;
        if (pa.life <= 0) {
          this.gameContainer.removeChild(pa);
          this.particles.splice(i, 1);
        }
      }

      // Update coins (visual only)
      for (let i = this.coins.length - 1; i >= 0; i--) {
        const c = this.coins[i] as any;
        if (!c.collected) {
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.18;
          c.vx *= 0.99;

          if (c.y > this.APP_H * 0.6) {
            c.y = this.APP_H * 0.6;
            c.vy *= -0.5;
            c.vx *= 0.8;
            if (Math.abs(c.vy) < 0.5) {
              c.collected = true;
              c.collectTimer = 30;
            }
          }
          c.bobPhase += 0.05;
        } else {
          c.collectTimer--;
          if (c.collectTimer <= 0) {
            const tx = 50;
            const ty = 30;
            c.x += (tx - c.x) * 0.15;
            c.y += (ty - c.y) * 0.15;
            c.scale.set(c.scale.x * 0.95);

            if (Math.abs(c.x - tx) < 10 && Math.abs(c.y - ty) < 10) {
              this.audio.playCoinCollectSound();
              this.gameContainer.removeChild(c);
              this.coins.splice(i, 1);
            }
          }
        }

        c.life -= 0.003;
        if (c.life <= 0 && !c.collected) {
          c.collected = true;
          c.collectTimer = 0;
        }
      }

      // Update floating texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i] as any;
        ft.y += ft.vy;
        ft.vy -= 0.02;
        ft.life -= 0.015;
        ft.alpha = ft.life;
        ft.scale.set(1 + (1 - ft.life) * 0.3);
        if (ft.life <= 0) {
          this.gameContainer.removeChild(ft);
          this.floatingTexts.splice(i, 1);
        }
      }

      // Rock hit animation
      if (this.isDrilling && !this.rockEmerging) {
        const shk = 2 + (1 - this.rockHP / this.maxRockHP) * 3;
        this.rockContainer.x =
          this.ROCK_X + (Math.random() - 0.5) * shk;
        this.rockContainer.y =
          this.ROCK_Y + (Math.random() - 0.5) * shk;
      } else if (!this.rockEmerging) {
        this.rockContainer.x = this.ROCK_X;
        this.rockContainer.y = this.ROCK_Y;
      }

      // Update rock
      this.updateRock();

      // Update rock fragments
      for (let i = this.rockFragments.length - 1; i >= 0; i--) {
        const f = this.rockFragments[i] as any;
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.gravity;
        f.rotation += f.vr;
        f.vx *= 0.98;
        f.life -= 0.012;
        f.alpha = Math.max(0, f.life);
        if (f.life <= 0) {
          this.gameContainer.removeChild(f);
          this.rockFragments.splice(i, 1);
        }
      }

      // Update crack dust
      for (let i = this.crackDustParticles.length - 1; i >= 0; i--) {
        const cd = this.crackDustParticles[i] as any;
        cd.x += cd.vx;
        cd.y += cd.vy;
        cd.vy -= 0.02;
        cd.life -= 0.025;
        cd.alpha = cd.life * 0.6;
        if (cd.life <= 0) {
          this.gameContainer.removeChild(cd);
          this.crackDustParticles.splice(i, 1);
        }
      }
    });
  }

  toggleMute(): boolean {
    return this.audio.toggleMute();
  }

  destroy() {
    this.destroyed = true;

    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];

    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this.boundOnDown);
      this.canvas.removeEventListener("pointerup", this.boundOnUp);
      this.canvas.removeEventListener("pointerleave", this.boundOnUp);
      this.canvas.removeEventListener("touchstart", this.boundOnDown);
      this.canvas.removeEventListener("touchend", this.boundOnUp);
    }

    this.audio.destroy();

    try {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    } catch (_) {}
  }
}
