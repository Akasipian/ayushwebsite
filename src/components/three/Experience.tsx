import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { G, clamp } from "../../lib/uniforms";
import { useStore } from "../../lib/store";
import { C1, C2 } from "./palette";
import FluidBackground from "./FluidBackground";
import ParticleOcean from "./ParticleOcean";
import MicroGrid from "./MicroGrid";
import IntroVortex from "./IntroVortex";
import NexusCore from "./NexusCore";
import ChronoFX from "./ChronoFX";
import ConstellationFX from "./ConstellationFX";

/* ---------------- camera flight path ---------------- */
const WAYPOINTS = [
  new THREE.Vector3(0, 0.3, 16),
  new THREE.Vector3(3.0, -0.8, -18),
  new THREE.Vector3(-2.4, 1.0, -46),
  new THREE.Vector3(0.9, -1.0, -78),
  new THREE.Vector3(-2.3, 1.1, -110),
  new THREE.Vector3(2.3, -0.6, -140),
  new THREE.Vector3(-0.7, 0.5, -168),
  new THREE.Vector3(0, 0, -185),
];
const curve = new THREE.CatmullRomCurve3(WAYPOINTS, false, "catmullrom", 0.35);

function CameraRig() {
  const { camera, size } = useThree();
  const pos = useRef(new THREE.Vector3(0, 0.3, 16));
  const tmpA = useRef(new THREE.Vector3());
  const tmpB = useRef(new THREE.Vector3());
  const lastAspect = useRef(1);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const phase = useStore.getState().phase;

    // ---- global clock ----
    G.time += dt;
    G.t += dt * G.timeScale;
    // mouseVel decay handled by pointer tracker now

    // ---- scroll tracking — ultra-smooth exponential interpolation ----
    const sc = document.getElementById("scroll-container");
    const max = sc ? Math.max(1, sc.scrollHeight - sc.clientHeight) : 1;
    const target = sc ? clamp(sc.scrollTop / max, 0, 1) : 0;
    const prev = G.scroll;
    G.scroll += (target - G.scroll) * (1 - Math.exp(-14 * dt));
    G.scrollVel = (G.scroll - prev) * 0.92 + G.scrollVel * 0.08;

    const cam = camera as THREE.PerspectiveCamera;
    // responsive fov compensation
    const aspect = size.width / size.height;
    if (Math.abs(aspect - lastAspect.current) > 0.001) {
      lastAspect.current = aspect;
      cam.fov = aspect < 0.75 ? 76 : aspect < 1.1 ? 66 : 58;
      cam.updateProjectionMatrix();
    }

    if (phase === "intro") {
      // ultra-smooth cinematic hover
      const t = G.time;
      pos.current.set(Math.sin(t * 0.3) * 0.5, 0.3 + Math.cos(t * 0.42) * 0.3, 16);
      const lf = 1 - Math.exp(-6 * dt);
      cam.position.x += (pos.current.x - cam.position.x) * lf;
      cam.position.y += (pos.current.y - cam.position.y) * lf;
      cam.position.z += (pos.current.z - cam.position.z) * lf;
      cam.lookAt(0, 0, 0);
      cam.rotation.z += Math.sin(t * 0.2) * 0.008;
      G.cursor3.copy(G.mouse as unknown as THREE.Vector3);
    } else {
      const t = clamp(G.scroll, 0.0001, 0.9999);
      curve.getPoint(t, tmpA.current);
      curve.getPoint(clamp(t + 0.04, 0, 1), tmpB.current);
      const desired = tmpA.current;
      // silk-smooth exponential damping — high responsiveness, zero jitter
      const kxy = 1 - Math.exp(-8 * dt);
      const kz  = 1 - Math.exp(-10 * dt);
      pos.current.x += (desired.x + G.mouse.x * 0.65 - pos.current.x) * kxy;
      pos.current.y += (desired.y + G.mouse.y * 0.45 - pos.current.y) * kxy;
      pos.current.z += (desired.z - pos.current.z) * kz;
      cam.position.copy(pos.current);
      cam.lookAt(tmpB.current.x + G.mouse.x * 1.4, tmpB.current.y + G.mouse.y * 1.1, tmpB.current.z);
      // smooth banking roll
      const bank = clamp((tmpB.current.x - tmpA.current.x) * -1.2, -0.3, 0.3);
      cam.rotation.z += (bank + G.scrollVel * -3.0 - cam.rotation.z) * 0.12;
    }

    // cursor raycast plane ~10u ahead
    const planeZ = cam.position.z - 10;
    const ndc = new THREE.Vector3(G.mouse.x, G.mouse.y, 0.5).unproject(cam);
    const dir = ndc.sub(cam.position).normalize();
    const dist = (planeZ - cam.position.z) / (dir.z || -0.0001);
    G.cursor3.copy(cam.position).add(dir.multiplyScalar(dist));
  });
  return null;
}

