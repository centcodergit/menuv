import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { cn } from "@/lib/utils";

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

// A swirling vertical column of light (React Bits "Light Pillar" idea), leaning toward the cursor.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uLean;
uniform float uIntensity;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float center = 0.5 + uLean * (uv.y - 0.1);
  float x = (uv.x - center) * aspect;
  float swirl = fbm(vec2(x * 2.6 + uTime * 0.12, uv.y * 2.2 - uTime * 0.3));
  float width = 0.11 + 0.035 * sin(uv.y * 5.0 + uTime * 0.5) + swirl * 0.07;
  float core = exp(-pow(x / width, 2.0));
  float halo = exp(-pow(x / (width * 4.0), 2.0)) * 0.32;
  float strands = smoothstep(0.5, 0.92, fbm(vec2(x * 11.0 + swirl, uv.y * 3.5 - uTime * 0.45))) * core;
  float fadeY = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.05, 0.45, uv.y);
  float a = (core * 0.55 + halo + strands * 0.45) * fadeY * uIntensity;
  vec3 col = mix(uColorA, uColorB, clamp(uv.y * 0.9 + swirl * 0.35, 0.0, 1.0));
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;

const rgb = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? v.split(/\s+/).map((n) => Number(n) / 255) : fallback;
};

/**
 * Light Pillar for the final CTA (7.15): one OGL WebGL context, mounted by the parent only near the viewport on
 * desktop. Leans toward the cursor, pauses off screen or in a hidden tab, releases its context on unmount.
 */
export default function LightPillar({ className }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    el.appendChild(gl.canvas);

    const dark = () => document.documentElement.classList.contains("dark");
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uLean: { value: 0 },
      uIntensity: { value: dark() ? 1 : 0.7 },
      uColorA: { value: rgb("--mv-violet-600", [0.43, 0.16, 0.85]) },
      uColorB: { value: rgb("--mv-orchid", [0.75, 0.15, 0.83]) },
    };
    const program = new Program(gl, { vertex, fragment, uniforms, transparent: true });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
      uniforms.uRes.value = [width, height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Only theme switches matter (Lenis toggles other classes on <html> on every scroll start/stop).
    let wasDark = dark();
    const mo = new MutationObserver(() => {
      if (dark() === wasDark) return;
      wasDark = dark();
      uniforms.uIntensity.value = dark() ? 1 : 0.7;
      uniforms.uColorA.value = rgb("--mv-violet-600", uniforms.uColorA.value);
      uniforms.uColorB.value = rgb("--mv-orchid", uniforms.uColorB.value);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let target = 0;
    const onMove = (e) => {
      target = (e.clientX / window.innerWidth - 0.5) * 0.45;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);

    let frame = 0;
    const loop = (t) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      uniforms.uTime.value = t * 0.001;
      uniforms.uLean.value += (target - uniforms.uLean.value) * 0.04;
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (!gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, []);

  return <div ref={host} aria-hidden="true" className={cn("pointer-events-none", className)} />;
}
