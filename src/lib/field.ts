// The hero's 3D particle field. Each particle is a spring pulled toward its
// target with damping, so the word overshoots and settles; the pointer pushes
// particles in 3D, a click sends a shockwave, and speed heats them from mint to
// orange to white. The simulation runs on the GPU (two ping-pong float textures:
// position, velocity); the main thread only moves the camera and sets uniforms.
// Imported lazily so three.js never blocks first paint.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  FloatType,
  HalfFloatType,
  NearestFilter,
  NormalBlending,
  PerspectiveCamera,
  Plane,
  Points,
  RGBAFormat,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { GPUComputationRenderer, type Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { fitFrame, pairLocal, shuffleTargets, type Frame, type Rect } from "./field-math";

const FOV = 35;

const velocityShader = /* glsl */ `
  uniform sampler2D tTarget;
  uniform float uTime;
  uniform float uDt;
  uniform float uSpring;
  uniform float uDamp;
  uniform vec3 uRayO;    // pointer ray, from the camera through the cursor
  uniform vec3 uRayD;
  uniform float uRayOn;
  uniform float uRadius;
  uniform float uPush;
  uniform vec4 uShock;   // xyz: centre, w: strength (one frame only)
  uniform float uHeatGain;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 p = texture2D(texturePosition, uv);
    vec4 v = texture2D(textureVelocity, uv);
    vec4 t = texture2D(tTarget, uv);
    float seed = p.w;

    // Breathing drift on the target, so a settled word still feels alive.
    vec3 goal = t.xyz + vec3(
      sin(uTime * 0.7 + seed * 6.2832),
      cos(uTime * 0.9 + seed * 8.17),
      sin(uTime * 0.5 + seed * 4.41)
    ) * t.w;

    vec3 vel = v.xyz + (goal - p.xyz) * uSpring * uDt;
    float heat = v.w;

    // Distance to the pointer ray (not to one point on a plane), so the cursor
    // reaches every letter even when the word is turned and its ends sit deeper.
    if (uRayOn > 0.5) {
      vec3 op = p.xyz - uRayO;
      vec3 d = op - uRayD * dot(op, uRayD);
      float dist = length(d);
      if (dist < uRadius) {
        float f = 1.0 - dist / uRadius;
        vel += normalize(d + vec3(1e-5)) * f * uPush * uDt;
        heat += f * 0.2 * uDt;
      }
    }

    if (uShock.w > 0.0) {
      vec3 s = p.xyz - uShock.xyz;
      float sd = length(s) + 0.001;
      vel += (s / sd) * uShock.w / (1.0 + sd * sd * 0.35) * (0.6 + fract(seed * 13.7));
      heat = max(heat, smoothstep(6.0, 0.0, sd));
    }

    vel *= pow(uDamp, uDt);
    float speed = length(vel);
    heat = max(heat * pow(0.95, uDt), min(1.0, speed * uHeatGain));
    gl_FragColor = vec4(vel, clamp(heat, 0.0, 1.0));
  }
`;

const positionShader = /* glsl */ `
  uniform float uDt;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 p = texture2D(texturePosition, uv);
    vec4 v = texture2D(textureVelocity, uv);
    p.xyz += v.xyz * uDt;
    gl_FragColor = p;
  }
`;

const pointsVertex = /* glsl */ `
  uniform sampler2D tPos;
  uniform sampler2D tVel;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uFogNear;
  uniform float uFogFar;
  attribute vec2 ref;
  attribute float aSize;
  varying float vHeat;
  varying float vFog;
  void main() {
    vec4 p = texture2D(tPos, ref);
    vHeat = texture2D(tVel, ref).w;
    vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0);
    float depth = -mv.z;
    vFog = 1.0 - smoothstep(uFogNear, uFogFar, depth);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * (1.0 + vHeat * 0.5) * uPixelRatio / depth;
  }
`;

const pointsFragment = /* glsl */ `
  uniform vec3 uCool;
  uniform vec3 uHot;
  uniform vec3 uWhite;
  uniform float uOpacity;
  varying float vHeat;
  varying float vFog;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float core = smoothstep(0.32, 0.05, r);
    float halo = smoothstep(0.5, 0.15, r) * 0.3;
    vec3 c = mix(uCool, uHot, smoothstep(0.08, 0.55, vHeat));
    c = mix(c, uWhite, smoothstep(0.7, 1.0, vHeat));
    gl_FragColor = vec4(c, (core + halo) * uOpacity * vFog);
    #include <colorspace_fragment>
  }
`;

const starsVertex = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aSize;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const starsFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, r) * uOpacity);
    #include <colorspace_fragment>
  }
