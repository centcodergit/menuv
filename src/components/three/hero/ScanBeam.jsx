import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MONOLITH_HALF } from "@/components/three/hero/QrMonolith";

const PERIOD = 6;
const SWEEP = 1.15;

function beamTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "rgba(139,92,246,0)");
  grad.addColorStop(0.42, "rgba(167,139,250,0.35)");
  grad.addColorStop(0.5, "rgba(237,233,254,1)");
  grad.addColorStop(0.58, "rgba(167,139,250,0.35)");
  grad.addColorStop(1, "rgba(139,92,246,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * The scan (master prompt 7.1): every 6 seconds a thin additive violet plane sweeps down the monolith.
 * Right after it passes, `onPassed` fires so the phone screen can brighten for 300ms (scan → the menu lights up).
 */
export default function ScanBeam({ state, onPassed }) {
  const mesh = useRef(null);
  const last = useRef(false);
  const texture = useMemo(beamTexture, []);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const { assemble, scatter } = state.current;
    const active = assemble > 0.99 && scatter < 0.04;
    const t = clock.elapsedTime % PERIOD;
    const sweeping = active && t < SWEEP;
    m.visible = sweeping;
    if (sweeping) {
      const k = t / SWEEP;
      m.position.y = MONOLITH_HALF + 0.25 - k * (MONOLITH_HALF * 2 + 0.5);
      m.material.opacity = Math.sin(Math.PI * k) * 0.95;
    }
    if (last.current && !sweeping && active) onPassed?.();
    last.current = sweeping;
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0.09]} visible={false}>
      <planeGeometry args={[MONOLITH_HALF * 2 + 0.08, 0.42]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}
