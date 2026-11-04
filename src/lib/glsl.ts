/* ================= GLSL LIBRARY ================= */

export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){
  float f=0.0,a=0.5;
  for(int i=0;i<4;i++){ f+=a*snoise(p); p*=2.02; a*=0.5; }
  return f;
}
float hash21(vec2 p){ p=fract(p*vec2(234.34,435.345)); p+=dot(p,p+34.23); return fract(p.x*p.y); }
`;

/* ---------------- FLUID / OCEAN BACKDROP ---------------- */
export const FLUID_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 1.0, 1.0); }
`;

export const FLUID_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform vec2 u_mouseVel;
uniform float u_viscosity;
uniform float u_scroll;
uniform float u_glitch;
uniform float u_iterations;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
${NOISE}

/* one depth layer of the 5D grid: ultra-soft zooming, glowing dots + whispers of lines */
vec3 layer(vec2 uv, float d, float t, float aspect, float scroll, out float alpha){
  float zoom = mix(4.0, 38.0, pow(d, 1.4));
  vec2 p = vec2(uv.x*aspect, uv.y) * zoom;
  
  // Majestic, extremely slow forward drift
  p.y -= d * 12.0 + scroll * 10.0 + t * 0.4;
  p.x += t * 0.15;

  float wt = t * 0.04 + d * 2.0;
  vec2 w = vec2(
    snoise(vec3(p.x*0.08, p.y*0.08, wt)),
    snoise(vec3(p.x*0.08 + 14.3, p.y*0.08, wt*0.8 + 6.2))
  );
  
  // Gentle mouse sway
  w += u_mouse * 0.12 * d;
  p += w * (1.5 - d*0.5);

  vec2 f = fract(p) - 0.5;
  vec2 ic = floor(p);

  // Resolution-independent soft lines
  float aa = 0.06 + d*0.12;
  float gx = 1.0 - smoothstep(0.0, aa, abs(f.x));
  float gy = 1.0 - smoothstep(0.0, aa, abs(f.y));
  float lines = max(gx, gy);
  
  // High-fidelity blooming nodes
  float dots = 1.0 - smoothstep(0.0, 0.18 + d*0.1, length(f));

  float h = hash21(ic + floor(d*20.0)*7.13);
  vec3 lineCol = mix(u_c1, u_c2, 0.5 + 0.5*sin(ic.y*0.15 + t*0.2));
  
  vec3 col = lineCol * lines * 0.045
           + mix(u_c1, vec3(1.0), 0.5) * dots * 0.16;
           
  if(h > 0.988) col += vec3(0.89,0.75,0.48) * dots * 0.7;
  if(h < 0.005) col += u_c3 * dots * 0.5;

  alpha = smoothstep(0.0, 0.25, d) * (1.0 - smoothstep(0.75, 1.0, d));
  float cloud = snoise(vec3(p.x*0.05, p.y*0.05, t*0.08));
  alpha *= smoothstep(-0.4, 0.4, cloud);

  return col;
}

/* serene deep space nebula/lattice */
vec3 farField(vec2 uv, float t, float aspect, out float a){
  vec2 p = vec2(uv.x*aspect, uv.y) * 20.0;
  vec2 w = vec2(snoise(vec3(p*0.06, t*0.03)), snoise(vec3(p*0.06+19.0, t*0.03+5.0)));
  p += w * 2.2;
  vec2 f = fract(p) - 0.5;
  float d = 1.0 - smoothstep(0.05, 0.15, length(f));
  a = d;
  return mix(u_c1, u_c2, 0.5) * d * 0.08;
}

