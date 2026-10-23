import { VERT, frag } from "./shader";
import { samplePath, denseSpline, type Pt } from "@/lib/catmullRom";
import { clamp, lerp, damp, easeInOutCubic, smoothstep } from "@/lib/damp";
import { onFrame } from "@/lib/frame";

const HSKD = 22;
const HSK = Math.tan((HSKD * Math.PI) / 180);
const COS = Math.cos((HSKD * Math.PI) / 180);

const DROPS = [
  { f: 1, r: 0.036, k: 0.2, back: 0.11 },
  { f: 0.72, r: 0.026, k: 0.15, back: 0.13 },
  { f: 0.45, r: 0.02, k: 0.11, back: 0.15 },
  { f: 1.18, r: 0.014, k: 0.24, back: 0.1 },
].map((d) => ({ ...d, x: 0, y: 0, vx: 0, vy: 0, rr: 0 }));

export type EngineEls = {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  introText: HTMLElement;
  introBlock: HTMLElement;
  slot: HTMLElement;
};

export type TextureSource = { canvas: HTMLCanvasElement; render: (now: number) => void; width: () => number; height: () => number };

type Handoff = {
  P: Pt[]; cum: number[]; len: number; l0: number; l1: number; t: number;
  hx0: number; hy0: number; sk0: number; c0: Pt; th0: number; th1: number;
};

export class HeroEngine {
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private U: Record<string, WebGLUniformLocation | null> = {};
  private tex: WebGLTexture;
  private N: number;
  private fine: boolean;
  private reduce: boolean;
  private S = { cx: 0, cy: 0, hx: 0, hy: 0 };
  private PATH: Pt[] = [];
  private SEG: [Pt, Pt] = [[0, 0], [0, 0]];
  private slotBox = { cx: 0, cy: 0, hx: 1, hy: 1, top: 0 };
  private IX: Handoff | null = null;
  private ptsBuf: Float32Array;
  private readPx = new Uint8Array(4);
  private mx = 0;
  private my = 0;
  private smx = 0.6;
  private smy = 0.5;
  private hov = 0;
  private head = 0;
  private ax = 0;
  private ay = 0;
  private attached = false;
  private wasOver = false;
  private lastOver = 0;
  private rpSkip = 0;
  private mouseMoved = false;
  private visible = true;
  private t0 = performance.now();
  private cleanup: (() => void)[] = [];
  /** 0 until the loader hands off; the slash fades in with it. */
  intro = 0;
  /** Smoothed card-morph progress, read by the scene card. */
  e2s = 0;
  texSource: TextureSource | null = null;
  onOpenChange?: (open: boolean) => void;
  private open = false;

