import * as THREE from "three";
import { BG_FRAG, BG_VERT, EDGE_FRAG, EDGE_VERT, NODE_FRAG, NODE_VERT } from "./shaders";
import { buildLayout, type Layout } from "./layout";
import { cascade, type PulseTarget } from "./cascade";

// Raw shader materials: keep colours in sRGB end to end (no linear conversion).
THREE.ColorManagement.enabled = false;
const C = (hex: string) => new THREE.Color(hex);
const ease = (x: number) => x * x * (3 - 2 * x);

/**
 * The card's "thinking system". A brain-shaped web of neurons and synapses that
 * fires: a click sends a signal down the real synapses, neuron to neuron, hover
 * lights the synapses of the neuron under the cursor, and small thoughts run on
 * their own when idle. Holding rearranges the same neurons into the layers of an
 * artificial neural network, where a click runs a forward pass layer to layer.
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
  private target = { mix: 0.0, mx: 0, my: 0, on: 0, hold: 0 };
  private cur = { mix: 0.0, mx: 0, my: 0, on: 0, hold: 0, rx: 0.22, ry: -1.05 };
  private last = 0;
  private lastHoverSpark = 0;
  private nextAuto = 1.2;
  private lastHoverPick = 0;
  private v = new THREE.Vector3();
  private nodeGeo!: THREE.BufferGeometry;
  private edgeGeo: THREE.BufferGeometry[] = [];
  private pulses!: { brain: PulseTarget; net: PulseTarget };
  /** True while the pointer is over a neuron (for the cursor). */
  nearNode = false;
  private wasNet = false;
  private inputs: number[] = [];
  w = 1;
  h = 1;

  constructor(opts: { dense: boolean; frozen?: boolean }) {
    this.frozen = !!opts.frozen;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setClearColor(0xf3f5f9, 1);
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute("aria-hidden", "true");
    this.camera.position.set(0, 0, 5.2);

    const L = (this.layout = buildLayout(opts.dense ? 2000 : 820));
    this.inputs = L.inputs;
    this.uniforms = {
      uTime: { value: 0 },
      uMix: { value: 0 },
      uSparks: { value: this.sparks },
      uPT: { value: 0 },
      uWob: { value: 1 },
      uWrist: { value: 0 },
      uHover: { value: -1 },
      uInstant: { value: this.frozen ? 1 : 0 },
      uSize: { value: 3 },
      uDpr: { value: 1 },
      uColA: { value: C("#3d5d9e") },
      uColB: { value: C("#081c38") },
      uSpark: { value: C("#d88400") },
      uHot: { value: C("#f0b428") },
      // Depth: the far side fades toward the card colour, nodes are lit spheres (see shaders).
      uDepth: { value: 1 },
      uCamDist: { value: 5.2 },
      uFogCol: { value: C("#e6ecf6") },
    };

    // Nodes
    const ng = new THREE.BufferGeometry();
    ng.setAttribute("position", new THREE.BufferAttribute(L.brain, 3));
    ng.setAttribute("aNet", new THREE.BufferAttribute(L.net, 3));
    ng.setAttribute("aSeed", new THREE.BufferAttribute(L.seed, 1));
    const hit = new Float32Array(L.n).fill(-99);
    ng.setAttribute("aHit", new THREE.BufferAttribute(hit, 1));
    ng.setAttribute("aRing", new THREE.BufferAttribute(new Float32Array(L.n).fill(-99), 1));
    ng.setAttribute("aIdx", new THREE.BufferAttribute(Float32Array.from({ length: L.n }, (_, i) => i), 1));
    this.nodeGeo = ng;
    this.nodeMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const nodes = new THREE.Points(ng, this.nodeMat);
    nodes.frustumCulled = false;

    // Edges: one mesh per layout; each fades with the mix.
    const edges = (pairs: Uint32Array, layer: number, kinds?: Uint8Array) => {
      const m = pairs.length / 2;
      const pos = new Float32Array(m * 6), net = new Float32Array(m * 6), seed = new Float32Array(m * 2), t = new Float32Array(m * 2), eid = new Float32Array(m * 2);
      const kind = new Float32Array(m * 2);
      const fire = new Float32Array(m * 2).fill(-99), dir = new Float32Array(m * 2), ends = new Float32Array(m * 4);
      for (let e = 0; e < m; e++) {
        const r = Math.random();
        for (let k = 0; k < 2; k++) {
          const i = pairs[e * 2 + k], v = e * 2 + k;
          pos.set(L.brain.subarray(i * 3, i * 3 + 3), v * 3);
          net.set(L.net.subarray(i * 3, i * 3 + 3), v * 3);
          seed[v] = L.seed[i];
          t[v] = k;
          eid[v] = r;
          ends[v * 2] = pairs[e * 2];
          ends[v * 2 + 1] = pairs[e * 2 + 1];
          kind[v] = kinds ? kinds[e] : 0;
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aNet", new THREE.BufferAttribute(net, 3));
      g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
      g.setAttribute("aEdge", new THREE.BufferAttribute(eid, 1));
      g.setAttribute("aFire", new THREE.BufferAttribute(fire, 1));
      g.setAttribute("aDir", new THREE.BufferAttribute(dir, 1));
      g.setAttribute("aEnds", new THREE.BufferAttribute(ends, 2));
      g.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));
      this.edgeGeo[layer] = g;
      const mat = new THREE.ShaderMaterial({
        vertexShader: EDGE_VERT,
        fragmentShader: EDGE_FRAG,
        uniforms: { ...this.uniforms, uLayer: { value: layer }, uBaseA: { value: layer ? 0.11 : 0.42 }, uDash: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const lines = new THREE.LineSegments(g, mat);
      lines.frustumCulled = false;
      return lines;
    };
    this.group.add(edges(L.brainEdges, 0, L.brainEdgeKind), edges(L.netEdges, 1), nodes);
    const attr = (g: THREE.BufferGeometry, k: string) => (g.getAttribute(k) as THREE.BufferAttribute).array as Float32Array;
    this.pulses = {
      brain: { fire: attr(this.edgeGeo[0], "aFire"), dir: attr(this.edgeGeo[0], "aDir"), hit },
      net: { fire: attr(this.edgeGeo[1], "aFire"), dir: attr(this.edgeGeo[1], "aDir"), hit },
    };
    this.scene.add(this.group);

    this.bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthWrite: false,
      depthTest: false,
      uniforms: { uBase: { value: C("#f3f5f9") }, uTint: { value: C("#e6ecf7") }, uGlow: { value: C("#f3e3c6") }, uMix: this.uniforms.uMix },
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
  /**
   * A deliberate tap: the nearest neuron pops (ring + flash) and sends a signal
   * down its synapses. In the network view it runs a forward pass instead.
   */
  poke() {
    const net = this.uniforms.uMix.value > 0.5;
    let i = this.pick(this.target.mx, this.target.my, 0.14) ?? Math.floor(Math.random() * this.layout.n);
    if (net) i = this.layout.core[i];
    (this.nodeGeo.getAttribute("aRing").array as Float32Array)[i] = this.pt();
    this.nodeGeo.getAttribute("aRing").needsUpdate = true;
    this.think(i, net ? { maxDepth: 6, branch: 1, cap: 500, hop: 0.2 } : { maxDepth: 7, branch: 0.6, cap: 150, hop: 0.11 });
    if (net) this.fire(i);
  }

  private think(i: number, o: { maxDepth: number; branch: number; cap: number; hop: number }) {
    const net = this.uniforms.uMix.value > 0.5;
    cascade(net ? this.layout.netAdj : this.layout.brainAdj, this.layout.n, i, this.pt(), net ? this.pulses.net : this.pulses.brain, {
      ...o,
      hop: this.frozen ? 0 : o.hop,
    });
    if (net) {
      // A neuron is a ring of nodes around its core: light the whole ring.
      const hit = this.pulses.net.hit, core = this.layout.core;
      for (let k = 0; k < this.layout.n; k++) if (core[k] !== k) hit[k] = hit[core[k]];
    }
    this.edgeGeo[net ? 1 : 0].getAttribute("aFire").needsUpdate = true;
    this.edgeGeo[net ? 1 : 0].getAttribute("aDir").needsUpdate = true;
    this.nodeGeo.getAttribute("aHit").needsUpdate = true;
  }

  private time() {
    return this.frozen ? 2 : (performance.now() - this.t0) / 1000;
  }
  /** Pulse clock: always real time, so a click shows even when the scene is frozen. */
  private pt() {
    return (performance.now() - this.t0) / 1000;
  }

  /** Same placement as the shaders' place(), for picking and spark origins. */
  private nodePos(i: number, t: number, out: THREE.Vector3) {
    const L = this.layout, s = L.seed[i];
    const k = ease(Math.min(1, Math.max(0, this.uniforms.uMix.value * 1.3 - s * 0.3)));
    const bx = L.brain[i * 3], by = L.brain[i * 3 + 1], bz = L.brain[i * 3 + 2];
    const bl = Math.hypot(bx, by, bz) || 1, w = 0.01 * Math.sin(t * 1.3 + bx * 2.3 + by * 3.1 + bz * 1.7);
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
    const t = this.time();
    this.uniforms.uTime.value = t;
    this.uniforms.uPT.value = this.pt();
    this.uniforms.uMix.value = Math.min(1, c.mix + c.hold);

    // Hover: ring the neuron under the cursor and light its synapses.
    if (now - this.lastHoverPick > 70) {
      this.lastHoverPick = now;
      const h = tg.on ? this.pick(tg.mx, tg.my, 0.07) : null;
      this.uniforms.uHover.value = h === null ? -1 : this.uniforms.uMix.value > 0.5 ? this.layout.core[h] : h;
      if (this.nearNode !== (h !== null)) {
        this.nearNode = h !== null;
        this.canvas.style.cursor = this.nearNode ? "pointer" : "";
      }
    }

    if (!this.frozen) {
      // Hover sparks a soft shell around the cursor; idle time runs a small thought.
      if (tg.on && now - this.lastHoverSpark > 450) {
        const i = this.pick(tg.mx, tg.my, 0.09);
        if (i !== null) {
          this.fire(i);
          this.lastHoverSpark = now;
          this.nextAuto = t + 2.4;
        }
      }
      // Network view: forward passes from the input layer, a quick burst as it forms.
      const netNow = this.uniforms.uMix.value > 0.5;
      if (netNow && !this.wasNet) this.nextAuto = t;
      this.wasNet = netNow;
      if (t > this.nextAuto) {
        if (netNow) {
          this.think(this.inputs[Math.floor(Math.random() * this.inputs.length)], { maxDepth: 6, branch: 0.45, cap: 40, hop: 0.2 });
          this.nextAuto = t + 0.55 + Math.random() * 0.4;
        } else {
          this.think(Math.floor(Math.random() * this.layout.n), { maxDepth: 4, branch: 0.5, cap: 18, hop: 0.13 });
          this.nextAuto = t + 1.4 + Math.random() * 0.9;
        }
      }
    }

    const net = this.uniforms.uMix.value;
    // Brain: a three-quarter side view (front lobe to the left, seen a little from above), the angle a
    // brain is most readable from, swaying gently so its depth shows.
    const baseY = this.frozen ? -1.05 : -1.05 + Math.sin(t * 0.12) * 0.24;
    // Network: an oblique view so the layer grids show their depth, input on the left.
    const ry = baseY * (1 - net) + -0.34 * net + c.mx * 0.3 * c.on;
    c.ry += (ry - c.ry) * 0.06;
    c.rx += (0.22 - c.my * 0.16 * c.on + net * 0.1 - c.rx) * 0.06;
    this.group.rotation.set(c.rx, c.ry, 0);
    // Narrow canvases (phones): step back just enough to keep the brain, and the wider network, in frame.
    const aspect = this.w / this.h, fit = Math.max(1, (0.92 + net * 0.42) / aspect);
    this.camera.position.set(0, 0, 5.2 * fit);
    this.camera.lookAt(0, 0, 0);
    this.uniforms.uCamDist.value = this.camera.position.length();
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
