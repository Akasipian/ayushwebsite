import * as THREE from "three";

/** Global mutable simulation bridge shared by DOM + WebGL layers. */
export const G = {
  /** wall clock seconds */
  time: 0,
  /** time multiplied by timeScale — drives all shaders */
  t: 0,
  timeScale: 2.0,
  /** normalized pointer -1..1 */
  mouse: new THREE.Vector2(0, 0),
  /** smoothed pointer velocity */
  mouseVel: new THREE.Vector2(0, 0),
  /** pointer raycast onto active z-plane (world space) */
  cursor3: new THREE.Vector3(0, 0, 0),
  /** scroll 0..1 + velocity */
  scroll: 0,
  scrollVel: 0,
  /** glitch uniform 0..1 */
  glitch: 0,
  /** transient visual pulse after a successful contact transmission */
  transmitPulse: 0,
  /** perf quality 1 = full, 0.5 = adaptive degraded */
  quality: 1,
  awakened: false,
  /** active skill id for nexus morph */
  skill: "html",
  /** hovered social node index (-1 none) */
  socialHover: -1,
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const damp = (a: number, b: number, l: number, dt: number) => lerp(a, b, 1 - Math.exp(-l * dt));

let lastVib = 0;
export function vibe(pattern: number | number[] = 8) {
  const now = performance.now();
  if (now - lastVib < 60) return;
  lastVib = now;
  try {
    // @ts-ignore
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
}

/** pointer tracker — ultra-smooth interpolated at render rate */
export function bindPointer() {
  let rawX = 0, rawY = 0;
  let smoothX = 0, smoothY = 0;
  let px = 0, py = 0, pt = performance.now();
  let raf = 0;

  const onMove = (e: PointerEvent) => {
    rawX = (e.clientX / window.innerWidth) * 2 - 1;
    rawY = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  // Interpolate mouse at display refresh rate for silk-smooth tracking
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = Math.max(1, now - pt) / 1000;
    pt = now;

    // Exponential smoothing — instant feel, zero jitter
    const k = 1 - Math.exp(-18 * dt);
    smoothX += (rawX - smoothX) * k;
    smoothY += (rawY - smoothY) * k;

    G.mouseVel.x = damp(G.mouseVel.x, (smoothX - px) / Math.max(dt, 0.001), 8, dt);
    G.mouseVel.y = damp(G.mouseVel.y, (smoothY - py) / Math.max(dt, 0.001), 8, dt);
    px = smoothX;
    py = smoothY;

    G.mouse.set(smoothX, smoothY);
  };
  raf = requestAnimationFrame(tick);

  window.addEventListener("pointermove", onMove, { passive: true });
  return () => {
    window.removeEventListener("pointermove", onMove);
    cancelAnimationFrame(raf);
  };
}

/** global glitch engine — 250ms rupture every 12-18s */
export function startGlitchEngine() {
  let t: ReturnType<typeof setTimeout>;
  let reset: ReturnType<typeof setTimeout> | undefined;
  const fire = () => {
    if (G.awakened) {
      G.glitch = 1;
      document.documentElement.classList.add("glitching");
      document.body.classList.add("glitching");
      reset = setTimeout(() => {
        G.glitch = 0;
        document.documentElement.classList.remove("glitching");
        document.body.classList.remove("glitching");
      }, 250);
    }
    t = setTimeout(fire, 12000 + Math.random() * 6000);
  };
  t = setTimeout(fire, 8000);
  return () => {
    clearTimeout(t);
    if (reset) clearTimeout(reset);
    G.glitch = 0;
    document.documentElement.classList.remove("glitching");
    document.body.classList.remove("glitching");
  };
}