void main(){
  vec2 uv = vUv;
  float aspect = u_res.x/u_res.y;
  vec2 q = (uv-0.5)*vec2(aspect,1.0);
  float t = u_time;

  // Deep obsidian void base
  vec3 col = vec3(0.006, 0.008, 0.010);
  
  // Soft emerald core glow
  float core = exp(-dot(q, q) * 2.2);
  col += u_c1 * core * 0.035;

  float fa;
  col += farField(uv, t, aspect, fa);

  // 4 accumulated fractal layers for infinite 5D depth
  for(int i=0;i<4;i++){
    float fi = float(i)/4.0;
    float d = fract(t*0.04 + fi);
    float a;
    vec3 lc = layer(uv, d, t, aspect, u_scroll, a);
    col += lc * a * (0.6 + d*0.5);
  }

  // Soft cursor ambient light (no sharp sweeps)
  float md = length(q - u_mouse*vec2(aspect,1.0)*0.5);
  col += u_c1 * exp(-md*3.5) * 0.04;

  // Heavy, soft vignette
  float vig = smoothstep(1.3, 0.25, length(q));
  col *= mix(0.15, 1.0, vig);

  // Gentle dither to prevent banding, no harsh noise
  col += (hash21(uv*u_res)-0.5)*0.006;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------------- PARTICLE OCEAN ---------------- */
export const PARTICLE_VERT = /* glsl */ `
attribute vec3 aRand; // x: variance, y: brightness freq, z: magnetic attraction
uniform float u_time;
uniform vec3 u_cursor;
uniform float u_density;
uniform float u_px;
varying float vGlow;
varying float vMix;
varying float vDepth;

vec3 flow(vec3 p, float t){
  float s = 0.14;
  return vec3(
    sin(p.y*s + t*0.2) + cos(p.z*s*1.3 - t*0.25),
    sin(p.z*s - t*0.18) + cos(p.x*s*1.1 + t*0.22),
    sin(p.x*s*0.9 + t*0.15) + cos(p.y*s*1.2 - t*0.19)
  ) * 0.4;
}

void main(){
  float t = u_time;
  vec3 p = position + flow(position, t) * (0.8 + aRand.x*1.4);

  p.y += sin(t*0.1*aRand.y + aRand.x*6.2831)*0.5;

  vec3 toC = u_cursor - p;
  float d = length(toC);
  // gentle magnetic attraction
  p += normalize(toC + 1e-4) * aRand.z * 0.8 * exp(-d*0.2);
  // soft, viscous repulsion
  float rep = smoothstep(3.0, 0.0, d);
  p -= normalize(toC + 1e-4) * rep * rep * 1.2;
  p += flow(p, t*0.8) * rep * 0.6;

  // brightness pulsing
  vGlow = 0.55 + 0.45*sin(t*(1.0+aRand.y*3.0) + aRand.x*40.0);
  vGlow += rep*2.0;
  vMix = aRand.y;

  vec4 mv = modelViewMatrix * vec4(p,1.0);
  float hidden = step(aRand.x, u_density); // adaptive cull
  gl_Position = projectionMatrix * mv;
  gl_PointSize = hidden * (1.1 + aRand.x*2.2 + rep*3.0) * u_px * (140.0 / -mv.z);
  vDepth = clamp(-mv.z/60.0, 0.0, 1.0);
}
`;

export const PARTICLE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_gold;
varying float vGlow;
varying float vMix;
varying float vDepth;
void main(){
  vec2 c = gl_PointCoord-0.5;
  float d = length(c);
  float a = smoothstep(0.5,0.06,d);
  vec3 col = mix(u_c1,u_c2,vMix);
  // very rare gold data packets drifting in the stream
  float gold = smoothstep(0.985, 1.0, vMix);
  col = mix(col, u_gold*1.1, gold);
  col = mix(col, vec3(0.9), pow(vGlow,3.0)*0.12);
  float bri = (0.16+vGlow*0.55) * (1.0-vDepth*0.5);
  gl_FragColor = vec4(col * bri, a*(0.28+min(vGlow,1.0)*0.22));
}
`;

/* ---------------- INTRO TYPOGRAPHY VORTEX ---------------- */
export const INTRO_VERT = /* glsl */ `
attribute vec3 aStart;
attribute vec3 aTarget;
attribute vec2 aSeed; // x rand, y size
uniform float u_prog;   // 0..2 : 0=cloud 1=formed 2=exploded
uniform float u_time;
uniform float u_px;
varying float vA;
varying float vMix;

float easeOutCubic(float x){ return 1.0-pow(1.0-x,3.0); }
float easeInOut(float x){ return x*x*(3.0-2.0*x); }

void main(){
  float t = u_time;
  float form = clamp(u_prog, 0.0, 1.0);
  float boom = clamp(u_prog-1.0, 0.0, 1.0);
  float e = easeInOut(form);

  vec3 start = aStart;
  start.x += sin(t*0.4 + aSeed.x*17.0)*1.4;
  start.y += cos(t*0.33 + aSeed.x*23.0)*1.4;

  vec3 pos = mix(start, aTarget, e);
  // formation shimmer
  pos += (1.0-e)*vec3(sin(t+aSeed.x*40.0),cos(t*1.3+aSeed.x*31.0),0.0)*0.05;

  if(boom>0.0){
    float b = easeOutCubic(boom);
    vec3 dir = normalize(aTarget + vec3((aSeed.x-0.5)*3.0, aSeed.y*0.4, 0.0));
    // 4D spiral vortex
    float ang = b*7.0 + aSeed.x*6.2831;
    float rad = b * (6.0 + aSeed.x*26.0);
    vec3 spiral;
    spiral.x = dir.x*b*10.0 + cos(ang)*rad;
    spiral.y = dir.y*b*10.0 + sin(ang)*rad*0.6 + b*b*8.0*sin(aSeed.x*9.0);
    spiral.z = -b * (18.0 + aSeed.x*44.0) + sin(ang*0.5)*rad*0.5;
    pos = aTarget + spiral;
  }

  vA = (boom>0.0) ? (1.0-easeInOut(boom))*0.9 : mix(0.25,1.0,e);
  vMix = aSeed.x;
  vec4 mv = modelViewMatrix * vec4(pos,1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.9 + aSeed.y*1.8) * u_px * (240.0 / -mv.z);
}
`;

export const INTRO_FRAG = /* glsl */ `
precision highp float;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_gold;
varying float vA;
varying float vMix;
void main(){
  float d = length(gl_PointCoord-0.5);
  float a = smoothstep(0.5,0.15,d) * vA;
  if(a<0.003) discard;
  // Deep carbon-dust particles — very dim, no white light
  vec3 col = u_gold * 0.12; 
  gl_FragColor = vec4(col, a * 0.15);
}
`;

/* ---------------- NEXUS CORE ---------------- */
export const NEXUS_VERT = /* glsl */ `
uniform float u_time;
uniform float u_amp;
uniform float u_twist;
varying vec3 vN;
varying vec3 vPos;
varying float vDisp;
${NOISE}
void main(){
  float t = u_time;
  vec3 p = position;
  // topology twist
  float tw = p.y * u_twist * 0.35;
  float cs = cos(tw), sn = sin(tw);
  p.xz = mat2(cs,-sn,sn,cs) * p.xz;
  float n = fbm(normalize(p)*1.4 + vec3(0.0,0.0,t*0.35)) * 0.5
          + snoise(normalize(p)*3.4 - vec3(t*0.5)) * 0.22;
  float disp = n * u_amp;
  vec3 np = p + normal * disp;
  vDisp = disp;
  vN = normalize(normalMatrix * normal);
  vPos = np;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(np,1.0);
}
`;

export const NEXUS_FRAG = /* glsl */ `
precision highp float;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform float u_time;
uniform float u_hot;
varying vec3 vN;
varying vec3 vPos;
varying float vDisp;
void main(){
  vec3 V = vec3(0.0,0.0,1.0);
  float fres = pow(1.0-abs(dot(normalize(vN), V)), 2.2);
  float band = smoothstep(0.45,0.5,abs(fract(vPos.y*2.2 - u_time*0.4)-0.5));
  vec3 col = mix(u_c1, u_c2, clamp(0.5 + vDisp*2.4, 0.0, 1.0));
  vec3 base = col * (0.10 + 0.12*sin(u_time + vPos.y*4.0));
  vec3 emis = col * fres * (1.4 + u_hot*1.6) + vec3(1.0)*band*0.12;
  gl_FragColor = vec4(base + emis, 1.0);
}
`;

/* ---------------- MICRO CROSSHAIR ---------------- */
export const CROSS_VERT = /* glsl */ `
uniform float u_time;
attribute float aPhase;
attribute float aScale;
varying vec2 vUv;
varying float vP;
void main(){
  vUv = uv;
  vP = aPhase;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(position*aScale, 1.0);
  mv.xyz += vec3(sin(u_time*0.4+aPhase*9.0)*0.5, cos(u_time*0.33+aPhase*7.0)*0.5, 0.0);
  gl_Position = projectionMatrix * mv;
}
`;

export const CROSS_FRAG = /* glsl */ `
precision highp float;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform float u_time;
varying vec2 vUv;
varying float vP;
void main(){
  vec2 c = abs(vUv-0.5);
  float cross = (1.0-smoothstep(0.02,0.05,c.y))*(1.0-smoothstep(0.42,0.5,c.x))
              + (1.0-smoothstep(0.02,0.05,c.x))*(1.0-smoothstep(0.42,0.5,c.y));
  float dot0 = 1.0-smoothstep(0.03,0.06,length(vUv-0.5));
  float blink = 0.4+0.6*(0.5+0.5*sin(u_time*(1.5+vP*3.0)+vP*40.0));
  vec3 col = mix(u_c1,u_c2,vP);
  gl_FragColor = vec4(col*0.85, (cross+dot0)*blink*0.42);
}
`;

/* ---------------- RING / BEAM helpers ---------------- */
export const RING_FRAG = /* glsl */ `
precision highp float;
uniform vec3 u_color;
uniform float u_time;
uniform float u_active;
varying vec2 vUv;
void main(){
  float flow = fract(vUv.x*3.0 - u_time*0.35);
  float pulse = smoothstep(0.4,0.0,abs(flow-0.5)) * (0.5+u_active*1.8);
  vec3 col = u_color * (0.55 + pulse + u_active*0.9);
  gl_FragColor = vec4(col, 0.85);
}
`;

export const RING_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
