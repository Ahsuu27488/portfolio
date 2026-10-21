// One GPU particle swarm. All per-frame motion (morph, drift, pointer
// repulsion, heat colour) happens in the vertex shader; the main thread only
// updates a few uniforms. Imported lazily so three.js never blocks first paint.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { samplePoints, type Shape } from "./shapes";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uRadius;
  uniform vec2 uPointer;
  attribute vec3 aTo;
  attribute vec4 aRand; // x: delay, y: size, z: base heat, w: phase
  varying float vHeat;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float delay = aRand.x * 0.4;
    float t = easeInOut(clamp((uProgress - delay) / 0.6, 0.0, 1.0));
    vec3 p = mix(position, aTo, t);

    // While travelling, particles swirl off the straight line.
    float travel = sin(t * 3.14159);
    float a = aRand.w * 6.2832;
    p.xy += travel * vec2(sin(a + uTime * 0.9), cos(a * 1.7 + uTime * 1.1)) * 0.22 * (0.4 + aRand.y);
    p.z += travel * sin(a * 2.3) * 0.35;

    // Idle breathing.
    p += vec3(sin(uTime * 0.8 + a * 3.0), cos(uTime * 0.7 + a * 2.0), sin(uTime * 0.5 + a)) * 0.006;

    // Pointer pushes particles away and heats them (Taskvane's temperatures).
    vec2 diff = p.xy - uPointer;
    float dist = length(diff);
    float force = uRadius > 0.0 ? smoothstep(uRadius, 0.0, dist) : 0.0;
    p.xy += normalize(diff + vec2(1e-5)) * force * uRadius * 0.55;
    p.z += force * 0.25;

    vHeat = clamp(force * 1.5 + aRand.z, 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.y * 0.9) * uPixelRatio / -mv.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uCool;
  uniform vec3 uHot;
  uniform float uOpacity;
  varying float vHeat;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float alpha = smoothstep(0.5, 0.1, r) * uOpacity;
    gl_FragColor = vec4(mix(uCool, uHot, vHeat), alpha);
  }
