import * as THREE from "three";

/**
 * Procedural textures and geometry for the stylised Margherita (no downloads, nothing to license).
 * Everything is generated once per mount from a seeded random, so the pizza looks the same on every visit.
 */

export function seeded(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth periodic noise in [-1, 1] (sum of sines, no tables). */
export const wobble = (a, seed = 0) =>
  (Math.sin(a * 3 + seed) * 0.5 + Math.sin(a * 7 + seed * 1.7) * 0.3 + Math.sin(a * 13 + seed * 2.3) * 0.2);

function canvasTexture(w, h, paint, { repeatX = false } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  paint(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeatX) tex.wrapS = THREE.RepeatWrapping;
  // Painted in UV space (canvas y = texture v), so no flip.
  tex.flipY = false;
  return tex;
}

function spot(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace("ALPHA", alpha));
  g.addColorStop(1, color.replace("ALPHA", 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Crust (torus UVs: x runs around the ring, y around the tube; y ≈ 0.25 is the top of the rim).
 * Golden body, deeper bake on top and outside, Neapolitan "leopard" char spots, a dusting of flour.
 */
export function crustTexture(rand) {
  return canvasTexture(
    1024,
    256,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#b7682c");
      g.addColorStop(0.16, "#9a5221");
      g.addColorStop(0.3, "#a95e27");
      g.addColorStop(0.42, "#c98a45");
      g.addColorStop(0.58, "#ddb06c");
      g.addColorStop(0.8, "#e2b97c");
      g.addColorStop(1, "#b7682c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // Uneven bake.
      for (let i = 0; i < 220; i += 1) {
        const x = rand() * w;
        const y = h * (0.02 + rand() * 0.5);
        const r = 10 + rand() * 30;
        for (const dx of [-w, 0, w]) spot(ctx, x + dx, y, r, "rgba(140,70,25,ALPHA)", 0.18 + rand() * 0.2);
      }
      // Leopard spots, concentrated on the top of the rim.
      for (let i = 0; i < 170; i += 1) {
        const x = rand() * w;
        const y = h * (0.1 + Math.pow(rand(), 1.4) * 0.3);
        const r = 3 + Math.pow(rand(), 2) * 13;
        for (const dx of [-w, 0, w]) {
          spot(ctx, x + dx, y, r * 1.8, "rgba(70,32,10,ALPHA)", 0.35);
          spot(ctx, x + dx, y, r, "rgba(28,14,6,ALPHA)", 0.85);
        }
      }
      // Flour.
      for (let i = 0; i < 500; i += 1) {
        ctx.fillStyle = `rgba(255,244,222,${0.08 + rand() * 0.2})`;
        ctx.fillRect(rand() * w, h * (0.35 + rand() * 0.6), 1.5, 1.5);
      }
    },
    { repeatX: true },
  );
}

/** Tomato sauce (planar UVs): deep red with brighter pulp, darker reductions, oregano and a few oil glints. */
export function sauceTexture(rand) {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#a3241a";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i += 1) spot(ctx, rand() * w, rand() * h, 8 + rand() * 34, "rgba(196,52,30,ALPHA)", 0.25 + rand() * 0.3);
    for (let i = 0; i < 160; i += 1) spot(ctx, rand() * w, rand() * h, 6 + rand() * 26, "rgba(110,16,10,ALPHA)", 0.25 + rand() * 0.3);
    for (let i = 0; i < 60; i += 1) spot(ctx, rand() * w, rand() * h, 3 + rand() * 6, "rgba(232,120,60,ALPHA)", 0.35);
    // Darker, reduced edge where the sauce meets the crust.
    const edge = ctx.createRadialGradient(w / 2, h / 2, w * 0.36, w / 2, h / 2, w * 0.5);
    edge.addColorStop(0, "rgba(90,14,8,0)");
    edge.addColorStop(1, "rgba(90,14,8,0.55)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, h);
    // Oregano.
    for (let i = 0; i < 220; i += 1) {
      ctx.fillStyle = rand() > 0.5 ? "rgba(52,62,26,0.85)" : "rgba(86,92,40,0.7)";
      ctx.save();
      ctx.translate(rand() * w, rand() * h);
      ctx.rotate(rand() * Math.PI);
      ctx.fillRect(-1.6, -0.8, 3.2, 1.6);
      ctx.restore();
    }
  });
}

/** Dough under the sauce (seen when the layers separate): pale, floury, a little bake mottling. */
export function doughTexture(rand) {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#e3bd85";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i += 1) spot(ctx, rand() * w, rand() * h, 6 + rand() * 20, "rgba(196,140,80,ALPHA)", 0.25);
    for (let i = 0; i < 400; i += 1) {
      ctx.fillStyle = `rgba(255,248,232,${0.15 + rand() * 0.25})`;
      ctx.fillRect(rand() * w, rand() * h, 1.2, 1.2);
    }
  });
}

