import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { INTRO_VERT, INTRO_FRAG } from "../../lib/glsl";
import { G } from "../../lib/uniforms";
import { useStore } from "../../lib/store";
import { audio } from "../../lib/audio";

const COUNT = 60000;

function sampleText(): Float32Array {
  const w = 1500, h = 380;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.fillStyle = "#000";
  x.fillRect(0, 0, w, h);
  x.font = "800 240px 'JetBrains Mono', monospace";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillStyle = "#fff";
  x.fillText("Ayush Shrivastava", w / 2, h / 2 + 10);
  const data = x.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  const step = 3;
  for (let py = 0; py < h; py += step)
    for (let px = 0; px < w; px += step)
      if (data[(py * w + px) * 4] > 120) pts.push(px, py);
  const out = new Float32Array(COUNT * 3);
  const scale = 15.5 / w;
  for (let i = 0; i < COUNT; i++) {
    const j = Math.floor(Math.random() * (pts.length / 2)) * 2;
    out[i * 3] = (pts[j] - w / 2) * scale + (Math.random() - 0.5) * 0.03;
    out[i * 3 + 1] = -(pts[j + 1] - h / 2) * scale + (Math.random() - 0.5) * 0.03;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }
  return out;
}

export default function IntroVortex() {
  const phase = useStore((s) => s.phase);
  const [visible, setVisible] = useState(true);
  const progress = useRef(1); // Start fully formed — name is already visible
  const boomTimer = useRef(-1);
  const matRef = useRef<any>(null);
  const done = useRef(false);

  const { geo, material } = useMemo(() => {
    const target = sampleText();
    const start = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      // Start positions = target positions (already formed)
      start[i * 3] = target[i * 3] + (Math.random() - 0.5) * 0.3;
      start[i * 3 + 1] = target[i * 3 + 1] + (Math.random() - 0.5) * 0.3;
      start[i * 3 + 2] = target[i * 3 + 2] + (Math.random() - 0.5) * 0.4;
      seed[i * 2] = Math.random();
      seed[i * 2 + 1] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(target.slice(), 3));
    geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 500);
    const material = new THREE.ShaderMaterial({
      vertexShader: INTRO_VERT,
      fragmentShader: INTRO_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_prog: { value: 1 }, // Start fully formed
        u_time: { value: 0 },
        u_px: { value: Math.min(window.devicePixelRatio, 1.5) },
        u_c1: { value: new THREE.Color("#00ff9d") },
        u_c2: { value: new THREE.Color("#22d3ee") },
        u_gold: { value: new THREE.Color("#f6e0b3") },
      },
    });
    return { geo, material };
  }, []);

  const fracture = () => {
    if (boomTimer.current >= 0 || done.current) return;
    boomTimer.current = 0;
    audio.fracture();
  };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = G.t;
      matRef.current.uniforms.u_prog.value = progress.current;
    }
    if (done.current) return;

    if (phase === "live" && boomTimer.current < 0) {
      done.current = true;
      setVisible(false);
      return;
    }
    if (phase !== "intro") return;

    // explosion on click
    if (boomTimer.current >= 0) {
      boomTimer.current += dt;
      progress.current = Math.min(2, 1 + boomTimer.current / 1.8);
      if (progress.current >= 2 && boomTimer.current > 2.0) {
        done.current = true;
        G.awakened = true;
        useStore.getState().setPhase("live");
        document.body.classList.remove("locked");
        setTimeout(() => setVisible(false), 1200);
      }
    }
  });

  // Click anywhere to fracture and enter
  useEffect(() => {
    const onDown = () => {
      if (phase === "intro" && boomTimer.current < 0) fracture();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && phase === "intro" && boomTimer.current < 0) {
        e.preventDefault();
        fracture();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase]);

  if (!visible) return null;
  return (
    <points
      geometry={geo}
      material={material}
      ref={(p: any) => p && (matRef.current = p.material)}
      frustumCulled={false}
    />
  );
}