`;

export type SwarmOptions = {
  count: number;
  font: string;
  cool: string;
  hot: string;
  /** Fraction of the canvas the shape may fill. */
  fill?: number;
  additive?: boolean;
  reducedMotion?: boolean;
};

const FOV = 35;
const DIST = 6;

export class Swarm {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  private geometry = new BufferGeometry();
  private material: ShaderMaterial;
  private points: Points;
  private shape: Shape | null = null;
  private boxW = 1;
  private boxH = 1;
  private progress = 1;
  private raf = 0;
  private running = false;
  private last = 0;
  private time = 0;
  private radiusTarget = 0;
  private tiltTarget = new Vector3();
  private resizeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: SwarmOptions,
  ) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0, DIST);

    const n = opts.count;
    const rand = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      rand.set([Math.random(), Math.random(), Math.random() < 0.12 ? 0.55 : Math.random() * 0.12, Math.random()], i * 4);
    }
    const start = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i += 3) {
      start[i] = (Math.random() - 0.5) * 8;
      start[i + 1] = (Math.random() - 0.5) * 5;
      start[i + 2] = (Math.random() - 0.5) * 3;
    }
    this.geometry.setAttribute("position", new BufferAttribute(start, 3));
    this.geometry.setAttribute("aTo", new BufferAttribute(start.slice(), 3));
    this.geometry.setAttribute("aRand", new BufferAttribute(rand, 4));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: opts.additive === false ? NormalBlending : AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 1 },
        uSize: { value: 22 },
        uPixelRatio: { value: 1 },
        uRadius: { value: 0 },
        uPointer: { value: [0, 0] },
        uCool: { value: new Color(opts.cool) },
        uHot: { value: new Color(opts.hot) },
        uOpacity: { value: 0.9 },
      },
    });
    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
    this.resize();
  }

  /** World-space size of the visible plane at z = 0. */
  private planeSize() {
    const h = 2 * DIST * Math.tan((FOV * Math.PI) / 360);
    return { w: h * this.camera.aspect, h };
  }

  resize() {
    const { clientWidth: cw, clientHeight: ch } = this.canvas;
    if (!cw || !ch) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(cw, ch, false);
    this.camera.aspect = cw / ch;
    this.camera.updateProjectionMatrix();
    const plane = this.planeSize();
    const fill = this.opts.fill ?? 0.9;
    this.boxW = plane.w * fill;
    this.boxH = plane.h * fill;
    // Particle size follows the canvas, so phones get proportionally smaller dots.
    this.material.uniforms.uSize.value = Math.max(9, Math.min(26, ch / 18));
    this.material.uniforms.uPixelRatio.value = dpr;
    if (this.shape) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.setShape(this.shape!, true), 120);
    }
    if (!this.running) this.render();
  }

  /** Morph to a new shape. `instant` skips the travel (resize, reduced motion). */
  setShape(shape: Shape, instant = false) {
    this.shape = shape;
    const pos = this.geometry.getAttribute("position") as BufferAttribute;
    const to = this.geometry.getAttribute("aTo") as BufferAttribute;
    const rand = this.geometry.getAttribute("aRand") as BufferAttribute;
    // Freeze where each particle is now, so a morph can start mid-morph.
    const p = this.progress;
    for (let i = 0; i < pos.count; i++) {
      const tt = Math.min(1, Math.max(0, (p - rand.getX(i) * 0.4) / 0.6));
      const e = tt < 0.5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2;
      pos.setXYZ(
        i,
        pos.getX(i) + (to.getX(i) - pos.getX(i)) * e,
        pos.getY(i) + (to.getY(i) - pos.getY(i)) * e,
        pos.getZ(i) + (to.getZ(i) - pos.getZ(i)) * e,
      );
    }
    to.array.set(samplePoints(shape, pos.count, this.boxW, this.boxH, this.opts.font));
    pos.needsUpdate = true;
    to.needsUpdate = true;
    this.progress = instant || this.opts.reducedMotion ? 1 : 0;
    this.material.uniforms.uProgress.value = this.progress;
    if (!this.running) this.render();
  }

  /** Pointer in canvas pixels, or null when it leaves. */
  pointer(x: number | null, y = 0) {
    if (x === null) {
      this.radiusTarget = 0;
      this.tiltTarget.set(0, 0, 0);
      return;
    }
    const { clientWidth: cw, clientHeight: ch } = this.canvas;
    const plane = this.planeSize();
    const nx = x / cw - 0.5;
    const ny = y / ch - 0.5;
    this.material.uniforms.uPointer.value = [nx * plane.w, -ny * plane.h];
    this.radiusTarget = Math.min(plane.w, plane.h) * 0.16;
    this.tiltTarget.set(ny * 0.25, nx * 0.35, 0);
  }

  start() {
    if (this.running || this.opts.reducedMotion) {
      this.render();
      return;
    }
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const real = (now - this.last) / 1000;
      const dt = Math.min(0.05, real);
      this.last = now;
      this.time += dt;
      // Morph timing follows the wall clock, so slow devices still finish on time.
      if (this.progress < 1) this.progress = Math.min(1, this.progress + Math.min(real, 0.25) / 1.3);
      const u = this.material.uniforms;
      u.uTime.value = this.time;
      u.uProgress.value = this.progress;
      u.uRadius.value += (this.radiusTarget - u.uRadius.value) * Math.min(1, dt * 6);
      this.points.rotation.x += (this.tiltTarget.x - this.points.rotation.x) * Math.min(1, dt * 3);
      this.points.rotation.y += (this.tiltTarget.y - this.points.rotation.y) * Math.min(1, dt * 3);
      this.render();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    clearTimeout(this.resizeTimer);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