/** Torus crust with a hand-stretched, slightly irregular rim and a puffy, bumpy surface. */
export function crustGeometry({ radius = 1.07, tube = 0.105, seed = 3 } = {}) {
  const geo = new THREE.TorusGeometry(radius, tube, 28, 160);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    const u = uv.getX(i) * Math.PI * 2;
    const t = uv.getY(i) * Math.PI * 2;
    // Distance from the ring's centre line, then puff it irregularly around the ring.
    const cx = Math.cos(u) * radius;
    const cy = Math.sin(u) * radius;
    const puff = 1 + wobble(u, seed) * 0.16 + Math.sin(u * 23 + t * 3) * 0.025;
    const ringShift = wobble(u * 0.5, seed + 4) * 0.025;
    v.x = cx * (1 + ringShift) + (v.x - cx) * puff;
    v.y = cy * (1 + ringShift) + (v.y - cy) * puff;
    v.z *= puff * (Math.sin(t) > 0 ? 1.05 : 0.7); // taller on top, flatter underneath
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/** A disc whose edge wanders (sauce spread by hand). Planar UVs. */
export function wobblyDisc(radius, seed = 1, amount = 0.035, segments = 128) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const r = radius * (1 + wobble(a, seed) * amount);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ShapeGeometry(shape, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const span = radius * (1 + amount) * 2;
  for (let i = 0; i < pos.count; i += 1) uv.setXY(i, pos.getX(i) / span + 0.5, pos.getY(i) / span + 0.5);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** A melted mozzarella pool: a flattened, lumpy sphere with browned blisters (vertex colours). */
export function cheeseGeometry(seed = 11) {
  const geo = new THREE.SphereGeometry(1, 40, 20);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cream = new THREE.Color("#eee0bf");
  const warm = new THREE.Color("#e6cf9c");
  const blister = new THREE.Color("#b97a35");
  const c = new THREE.Color();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    const a = Math.atan2(v.z, v.x);
    const r = 1 + (Math.sin(a * 2 + seed) * 0.6 + Math.sin(a * 3 + seed * 1.3) * 0.4) * 0.13;
    v.x *= r;
    v.z *= r;
    // Melted: a soft dome that slumps towards the edge.
    v.y = v.y > 0 ? Math.pow(v.y, 1.6) * (0.13 + 0.03 * Math.sin(a * 2 + seed)) : v.y * 0.02;
    pos.setXYZ(i, v.x, v.y, v.z);
    // Blisters on the upper surface, a warmer tone towards the melted edge.
    const top = Math.max(0, v.y / 0.12);
    const n = Math.sin(v.x * 9 + seed) * Math.sin(v.z * 8 - seed * 0.7) + Math.sin(v.x * 17 + v.z * 13) * 0.4;
    const b = Math.max(0, n - 0.55) * 2.2 * top;
    c.copy(cream).lerp(warm, Math.min(1, Math.hypot(v.x, v.z) * 0.7)).lerp(blister, Math.min(0.85, b));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** A basil leaf: a curled, tapered plane with a lighter midrib (vertex colours), about 1 unit long. */
export function basilGeometry() {
  const geo = new THREE.PlaneGeometry(1, 1, 10, 20);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const leaf = new THREE.Color("#ffffff");
  const rib = new THREE.Color("#cfe8b0");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const u = pos.getX(i); // -0.5..0.5 across
    const t = pos.getY(i) + 0.5; // 0 (stem) .. 1 (tip)
    const width = 0.42 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.75) * (1 - 0.25 * t);
    const x = u * 2 * width;
    const z = t - 0.5;
    const y = 1.1 * x * x + 0.07 * Math.sin(Math.PI * t) - 0.04 * t * t;
    pos.setXYZ(i, x, y, z);
    c.copy(leaf).lerp(rib, Math.max(0, 1 - Math.abs(u) * 14) * 0.6);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Dark glazed ceramic plate profile (radius 1.8). */
export function plateGeometry() {
  const pts = [
    [0, 0],
    [1.3, 0],
    [1.4, 0.01],
    [1.5, 0.035],
    [1.6, 0.075],
    [1.69, 0.112],
    [1.76, 0.13],
    [1.8, 0.126],
    [1.815, 0.11],
    [1.79, 0.092],
    [1.68, 0.066],
    [1.5, 0.018],
    [1.3, -0.03],
    [1.18, -0.05],
    [1.12, -0.058],
    [0, -0.058],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(pts, 160);
  geo.computeVertexNormals();
  return geo;
}
