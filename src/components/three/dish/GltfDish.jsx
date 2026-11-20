import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

/**
 * An uploaded dish model (GLB, Draco or Meshopt compressed, under 1.5 MB: master prompt 4.7), scaled to sit on
 * the plate like the procedural pizza (radius ~1.15) and exploded by its top-level parts, bottom to top
 * (Kenney's Food Kit pizza, for example, is modelled in separate layers).
 * Enable it by setting DISH_GLB_URL in DishScene.jsx.
 */
export default function GltfDish({ url, explode, radius = 1.15, gap = 0.3 }) {
  const { scene } = useGLTF(url, true);
  const parts = useRef([]);

  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const s = (radius * 2) / Math.max(size.x, size.z, 1e-6);
    root.scale.setScalar(s);
    const centre = box.getCenter(new THREE.Vector3());
    root.position.set(-centre.x * s, -box.min.y * s, -centre.z * s);
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    // Explode order: lowest part first.
    const kids = [...root.children].map((o) => ({ o, y: new THREE.Box3().setFromObject(o).min.y, base: o.position.y }));
    kids.sort((a, b) => a.y - b.y);
    parts.current = kids;
    return root;
  }, [scene, radius]);

  useFrame(() => {
    const t = explode?.current?.t ?? 0;
    const s = model.scale.x || 1;
    parts.current.forEach((p, i) => {
      p.o.position.y = p.base + ((i * gap) / s) * t;
    });
  });

  return <primitive object={model} />;
}
