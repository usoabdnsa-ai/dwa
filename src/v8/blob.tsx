"use client";

import { useEffect, useRef, useState } from "react";

/*
 * The v8 background: one liquid-glass blob, raymarched in a fragment shader
 * written for dwa. It has four shapes it can melt between (uMorph):
 *   0 a soft drop with orbiting droplets, 1 a pill, 2 a cluster of three
 *   (a shelf), 3 a rounded ticket (the pickup code).
 * Pearl shading: a mint/lilac environment with a studio strip, thin-film
 * iridescence at the rim, crevice shading, translucency on thin parts and an
 * anti-aliased silhouette. The pill is two-tone, the ticket has punched notches. It is only marched inside its bounding sphere and
 * drawn at reduced resolution, paused when the tab is hidden, still under
 * reduced motion.
 */

const VERT = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uPos;
uniform float uScale;
uniform float uMorph;
uniform float uMerge;
uniform float uEnergy;
uniform vec3 uTint;

mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
float sdCapsule(vec3 p,float h,float r){p.y-=clamp(p.y,-h,h);return length(p)-r;}
float sdRBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}

/* object space: slow turn plus a tilt toward the pointer */
vec3 xf(vec3 p){
  p.xz*=rot(uTime*.12+(uMouse.x-.5)*.9);
  p.yz*=rot((uMouse.y-.5)*.6);
  return p;
}
vec4 weights(){
  float m=uMorph;
  return vec4(clamp(1.-m,0.,1.),clamp(1.-abs(m-1.),0.,1.),clamp(1.-abs(m-2.),0.,1.),clamp(m-2.,0.,1.));
}

float map(vec3 p){
  float t=uTime;
  p=xf(p);
  vec4 w=weights();

  float spread=mix(1.7,.6,uMerge);
  float d0=length(p)-mix(.3,.62,uMerge);
  for(int i=0;i<4;i++){
    float fi=float(i);
    vec3 c=vec3(sin(t*.45+fi*1.9),cos(t*.37+fi*1.3)*.65,cos(t*.45+fi*1.9))*spread;
    d0=smin(d0,length(p-c)-mix(.17,.2,uMerge),mix(.06,.38,uMerge));
  }
  /* pill: a capsule with a pressed seam where the two halves meet */
  vec3 pp=p; pp.xy*=rot(.95);
  float d1=sdCapsule(pp,.56,.36)+.014*smoothstep(.04,0.,abs(pp.y));
  /* shelf: three boxes leaning together */
  float a=length(p-vec3(-.46,-.16,0.))-.34;
  float b=length(p-vec3(.44,-.2,.08))-.3;
  float c=length(p-vec3(.0,.4,-.05))-.32;
  float d2=smin(smin(a,b,.18),c,.18);
  /* ticket: rounded card with two punched notches */
  float d3=sdRBox(p,vec3(.78,.46,.09),.14);
  d3=smax(d3,-(length(p.xy-vec2(.8,0.))-.17),.04);
  d3=smax(d3,-(length(p.xy-vec2(-.8,0.))-.17),.04);
  d3+=.007*smoothstep(.018,0.,abs(p.x-.4))*smoothstep(-.2,.6,sin(p.y*44.)); /* tear-off perforation */

  float d=d0*w.x+d1*w.y+d2*w.z+d3*w.w;
  float wob=sin(p.x*4.+t*1.3)*sin(p.y*4.2+t*1.1)*sin(p.z*3.8+t*.9);
  return d+wob*(.02+.07*uEnergy);
}

vec3 nrm(vec3 p){
  vec2 e=vec2(.0015,-.0015);
  return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));
}

vec3 backdrop(vec2 vu,vec2 uv){
  float ar=uRes.x/uRes.y;
  vec2 s=vec2(vu.x*ar,vu.y);
  /* rich lilac page: lilac base, a mint wash top-left, deeper violet bottom-right, peach light from above */
  vec3 col=mix(vec3(.902,.886,.984),vec3(.937,.929,.992),vu.y);
  vec2 A=vec2((.16+.06*sin(uTime*.08))*ar,.82);
  vec2 B=vec2((.86+.05*cos(uTime*.1))*ar,.2);
  vec2 C=vec2(.55*ar,1.08);
  col=mix(col,vec3(.79,.94,.88),smoothstep(.85,0.,distance(s,A))*.75);
  col=mix(col,vec3(.83,.78,1.),smoothstep(.9,0.,distance(s,B))*.8);
  col=mix(col,vec3(1.,.92,.89),smoothstep(.65,0.,distance(s,C))*.4);
  /* a lilac halo that travels with the blob */
  col=mix(col,vec3(.86,.82,1.),smoothstep(1.25*uScale,0.,length(uv-uPos))*.45*uMerge);
  return col;
}

