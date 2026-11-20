import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { cn } from "@/lib/utils";

const vertex = /* glsl */ `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// React Bits "Light Rays" shader (rays from an origin above the top edge), trimmed and re-themed.
const fragment = /* glsl */ `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 rayPos;
uniform vec3 raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float fadeDistance;

float rayStrength(vec2 source, vec2 dir, vec2 coord, float seedA, float seedB, float speed) {
  vec2 toCoord = coord - source;
  float cosAngle = dot(normalize(toCoord), dir);
  float spread = pow(max(cosAngle, 0.0), 1.0 / max(lightSpread, 0.001));
  float dist = length(toCoord);
  float maxDist = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDist - dist) / maxDist, 0.0, 1.0);
  float fade = clamp((iResolution.x * fadeDistance - dist) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float base = clamp((0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) + (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)), 0.0, 1.0);
  return base * lengthFalloff * fade * spread;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
  vec2 dir = vec2(0.0, 1.0);
  float r1 = rayStrength(rayPos, dir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  float r2 = rayStrength(rayPos, dir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
  float a = r1 * 0.5 + r2 * 0.4;
  float brightness = 1.0 - (coord.y / iResolution.y);
  vec3 col = raysColor * a * (0.35 + brightness * 0.65);
  gl_FragColor = vec4(col, a * (0.35 + brightness * 0.65));
}
`;

/**
 * React Bits "Light Rays" (OGL), re-themed violet and low intensity: a soft volumetric glow from above.
 * One WebGL context: mount it only while its section is near the viewport, desktop only. It pauses when off
 * screen and releases its context on unmount.
 */
export default function LightRays({ className, color = [0.545, 0.36, 0.965], speed = 0.6, spread = 0.9, length = 1.4, fade = 1.1 }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    el.appendChild(gl.canvas);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      rayPos: { value: [0, 0] },
      raysColor: { value: color },
      raysSpeed: { value: speed },
      lightSpread: { value: spread },
      rayLength: { value: length },
      fadeDistance: { value: fade },
    };
    const program = new Program(gl, { vertex, fragment, uniforms, transparent: true });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
      const w = width * renderer.dpr;
      const h = height * renderer.dpr;
      uniforms.iResolution.value = [w, h];
      uniforms.rayPos.value = [w * 0.5, -h * 0.2];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(el);

    let frame = 0;
    const loop = (t) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      if (!gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
    // Parameters are fixed per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} aria-hidden="true" className={cn("pointer-events-none", className)} />;
}
