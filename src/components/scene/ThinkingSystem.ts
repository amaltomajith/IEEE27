import * as THREE from "three";
import { BG_FRAG, BG_VERT, EDGE_FRAG, EDGE_VERT, NODE_FRAG, NODE_VERT } from "./shaders";
import { buildLayout, type Layout } from "./layout";

// Raw shader materials: keep colours in sRGB end to end (no linear conversion).
THREE.ColorManagement.enabled = false;
const C = (hex: string) => new THREE.Color(hex);
const ease = (x: number) => x * x * (3 - 2 * x);

/**
 * The card's "thinking system". A brain-shaped web of neurons and synapses that
 * fires: cascades radiate from wherever the cursor touches, and it sparks on its
 * own when idle. Holding rearranges the same neurons into the layers of an
 * artificial neural network, where activity flows forward layer to layer.
 */
export class ThinkingSystem {
  readonly canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 50);
  private group = new THREE.Group();
  private layout: Layout;
  private uniforms: Record<string, THREE.IUniform>;
  private nodeMat: THREE.ShaderMaterial;
  private bgMat: THREE.ShaderMaterial;
  private sparks = Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, -99));
  private sparkIdx = 0;
  private t0 = performance.now();
  private frozen: boolean;
  private target = { mix: 0.0, focus: 0, mx: 0, my: 0, on: 0, hold: 0 };
  private cur = { mix: 0.0, focus: 0, mx: 0, my: 0, on: 0, hold: 0, rx: 0.18, ry: -0.7 };
  private last = 0;
  private lastHoverSpark = 0;
  private nextAuto = 1.2;
  private v = new THREE.Vector3();
  w = 1;
  h = 1;

  constructor(opts: { dense: boolean; frozen?: boolean }) {
    this.frozen = !!opts.frozen;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setClearColor(0x0a2129, 1);
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute("aria-hidden", "true");
    this.camera.position.set(0, 0, 5.2);

    const L = (this.layout = buildLayout(opts.dense ? 1400 : 620));
    this.uniforms = {
      uTime: { value: 0 },
      uMix: { value: 0 },
      uSparks: { value: this.sparks },
      uSize: { value: 3 },
      uDpr: { value: 1 },
      uColA: { value: C("#22d8c8") },
      uColB: { value: C("#dcefff") },
    };

    // Nodes
    const ng = new THREE.BufferGeometry();
    ng.setAttribute("position", new THREE.BufferAttribute(L.brain, 3));
    ng.setAttribute("aNet", new THREE.BufferAttribute(L.net, 3));
    ng.setAttribute("aSeed", new THREE.BufferAttribute(L.seed, 1));
    this.nodeMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nodes = new THREE.Points(ng, this.nodeMat);
    nodes.frustumCulled = false;

    // Edges: one mesh per layout; each fades with the mix.
    const edges = (pairs: Uint32Array, layer: number) => {
      const m = pairs.length / 2;
      const pos = new Float32Array(m * 6), net = new Float32Array(m * 6), seed = new Float32Array(m * 2), t = new Float32Array(m * 2), eid = new Float32Array(m * 2);
      for (let e = 0; e < m; e++) {
        const r = Math.random();
        for (let k = 0; k < 2; k++) {
          const i = pairs[e * 2 + k], v = e * 2 + k;
          pos.set(L.brain.subarray(i * 3, i * 3 + 3), v * 3);
          net.set(L.net.subarray(i * 3, i * 3 + 3), v * 3);
          seed[v] = L.seed[i];
          t[v] = k;
          eid[v] = r;
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aNet", new THREE.BufferAttribute(net, 3));
      g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
      g.setAttribute("aEdge", new THREE.BufferAttribute(eid, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: EDGE_VERT,
        fragmentShader: EDGE_FRAG,
        uniforms: { ...this.uniforms, uLayer: { value: layer } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const lines = new THREE.LineSegments(g, mat);
      lines.frustumCulled = false;
      return lines;
    };
    this.group.add(edges(L.brainEdges, 0), edges(L.netEdges, 1), nodes);
    this.scene.add(this.group);

    this.bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthWrite: false,
      depthTest: false,
      uniforms: { uNavy: { value: C("#0a2129") }, uTeal: { value: C("#147a86") }, uSignal: { value: C("#22d8c8") }, uMix: this.uniforms.uMix },
    });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bgMat);
    bg.frustumCulled = false;
    bg.renderOrder = -1;
    this.scene.add(bg);
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
    this.uniforms.uDpr.value = dpr;
    this.uniforms.uSize.value = 3.4 * Math.max(0.75, h / 760);
  }

  /** Pointer in NDC (-1..1) relative to the canvas. */
  setPointer(x: number, y: number, on: boolean) {
    this.target.mx = x;
    this.target.my = y;
    this.target.on = on ? 1 : 0;
  }
  setHold(on: boolean) {
    this.target.hold = on ? 1 : 0;
  }
  setMix(v: number) {
    this.target.mix = v;
  }
  setFocus(v: number) {
    this.target.focus = v;
  }
  /** A deliberate tap: fire a strong cascade at the nearest neuron. */
  poke() {
    const i = this.pick(this.target.mx, this.target.my, 0.25);
    this.fire(i ?? Math.floor(Math.random() * this.layout.n));
  }

  private time() {
    return this.frozen ? 2 : (performance.now() - this.t0) / 1000;
  }

  /** Same placement as the shaders' place(), for picking and spark origins. */
  private nodePos(i: number, t: number, out: THREE.Vector3) {
    const L = this.layout, s = L.seed[i];
    const k = ease(Math.min(1, Math.max(0, this.uniforms.uMix.value * 1.3 - s * 0.3)));
    const bx = L.brain[i * 3], by = L.brain[i * 3 + 1], bz = L.brain[i * 3 + 2];
    const bl = Math.hypot(bx, by, bz) || 1, w = 0.018 * Math.sin(t * 1.3 + s * 40);
    const nx = L.net[i * 3], ny = L.net[i * 3 + 1] + 0.012 * Math.sin(t * 2 + s * 30), nz = L.net[i * 3 + 2];
    return out.set(bx + (bx / bl) * w + (nx - bx - (bx / bl) * w) * k, by + (by / bl) * w + (ny - by - (by / bl) * w) * k, bz + (bz / bl) * w + (nz - bz - (bz / bl) * w) * k);
  }

  /** Nearest neuron to a screen point (NDC), within `radius`. */
  private pick(x: number, y: number, radius: number) {
    const t = this.time();
    let best = -1, bd = radius * radius;
    this.group.updateMatrixWorld();
    const aspect = this.w / this.h;
    for (let i = 0; i < this.layout.n; i++) {
      this.nodePos(i, t, this.v).applyMatrix4(this.group.matrixWorld).project(this.camera);
      const dx = (this.v.x - x) * aspect, dy = this.v.y - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    return best < 0 ? null : best;
  }

  private fire(i: number) {
    const t = this.time();
    this.nodePos(i, t, this.v);
    this.sparks[this.sparkIdx].set(this.v.x, this.v.y, this.v.z, t);
    this.sparkIdx = (this.sparkIdx + 1) % this.sparks.length;
  }

  render(now: number) {
    if (now === this.last) return;
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    const c = this.cur, tg = this.target;
    const k = 1 - Math.exp(-dt * 6), kf = 1 - Math.exp(-dt * 2.2);
    c.mx += (tg.mx - c.mx) * k;
    c.my += (tg.my - c.my) * k;
    c.on += (tg.on - c.on) * k;
    c.hold += (tg.hold - c.hold) * kf;
    c.mix += (tg.mix - c.mix) * kf;
    c.focus += (tg.focus - c.focus) * kf;
    const t = this.time();
    this.uniforms.uTime.value = t;
    this.uniforms.uMix.value = Math.min(1, c.mix + c.hold);

    if (!this.frozen) {
      // Hover sparks the neuron under the cursor; idle time sparks a random one.
      if (tg.on && now - this.lastHoverSpark > 450) {
        const i = this.pick(tg.mx, tg.my, 0.09);
        if (i !== null) {
          this.fire(i);
          this.lastHoverSpark = now;
          this.nextAuto = t + 2.4;
        }
      }
      if (t > this.nextAuto) {
        this.fire(Math.floor(Math.random() * this.layout.n));
        this.nextAuto = t + 1.6 + Math.random() * 0.8;
      }
    }

    const net = this.uniforms.uMix.value;
    const baseY = this.frozen ? -0.7 : -0.7 + Math.sin(t * 0.12) * 0.45;
    // Network state: near side-on, so each layer reads as a column, input on the left.
    const ry = baseY * (1 - net) + -0.24 * net + c.mx * 0.3 * c.on;
    c.ry += (ry - c.ry) * 0.06;
    c.rx += (0.16 - c.my * 0.16 * c.on + net * 0.12 - c.rx) * 0.06;
    this.group.rotation.set(c.rx, c.ry, 0);
    // Takeover: pull back slightly and slide the system right so the copy has room.
    this.camera.position.z = 5.2 + c.focus * 0.4;
    this.camera.position.x = c.focus * -1.2 * Math.min(1, this.w / this.h / 1.4);
    this.camera.lookAt(this.camera.position.x, 0, 0);
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
