// Shaders for the "thinking system": a brain-shaped neural web that rearranges into
// a layered artificial neural network. Positions come from two layouts per node
// (position = brain, aNet = network) mixed per node with a small stagger.
// The hands reuse the same shaders with aNet = position and uMix = 0.
//
// Two kinds of activity:
// - spark(): travelling shells in space (hover ambience, the network's forward wash);
// - pulses: real signals that run along individual synapses, scheduled per edge by
//   cascade.ts (aFire = start time, aDir = which way) and per node (aHit = arrival).

const COMMON = `
uniform float uTime, uMix, uPT, uWob, uWrist;
uniform vec4 uSparks[4];
float ease(float x){ return x * x * (3. - 2. * x); }
float mixFor(float seed){ return ease(clamp(uMix * 1.3 - seed * 0.3, 0., 1.)); }
vec3 place(vec3 b, vec3 n, float seed){
  vec3 bb = b + normalize(b + 1e-4) * 0.018 * uWob * sin(uTime * 1.3 + seed * 40.);
  vec3 nn = n + vec3(0., 0.012 * sin(uTime * 2. + seed * 30.), 0.);
  return mix(bb, nn, mixFor(seed));
}
// Hands dissolve towards the wrist (local x < 0) instead of ending in a cut.
float wristFade(vec3 p){ return mix(1., smoothstep(-0.55, 0.12, p.x), uWrist); }
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
attribute float aSeed, aHit, aRing, aIdx;
uniform float uSize, uDpr, uHover;
varying float vMix, vSpark, vHit, vRing, vHov, vCore, vFade;
void main(){
  vec3 p = place(position, aNet, aSeed);
  vMix = mixFor(aSeed);
  vSpark = spark(p);
  vFade = wristFade(position);
  float ha = uPT - aHit;
  vHit = ha >= 0. && ha < 3. ? exp(-ha * 2.6) : 0.;
  float ra = uPT - aRing;
  vRing = ra >= 0. && ra < 0.9 ? ra / 0.9 : -1.;
  vHov = abs(aIdx - uHover) < 0.5 ? 1. : 0.;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float base = uSize * uDpr * (5. / -mv.z) * (0.7 + aSeed * 0.6) * (1. + vMix * 0.35);
  float dsz = base * (1. + min(vSpark, 1.5) * 1.4 + vHit * 1.5);
  // Rings need room beyond the dot: grow the sprite, shrink the core to match.
  float ring = vRing >= 0. ? mix(14., 78., ease(vRing)) * uDpr : vHov > 0.5 ? 26. * uDpr : 0.;
  gl_PointSize = max(dsz, ring);
  vCore = dsz / gl_PointSize;
}`;

export const NODE_FRAG = `
precision highp float;
uniform vec3 uColA, uColB, uSpark, uHot;
varying float vMix, vSpark, vHit, vRing, vHov, vCore, vFade;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.;
  float core = smoothstep(vCore, 0.0, d);
  float heat = clamp(max(vSpark, vHit * 1.2), 0., 1.);
  float a = min(1., core * core * (0.85 + min(vSpark, 1.5) * 0.5 + vHit * 0.6));
  vec3 col = mix(mix(uColA, uColB, vMix), uSpark, heat);
  // Fresh arrivals burn gold, then cool to wine.
  col = mix(col, uHot, smoothstep(0.45, 0.9, vHit));
  float ring = 0.;
  if (vRing >= 0.) ring = smoothstep(0.07, 0., abs(d - 0.9)) * (1. - vRing) * 0.9;
  else if (vHov > 0.5) ring = smoothstep(0.08, 0., abs(d - 0.82)) * 0.55;
  if (ring > a) { col = uSpark; a = ring; }
  a *= vFade;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
}`;

