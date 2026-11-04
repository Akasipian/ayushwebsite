import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RING_VERT, RING_FRAG } from "../../lib/glsl";
import { G, clamp } from "../../lib/uniforms";
import { TIMELINE } from "../../lib/data";
import { makeGlowTexture } from "../../lib/textures";

/** Holographic ladder: spine + threshold rings per milestone + era orbs. */
export default function ChronoFX() {
  const rings = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const glowTex = useMemo(() => makeGlowTexture(), []);

  const zMin = Math.min(...TIMELINE.map((t) => t.z)) - 10;
  const zMax = Math.max(...TIMELINE.map((t) => t.z)) + 10;
  const spineLen = zMax - zMin;
  const spineZ = (zMin + zMax) / 2;

  const ringMats = useMemo(
    () =>
      TIMELINE.map((_m, i) => {
        const c = new THREE.Color().lerpColors(new THREE.Color("#00ff9d"), new THREE.Color("#22d3ee"), i / (TIMELINE.length - 1));
        return new THREE.ShaderMaterial({
          vertexShader: RING_VERT,
          fragmentShader: RING_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          uniforms: { u_color: { value: c }, u_time: { value: 0 }, u_active: { value: 0 } },
        });
      }),
    []
  );

  useFrame(() => {
    const camZ = camera.position.z;
    rings.current?.children.forEach((g: any, i) => {
      const ring = g.children[0] as THREE.Mesh;
      const mat = ring.material as any;
      mat.uniforms.u_time.value = G.t;
      const act = clamp(1 - Math.abs(camZ - TIMELINE[i].z) / 7, 0, 1);
      mat.uniforms.u_active.value += (act - mat.uniforms.u_active.value) * (1 - Math.exp(-8 * 0.016));
      ring.rotation.z += 0.004 * G.timeScale * (1 + mat.uniforms.u_active.value * 3);
      const orb = g.children[1] as THREE.Sprite;
      const s = 0.5 + mat.uniforms.u_active.value * 0.8 + Math.sin(G.t * 3 + i) * 0.06;
      orb.scale.setScalar(s);
      (orb.material as THREE.SpriteMaterial).opacity = 0.4 + mat.uniforms.u_active.value * 0.6;
    });
  });

  return (
    <group>
      {/* spine */}
      <mesh position={[0, 0, spineZ]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, spineLen, 6, 1, true]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* rungs */}
      {Array.from({ length: Math.floor(spineLen / 3) }).map((_rung, i) => (
        <mesh key={i} position={[0, Math.sin(i * 1.7) * 1.2, zMax - i * 3]} rotation={[0, 0, (i % 4) * (Math.PI / 4)]}>
          <boxGeometry args={[1.6 + Math.sin(i) * 0.5, 0.015, 0.015]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.16 + (i % 3) * 0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {/* milestone threshold rings */}
      <group ref={rings}>
        {TIMELINE.map((m, i) => (
          <group key={m.id} position={[Math.sin(i * 2.1) * 1.4, Math.cos(i * 1.3) * 1.2, m.z]}>
            <mesh material={ringMats[i]}>
              <torusGeometry args={[2.6 + (i % 3) * 0.35, 0.03, 8, 64]} />
            </mesh>
            {/* imperial crown ring */}
            <mesh rotation={[Math.PI / 2.6, 0.4, i]}>
              <torusGeometry args={[3.05 + (i % 3) * 0.35, 0.012, 6, 64]} />
              <meshBasicMaterial color="#e3c07b" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <sprite scale={0.5}>
              <spriteMaterial map={glowTex} color={i % 2 ? "#e3c07b" : "#00ff9d"} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.5} />
            </sprite>
          </group>
        ))}
      </group>
    </group>
  );
}