vec3 envMap(vec3 r){
  vec3 e=mix(vec3(.93,.94,1.),vec3(.72,.94,.86),smoothstep(-.5,.9,r.y));
  e=mix(e,vec3(.8,.75,1.),smoothstep(.1,1.,r.x)*.6);
  e=mix(e,vec3(1.,.91,.84),smoothstep(.2,1.,-r.x)*smoothstep(.0,-.8,r.y)*.5);
  /* a soft studio strip so the surface reads as glossy, not flat */
  e+=smoothstep(.08,0.,abs(r.y-.55+r.x*.2))*smoothstep(-.2,.6,r.z)*.18;
  return e;
}

vec3 shade(vec3 p,vec3 rd){
  vec3 n=nrm(p);
  float ndv=max(dot(n,-rd),0.);
  float fres=pow(1.-ndv,3.);
  vec3 r=reflect(rd,n);
  vec4 w=weights();
  /* the pill's second half is lilac */
  vec3 pp=xf(p); pp.xy*=rot(.95);
  float halfB=smoothstep(-.015,.015,pp.y)*w.y;
  vec3 base=mix(vec3(.97,.97,1.),uTint,.35);
  base=mix(base,vec3(.76,.7,1.),halfB*.85);
  /* crevice shading and thin-part translucency */
  float ao=clamp(.45+.55*map(p+n*.14)/.14,0.,1.);
  float thick=clamp(-map(p-n*.3)/.3,0.,1.);
  float dif=.62+.38*max(dot(n,normalize(vec3(.4,.8,.6))),0.);
  vec3 c=base*dif*mix(.78,1.,ao);
  c=mix(c,envMap(r),.34+.32*fres);
  c+=mix(base,vec3(1.),.4)*(1.-thick)*.14*(.25+.75*fres);
  vec3 film=.55+.45*cos(6.2831*(fres*1.1+dot(n,vec3(.3,.5,.2))*.5+vec3(0.,.33,.67))+uTime*.25);
  c=mix(c,film,fres*.42);
  c+=pow(max(dot(r,normalize(vec3(.5,.7,.6))),0.),140.)*.7;
  c+=pow(max(dot(r,normalize(vec3(-.6,.3,.7))),0.),22.)*.1;
  return min(c,vec3(1.));
}

