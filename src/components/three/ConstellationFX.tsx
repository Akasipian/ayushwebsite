import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { NEXUS_VERT, NEXUS_FRAG } from "../../lib/glsl";
import { G } from "../../lib/uniforms";
import { useStore } from "../../lib/store";
import { SOCIALS } from "../../lib/data";
import { makeGlowTexture, makeLabelTexture } from "../../lib/textures";

const CENTER = new THREE.Vector3(0, 0, -193);

export default function ConstellationFX() {
  const group = useRef<THREE.Group>(null);
  const sphere = useRef<THREE.Mesh>(null);
  const nodes = useRef<THREE.Group>(null);
  const beams = useRef<THREE.Group>(null);
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const transmit = useRef(0);

  const nodePos = useMemo(
    () =>
      SOCIALS.map((_, i) => {
        const a = (i / SOCIALS.length) * Math.PI * 2 - Math.PI / 2;
        return new THREE.Vector3(Math.cos(a) * 6.4, Math.sin(a) * 4.4, (i % 2 ? -1.4 : 1.4));
      }),
    []
  );

  // static web
  const webGeo = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < nodePos.length; i++) {
      const a = nodePos[i], b = nodePos[(i + 1) % nodePos.length];
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const c = nodePos[(i + 2) % nodePos.length];
      pts.push(a.x, a.y, a.z, c.x, c.y, c.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [nodePos]);

  // per-node beam fans (hover light beams)
  const beamGeos = useMemo(
    () =>
      nodePos.map((p, i) => {
        const pts: number[] = [];
        nodePos.forEach((q, j) => {
          if (i === j) return;
          pts.push(p.x, p.y, p.z, q.x, q.y, q.z);
        });
        pts.push(p.x, p.y, p.z, 0, 0, 0);
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        return g;
      }),
    [nodePos]
  );

  const sphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: NEXUS_VERT,
        fragmentShader: NEXUS_FRAG,
        uniforms: {
          u_time: { value: 0 },
          u_amp: { value: 0.16 },
          u_twist: { value: 0.6 },
          u_hot: { value: 0.4 },
          u_c1: { value: new THREE.Color("#00ff9d") },
          u_c2: { value: new THREE.Color("#22d3ee") },
        },
      }),
    []
  );

  const labels = useMemo(() => SOCIALS.map((s) => makeLabelTexture([s.beacon], "#22d3ee", 384, 96)), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    group.current!.rotation.z = Math.sin(G.t * 0.1) * 0.08;
    sphereMat.uniforms.u_time.value = G.t;

    if (G.transmitPulse > 0) {
      transmit.current = Math.max(transmit.current, G.transmitPulse);
      G.transmitPulse = Math.max(0, G.transmitPulse - dt * 1.4);
    }
    transmit.current = Math.max(0, transmit.current - dt * 1.4);
    sphereMat.uniforms.u_hot.value = 0.4 + Math.sin(G.t * 1.2) * 0.2 + transmit.current;

    const impl = transmit.current > 0 ? Math.max(0.04, 1 - Math.sin(Math.min(transmit.current, 1) * Math.PI) * 0.96) : 1;
    const base = 1 + Math.sin(G.t * 1.6) * 0.05;
    sphere.current?.scale.setScalar(base * impl);

    const hover = useStore.getState().socialHover;
    nodes.current?.children.forEach((n: any, i) => {
      const spr = n.children[0] as THREE.Sprite;
      const on = i === hover;
      const s = 1.1 + Math.sin(G.t * 2 + i * 1.4) * 0.12 + (on ? 1.1 : 0);
      const sk = 1 - Math.exp(-12 * dt);
      spr.scale.setScalar(spr.scale.x + (s - spr.scale.x) * sk);
      const opTarget = on ? 1 : 0.65;
      (spr.material as THREE.SpriteMaterial).opacity += (opTarget - (spr.material as THREE.SpriteMaterial).opacity) * sk;
      n.position.y = nodePos[i].y + Math.sin(G.t * 0.8 + i) * 0.3;
    });
    beams.current?.children.forEach((b: any, i) => {
      const target = i === hover ? 0.95 : 0;
      const bk = 1 - Math.exp(-14 * dt);
      b.material.opacity += (target - b.material.opacity) * bk;
    });
  });

  return (
    <group ref={group} position={CENTER}>
      {/* central data sphere */}
      <mesh ref={sphere} material={sphereMat}>
        <icosahedronGeometry args={[1.15, 3]} />
      </mesh>
      <sprite scale={6}>
        <spriteMaterial map={glowTex} color="#00ff9d" transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {/* static constellation web */}
      <lineSegments geometry={webGeo}>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      {/* social nodes */}
      <group ref={nodes}>
        {SOCIALS.map((s, i) => (
          <group key={s.id} position={nodePos[i]}>
            <sprite scale={1.1}>
              <spriteMaterial map={glowTex} color={i % 2 ? "#22d3ee" : "#00ff9d"} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
            <sprite scale={[2.6, 0.65, 1]} position={[0, 0.85, 0]}>
              <spriteMaterial map={labels[i]} transparent opacity={0.85} depthWrite={false} />
            </sprite>
          </group>
        ))}
      </group>
      {/* hover beam fans */}
      <group ref={beams}>
        {beamGeos.map((g, i) => (
          <lineSegments key={i} geometry={g}>
            <lineBasicMaterial color={i % 2 ? "#e3c07b" : "#00ff9d"} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
          </lineSegments>
        ))}
      </group>
    </group>
  );
}
