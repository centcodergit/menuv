import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { URL_QR, darkModules } from "@/content/qr";

const MODULE = 0.088;
const HALF = (URL_QR.size * MODULE) / 2;
const MAX_DELAY = 0.38;

const easeOut = (t) => 1 - (1 - t) ** 4;
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Deterministic randomness so every visit assembles the same way.
const rand = (i) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * The QR monolith (master prompt 7.1): the real https://menuverse.eu code, dark modules only, as one
 * InstancedMesh of small glossy boxes with a violet emissive glow. Modules fly in from a sphere and assemble
 * (per-instance delay + easing), push forward near the cursor like a ripple (maath damping), and during the
 * scroll dive scatter outward into glowing points.
 * `state.current` = { assemble (0..1), scatter (0..1, damped scroll), hit: Vector3 | null (local pointer hit) }.
 */
export default function QrMonolith({ state }) {
  const mesh = useRef(null);
  const material = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const cells = darkModules(URL_QR);
    return cells.map(([cx, cy], i) => {
      const grid = new THREE.Vector3(cx * MODULE - HALF + MODULE / 2, HALF - cy * MODULE - MODULE / 2, 0);
      const theta = rand(i + 1) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 7) - 1);
      const r = 3.2 + rand(i + 13) * 1.6;
      const start = new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      const out = grid.clone().normalize().multiplyScalar(1.2 + rand(i + 21) * 1.8);
      out.z = (rand(i + 31) - 0.3) * 2.4;
      return { grid, start, out, delay: rand(i + 3) * MAX_DELAY, push: 0, spin: (rand(i + 5) - 0.5) * 4 };
    });
  }, []);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const { assemble, scatter, hit } = state.current;
    const sc = smooth(0, 1, scatter);
    for (let i = 0; i < data.length; i += 1) {
      const d = data[i];
      const t = easeOut(Math.min(1, Math.max(0, (assemble - d.delay) / (1 - MAX_DELAY))));
      dummy.position.lerpVectors(d.start, d.grid, t);

      // Cursor ripple: modules near the pointer lift toward the viewer.
      let target = 0;
      if (hit && t > 0.98 && sc < 0.05) {
        const dx = d.grid.x - hit.x;
        const dy = d.grid.y - hit.y;
        target = 0.16 * Math.exp(-(dx * dx + dy * dy) / 0.16);
      }
      easing.damp(d, "push", target, 0.18, delta);
      dummy.position.z += d.push;

      if (sc > 0) dummy.position.addScaledVector(d.out, sc);
      const s = (0.35 + 0.65 * t) * (1 - 0.82 * sc);
      dummy.scale.setScalar(s);
      dummy.rotation.set(d.spin * (1 - t), d.spin * 0.6 * (1 - t), 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (material.current) {
      material.current.emissiveIntensity = 0.14 + sc * 4.5;
      material.current.opacity = 1 - smooth(0.75, 1, scatter);
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, data.length]} frustumCulled={false}>
      <boxGeometry args={[MODULE * 0.84, MODULE * 0.84, MODULE * 0.9]} />
      <meshPhysicalMaterial
        ref={material}
        color="#0A0910"
        metalness={0.75}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.08}
        emissive="#6D28D9"
        emissiveIntensity={0.14}
        transparent
      />
    </instancedMesh>
  );
}

export const MONOLITH_HALF = HALF;
