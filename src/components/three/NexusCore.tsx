import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { NEXUS_VERT, NEXUS_FRAG, RING_VERT, RING_FRAG } from "../../lib/glsl";
import { G, clamp } from "../../lib/uniforms";
import { useStore } from "../../lib/store";
import { SKILLS } from "../../lib/data";
import { makeGlowTexture } from "../../lib/textures";

const POS = new THREE.Vector3(0, -0.4, -56);

export default function NexusCore() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const dots = useRef<THREE.Group>(null);
  const hot = useRef(0);
  const uniforms = useRef<any>(null);
  const ringU = useRef<any>(null);
  const cCache = useRef<Record<string, THREE.Color>>({});
  const col = (hex: string) => (cCache.current[hex] ||= new THREE.Color(hex));
  const glowTex = useMemo(() => makeGlowTexture(), []);

  const coreMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: NEXUS_VERT,
        fragmentShader: NEXUS_FRAG,
        uniforms: {
          u_time: { value: 0 },
          u_amp: { value: 0.34 },
          u_twist: { value: 1.6 },
          u_hot: { value: 0 },
          u_c1: { value: new THREE.Color("#22d3ee") },
          u_c2: { value: new THREE.Color("#a855f7") },
        },
      }),
    []
  );
  const ringMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { u_color: { value: new THREE.Color("#a855f7") }, u_time: { value: 0 }, u_active: { value: 0 } },
      }),
    []
  );

  // skill morph trigger
  useMemo(() => {
    return useStore.subscribe((s) => {
      const skill = SKILLS.find((k) => k.id === s.skillId) || SKILLS[0];
      if (!uniforms.current) return;
      gsap.to(uniforms.current.u_amp, { value: skill.amp, duration: 1.1, ease: "power3.out" });
      gsap.to(uniforms.current.u_twist, { value: skill.twist, duration: 1.4, ease: "expo.out" });
      gsap.to(uniforms.current.u_hot, { value: 1, duration: 0.25, yoyo: true, repeat: 1 });
      G.skill = skill.id;
    });
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (!group.current) return;
    uniforms.current = (inner.current as any)?.material?.uniforms;
    ringU.current = (ring.current as any)?.material?.uniforms;
    if (!uniforms.current) return;

    uniforms.current.u_time.value = G.t;
    ringU.current.u_time.value = G.t;

    // hover via cursor proximity in world space
    const d = G.cursor3.distanceTo(POS);
    const target = clamp(1.6 - d / 3.4, 0, 1);
    // silk-smooth hover interpolation
    hot.current += (target - hot.current) * (1 - Math.exp(-10 * dt));
    uniforms.current.u_hot.value += (hot.current - uniforms.current.u_hot.value) * (1 - Math.exp(-12 * dt));
    const velBoost = clamp(G.mouseVel.length() * 1.2, 0, 0.5);
    const skill = SKILLS.find((k) => k.id === useStore.getState().skillId) || SKILLS[0];
    const ampTarget = skill.amp + velBoost + hot.current * 0.22;
    if (!gsap.isTweening(uniforms.current.u_amp)) {
      uniforms.current.u_amp.value += (ampTarget - uniforms.current.u_amp.value) * (1 - Math.exp(-8 * dt));
    }
    // silk-smooth palette drift
    const cl = 1 - Math.exp(-6 * dt);
    uniforms.current.u_c1.value.lerp(col(skill.palette[0]), cl);
    uniforms.current.u_c2.value.lerp(col(skill.palette[1]), cl);
    ringU.current.u_color.value.copy(uniforms.current.u_c2.value);
    ringU.current.u_active.value += (hot.current - ringU.current.u_active.value) * (1 - Math.exp(-10 * dt));

    // motion
    inner.current!.rotation.y += dt * 0.24 * G.timeScale * (1 + hot.current);
    inner.current!.rotation.x = Math.sin(G.t * 0.2) * 0.3;
    shell.current!.rotation.y -= dt * 0.1 * G.timeScale;
    shell.current!.rotation.z += dt * 0.06 * G.timeScale;
    const pulse = 1 + Math.sin(G.t * 1.4) * 0.02 + hot.current * 0.08;
    group.current.scale.setScalar(pulse);
    ring.current!.rotation.z += dt * 0.5 * G.timeScale;

    // orbit dots — active skill amplified
    const activeIdx = SKILLS.findIndex((k) => k.id === skill.id);
    dots.current?.children.forEach((c: any, i) => {
      const sp = 0.3 + i * 0.07;
      const a = G.t * sp + (i * Math.PI * 2) / SKILLS.length;
      const r = 5.3 + Math.sin(G.t * 0.6 + i) * 0.25;
      c.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 1.6, Math.sin(a) * r);
      const active = i === activeIdx;
      const s = active ? 1.5 + Math.sin(G.t * 4) * 0.2 : 0.5;
      c.scale.setScalar(c.scale.x + (s - c.scale.x) * 0.1);
      c.material.opacity = active ? 1 : 0.45;
    });
  });

  return (
    <group ref={group} position={POS}>
      <mesh ref={inner} material={coreMat}>
        <torusKnotGeometry args={[1.75, 0.5, 200, 32, 2, 3]} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[3.3, 1]} />
        <meshBasicMaterial wireframe transparent opacity={0.32} color="#67e8f9" blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring} material={ringMat} rotation={[Math.PI / 2.25, 0.3, 0]}>
        <torusGeometry args={[4.6, 0.028, 8, 96]} />
      </mesh>
      <group ref={dots}>
        {SKILLS.map((s, i) => (
          <sprite key={s.id} scale={0.5}>
            <spriteMaterial map={glowTex} color={s.palette[i % 2]} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        ))}
      </group>
      <sprite scale={7}>
        <spriteMaterial map={glowTex} color="#22d3ee" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}