`;

/** What the field draws: lines of text, or one of the product marks (by id). */
export type FieldShape = { kind: "text"; lines: string[] } | { kind: "mark"; id: string };

/** Samples `count` xyz points of a shape fitted into `boxW × boxH` world units. */
export type ShapeSampler = (shape: FieldShape, count: number, boxW: number, boxH: number) => Float32Array;

export type FieldOptions = {
  /** Side of the square simulation texture; particle count is its square. */
  size: number;
  cool: string;
  hot: string;
  white: string;
  star: string;
  reducedMotion: boolean;
  sample: ShapeSampler;
};

/** True when this browser can render the simulation's float textures. */
export function fieldSupport(renderer: WebGLRenderer): typeof FloatType | typeof HalfFloatType | null {
  if (renderer.capabilities.maxVertexTextures === 0) return null;
  if (renderer.extensions.has("EXT_color_buffer_float")) return FloatType;
  if (renderer.extensions.has("EXT_color_buffer_half_float")) return HalfFloatType;
  return null;
}

export class Field {
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 400);
  private gpu: GPUComputationRenderer;
  private posVar: Variable;
  private velVar: Variable;
  private target: DataTexture;
  private points: Points;
  private stars: Points;
  private material: ShaderMaterial;
  private starMaterial: ShaderMaterial;
  private count: number;
  private frame: Frame = { boxW: 10, boxH: 6, distance: 30, offsetX: 0, offsetY: 0 };
  private shape: FieldShape | null = null;
  private targets: Float32Array;
  private raf = 0;
  private running = false;
  private last = 0;
  private time = 0;
  private opacity = 0;
  // Camera orbit (radians, and distance as a multiple of the framed distance).
  private orbit = { theta: -0.7, phi: 0.32, zoom: 4.2 };
  private orbitGoal = { theta: 0, phi: 0, zoom: 1 };
  private intro = true;
  private dragging = false;
  private idleSince = 0;
  private pointerNdc = new Vector2();
  private pointerActive = false;
  private pointerWorld = new Vector3(9999, 9999, 9999);
  private raycaster = new Raycaster();
  private plane = new Plane(new Vector3(0, 0, 1), 0);
  private shock = 0;
  private shockAt = new Vector3();

  constructor(
    private renderer: WebGLRenderer,
    private canvas: HTMLCanvasElement,
    type: typeof FloatType | typeof HalfFloatType,
    private opts: FieldOptions,
  ) {
    const S = opts.size;
    this.count = S * S;
    renderer.setClearColor(0x000000, 0);

    this.gpu = new GPUComputationRenderer(S, S, renderer);
    this.gpu.setDataType(type);
    const pos0 = this.gpu.createTexture();
    const vel0 = this.gpu.createTexture();
    const p = pos0.image.data as Float32Array;
    const v = vel0.image.data as Float32Array;
    // Start as a wide, faint cloud far from the word; the camera flies in while it assembles.
    for (let i = 0; i < this.count; i++) {
      const t = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 18 + Math.random() * 26;
      p[i * 4] = r * Math.sin(ph) * Math.cos(t);
      p[i * 4 + 1] = r * Math.sin(ph) * Math.sin(t) * 0.6;
      p[i * 4 + 2] = r * Math.cos(ph);
      p[i * 4 + 3] = Math.random(); // seed
      v[i * 4 + 3] = 0.7; // start warm, cool down as the word settles
    }
    this.targets = new Float32Array(this.count * 3);

    this.target = new DataTexture(new Float32Array(this.count * 4), S, S, RGBAFormat, FloatType);
    this.target.minFilter = this.target.magFilter = NearestFilter;
    this.target.needsUpdate = true;

    this.velVar = this.gpu.addVariable("textureVelocity", velocityShader, vel0);
    this.posVar = this.gpu.addVariable("texturePosition", positionShader, pos0);
    this.gpu.setVariableDependencies(this.velVar, [this.posVar, this.velVar]);
    this.gpu.setVariableDependencies(this.posVar, [this.posVar, this.velVar]);
    Object.assign(this.velVar.material.uniforms, {
      tTarget: { value: this.target },
      uTime: { value: 0 },
      uDt: { value: 1 },
      uSpring: { value: 0.03 },
      uDamp: { value: 0.87 },
      uRayO: { value: this.raycaster.ray.origin },
      uRayD: { value: this.raycaster.ray.direction },
      uRayOn: { value: 0 },
      uRadius: { value: 1.2 },
      uPush: { value: 0.12 },
      uShock: { value: [0, 0, 0, 0] },
      uHeatGain: { value: 3 },
    });
    this.posVar.material.uniforms.uDt = { value: 1 };
    const err = this.gpu.init();
    if (err) throw new Error(err);

    // One vertex per particle; `ref` is its texel in the simulation textures.
    const ref = new Float32Array(this.count * 2);
    const sizes = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      ref[i * 2] = ((i % S) + 0.5) / S;
      ref[i * 2 + 1] = (Math.floor(i / S) + 0.5) / S;
      sizes[i] = 0.55 + Math.random() * 0.9;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(this.count * 3), 3));
    geo.setAttribute("ref", new BufferAttribute(ref, 2));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    this.material = new ShaderMaterial({
      vertexShader: pointsVertex,
      fragmentShader: pointsFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        tPos: { value: null },
        tVel: { value: null },
        uSize: { value: 40 },
        uPixelRatio: { value: 1 },
        uFogNear: { value: 20 },
        uFogFar: { value: 60 },
        uCool: { value: new Color(opts.cool) },
        uHot: { value: new Color(opts.hot) },
        uWhite: { value: new Color(opts.white) },
        uOpacity: { value: 0 },
      },
    });
    this.points = new Points(geo, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    // A sparse star shell far behind the word: it is what makes the orbit read as depth.
    const STARS = 900;
    const sp = new Float32Array(STARS * 3);
    const ss = new Float32Array(STARS);
    for (let i = 0; i < STARS; i++) {
      const t = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 70 + Math.random() * 90;
      sp[i * 3] = r * Math.sin(ph) * Math.cos(t);
      sp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t);
      sp[i * 3 + 2] = r * Math.cos(ph);
      ss[i] = 1 + Math.random() * 2.2;
    }
    const sg = new BufferGeometry();
    sg.setAttribute("position", new BufferAttribute(sp, 3));
    sg.setAttribute("aSize", new BufferAttribute(ss, 1));
    this.starMaterial = new ShaderMaterial({
      vertexShader: starsVertex,
      fragmentShader: starsFragment,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: { uPixelRatio: { value: 1 }, uColor: { value: new Color(opts.star) }, uOpacity: { value: 0 } },
    });
    this.stars = new Points(sg, this.starMaterial);
    this.stars.frustumCulled = false;
    this.scene.add(this.stars);

    if (opts.reducedMotion) {
      this.intro = false;
      this.orbit = { theta: 0, phi: 0, zoom: 1 };
      this.opacity = 1;
    }
    this.idleSince = performance.now();
  }

  get particles() {
    return this.count;
  }

  /** Re-frames the word into `focus` (canvas pixels) after a size change. */
  resize(focus: Rect) {
    const { clientWidth: cw, clientHeight: ch } = this.canvas;
    if (!cw || !ch || !focus.w || !focus.h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(cw, ch, false);
    this.camera.aspect = cw / ch;
    this.frame = fitFrame(cw, ch, focus, FOV);
    this.camera.setViewOffset(cw, ch, this.frame.offsetX, this.frame.offsetY, cw, ch);
    this.camera.updateProjectionMatrix();
    const d = this.frame.distance;
    this.material.uniforms.uPixelRatio.value = dpr;
    this.starMaterial.uniforms.uPixelRatio.value = dpr;
    // Dot size follows how big the word is on screen, so phones get finer dots.
    this.material.uniforms.uSize.value = d * Math.max(1.8, Math.min(3, focus.h / 130));
    this.material.uniforms.uFogNear.value = d * 1.05;
    this.material.uniforms.uFogFar.value = d * 3.2;
    const k = this.frame.boxH / 6;
    this.velVar.material.uniforms.uRadius.value = 0.75 * k;
    this.velVar.material.uniforms.uPush.value = 0.08 * k;
    if (this.shape) this.setShape(this.shape, true);
    else this.render();
  }

  /** Morphs to a new shape. `local` reflows in place (typing a letter); otherwise the swarm swirls. */
  setShape(shape: FieldShape, local = false) {
    this.shape = shape;
    const { boxW, boxH } = this.frame;
    const next = this.opts.sample(shape, this.count, boxW, boxH);
    const paired = local ? pairLocal(this.targets, next) : shuffleTargets(next);
    this.targets = paired;
    const data = this.target.image.data as Float32Array;
    const breathe = boxH * 0.006;
    for (let i = 0; i < this.count; i++) {
      data[i * 4] = paired[i * 3];
      data[i * 4 + 1] = paired[i * 3 + 1];
      data[i * 4 + 2] = paired[i * 3 + 2];
      data[i * 4 + 3] = breathe * (0.4 + ((i * 0.6180339) % 1));
    }
    this.target.needsUpdate = true;
    if (!local && !this.intro) {
      // A small kick outward so a new word visibly re-forms.
      this.shockAt.set(0, 0, 0);
      this.shock = 0.35 * (boxH / 6);
    }
    if (this.opts.reducedMotion) this.snap();
  }

  /** Reduced motion: put every particle on its target and draw one still frame. */
  private snap() {
    const S = this.opts.size;
    const tex = this.gpu.createTexture();
    const data = tex.image.data as Float32Array;
    const t = this.target.image.data as Float32Array;
    for (let i = 0; i < this.count; i++) {
      data[i * 4] = t[i * 4];
      data[i * 4 + 1] = t[i * 4 + 1];
      data[i * 4 + 2] = t[i * 4 + 2];
      data[i * 4 + 3] = (i % S) / S;
    }
    tex.needsUpdate = true;
    this.gpu.renderTexture(tex, this.posVar.renderTargets[0]);
    this.gpu.renderTexture(tex, this.posVar.renderTargets[1]);
    const zero = this.gpu.createTexture();
    this.gpu.renderTexture(zero, this.velVar.renderTargets[0]);
    this.gpu.renderTexture(zero, this.velVar.renderTargets[1]);
    tex.dispose();
    zero.dispose();
    this.render();
  }

  /** Pointer in canvas pixels, or null when it leaves. */
  pointer(x: number | null, y = 0) {
    if (x === null) {
      this.pointerActive = false;
      return;
    }
    const { clientWidth: cw, clientHeight: ch } = this.canvas;
    this.pointerNdc.set((x / cw) * 2 - 1, -(y / ch) * 2 + 1);
    this.pointerActive = true;
    this.idleSince = performance.now();
  }

  /** Drag-to-orbit, in pixels moved since the last call. */
  drag(dx: number, dy: number) {
    this.dragging = true;
    this.intro = false;
    this.orbitGoal.theta = Math.max(-0.95, Math.min(0.95, this.orbitGoal.theta + dx * 0.0035));
    this.orbitGoal.phi = Math.max(-0.5, Math.min(0.5, this.orbitGoal.phi + dy * 0.0025));
    this.idleSince = performance.now();
  }

  release() {
    this.dragging = false;
    this.idleSince = performance.now();
  }

  /** Shockwave from the point under the pointer. */
  blast() {
    if (this.opts.reducedMotion) return;
    this.updatePointerWorld();
    if (this.pointerWorld.x > 999) this.shockAt.set(0, 0, 0);
    else this.shockAt.copy(this.pointerWorld);
    this.shock = 1.2 * (this.frame.boxH / 6);
  }

  start() {
    if (this.opts.reducedMotion) {
      this.render();
      return;
    }
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private updatePointerWorld() {
    this.velVar.material.uniforms.uRayOn.value = this.pointerActive ? 1 : 0;
    if (!this.pointerActive) {
      this.pointerWorld.set(9999, 9999, 9999);
      return;
    }
    this.camera.getWorldDirection(this.plane.normal);
    this.plane.constant = 0;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    if (!this.raycaster.ray.intersectPlane(this.plane, this.pointerWorld)) this.pointerWorld.set(9999, 9999, 9999);
  }

  private tick = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min((now - this.last) / 16.667, 2.5); // in 60 fps ticks
    this.last = now;
    this.time += dt / 60;

    // Camera: fly-in, then a slow sway while idle; the pointer adds a little parallax.
    const o = this.orbit, g = this.orbitGoal;
    // After a drag the word springs back to face the reader, then sways while idle.
    if (!this.dragging) {
      const k = 1 - Math.pow(1 - (now - this.idleSince > 2500 ? 0.012 : 0.04), dt);
      g.theta += (Math.sin(this.time * 0.22) * 0.3 - g.theta) * k;
      g.phi += (Math.sin(this.time * 0.17) * 0.1 - g.phi) * k;
    }
    if (this.intro && Math.abs(o.zoom - g.zoom) < 0.02) this.intro = false;
    const ease = 1 - Math.pow(1 - (this.intro ? 0.03 : 0.08), dt);
    o.theta += (g.theta - o.theta) * ease;
    o.phi += (g.phi - o.phi) * ease;
    o.zoom += (g.zoom - o.zoom) * ease;
    this.placeCamera();

    this.opacity = Math.min(1, this.opacity + 0.02 * dt);
    this.material.uniforms.uOpacity.value = this.opacity * 0.85;
    this.starMaterial.uniforms.uOpacity.value = this.opacity * 0.5;
    this.stars.rotation.y += 0.00025 * dt;

    this.updatePointerWorld();
    const vu = this.velVar.material.uniforms;
    vu.uTime.value = this.time;
    vu.uDt.value = dt;
    this.posVar.material.uniforms.uDt.value = dt;
    vu.uShock.value = [this.shockAt.x, this.shockAt.y, this.shockAt.z, this.shock];
    this.shock = 0;
    this.gpu.compute();
    this.render();
  };

  private placeCamera() {
    const o = this.orbit;
    const px = this.pointerActive ? this.pointerNdc.x : 0;
    const py = this.pointerActive ? this.pointerNdc.y : 0;
    const theta = o.theta + px * 0.12;
    const phi = o.phi - py * 0.07;
    const r = this.frame.distance * o.zoom;
    this.camera.position.set(r * Math.cos(phi) * Math.sin(theta), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(theta));
    this.camera.lookAt(0, 0, 0);
  }

  private render() {
    this.material.uniforms.tPos.value = this.gpu.getCurrentRenderTarget(this.posVar).texture;
    this.material.uniforms.tVel.value = this.gpu.getCurrentRenderTarget(this.velVar).texture;
    if (!this.running) {
      this.placeCamera();
      this.material.uniforms.uOpacity.value = this.opacity * 0.85;
      this.starMaterial.uniforms.uOpacity.value = this.opacity * 0.5;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.gpu.dispose();
    this.target.dispose();
    this.points.geometry.dispose();
    this.stars.geometry.dispose();
    this.material.dispose();
    this.starMaterial.dispose();
  }
}
