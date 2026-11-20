import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  basilGeometry,
  cheeseGeometry,
  crustGeometry,
  crustTexture,
  doughTexture,
  sauceTexture,
  seeded,
  wobblyDisc,
} from "@/components/three/dish/pizzaMaterials";

/** How far each layer lifts in the exploded view (scene units), bottom to top, and a small counter-twist. */
const LIFT = { base: 0.1, sauce: 0.42, cheese: 0.74, basil: 1.06 };
const TWIST = { base: 0, sauce: -0.12, cheese: 0.1, basil: -0.18 };

// Mozzarella pools (x, z, size, rotation): a hand-torn Margherita, not a grid.
const CHEESE = [
  [0.02, 0.05, 0.3, 0.2],
  [-0.48, -0.36, 0.27, 1.1],
  [0.46, -0.42, 0.29, 2.3],
  [0.58, 0.28, 0.26, 0.6],
  [-0.12, 0.6, 0.28, 2.9],
  [-0.62, 0.22, 0.25, 1.9],
  [0.06, -0.72, 0.22, 0.4],
  [0.3, 0.68, 0.18, 1.4],
  [-0.78, -0.12, 0.15, 2.2],
  [0.8, -0.05, 0.16, 0.9],
];
// Basil leaves (x, z, length, heading).
const BASIL = [
  [0.2, -0.08, 0.36, 0.7],
  [-0.3, 0.3, 0.32, 2.4],
  [-0.22, -0.55, 0.3, 4.1],
  [0.55, 0.45, 0.28, 5.3],
  [0.62, -0.32, 0.3, 1.6],
  [-0.64, -0.02, 0.26, 3.3],
];

function useInstances(ref, items, place) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Object3D();
    items.forEach((item, i) => {
      place(m, item, i);
      m.updateMatrix();
      mesh.setMatrixAt(i, m.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    // place() is a static helper declared with the data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, items]);
}

/**
 * Stylised Margherita built from primitives: dough disc, torus crust, sauce disc, mozzarella pools (instanced),
 * basil leaves (instanced). Each layer is its own group so the exploded view can lift them apart.
 * `explode.current.t` (0..1) is written by the DOM side (GSAP); this component only reads it per frame.
 */
export default function ProceduralPizza({ explode }) {
  const base = useRef(null);
  const sauce = useRef(null);
  const cheese = useRef(null);
  const basil = useRef(null);
  const cheeseMesh = useRef(null);
  const basilMesh = useRef(null);

  const assets = useMemo(() => {
    const rand = seeded(42);
    return {
      crustMap: crustTexture(rand),
      sauceMap: sauceTexture(rand),
      doughMap: doughTexture(rand),
      crust: crustGeometry(),
      sauce: wobblyDisc(0.98, 2, 0.03),
      dough: new THREE.CylinderGeometry(1.1, 1.08, 0.05, 96),
      cheese: cheeseGeometry(),
      basil: basilGeometry(),
    };
  }, []);
  useEffect(
    () => () => {
      Object.values(assets).forEach((a) => a.dispose?.());
    },
    [assets],
  );

  useInstances(cheeseMesh, CHEESE, (m, [x, z, s, r]) => {
    m.position.set(x, 0.052, z);
    m.rotation.set(0, r, 0);
    m.scale.set(s, s * 1.25, s * (0.85 + (r % 0.3)));
  });
  useInstances(basilMesh, BASIL, (m, [x, z, s, r], i) => {
    // Rest on the cheese (a little higher near the centre), tilted slightly.
    m.position.set(x, 0.1 + (i % 2) * 0.012, z);
    m.rotation.set(0.12 * ((i % 3) - 1), r, 0.1 * ((i % 2) - 0.5));
    m.scale.setScalar(s);
  });
  useLayoutEffect(() => {
    const mesh = basilMesh.current;
    if (!mesh) return;
    const c = new THREE.Color();
    BASIL.forEach((_, i) => mesh.setColorAt(i, c.set(i % 2 ? "#2f6e27" : "#3b822f").offsetHSL(0, 0, (i % 3) * 0.015)));
    mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame(() => {
    const t = explode?.current?.t ?? 0;
    const layers = [
      [base, "base"],
      [sauce, "sauce"],
      [cheese, "cheese"],
      [basil, "basil"],
    ];
    for (const [ref, key] of layers) {
      if (!ref.current) continue;
      ref.current.position.y = LIFT[key] * t;
      ref.current.rotation.y = TWIST[key] * t;
    }
  });

  return (
    <group>
      <group ref={base}>
        <mesh geometry={assets.dough} position={[0, 0.025, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={assets.doughMap} roughness={0.88} />
        </mesh>
        <mesh geometry={assets.crust} position={[0, 0.058, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial map={assets.crustMap} roughness={0.72} sheen={0.4} sheenColor="#ffe2b0" sheenRoughness={0.6} />
        </mesh>
      </group>
      <group ref={sauce}>
        <mesh geometry={assets.sauce} position={[0, 0.0515, 0]} receiveShadow>
          <meshPhysicalMaterial map={assets.sauceMap} roughness={0.34} clearcoat={0.55} clearcoatRoughness={0.3} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      </group>
      <group ref={cheese}>
        <instancedMesh ref={cheeseMesh} args={[assets.cheese, undefined, CHEESE.length]} castShadow receiveShadow>
          <meshPhysicalMaterial vertexColors roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.35} sheen={0.5} sheenColor="#fff6e0" />
        </instancedMesh>
      </group>
      <group ref={basil}>
        <instancedMesh ref={basilMesh} args={[assets.basil, undefined, BASIL.length]} castShadow>
          <meshPhysicalMaterial vertexColors roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.25} side={THREE.DoubleSide} />
        </instancedMesh>
      </group>
    </group>
  );
}
