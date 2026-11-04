import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PARTICLE_VERT, PARTICLE_FRAG } from "../../lib/glsl";
import { G } from "../../lib/uniforms";

export default function ParticleOcean({ count = 120000 }: { count?: number }) {
  const mat = useRef<any>(null);
  const { viewport } = useThree();

  const { geo, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // corridor distribution hugging the camera flight tunnel
      const z = 24 - Math.random() * 244;
      pos[i * 3 + 0] = (Math.random() - 0.5) * 52;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 2] = z;
      rand[i * 3 + 0] = Math.random();
      rand[i * 3 + 1] = Math.random();
      rand[i * 3 + 2] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -100), 400);
    const material = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_cursor: { value: new THREE.Vector3() },
        u_density: { value: 1 },
        u_px: { value: 1 },
        u_c1: { value: new THREE.Color("#00ff9d") },
        u_c2: { value: new THREE.Color("#22d3ee") },
        u_gold: { value: new THREE.Color("#e3c07b") },
      },
    });
    return { geo, material };
  }, [count]);

  useFrame(() => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.u_time.value = G.t * 0.5;
    u.u_cursor.value.copy(G.cursor3);
    u.u_density.value += (G.quality - u.u_density.value) * 0.05;
  });

  return (
    <points
      geometry={geo}
      material={material}
      ref={(p: any) => {
        if (p) {
          mat.current = p.material;
          p.material.uniforms.u_px.value = Math.min(viewport.dpr, 2);
        }
      }}
      frustumCulled={false}
    />
  );
}
