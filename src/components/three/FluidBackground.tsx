import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { FLUID_VERT, FLUID_FRAG } from "../../lib/glsl";
import { G } from "../../lib/uniforms";

export default function FluidBackground() {
  const mat = useRef<any>(null);
  const { size } = useThree();

  const { geo, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const material = new THREE.ShaderMaterial({
      vertexShader: FLUID_VERT,
      fragmentShader: FLUID_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        u_time: { value: 0 },
        u_res: { value: new THREE.Vector2(1, 1) },
        u_mouse: { value: new THREE.Vector2() },
        u_mouseVel: { value: new THREE.Vector2() },
        u_viscosity: { value: 0.72 },
        u_scroll: { value: 0 },
        u_glitch: { value: 0 },
        u_iterations: { value: 6 },
        u_c1: { value: new THREE.Color("#00ff9d") },
        u_c2: { value: new THREE.Color("#22d3ee") },
        u_c3: { value: new THREE.Color("#ff3b5c") },
      },
    });
    return { geo, material };
  }, []);

  useFrame(() => {
    const u = mat.current.uniforms;
    // matrix runs at half the global clock — stays calm while UI is snappy
    u.u_time.value = G.t * 0.5;
    u.u_res.value.set(size.width, size.height);
    u.u_mouse.value.copy(G.mouse);
    u.u_mouseVel.value.copy(G.mouseVel);
    u.u_scroll.value = G.scroll;
    u.u_glitch.value = G.glitch;
    u.u_iterations.value = 6 * G.quality;
    u.u_viscosity.value = 0.72 - Math.min(Math.abs(G.mouseVel.length()) * 0.2, 0.3);
  });

  return <mesh geometry={geo} material={material} ref={(m: any) => m && (mat.current = m.material)} frustumCulled={false} renderOrder={-10} />;
}
