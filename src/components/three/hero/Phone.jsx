import { forwardRef } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import PhoneMenu, { SCREEN_H, SCREEN_W } from "@/components/hero/PhoneMenu";

export const PHONE = { w: 1.5, h: 3.1, d: 0.16 };
const SCREEN_UNITS_W = 1.36;
/**
 * The DOM menu is laid out at 2x (CSS zoom) and mapped onto the screen face at half size, so text stays sharp
 * when the camera dives in (browsers upscale the rasterised layer during the scroll otherwise).
 * CSS px per world unit, and the drei <Html> distanceFactor that produces it (400 / px).
 */
const ZOOM = 2;
const PX_PER_UNIT = (SCREEN_W * ZOOM) / SCREEN_UNITS_W;
const DISTANCE_FACTOR = 400 / PX_PER_UNIT;
const SCREEN_RADIUS_PX = Math.round(0.17 * PX_PER_UNIT);

const black = <meshStandardMaterial color="#09080D" metalness={0.6} roughness={0.35} />;

/**
 * The hero phone (master prompt 7.1): drei RoundedBox in a dark physical material (#14121C, metalness 0.85,
 * roughness 0.28, clearcoat 1), thin side buttons, and the real <PhoneMenu> on the screen face through
 * drei <Html transform>, so it stays crisp and interactive at any zoom (the dynamic island is part of the menu).
 */
const Phone = forwardRef(function Phone({ menuProps, flash }, ref) {
  return (
    <group ref={ref}>
      <RoundedBox args={[PHONE.w, PHONE.h, PHONE.d]} radius={0.2} smoothness={8} castShadow>
        <meshPhysicalMaterial color="#14121C" metalness={0.85} roughness={0.28} clearcoat={1} clearcoatRoughness={0.12} />
      </RoundedBox>
      {/* side buttons */}
      <mesh position={[-PHONE.w / 2 - 0.008, 0.78, 0]}>
        <boxGeometry args={[0.025, 0.2, 0.06]} />
        {black}
      </mesh>
      <mesh position={[-PHONE.w / 2 - 0.008, 0.38, 0]}>
        <boxGeometry args={[0.025, 0.36, 0.06]} />
        {black}
      </mesh>
      <mesh position={[PHONE.w / 2 + 0.008, 0.55, 0]}>
        <boxGeometry args={[0.025, 0.46, 0.06]} />
        {black}
      </mesh>
      {/* screen glass behind the DOM menu (keeps the face dark at grazing angles) */}
      <mesh position={[0, 0, PHONE.d / 2 + 0.001]}>
        <planeGeometry args={[SCREEN_UNITS_W, (SCREEN_H / SCREEN_W) * SCREEN_UNITS_W]} />
        <meshBasicMaterial color="#0B0A12" toneMapped={false} />
      </mesh>
      <Html
        transform
        position={[0, 0, PHONE.d / 2 + 0.003]}
        distanceFactor={DISTANCE_FACTOR}
        zIndexRange={[30, 10]}
        style={{ pointerEvents: "auto" }}
      >
        <div style={{ width: SCREEN_W * ZOOM, height: SCREEN_H * ZOOM, borderRadius: SCREEN_RADIUS_PX, overflow: "hidden", backfaceVisibility: "hidden" }}>
          <div style={{ zoom: ZOOM }}>
            <PhoneMenu {...menuProps} autoCycle flash={flash} />
          </div>
        </div>
      </Html>
    </group>
  );
});

export default Phone;
