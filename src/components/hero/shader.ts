// Hero fragment shader. Everything is a 2D signed distance field fused with smooth-min,
// which is where the goo comes from:
//   slanted bar (sdBox, x skewed by tan 22deg) -> capsule tube along a sampled path
//   -> rounded card box (showing the live scene), plus four cursor droplets.
export const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

export const frag = (N: number) => `precision highp float;
#define N ${N}
uniform vec2 uRes;uniform float uT,uHead,uTh,uK2,uE2,uTexOn,uHov,uIn,uRest;uniform vec2 uM;
uniform vec4 uSlash,uBox,uSeg;uniform vec3 uCol;uniform float uMode,uSkew;uniform vec4 uCapH,uCapT;uniform float uBreathe,uSc;
uniform vec2 uPts[N];uniform vec3 uB0,uB1,uB2,uB3;uniform sampler2D uTex;uniform vec2 uTexSize;
float sdBox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float blob(vec2 p,vec3 b){return b.z>.0005?length(p-b.xy)-b.z:1e3;}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-8),0.,1.);return length(pa-ba*h);}
void main(){
  vec2 p=(gl_FragCoord.xy-uRes*.5)/uRes.y;
  vec2 mp=(uM*uRes-uRes*.5)/uRes.y;
  vec2 q=p-uSlash.xy; q.y+=.004*sin(uT*1.2)*uRest*uBreathe;
  q.x-=q.y*(uSkew+(uM.x-.5)*.05*uRest);
  float dPara=sdBox(q,uSlash.zw,.012*uSc);
  float dl=sdSeg(p,uSeg.xy,uSeg.zw)-uTh;
  for(int i=0;i<N-1;i++){
    float fi=float(i);
    if(fi>=uHead-.001) break;
    vec2 a=uPts[i], b=uPts[i+1];
    if(fi+1.>uHead) b=mix(a,b,uHead-fi);
    float dd=sdSeg(p,a,b)-uTh;
    if(uMode>.0005){ if(length(a-uCapT.xy)<uTh*2.5) dd=max(dd,dot(p-uCapT.xy,uCapT.zw)); if(length(b-uCapH.xy)<uTh*2.5) dd=max(dd,dot(p-uCapH.xy,uCapH.zw)); }
    dl=min(dl,dd);
  }
  float d=uMode>.0005?mix(dPara,dl,uMode):mix(dPara,dl,smoothstep(.0,1.2,uHead));
  float dB=sdBox(p-uBox.xy,uBox.zw,.022*uSc);
  d=smin(d+uK2*.12*uSc,dB,(.08*(1.-uE2)+.008)*uSc);
  float db=smin(smin(blob(p,uB0),blob(p,uB1),.05),smin(blob(p,uB2),blob(p,uB3),.04),.05);
  d=smin(d,db,.07);
  vec3 col=mix(uCol,vec3(.722,.376,.247),clamp(.5-(q.y/uSlash.w)*.5,0.,1.)*.8*uRest);
  col=mix(col,uCol*.8,smoothstep(.22,.0,length(p-mp))*uHov*.38);
  if(uTexOn>.5){
    vec2 v=(p-uBox.xy)/uBox.zw*.5+.5; v.y=1.-v.y;
    float ar=uBox.z/uBox.w, tr=uTexSize.x/max(uTexSize.y,1.);
    if(ar>tr){v.y=(v.y-.5)*tr/ar+.5;}else{v.x=(v.x-.5)*ar/tr+.5;}
    col=mix(col,texture2D(uTex,clamp(v,0.,1.)).rgb,smoothstep(.45,.95,uE2)*step(dB,.002*uSc));
  }
  float px=1.2/uRes.y;
  float al=(1.-smoothstep(-px,px,d))*uIn;
  gl_FragColor=vec4(col*al,al);
}`;