export const EDGE_VERT = `
${COMMON}
attribute vec3 aNet;
attribute float aSeed, aT, aEdge, aFire, aDir;
attribute vec2 aEnds;
uniform float uHover;
varying float vT, vEdge, vFire, vDir, vHov, vFade;
varying vec3 vPos;
void main(){
  vec3 p = place(position, aNet, aSeed);
  vT = aT;
  vEdge = aEdge;
  vFire = aFire;
  vDir = aDir;
  vHov = abs(aEnds.x - uHover) < 0.5 || abs(aEnds.y - uHover) < 0.5 ? 1. : 0.;
  vFade = wristFade(position);
  vPos = p;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;

export const EDGE_FRAG = `
precision highp float;
${COMMON}
uniform float uLayer, uBaseA, uDash, uInstant;
uniform vec3 uColA, uColB, uSpark, uHot;
varying float vT, vEdge, vFire, vDir, vHov, vFade;
varying vec3 vPos;
void main(){
  float vis = uLayer < 0.5 ? 1. - smoothstep(0.15, 0.75, uMix) : uLayer < 1.5 ? smoothstep(0.35, 0.95, uMix) : 1.;
  if (vis < 0.01) discard;
  float speed = 0.35 + fract(vEdge * 7.31) * 0.6;
  float pos = uLayer > 0.5 || fract(vEdge * 3.7) > 0.5 ? vT : 1. - vT;
  float ph = fract(uTime * speed * 0.5 + vEdge * 11.);
  float dash = smoothstep(0.08, 0., abs(pos - ph)) * step(0.7, fract(vEdge * 13.7)) * uDash;
  float sp = spark(vPos);

  // Signal pulse: a bright head runs the length of the synapse in 0.3s with a
  // short tail, then the whole line holds an afterglow that fades.
  float pulse = 0., hot = 0.;
  float age = uPT - vFire;
  if (age >= 0. && age < 2.4) {
    float along = vDir > 0.5 ? vT : 1. - vT;
    float pr = uInstant > 0.5 ? 2. : age / 0.3;
    float head = exp(-pow((along - pr) / 0.07, 2.));
    float tail = along < pr ? smoothstep(pr - 0.5, pr, along) * 0.6 : 0.;
    float glow = smoothstep(0.85, 1.25, pr) * exp(-max(age - 0.3, 0.) * 2.) * 0.55;
    pulse = max(head + tail, glow);
    hot = head;
  }

  float a = min(1., (uBaseA + dash * 0.6 + sp * 0.75 + pulse * 0.95 + vHov * 0.4) * vis * vFade);
  vec3 col = mix(mix(uColA, uColB, uMix), uSpark, clamp(dash * 0.8 + sp + pulse + vHov * 0.6, 0., 1.));
  col = mix(col, uHot, clamp(hot, 0., 1.) * 0.85);
  gl_FragColor = vec4(col, a);
}`;

/** A jagged arc between two fingertips (the hands' contact spark). */
export const BOLT_VERT = `
attribute float aT;
uniform vec3 uA, uB;
uniform float uPT, uAt;
varying float vT;
float h(float x){ return fract(sin(x * 127.1) * 43758.5453); }
void main(){
  vT = aT;
  vec3 p = mix(uA, uB, aT);
  vec3 ab = uB - uA;
  vec3 side = normalize(cross(ab, vec3(0., 0., 1.)) + 1e-4);
  float f = floor(uPT * 24.);
  float env = sin(aT * 3.14159);
  p += side * (h(aT * 31. + f) - 0.5) * 0.09 * env + vec3(0., 0., (h(aT * 17. + f * 3.) - 0.5) * 0.05 * env);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;

export const BOLT_FRAG = `
precision highp float;
uniform vec3 uSpark, uHot;
uniform float uPT, uAt;
varying float vT;
void main(){
  float age = uPT - uAt;
  float a = age >= 0. && age < 0.9 ? exp(-age * 4.) * (0.6 + 0.4 * step(0.5, fract(uPT * 18.))) : 0.;
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uSpark, uHot, exp(-age * 6.)), a);
}`;

export const BG_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.); }`;

export const BG_FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec3 uBase, uTint, uGlow;
uniform float uMix;
// Light card: ivory base, a warm clay/peach wash bottom-right and a lighter top-left.
void main(){
  vec2 p = vUv;
  float g1 = smoothstep(0.9, 0.0, distance(p, vec2(0.8, -0.05)));
  float g2 = smoothstep(0.75, 0.0, distance(p, vec2(0.1, 1.05)));
  vec3 col = uBase;
  col = mix(col, uTint, g1 * 0.85);
  col = mix(col, uGlow, g1 * g1 * 0.5 * (1.0 - uMix * 0.4));
  col = mix(col, vec3(1.), g2 * 0.6);
  gl_FragColor = vec4(col, 1.);
}`;