void main(){
  vec2 uv=vUv*2.-1.;
  float ar=uRes.x/uRes.y;
  uv.x*=ar;
  vec3 col=backdrop(vUv,uv);

  vec2 q=(uv-uPos)/uScale;
  vec3 ro=vec3(0.,0.,3.2);
  vec3 rd=normalize(vec3(q,-1.8));
  float bq=dot(ro,rd);
  float cq=dot(ro,ro)-2.9;
  float h=bq*bq-cq;
  bool hit=false;
  float mind=1e3,tm=0.,tt=0.;
  float px=2./uRes.y/uScale/1.8;
  if(h>0.){
    float sh=sqrt(h);
    tt=max(0.,-bq-sh);
    float far=-bq+sh;
    for(int i=0;i<80;i++){
      float d=map(ro+rd*tt);
      if(d<mind){mind=d;tm=tt;}
      if(d<max(.0012,px*tt*.35)){hit=true;break;}
      tt+=d*.9;
      if(tt>far) break;
    }
  }
  /* coverage from the closest approach: smooth, anti-aliased silhouette */
  float cov=hit?1.:smoothstep(px*max(tm,1.)*1.4,0.,mind);
  if(cov>0.) col=mix(col,shade(ro+rd*(hit?tt:tm),rd),cov);
  if(!hit){
    vec2 sc=uPos+vec2(0.,-.5*uScale);
    float e=length((uv-sc)/(vec2(.44,.065)*uScale));
    col*=1.-.11*smoothstep(1.,0.,e)*uMerge*(1.-cov);
  }
  col+=(fract(sin(dot(vUv*uRes+uTime,vec2(12.9898,78.233)))*43758.5453)-.5)*.012;
  gl_FragColor=vec4(col,1.);
}`;

type Target = { x: number; y: number; scale: number; morph: number; merge: number; energy: number; tint: [number, number, number] };

/* Placement presets in screen units: y from -1 (bottom) to 1 (top), x scaled by the aspect ratio. */
const target: Target = { x: 0, y: 0.25, scale: 1.3, morph: 0, merge: 1, energy: 0, tint: [0.92, 0.92, 1] };

export const TINTS = {
  pearl: [0.92, 0.92, 1] as [number, number, number],
  found: [0.62, 0.96, 0.8] as [number, number, number],
  none: [1, 0.78, 0.74] as [number, number, number],
};

export function setBlob(next: Partial<Target>) {
  Object.assign(target, next);
}

/** Where the blob sits on inner pages: top-right on desktop, top-centre on phones. */
export function cornerBlob() {
  const narrow = typeof innerWidth !== "undefined" && innerWidth < 768;
  const ar = typeof innerWidth !== "undefined" ? innerWidth / innerHeight : 1.6;
  setBlob(narrow ? { x: ar * 0.62, y: 0.86, scale: 0.3, morph: 0 } : { x: ar * 0.8, y: 0.74, scale: 0.44, morph: 0 });
}

export function Blob() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    const fail = () => setFallback(true);
    if (!gl) return fail();
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fail();
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["uRes", "uTime", "uMouse", "uPos", "uScale", "uMorph", "uMerge", "uEnergy", "uTint"].map((n) => [n, gl.getUniformLocation(prog, n)]));

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur: Target & { mx: number; my: number } = { ...target, tint: [...target.tint] as Target["tint"], mx: 0.5, my: 0.5 };
    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / innerWidth;
      mouse.y = 1 - e.clientY / innerHeight;
    };
    addEventListener("pointermove", onMove, { passive: true });
    const onDown = () => (target.energy = Math.min(1.2, target.energy + 0.7)); // a click ripples the surface
    addEventListener("pointerdown", onDown, { passive: true });
    const onLost = (e: Event) => (e.preventDefault(), cancelAnimationFrame(raf), fail());
    canvas.addEventListener("webglcontextlost", onLost);

    const resize = () => {
      const scale = Math.min(0.85, 1250 / Math.max(innerWidth, 1));
      canvas.width = Math.max(2, Math.round(innerWidth * scale));
      canvas.height = Math.max(2, Math.round(innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
    };
    resize();
    addEventListener("resize", resize);

    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    const ease = (a: number, b: number, k: number) => a + (b - a) * k;
    const frame = (now: number) => {
      // rates are per second, so the blob moves at the same speed on 60 Hz and 120 Hz screens
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const k = (rate: number) => (still ? 1 : 1 - Math.exp(-rate * dt));
      cur.x = ease(cur.x, target.x, k(4.3));
      cur.y = ease(cur.y, target.y, k(4.3));
      cur.scale = ease(cur.scale, target.scale, k(4.3));
      cur.morph = ease(cur.morph, target.morph, k(5.3));
      cur.merge = ease(cur.merge, target.merge, k(3.1));
      cur.energy = ease(cur.energy, target.energy, k(6.3));
      target.energy *= Math.exp(-3.7 * dt); // typing bursts and clicks fade out
      cur.tint = cur.tint.map((v, i) => ease(v, target.tint[i], k(3.1))) as Target["tint"];
      cur.mx = ease(cur.mx, mouse.x, k(3.1));
      cur.my = ease(cur.my, mouse.y, k(3.1));
      gl.uniform1f(U.uTime, still ? 8 : (now - t0) / 1000 + 8);
      gl.uniform2f(U.uMouse, cur.mx, cur.my);
      gl.uniform2f(U.uPos, cur.x, cur.y);
      gl.uniform1f(U.uScale, cur.scale);
      gl.uniform1f(U.uMorph, cur.morph);
      gl.uniform1f(U.uMerge, cur.merge);
      gl.uniform1f(U.uEnergy, cur.energy);
      gl.uniform3f(U.uTint, ...cur.tint);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    // no loseContext() on cleanup: dev Strict Mode remounts on the same canvas and would get a dead context back
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {fallback ? (
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_30%,#ffffff_0,#dcd5ff_18%,transparent_34%),radial-gradient(ellipse_at_15%_15%,#c9efdf,transparent_45%),radial-gradient(ellipse_at_85%_80%,#d4c9ff,transparent_45%),#e6e2fb]" />
      ) : (
        <canvas ref={ref} className="h-full w-full" />
      )}
    </div>
  );
}
