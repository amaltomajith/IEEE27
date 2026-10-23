import * as THREE from "three";
import { BOLT_FRAG, BOLT_VERT, EDGE_FRAG, EDGE_VERT, NODE_FRAG, NODE_VERT } from "./shaders";
import { humanHand, robotHand, type HandLayout } from "./handLayout";
import { cascade, type PulseTarget } from "./cascade";

THREE.ColorManagement.enabled = false;
const C = (hex: string) => new THREE.Color(hex);
const ease = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

type Hand = {
  L: HandLayout;
  group: THREE.Group;
  nodes: THREE.BufferGeometry;
  edges: THREE.BufferGeometry;
  pulse: PulseTarget;
  ring: Float32Array;
};

/**
 * "Reach": a machine hand and a human hand, drawn as neurons and synapses like the
 * brain, glide toward each other as the section scrolls (poster composition: robot
 * from the upper left, human from the right). Their fingertips stop a hair apart;
 * a spark jumps the gap and the signal runs back through both hands.
 */
export class Hands {
  readonly canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 50);
  private shared: Record<string, THREE.IUniform>;
  private robot: Hand;
  private human: Hand;
  private boltU: Record<string, THREE.IUniform>;
  private t0 = performance.now();
  private frozen: boolean;
  private prog = 0;
  private shown = 0;
  private armed = true;
  private nextIdle = 2;
  private pointer = { x: 0, y: 0, cx: 0, cy: 0 };
  private m = new THREE.Matrix4();
  private tmp = new THREE.Matrix4();
  private v = new THREE.Vector3();
  private f = new THREE.Vector3();
  private up = new THREE.Vector3();
  private side = new THREE.Vector3();
  w = 1;
  h = 1;
  /** Pose: roll about the finger axis, scale (share of half-width), tilt; p* = portrait. */
  private readonly tune = { rollR: 0.6, rollH: -0.9, scale: 0.5, tiltR: -0.36, tiltH: 0.12, pScale: 1.05, pTiltR: -1.05, pTiltH: 0.3, pMeetX: -0.3, pMeetY: 0.08 };

  constructor(opts: { dense: boolean; frozen?: boolean }) {
    this.frozen = !!opts.frozen;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setClearColor(0xfaf7ee, 1);
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute("aria-hidden", "true");
    this.camera.position.set(0, 0, 7);

    const none = Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, -99));
    this.shared = {
      uTime: { value: 0 },
      uPT: { value: 0 },
      uMix: { value: 0 },
      uSparks: { value: none },
      uSize: { value: 3 },
      uDpr: { value: 1 },
      uHover: { value: -1 },
      uInstant: { value: this.frozen ? 1 : 0 },
      uWrist: { value: 1 },
      uSpark: { value: C("#a8474f") },
      uHot: { value: C("#d0893c") },
    };
    this.robot = this.build(robotHand(), { col: "#573420", baseA: 0.5, dash: 0, wob: 0, size: 1.15 });
    this.human = this.build(humanHand(opts.dense ? 1500 : 850), { col: "#a65a3a", baseA: 0.14, dash: 0.7, wob: 0.6, size: 1.45 });

    const N = 18, t = new Float32Array(N * 2), p = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) { t[i * 2] = i / N; t[i * 2 + 1] = (i + 1) / N; }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.BufferAttribute(p, 3));
    bg.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    this.boltU = { uA: { value: new THREE.Vector3() }, uB: { value: new THREE.Vector3() }, uAt: { value: -99 }, uPT: this.shared.uPT, uSpark: this.shared.uSpark, uHot: this.shared.uHot };
    const bolt = new THREE.LineSegments(bg, new THREE.ShaderMaterial({ vertexShader: BOLT_VERT, fragmentShader: BOLT_FRAG, uniforms: this.boltU, transparent: true, depthWrite: false }));
    bolt.frustumCulled = false;
    this.scene.add(bolt);
  }

  private build(L: HandLayout, o: { col: string; baseA: number; dash: number; wob: number; size: number }): Hand {
    const own = { uColA: { value: C(o.col) }, uColB: { value: C(o.col) }, uWob: { value: o.wob } };
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;

    const ng = new THREE.BufferGeometry();
    ng.setAttribute("position", new THREE.BufferAttribute(L.pos, 3));
    ng.setAttribute("aNet", new THREE.BufferAttribute(L.pos, 3));
    ng.setAttribute("aSeed", new THREE.BufferAttribute(L.seed.map((s) => s * o.size), 1));
    const hit = new Float32Array(L.n).fill(-99), ring = new Float32Array(L.n).fill(-99);
    ng.setAttribute("aHit", new THREE.BufferAttribute(hit, 1));
    ng.setAttribute("aRing", new THREE.BufferAttribute(ring, 1));
    ng.setAttribute("aIdx", new THREE.BufferAttribute(new Float32Array(L.n).fill(-5), 1));
    const nodes = new THREE.Points(ng, new THREE.ShaderMaterial({ vertexShader: NODE_VERT, fragmentShader: NODE_FRAG, uniforms: { ...this.shared, ...own }, transparent: true, depthWrite: false }));
    nodes.frustumCulled = false;

    const m = L.edges.length / 2;
    const pos = new Float32Array(m * 6), seed = new Float32Array(m * 2), t = new Float32Array(m * 2), eid = new Float32Array(m * 2);
    const fire = new Float32Array(m * 2).fill(-99), dir = new Float32Array(m * 2), ends = new Float32Array(m * 4).fill(-5);
    for (let e = 0; e < m; e++) {
      const r = Math.random();
      for (let k = 0; k < 2; k++) {
        const i = L.edges[e * 2 + k], v = e * 2 + k;
        pos.set(L.pos.subarray(i * 3, i * 3 + 3), v * 3);
        seed[v] = L.seed[i];
        t[v] = k;
        eid[v] = r;
      }
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    eg.setAttribute("aNet", new THREE.BufferAttribute(pos, 3));
    eg.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    eg.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    eg.setAttribute("aEdge", new THREE.BufferAttribute(eid, 1));
    eg.setAttribute("aFire", new THREE.BufferAttribute(fire, 1));
    eg.setAttribute("aDir", new THREE.BufferAttribute(dir, 1));
    eg.setAttribute("aEnds", new THREE.BufferAttribute(ends, 2));
    const lines = new THREE.LineSegments(
      eg,
      new THREE.ShaderMaterial({
        vertexShader: EDGE_VERT,
        fragmentShader: EDGE_FRAG,
        uniforms: { ...this.shared, ...own, uLayer: { value: 2 }, uBaseA: { value: o.baseA }, uDash: { value: o.dash } },
        transparent: true,
        depthWrite: false,
      }),
    );
    lines.frustumCulled = false;
    group.add(lines, nodes);
    this.scene.add(group);
    return { L, group, nodes: ng, edges: eg, pulse: { fire, dir, hit }, ring };
  }

  setSize(w: number, h: number) {
    w = Math.max(2, Math.round(w));
    h = Math.max(2, Math.round(h));
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.shared.uDpr.value = dpr;
    this.shared.uSize.value = 3.1 * Math.max(0.75, h / 820);
  }

  /** Scroll progress through the section, 0..1. */
  setProgress(p: number) {
    this.prog = clamp01(p);
  }
  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }
  /** Tap on the stage: spark across the gap once the hands are close, else a stray thought. */
  tap() {
    if (this.shown > 0.85) this.spark();
    else this.think(Math.random() < 0.5 ? this.robot : this.human, -1, 5);
  }

  private pt() {
    return (performance.now() - this.t0) / 1000;
  }

  private think(hand: Hand, from: number, depth: number, hop = 0.12) {
    const i = from >= 0 ? from : Math.floor(Math.random() * hand.L.n);
    cascade(hand.L.adj, hand.L.n, i, this.pt(), hand.pulse, { maxDepth: depth, hop: this.frozen ? 0 : hop, branch: depth > 8 ? 1 : 0.6, cap: depth > 8 ? Infinity : 30 });
    hand.edges.getAttribute("aFire").needsUpdate = true;
    hand.edges.getAttribute("aDir").needsUpdate = true;
    hand.nodes.getAttribute("aHit").needsUpdate = true;
  }

  /** The contact moment: a bolt between the fingertips, then both hands light up from the tip. */
  spark() {
    const t = this.pt();
    this.boltU.uAt.value = t;
    for (const hand of [this.robot, this.human]) {
      hand.ring[hand.L.tip] = t;
      hand.nodes.getAttribute("aRing").needsUpdate = true;
      this.think(hand, hand.L.tip, 40, 0.05);
    }
  }

  /**
   * Pose one hand: point the index along `dir` with the back of the hand up and the
   * thumb toward the viewer, roll it about the finger axis to show a little of the
   * back, scale, then translate so the fingertip sits at `tip`.
   * The robot is a left hand: the same skeleton mirrored in local y.
   */
  private pose(hand: Hand, mirror: boolean, dir: [number, number], tip: [number, number], s: number, roll: number) {
    const f = this.f.set(dir[0], dir[1], 0).normalize();
    const up = this.up.set(-f.y, f.x, 0);
    if (up.y < 0) up.negate();
    const side = this.side.crossVectors(up, f); // local +y of a right hand (thumb side)
    this.m.makeRotationAxis(f, roll + this.pointer.cy * 0.12);
    this.m.multiply(this.tmp.makeBasis(f, side, up));
    this.m.multiply(this.tmp.makeScale(s, mirror ? -s : s, s));
    this.m.premultiply(this.tmp.makeRotationY(this.pointer.cx * 0.1));
    const tp = hand.L.tipPos;
    this.v.set(tp[0], tp[1], tp[2]).applyMatrix4(this.m);
    this.m.premultiply(this.tmp.makeTranslation(tip[0] - this.v.x, tip[1] - this.v.y, -this.v.z));
    hand.group.matrix.copy(this.m);
    hand.group.matrixWorldNeedsUpdate = true;
    return new THREE.Vector3(tip[0], tip[1], 0);
  }

  render(now: number) {
    const t = this.pt();
    this.shared.uTime.value = this.frozen ? 2 : t;
    this.shared.uPT.value = t;
    const pc = this.pointer;
    pc.cx += (pc.x - pc.cx) * 0.05;
    pc.cy += (pc.y - pc.cy) * 0.05;

    // Ease the shown progress toward the scroll so a fast flick still glides.
    this.shown += (this.prog - this.shown) * (this.frozen ? 1 : 0.12);
    const p = this.shown;
    const approach = ease(clamp01(p / 0.82));

    const aspect = this.w / this.h, portrait = aspect < 0.9;
    const H = 7 * Math.tan((15 * Math.PI) / 180), W = H * aspect;
    const tn = this.tune;
    const s = portrait ? (W * tn.pScale) / 1.9 : Math.min(1.4, Math.max(0.55, (W * tn.scale) / 1.9));
    const meet: [number, number] = portrait ? [tn.pMeetX * W, tn.pMeetY * H] : [0.16 * W, 0.2 * H];
    const aR = portrait ? tn.pTiltR : tn.tiltR, aH = Math.PI - (portrait ? tn.pTiltH : tn.tiltH);
    const dR = [Math.cos(aR), Math.sin(aR)], dH = [Math.cos(aH), Math.sin(aH)];
    const far = (portrait ? 1.3 : 1.6) * W, gap = 0.055 * s + far * (1 - approach);
    const bob = this.frozen ? 0 : Math.sin(t * 0.9) * 0.012;
    const tipR: [number, number] = [meet[0] - dR[0] * gap * 0.5, meet[1] - dR[1] * gap * 0.5 + bob];
    const tipH: [number, number] = [meet[0] - dH[0] * gap * 0.5, meet[1] - dH[1] * gap * 0.5 - bob];
    const a = this.pose(this.robot, true, dR as [number, number], tipR, s, tn.rollR);
    const b = this.pose(this.human, false, dH as [number, number], tipH, s, tn.rollH);
    (this.boltU.uA.value as THREE.Vector3).copy(a);
    (this.boltU.uB.value as THREE.Vector3).copy(b);

    // Contact: fire once on the way in, re-arm when scrolled back out.
    if (p > 0.8 && this.armed) {
      this.armed = false;
      this.spark();
      this.nextIdle = t + 1.6;
    } else if (p < 0.6) this.armed = true;
    if (!this.frozen && t > this.nextIdle) {
      const touching = p > 0.8;
      this.think(Math.random() < 0.5 ? this.robot : this.human, -1, touching ? 6 : 3);
      this.nextIdle = t + (touching ? 1.1 : 2.2) + Math.random() * 0.8;
    }
    void now;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose?.();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