  constructor(private els: EngineEls) {
    this.fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
    this.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.N = this.fine ? 64 : 32;
    this.ptsBuf = new Float32Array(this.N * 2);
    const gl = els.canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: this.fine, preserveDrawingBuffer: this.fine });
    if (!gl) throw new Error("webgl-unavailable");
    this.gl = gl;
    const sh = (t: number, s: string) => {
      const o = gl.createShader(t)!;
      gl.shaderSource(o, s);
      gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) ?? "shader");
      return o;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, frag(this.N)));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) ?? "link");
    gl.useProgram(pr);
    this.prog = pr;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 33, 41, 255]));
    // Accent wine, #773d43 (poster).
    gl.uniform3f(this.u("uCol"), 119 / 255, 61 / 255, 67 / 255);
    this.mx = innerWidth * 0.6;
    this.my = innerHeight * 0.5;
  }

  private u(n: string) {
    if (!(n in this.U)) this.U[n] = this.gl.getUniformLocation(this.prog, n);
    return this.U[n];
  }

  /** Rebuilds the slash and ribbon path from live DOM measurements (reference build()). */
  build = () => {
    const { canvas, root, introText, introBlock, slot } = this.els;
    const W = canvas.clientWidth || innerWidth, H = innerHeight, mob = W / H < 1, sy = scrollY;
    const top = root.getBoundingClientRect().top + sy;
    const hx = mob ? W * 0.078 : 0.07 * H, hy = (mob ? 0.15 : 0.33) * H;
    this.S = { cx: mob ? W * 0.74 : W / 2 + 0.07 * W, cy: top + (mob ? H * 0.38 : H / 2), hx, hy };
    const S = this.S;
    const B0: Pt = [S.cx + HSK * hy, S.cy - hy], A0: Pt = [S.cx - HSK * hy, S.cy + hy];
    const dl = Math.hypot(A0[0] - B0[0], A0[1] - B0[1]);
    const dir: Pt = [(A0[0] - B0[0]) / dl, (A0[1] - B0[1]) / dl];
    const ir = introText.getBoundingClientRect(), iTop = ir.top + sy, iBot = introBlock.getBoundingClientRect().bottom + sy;
    const xR = Math.min(W - Math.max(40, W * 0.06), Math.max(ir.right + W * 0.07, W * 0.64));
    const sr = slot.getBoundingClientRect();
    this.slotBox = { cx: sr.left + sr.width / 2, cy: sr.top + sy + sr.height / 2, hx: sr.width / 2, hy: sr.height / 2, top: sr.top + sy };
    const sb = this.slotBox;
    const P: Pt[] = [B0, A0, [A0[0] + dir[0] * 0.22 * H, A0[1] + dir[1] * 0.22 * H], [xR, iTop + 0.02 * H], [xR, iBot - 0.02 * H], [sb.cx + W * 0.06, sb.top - 0.1 * H], [sb.cx, sb.cy]];
    this.PATH = samplePath(P, this.N);
    this.SEG = [B0, A0];
  };

  size = () => {
    const { canvas } = this.els;
    const d = Math.min(devicePixelRatio || 1, this.fine ? 1.5 : 1);
    canvas.width = Math.round(canvas.clientWidth * d);
    canvas.height = Math.round(canvas.clientHeight * d);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.uniform2f(this.u("uRes"), canvas.width, canvas.height);
    this.build();
  };

  start() {
    this.size();
    let lastW = innerWidth;
    const onResize = () => {
      const hOnly = innerWidth === lastW;
      lastW = innerWidth;
      if (hOnly && !this.fine) return;
      this.size();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      this.mx = e.clientX;
      this.my = e.clientY;
      this.mouseMoved = true;
    };
    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove, { passive: true });
    const ro = new ResizeObserver(() => this.build());
    ro.observe(this.els.root);
    const io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    io.observe(this.els.root);
    document.fonts?.ready.then(this.build);
    const late = setTimeout(this.size, 1200);
    const off = onFrame(this.frame);
    this.cleanup.push(() => {
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      clearTimeout(late);
      off();
    });
  }

  destroy() {
    this.cleanup.forEach((f) => f());
    this.cleanup = [];
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private toS = (x: number, y: number, W: number, H: number, sy: number): Pt => [(x - W / 2) / H, (H / 2 - (y - sy)) / H];

  private frame = (now: number) => {
    if (!this.visible) return;
    const gl = this.gl, U = (n: string) => this.u(n);
    const { canvas, slot } = this.els;
    const W = canvas.clientWidth || innerWidth, H = innerHeight, sy = scrollY, N = this.N, S = this.S;
    const toS = (x: number, y: number) => this.toS(x, y, W, H, sy);
    gl.uniform1f(U("uSc"), 1);
    this.smx = damp(this.smx, this.mx / W, 0.12);
    this.smy = damp(this.smy, 1 - this.my / H, 0.12);
    const rest = clamp(1 - sy / (H * 0.15));
    const sc = toS(S.cx, S.cy);
    gl.uniform4f(U("uSlash"), sc[0], sc[1], S.hx / H, S.hy / H);
    gl.uniform1f(U("uTh"), (S.hx * COS) / H);

    // Ribbon head follows scroll (reference: min(sy + .72H, A0.y + (sy - 4) * 1.4)).
    const PATH = this.PATH;
    const a0y = PATH.length ? PATH[0][1] : 0;
    const startAt = this.fine ? 4 : H * 0.12, sv = Math.max(0, sy - startAt);
    const headY = sv <= 0 ? a0y - 1 : Math.max(a0y - 1, Math.min(sy + H * (this.fine ? 0.72 : 0.6), a0y + sv * 1.4));
    let hIdx = 0;
    for (let i = 0; i < PATH.length - 1; i++) {
      if (PATH[i + 1][1] <= headY) hIdx = i + 1;
      else if (PATH[i][1] <= headY) hIdx = Math.max(hIdx, i + clamp((headY - PATH[i][1]) / Math.max(1, PATH[i + 1][1] - PATH[i][1])));
      else break;
    }
    this.head = this.reduce ? hIdx : damp(this.head, hIdx, this.fine ? 0.25 : 0.3);
    if (Math.abs(this.head - hIdx) < 0.01) this.head = hIdx;
    for (let i = 0; i < N; i++) {
      const s2 = toS(PATH[i][0], PATH[i][1]);
      this.ptsBuf[i * 2] = s2[0];
      this.ptsBuf[i * 2 + 1] = s2[1];
    }
    gl.uniform2fv(U("uPts[0]"), this.ptsBuf);
    gl.uniform1f(U("uHead"), this.head);
    const sb = toS(this.SEG[0][0], this.SEG[0][1]), sa = toS(this.SEG[1][0], this.SEG[1][1]);
    gl.uniform4f(U("uSeg"), sb[0], sb[1], sa[0], sa[1]);
    gl.uniform1f(U("uMode"), 0);
    gl.uniform1f(U("uSkew"), HSK);
    if (this.IX) this.drawHandoff(toS, H);

    // Card morph: the tube melts into a rounded box the size of the slot.
    const box = this.slotBox;
    const end = box.cy - H / 2, start = Math.min(box.cy - H * 0.72, end - H * 0.3);
    const t2 = clamp((sy - start) / Math.max(1, end - start));
    this.e2s = this.reduce ? t2 : damp(this.e2s, t2, 0.2);
    if (Math.abs(this.e2s - t2) < 0.002) this.e2s = t2;
    const e2 = easeInOutCubic(this.e2s), bc = toS(box.cx, box.cy);
    gl.uniform4f(U("uBox"), bc[0], bc[1], this.e2s > 0.001 ? lerp(S.hx * 0.9, box.hx, e2) / H : 0, this.e2s > 0.001 ? lerp(S.hx * 0.9, box.hy, e2) / H : 0);
    gl.uniform1f(U("uK2"), clamp((this.e2s - 0.25) / 0.6));
    gl.uniform1f(U("uE2"), e2);
    const open = this.e2s > 0.97;
    if (open !== this.open) {
      this.open = open;
      slot.classList.toggle("is-open", open);
      this.onOpenChange?.(open);
    }

    this.bulge(now, W, H, rest);

    // Live scene as texture (the path the reference uses for its showreel video).
    const src = this.texSource;
    if (src && this.e2s > 0.15 && !open) {
      src.render(now);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src.canvas);
        gl.uniform2f(U("uTexSize"), src.width(), src.height());
        gl.uniform1f(U("uTexOn"), 1);
      } catch {
        gl.uniform1f(U("uTexOn"), 0);
      }
    } else gl.uniform1f(U("uTexOn"), src && this.e2s > 0.15 ? 1 : 0);

    gl.uniform1f(U("uT"), this.reduce ? 0 : (now - this.t0) / 1000);
    gl.uniform1f(U("uIn"), this.intro);
    gl.uniform1f(U("uRest"), rest);
    gl.uniform1f(U("uBreathe"), this.fine ? 1 : 0);
    gl.uniform2f(U("uM"), this.smx, this.smy);
    gl.uniform1f(U("uHov"), this.hov);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /** Cursor droplets: read the pixel under the mouse, then let four springs chase it. */
  private bulge(now: number, W: number, H: number, rest: number) {
    const gl = this.gl;
    const { canvas } = this.els;
    let over = this.lastOver;
    if (this.fine && ++this.rpSkip >= (this.mouseMoved ? 3 : 15)) {
      this.rpSkip = 0;
      this.mouseMoved = false;
      try {
        const d = canvas.width / canvas.clientWidth;
        gl.readPixels(Math.round(this.mx * d), Math.round(canvas.height - this.my * d), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.readPx);
        over = this.readPx[3] > 200 && this.intro > 0.99 && rest > 0.98 ? 1 : 0;
      } catch {
        /* readPixels can throw on lost context */
      }
      this.lastOver = over;
    }
    this.hov = lerp(this.hov, over, over ? 0.12 : 0.05);
    const px = (this.mx - W / 2) / H, py = (H / 2 - this.my) / H;
    if (over) {
      this.ax = px;
      this.ay = py;
      this.attached = true;
    } else if (this.wasOver) this.attached = true;
    this.wasOver = !!over;
    let pxl = 0, pyl = 0;
    if (this.attached && !over) {
      const dx = px - this.ax, dy = py - this.ay, len = Math.hypot(dx, dy), max = 0.11;
      if (len > 0.21 || rest < 0.98) this.attached = false;
      else {
        const k = len > max ? max / len : 1;
        pxl = dx * k;
        pyl = dy * k;
      }
    }
    const pull = this.attached && !over;
    DROPS.forEach((d, i) => {
      const wob = pull ? 0.006 * Math.sin(now / 180 + i * 1.7) : 0;
      const k = pull ? d.k : d.back, dmp = pull ? 0.72 : 0.8;
      d.vx = (d.vx + (pxl * d.f + wob - d.x) * k) * dmp;
      d.vy = (d.vy + (pyl * d.f + wob * 0.7 - d.y) * k) * dmp;
      d.x += d.vx;
      d.y += d.vy;
      const act = pull || Math.hypot(d.x, d.y) > 0.003;
      d.rr = this.reduce ? 0 : lerp(d.rr, act ? d.r : 0, act ? 0.25 : 0.12);
      gl.uniform3f(this.u("uB" + i), this.ax + d.x, this.ay + d.y, d.rr);
    });
  }

  /** The loader slash travels as a worm along a spline into the hero bar. */
  private drawHandoff(toS: (x: number, y: number) => Pt, H: number) {
    const IX = this.IX!, gl = this.gl, N = this.N, S = this.S, U = (n: string) => this.u(n);
    const t = clamp(IX.t);
    const at = (d: number): Pt => {
      let i = 1;
      while (i < IX.cum.length - 1 && IX.cum[i] < d) i++;
      const k = (d - IX.cum[i - 1]) / Math.max(1e-6, IX.cum[i] - IX.cum[i - 1]);
      return [IX.P[i - 1][0] + (IX.P[i][0] - IX.P[i - 1][0]) * k, IX.P[i - 1][1] + (IX.P[i][1] - IX.P[i - 1][1]) * k];
    };
    const e = easeInOutCubic(clamp((t - 0.06) / 0.74));
    const hd = IX.l0 + (IX.len - IX.l0) * e;
    const vis = IX.l0 + (IX.l1 - IX.l0) * e + Math.sin(Math.PI * e) * IX.len * 0.28;
    const tl = Math.max(0, hd - vis);
    const morph = 1 - smoothstep(0.84, 1, t);
    const fin = t > 0.5;
    const hx = fin ? S.hx : IX.hx0, hy = fin ? S.hy : IX.hy0, sk = fin ? HSK : IX.sk0;
    const c = fin ? toS(S.cx, S.cy) : toS(IX.c0[0], IX.c0[1]);
    gl.uniform4f(U("uSlash"), c[0], c[1], hx / H, hy / H);
    gl.uniform1f(U("uSkew"), sk);
    gl.uniform1f(U("uTh"), (IX.th0 + (IX.th1 - IX.th0) * e) / H);
    gl.uniform1f(U("uMode"), Math.max(0.001, morph));
    for (let i = 0; i < N; i++) {
      const q2 = at(tl + ((hd - tl) * i) / (N - 1)), s2 = toS(q2[0], q2[1]);
      this.ptsBuf[i * 2] = s2[0];
      this.ptsBuf[i * 2 + 1] = s2[1];
    }
    gl.uniform2fv(U("uPts[0]"), this.ptsBuf);
    gl.uniform1f(U("uHead"), N - 1);
    gl.uniform4f(U("uSeg"), 99, 99, 99, 99);
    const capN = (a: Pt, b: Pt): Pt => {
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      dx /= l;
      dy /= l;
      const w = clamp((Math.abs(dy) - 0.45) / 0.3);
      const nx = dx * (1 - w), ny = dy, nl = Math.hypot(nx, ny) || 1;
      return [nx / nl, ny / nl];
    };
    const hA = toS(...at(Math.max(0, hd - 6))), hB = toS(...at(hd)), tA = toS(...at(tl)), tB = toS(...at(Math.min(IX.len, tl + 6)));
    const nH = capN(hA, hB), nT = capN(tB, tA);
    gl.uniform4f(U("uCapH"), hB[0], hB[1], nH[0], nH[1]);
    gl.uniform4f(U("uCapT"), tA[0], tA[1], nT[0], nT[1]);
    if (t >= 1) {
      gl.uniform1f(U("uMode"), 0);
      gl.uniform1f(U("uHead"), 0);
      const c2 = toS(S.cx, S.cy);
      gl.uniform4f(U("uSlash"), c2[0], c2[1], S.hx / H, S.hy / H);
      gl.uniform1f(U("uSkew"), HSK);
      gl.uniform1f(U("uTh"), (S.hx * COS) / H);
    }
  }

  /**
   * Starts the worm from the loader's slash element. Calls `onGo` when the headline
   * should reveal (t > .72) and `onDone` when the bar has landed.
   */
  handoff(slashEl: HTMLElement, skewDeg: number, onGo: () => void, onDone: () => void) {
    const D = 2250, DELAY = 250;
    const r = slashEl.getBoundingClientRect(), w0 = slashEl.offsetWidth, h0 = slashEl.offsetHeight;
    const sy0 = scrollY, Wv = this.els.canvas.clientWidth || innerWidth, Hv = innerHeight, S = this.S;
    const T = Math.tan((skewDeg * Math.PI) / 180);
    const lc: Pt = [r.left + r.width / 2, r.top + r.height / 2 + sy0];
    const lb: Pt = [lc[0] - (h0 / 2) * T, lc[1] + h0 / 2], lt: Pt = [lc[0] + (h0 / 2) * T, lc[1] - h0 / 2];
    const hb: Pt = [S.cx - HSK * S.hy, S.cy + S.hy], ht: Pt = [S.cx + HSK * S.hy, S.cy - S.hy];
    const la = Math.hypot(lt[0] - lb[0], lt[1] - lb[1]), ha = Math.hypot(ht[0] - hb[0], ht[1] - hb[1]);
    const ld: Pt = [(lt[0] - lb[0]) / la, (lt[1] - lb[1]) / la], hdv: Pt = [(ht[0] - hb[0]) / ha, (ht[1] - hb[1]) / ha];
    const Y = (y: number) => y + sy0;
    const K: Pt[] = [
      [lb[0] - ld[0] * 40, lb[1] - ld[1] * 40], lb, lt,
      [Wv * 0.56, Y(Hv * 0.12)], [Wv * 0.86, Y(Hv * 0.3)], [Wv * 0.8, Y(Hv * 0.62)], [Wv * 0.56, Y(Hv * 0.7)],
      [hb[0] - hdv[0] * Hv * 0.08, hb[1] - hdv[1] * Hv * 0.08], hb, ht, [ht[0] + hdv[0] * 40, ht[1] + hdv[1] * 40],
    ];
    const P = denseSpline(K);
    const cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    this.IX = {
      P, cum, len: cum[cum.length - 1], l0: la, l1: ha, t: 0, hx0: w0 / 2, hy0: h0 / 2, sk0: T, c0: lc,
      th0: (w0 / 2) * Math.cos((skewDeg * Math.PI) / 180), th1: S.hx * COS,
    };
    this.intro = 1;
    const t0 = performance.now();
    let went = false;
    const off = onFrame((now) => {
      if (!this.IX) return;
      this.IX.t = Math.max(0, (now - t0 - DELAY) / D);
      if (!went && this.IX.t > 0.72) {
        went = true;
        onGo();
      }
      if (this.IX.t >= 1) {
        this.IX.t = 1;
        off();
        requestAnimationFrame(() => {
          this.IX = null;
          onDone();
        });
      }
    });
    this.cleanup.push(off);
  }
}
