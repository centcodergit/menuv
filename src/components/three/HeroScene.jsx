import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, Environment, Html, Lightformer, PerformanceMonitor, SpotLight } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { easing } from "maath";
import { gsap } from "@/lib/gsap";
import Phone from "@/components/three/hero/Phone";
import QrMonolith, { MONOLITH_HALF } from "@/components/three/hero/QrMonolith";
import ScanBeam from "@/components/three/hero/ScanBeam";
import HeroChip from "@/components/hero/HeroChip";
import { monolithBox, phoneScreenX } from "@/components/hero/layout";

const TAN16 = Math.tan((16 * Math.PI) / 180);
const TAN4 = Math.tan((4 * Math.PI) / 180);
const REST_ROT_Y = -0.22;
const MONOLITH_Z = -2;
const QR_LAYER = 1;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;

function Lights({ light }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      {/* Environment made only of Lightformers: no HDR download (master prompt 7.1). */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" color="#7C3AED" intensity={4} position={[-5, 1, 3]} scale={[4, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" color="#FFFFFF" intensity={2.2} position={[5, 0.5, 3]} scale={[0.5, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" color="#C4B5FD" intensity={2.5} position={[0, 1.5, -6]} scale={5} target={[0, 0, 0]} />
      </Environment>
      {/* The volumetric cone reads as a soft beam on the dark theme; on the light page the transparent canvas shows it
          as dark diagonal bands, so it is off there. */}
      <SpotLight
        volumetric={!light}
        position={[3.5, 5.5, 2.5]}
        angle={0.42}
        penumbra={0.8}
        distance={13}
        attenuation={7}
        anglePower={5}
        intensity={2.5}
        opacity={0.22}
        color="#C4B5FD"
      />
    </>
  );
}

/**
 * Post effects. The canvas is transparent over the page: grain and vignette blend into the dark theme, but on the
 * light theme they leave grey specks and dark corners, so the light theme keeps only the bloom.
 */
function Effects({ light }) {
  return light ? (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.65} intensity={0.7} />
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.65} intensity={0.7} />
      <Noise opacity={0.035} premultiply />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  );
}