/* ---------------- adaptive throttle monitor ---------------- */
function PerfMonitor() {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ slow: 0, downgraded: false });
  useFrame((_, dt) => {
    if (acc.current.downgraded) return;
    const fps = 1 / Math.max(dt, 1e-4);
    if (fps < 54) acc.current.slow++;
    else acc.current.slow = Math.max(0, acc.current.slow - 2);
    if (acc.current.slow > 30) {
      acc.current.downgraded = true;
      G.quality = 0.5;
      setDpr(Math.min(
        window.devicePixelRatio || 1,
        1,
        1600 / window.innerWidth,
        900 / window.innerHeight
      ));
    }
  });
  return null;
}

/* ---------------- post stack ---------------- */
function PostFX({ mobile }: { mobile: boolean }) {
  if (mobile) return null; // zero post-processing on mobile = massive fps gain
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.3} luminanceThreshold={0.7} luminanceSmoothing={0.98} mipmapBlur radius={0.6} />
      <Noise premultiply opacity={0.015} />
      <Vignette eskil={false} offset={0.3} darkness={0.85} />
    </EffectComposer>
  );
}

export default function Experience() {
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  }));
  useEffect(() => {
    let raf = 0;
    const updateViewport = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      }));
    };
    window.addEventListener("resize", updateViewport, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const isMobile = viewport.width < 768 || /Mobi|Android/i.test(navigator.userAgent);
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const hardwareConcurrency = navigator.hardwareConcurrency || 8;
  const highResolution = viewport.width * viewport.height > 1920 * 1200;
  const lowPower = isMobile || highResolution || deviceMemory <= 4 || hardwareConcurrency <= 4;
  const renderDpr = Math.min(
    viewport.devicePixelRatio,
    isMobile ? 1 : 1.25,
    1600 / viewport.width,
    900 / viewport.height
  );
  const mode = useStore((s) => s.mode);
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode === "sovereign" ? "" : mode);
  }, [mode]);

  return (
    <div className="fixed inset-0 z-0" id="gl">
      <Canvas
        dpr={renderDpr}
        frameloop="always"
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: isMobile ? "default" : "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 58, near: 0.1, far: 400, position: [0, 0.3, 16] }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#05070c"), 1);
        }}
      >
        <CameraRig />
        <PerfMonitor />
        <FluidBackground />
        <ParticleOcean count={lowPower ? 2000 : 8000} />
        <MicroGrid count={lowPower ? 400 : 800} />
        <IntroVortex />
        {!lowPower && (
          <>
            <NexusCore />
            <ChronoFX />
            <ConstellationFX />
            <pointLight position={[0, 9, -56]} intensity={7} color="#00ff9d" distance={110} />
            <pointLight position={[4, 4, -40]} intensity={5} color={C1} />
            <pointLight position={[-6, -2, -120]} intensity={5} color={C2} />
          </>
        )}
        <PostFX mobile={lowPower} />
        <ambientLight intensity={0.55} />
      </Canvas>
    </div>
  );
}
