// Shaders for the "thinking system": a brain-shaped neural web that rearranges into
// a layered artificial neural network. Positions come from two layouts per node
// (position = brain, aNet = network) mixed per node with a small stagger.

const COMMON = `
uniform float uTime, uMix;
uniform vec4 uSparks[4];
float ease(float x){ return x * x * (3. - 2. * x); }
float mixFor(float seed){ return ease(clamp(uMix * 1.3 - seed * 0.3, 0., 1.)); }
vec3 place(vec3 b, vec3 n, float seed){
  vec3 bb = b + normalize(b + 1e-4) * 0.018 * sin(uTime * 1.3 + seed * 40.);
  vec3 nn = n + vec3(0., 0.012 * sin(uTime * 2. + seed * 30.), 0.);
  return mix(bb, nn, mixFor(seed));
}
// Travelling shells of activity. Brain: radiate outward (euclidean).
// Network: flow forward along x, layer to layer.
float spark(vec3 p){
  float s = 0.;
  for (int i = 0; i < 4; i++) {
    vec4 o = uSparks[i];
    float age = uTime - o.w;
    if (age < 0. || age > 3.6) continue;
    float de = length(p - o.xyz);
    float dx = p.x - o.x;
    float df = dx < -0.03 ? 9. : dx + 0.12 * length(p.yz - o.yz);
    float d = mix(de, df, uMix);
    s += exp(-pow((d - age * 1.2) / 0.15, 2.)) * exp(-age * 0.75);
  }
  return s;
}`;

export const NODE_VERT = `
${COMMON}
attribute vec3 aNet;
attribute float aSeed;
uniform float uSize, uDpr;
varying float vMix, vSpark;
void main(){
  vec3 p = place(position, aNet, aSeed);
  vMix = mixFor(aSeed);
  vSpark = spark(p);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uDpr * (5. / -mv.z) * (0.7 + aSeed * 0.6) * (1. + vMix * 0.35) * (1. + min(vSpark, 1.5) * 1.4);
}`;

export const NODE_FRAG = `
precision highp float;
uniform vec3 uColA, uColB;
varying float vMix, vSpark;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float core = smoothstep(0.5, 0.0, length(c));
  float a = core * core * (0.8 + min(vSpark, 1.5));
  vec3 col = mix(mix(uColA, uColB, vMix), vec3(1.), clamp(vSpark, 0., 1.));
  gl_FragColor = vec4(col * a, a);
}`;

export const EDGE_VERT = `
${COMMON}
attribute vec3 aNet;
attribute float aSeed;
attribute float aT;
attribute float aEdge;
varying float vT, vEdge;
varying vec3 vPos;
void main(){
  vec3 p = place(position, aNet, aSeed);
  vT = aT;
  vEdge = aEdge;
  vPos = p;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;

export const EDGE_FRAG = `
precision highp float;
${COMMON}
uniform float uLayer;
uniform vec3 uColA, uColB;
varying float vT, vEdge;
varying vec3 vPos;
void main(){
  float vis = uLayer < 0.5 ? 1. - smoothstep(0.15, 0.75, uMix) : smoothstep(0.35, 0.95, uMix);
  if (vis < 0.01) discard;
  float speed = 0.35 + fract(vEdge * 7.31) * 0.6;
  float pos = uLayer > 0.5 || fract(vEdge * 3.7) > 0.5 ? vT : 1. - vT;
  float ph = fract(uTime * speed * 0.5 + vEdge * 11.);
  float dash = smoothstep(0.08, 0., abs(pos - ph)) * step(0.7, fract(vEdge * 13.7));
  float sp = spark(vPos);
  float a = ((uLayer > 0.5 ? 0.07 : 0.085) + dash * 0.75 + sp * 0.85) * vis;
  vec3 col = mix(mix(uColA, uColB, uMix), vec3(0.93, 1., 0.98), clamp(dash * 0.6 + sp, 0., 1.));
  gl_FragColor = vec4(col * a, a);
}`;

export const BG_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.); }`;

export const BG_FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec3 uNavy, uTeal, uSignal;
uniform float uMix;
void main(){
  vec2 p = vUv;
  float g1 = smoothstep(0.85, 0.0, distance(p, vec2(0.78, -0.08)));
  float g2 = smoothstep(0.7, 0.0, distance(p, vec2(0.12, 1.05)));
  vec3 col = uNavy;
  col = mix(col, uTeal, g1 * 0.5);
  col = mix(col, uSignal, g1 * g1 * 0.16 * (1.0 - uMix * 0.5));
  col = mix(col, uTeal * 0.7, g2 * 0.3);
  gl_FragColor = vec4(col, 1.);
}`;