/** Everything that moves: layout, entrance, scroll dive, pointer rig, chips. Reads refs, never sets state per frame. */
function Stage({ driver, play, late, menuProps, chips, onReady }) {
  const { camera, size } = useThree();
  const stage = useRef(null);
  const phone = useRef(null);
  const monolith = useRef(null);
  useEffect(() => {
    camera.layers.enable(QR_LAYER);
    // Everything inside the monolith group (modules + scan beam) goes on its own layer.
    monolith.current?.traverse((o) => o.layers.set(QR_LAYER));
  });
  const chipA = useRef(null);
  const chipB = useRef(null);
  const chipDomA = useRef(null);
  const chipDomB = useRef(null);
  const qr = useRef({ assemble: 0, scatter: 0, hit: null });
  const motion = useRef({ rise: 0, chips: 0, p: 0 });
  const camPos = useMemo(() => new THREE.Vector3(0, 0, 7), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(), []);
  const hitPoint = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const [flash, setFlash] = useState(false);
  const readySent = useRef(false);

  // Entrance: QR modules assemble, the phone rises and turns into place, the chips pop (master prompt 7.1, step 5).
  useEffect(() => {
    if (!play) return undefined;
    const q = qr.current;
    const m = motion.current;
    const tl = gsap.timeline();
    if (late) {
      m.rise = 1;
      m.chips = 1;
      tl.to(q, { assemble: 1, duration: 1.8, ease: "none" });
    } else {
      tl.to(q, { assemble: 1, duration: 1.8, ease: "none" }, 0)
        .to(m, { rise: 1, duration: 1.5, ease: "mv.out" }, 0.1)
        .to(m, { chips: 1, duration: 0.8, ease: "mv.spring" }, 0.85);
    }
    return () => tl.kill();
  }, [play, late]);

  const onScanPassed = useCallback(() => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 300);
  }, []);

  useFrame((state, delta) => {
    const d = driver.current;
    const m = motion.current;
    // Damped scroll progress (ScrollTrigger writes the raw value into the driver ref).
    easing.damp(m, "p", d.progress, 0.18, delta);
    const a = smooth(0.1, 0.6, m.p);
    const b = smooth(0.6, 1, m.p);

    // Keep the phone at ~69% of the viewport width at the reference distance (z = 7).
    const halfW = 7 * TAN16 * (size.width / size.height);
    const anchorX = (phoneScreenX(size.width) * 2 - 1) * halfW;
    stage.current.position.x = anchorX;
    // QR monolith: placed in screen space (between the navbar and the headline, tucked behind the phone).
    if (monolith.current) {
      const box = monolithBox({ w: size.width, h: size.height, textTop: d.textTop });
      const depth = 7 - MONOLITH_Z;
      const halfH = depth * TAN16;
      const halfWide = halfH * (size.width / size.height);
      monolith.current.position.set((box.cx * 2 - 1) * halfWide - anchorX, (1 - box.cy * 2) * halfH, MONOLITH_Z);
      monolith.current.scale.setScalar((box.height * 2 * halfH) / (2 * MONOLITH_HALF));
    }

    // Phone: rise + turn in, face the camera during the dive, tilt toward the pointer.
    const ph = phone.current;
    const tilt = 1 - a;
    ph.position.y = lerp(-1.4, -0.05, m.rise);
    easing.damp(ph.rotation, "y", lerp(0.9, REST_ROT_Y, m.rise) * (1 - a) + d.pointer.x * 0.12 * tilt, 0.25, delta);
    easing.damp(ph.rotation, "x", (0.04 - d.pointer.y * 0.08) * tilt, 0.25, delta);

    // QR: scatter into glowing points as the camera dives.
    qr.current.scatter = a;

    // Pointer → monolith surface (for the ripple).
    const mono = monolith.current;
    if (mono && d.pointer.inside) {
      ndc.set(d.pointer.ndcX, d.pointer.ndcY);
      raycaster.setFromCamera(ndc, camera);
      mono.updateMatrixWorld();
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).applyQuaternion(mono.getWorldQuaternion(new THREE.Quaternion())), mono.getWorldPosition(new THREE.Vector3()));
      qr.current.hit = raycaster.ray.intersectPlane(plane, hitPoint) ? mono.worldToLocal(hitPoint.clone()) : null;
    } else {
      qr.current.hit = null;
    }

    // Camera: dolly toward the phone (7 → 3.2), then into the screen until it fills the view.
    const z = lerp(lerp(7, 3.2, a), 1.5, b);
    camPos.set(lerp(0, anchorX, a), lerp(0, -0.05, a), z);
    // Pointer rig: up to 4 degrees around the target, fading out during the dive.
    camPos.x += d.pointer.x * TAN4 * z * (1 - b);
    camPos.y += d.pointer.y * TAN4 * z * 0.6 * (1 - b);
    easing.damp3(camera.position, camPos, 0.25, delta);
    look.set(lerp(0, anchorX, a), lerp(0, -0.05, a), 0);
    camera.lookAt(look);

    // Chips: a slow sway around the phone at different depths; they fall away during the dive.
    const t = state.clock.elapsedTime;
    // drei <Html> (screen space) ignores group scale, so the pop-in / fall-away is applied to the DOM directly.
    const chipScale = m.chips * (1 - smooth(0.02, 0.3, a));
    const chipStyle = (el) => {
      if (!el) return;
      el.style.opacity = String(chipScale);
      el.style.transform = `scale(${0.6 + 0.4 * chipScale})`;
      el.style.visibility = chipScale < 0.01 ? "hidden" : "visible";
    };
    if (chipA.current) {
      const th = Math.sin(t / 14 * Math.PI * 2) * 0.22;
      chipA.current.position.set(0.98 * Math.cos(th), 0.92 + Math.sin(t * 0.45) * 0.05, 0.55 - Math.sin(th) * 0.5);
      chipStyle(chipDomA.current);
    }
    if (chipB.current) {
      const th = Math.sin(t / 17 * Math.PI * 2 + 1.3) * 0.22;
      chipB.current.position.set(-0.62 * Math.cos(th), -0.98 + Math.sin(t * 0.38 + 1) * 0.05, 0.65 + Math.sin(th) * 0.4);
      chipStyle(chipDomB.current);
    }

    if (!readySent.current) {
      readySent.current = true;
      requestAnimationFrame(() => onReady?.());
    }
  });

  return (
    <group ref={stage}>
      <Phone ref={phone} menuProps={menuProps} flash={flash} />
      <group ref={monolith} position={[-1.3, 0.45, MONOLITH_Z]} rotation={[0.02, 0.26, 0]}>
        <QrMonolith state={qr} />
        <ScanBeam state={qr} onPassed={onScanPassed} />
      </group>
      <group ref={chipA}>
        <Html center distanceFactor={5} zIndexRange={[40, 31]} style={{ pointerEvents: "none" }}>
          <div ref={chipDomA} style={{ opacity: 0, visibility: "hidden" }}>
            <HeroChip kind="scan" title={chips.scanTitle} sub={chips.scanSub} />
          </div>
        </Html>
      </group>
      <group ref={chipB}>
        <Html center distanceFactor={5} zIndexRange={[40, 31]} style={{ pointerEvents: "none" }}>
          <div ref={chipDomB} style={{ opacity: 0, visibility: "hidden" }}>
            <HeroChip kind="live" title={chips.liveTitle} sub={chips.liveSub} />
          </div>
        </Html>
      </group>
      {/* Only the phone casts this shadow: the QR monolith lives on layer 1, which the shadow camera doesn't see
          (its modules otherwise cast dash-like shadows that showed on the light theme). */}
      <ContactShadows position={[0, -1.75, 0]} opacity={0.5} scale={5} blur={2.6} far={3.4} resolution={256} color="#000000" />
    </group>
  );
}

/**
 * The hero's real-time 3D stage (master prompt 7.1), desktop with a fine pointer only. Loaded lazily after
 * first paint. Inputs come through `driver` (a ref the DOM side updates: scroll progress, pointer), so nothing
 * here causes React re-renders per frame. Calls onReady after the first rendered frame (the DOM phone then fades out).
 */
export default function HeroScene({ driver, play, late, menuProps, chips, onReady, light = false }) {
  const [dprMax, setDprMax] = useState(1.75);
  return (
    <Canvas
      dpr={[1, dprMax]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, position: [0, 0, 7], near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        // Skip three.js's per-shader error check: it reads the program log right after linking, which forces a
        // synchronous compile and stalls the frame. Shaders then compile in parallel (KHR_parallel_shader_compile).
        gl.debug.checkShaderErrors = import.meta.env.DEV && new URLSearchParams(window.location.search).has("glcheck");
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDprMax(1)} />
      <AdaptiveDpr />
      <Suspense fallback={null}>
        <Lights light={light} />
        <Stage driver={driver} play={play} late={late} menuProps={menuProps} chips={chips} onReady={onReady} />
        <Effects light={light} />
      </Suspense>
    </Canvas>
  );
}
