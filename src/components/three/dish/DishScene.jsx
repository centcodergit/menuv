import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { easing } from "maath";
import ProceduralPizza from "@/components/three/dish/ProceduralPizza";
import GltfDish from "@/components/three/dish/GltfDish";
import { plateGeometry } from "@/components/three/dish/pizzaMaterials";

/**
 * A dish GLB uploaded by the owner replaces the procedural pizza: set its URL here (one line), e.g. "/models/dish.glb".
 * GltfDish scales it onto the plate and explodes it by its top-level parts.
 */
const DISH_GLB_URL = null;

// TODO(AR): this component can later switch to Google <model-viewer> (same GLB) with
//   <model-viewer src={DISH_GLB_URL} ar ar-modes="webxr scene-viewer quick-look" camera-controls disable-zoom auto-rotate>
// for real AR on phones. Not shipped now (master prompt 7.11): no AR, no extra dependency.

const POLAR = 0.92; // camera angle from vertical at rest (radians)
const MIN_POLAR = 0.5;
const MAX_POLAR = 1.22;

function Plate() {
  const geo = useMemo(() => plateGeometry(), []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshPhysicalMaterial color="#1b1921" roughness={0.38} metalness={0} clearcoat={1} clearcoatRoughness={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.18} />
      {/* Soft warm key from above-front: the "spotlight on the pass". */}
      <spotLight
        position={[1.6, 5.2, 2.4]}
        angle={0.5}
        penumbra={0.95}
        intensity={55}
        decay={2}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
      />
      {/* Violet rim from behind, on-palette. */}
      <directionalLight position={[-3, 2, -4]} intensity={1.1} color="#a78bfa" />
      {/* Lightformer-only environment (no HDR download) for the glaze, sauce and cheese highlights. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" color="#fff4e6" intensity={2.4} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[4, 3, 1]} />
        <Lightformer form="rect" color="#7c3aed" intensity={2.2} position={[-5, 1.5, -2]} scale={[3, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" color="#ffffff" intensity={1.2} position={[5, 1, 2]} scale={[0.6, 4, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

/** Orbit rig: rotate only, damped, gentle auto-rotate that stops while dragging and resumes a moment later. */
function Controls({ autoRotate, explode, onDragStart }) {
  const controls = useRef(null);
  const { camera, size } = useThree();
  const resume = useRef(0);
  const dragging = useRef(false);
  const target = useMemo(() => new THREE.Vector3(0, 0.12, 0), []);

  // Frame the plate for the stage's aspect ratio (phones are squarer than desktop cards).
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const fitWidth = 2.05 / (Math.tan(halfFov) * aspect);
    const fitHeight = 1.75 / Math.tan(halfFov);
    const dist = Math.max(fitWidth, fitHeight, 4.6);
    const dir = camera.position.clone().sub(target).normalize();
    camera.position.copy(target).addScaledVector(dir, dist);
    camera.updateProjectionMatrix();
    controls.current?.update();
  }, [camera, size, target]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    // OrbitControls sets touch-action: none on connect; keep vertical page scrolling on touch screens.
    if (c.domElement && c.domElement.style.touchAction !== "pan-y") c.domElement.style.touchAction = "pan-y";
    // Keep the exploded stack centred.
    easing.damp(c.target, "y", 0.12 + 0.4 * (explode.current?.t ?? 0), 0.15, delta);
    c.autoRotate = autoRotate && !dragging.current && performance.now() > resume.current;
  });

  return (
    <OrbitControls
      ref={controls}
      target={target}
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.65}
      minPolarAngle={MIN_POLAR}
      maxPolarAngle={MAX_POLAR}
      autoRotateSpeed={0.55}
      onStart={() => {
        dragging.current = true;
        onDragStart?.();
      }}
      onEnd={() => {
        dragging.current = false;
        resume.current = performance.now() + 2500;
      }}
    />
  );
}

/**
 * Calls onReady after the first rendered frames; on unmount, hands a still to onSnapshot. (R3F itself releases
 * the context 500ms after unmount with forceContextLoss; the phone slot hand-over waits for that.)
 */
function Lifecycle({ onReady, onSnapshot }) {
  const { gl, scene, camera } = useThree();
  const cbs = useRef({ onReady, onSnapshot });
  cbs.current = { onReady, onSnapshot };
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) cbs.current.onReady?.();
  });
  useEffect(
    () => () => {
      if (frames.current > 2 && cbs.current.onSnapshot) {
        try {
          gl.render(scene, camera);
          cbs.current.onSnapshot(gl.domElement.toDataURL("image/webp", 0.86));
        } catch {
          /* keep the previous poster */
        }
      }
    },
    [gl, scene, camera],
  );
  return null;
}

/**
 * Card B's dish (master prompt 7.11): one stylised pizza on a dark ceramic plate under a soft spotlight.
 * Props: `paused` (frameloop off while off screen), `autoRotate` (off for reduced motion), `explode` (ref, 0..1,
 * driven by GSAP on the DOM side), `onDragStart` (first drag hides the hint), `onReady`, `onSnapshot`.
 */
export default function DishScene({ paused, autoRotate, explode, onDragStart, onReady, onSnapshot, maxDpr = 1.75 }) {
  const dir = new THREE.Vector3(0, Math.cos(POLAR), Math.sin(POLAR));
  return (
    <Canvas
      aria-hidden="true"
      shadows
      frameloop={paused ? "never" : "always"}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: dir.multiplyScalar(5.4).toArray(), near: 0.1, far: 30 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        // Skip three.js's per-shader error check: it reads the program log right after linking, which forces a
        // synchronous compile and stalls the frame. Shaders then compile in parallel (KHR_parallel_shader_compile).
        gl.debug.checkShaderErrors = import.meta.env.DEV && new URLSearchParams(window.location.search).has("glcheck");
      }}
      style={{ touchAction: "pan-y" }}
    >
      <Lights />
      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <Plate />
          {DISH_GLB_URL ? <GltfDish url={DISH_GLB_URL} explode={explode} /> : <ProceduralPizza explode={explode} />}
        </group>
        <ContactShadows position={[0, -0.062, 0]} opacity={0.55} scale={5.5} blur={2.4} far={1.2} resolution={256} frames={1} color="#000000" />
      </Suspense>
      <Controls autoRotate={autoRotate} explode={explode} onDragStart={onDragStart} />
      <Lifecycle onReady={onReady} onSnapshot={onSnapshot} />
    </Canvas>
  );
}
