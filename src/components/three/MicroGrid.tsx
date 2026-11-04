import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CROSS_VERT, CROSS_FRAG } from "../../lib/glsl";
import { G } from "../../lib/uniforms";
import { makeTelemetryTexture } from "../../lib/textures";

/** 4,200 instanced coordinate crosshairs + scrolling telemetry strips through the void. */
export default function MicroGrid({ count = 4200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const stripsRef = useRef<THREE.Group>(null);

  const { geo, material, matrices } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    const phase = new Float32Array(count);
    const scale = new Float32Array(count);
    const m = new THREE.Matrix4();
    const matrices: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const z = 20 - Math.random() * 236;
      const x = (Math.random() - 0.5) * 46;
      const y = (Math.random() - 0.5) * 30;
      m.makeTranslation(x, y, z);
      matrices.push(m.clone());
      phase[i] = Math.random();
      scale[i] = 0.05 + Math.random() * 0.16;
    }
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));
    geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scale, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: CROSS_VERT,
      fragmentShader: CROSS_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_c1: { value: new THREE.Color("#00ff9d") },
        u_c2: { value: new THREE.Color("#22d3ee") },
      },
    });
    return { geo, material, matrices };
  }, [count]);

  const strips = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number; tex: THREE.CanvasTexture; speed: number }[] = [];
    for (let i = 0; i < 26; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * 36, (Math.random() - 0.5) * 22, 12 - i * 8 - Math.random() * 6],
        rot: (Math.random() - 0.5) * 0.6,
        tex: makeTelemetryTexture(i + 3),
        speed: 0.005 + Math.random() * 0.015,
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (material) material.uniforms.u_time.value = G.t * 0.5;
    if (meshRef.current) meshRef.current.count = Math.floor(count * G.quality);
    stripsRef.current?.children.forEach((child: any, i) => {
      if (child.material?.map) child.material.map.offset.x = (G.t * strips[i].speed) % 1;
    });
  });

  return (
    <group>
      <instancedMesh
        ref={(im: any) => {
          meshRef.current = im;
          if (im) matrices.forEach((mtx, i) => im.setMatrixAt(i, mtx));
        }}
        args={[geo, material, count]}
        frustumCulled={false}
      />
      <group ref={stripsRef}>
        {strips.map((s, i) => (
          <mesh key={i} position={s.pos} rotation={[0, 0, s.rot]}>
            <planeGeometry args={[3.4, 0.16]} />
            <meshBasicMaterial
              map={s.tex}
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
