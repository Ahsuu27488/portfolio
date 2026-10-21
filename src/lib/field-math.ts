// Pure maths for the hero field (no DOM, no WebGL), so it can be unit-tested.

export type Rect = { x: number; y: number; w: number; h: number };

export type Frame = {
  /** World units the word may fill at z = 0. */
  boxW: number;
  boxH: number;
  /** Camera distance from the origin that makes `boxH` world units span the focus rect. */
  distance: number;
  /** `camera.setViewOffset` shift that puts the origin at the focus rect's centre. */
  offsetX: number;
  offsetY: number;
};

/**
 * Frames the word: the focus rect (canvas pixels) shows a box `boxH` world units
 * tall at z = 0, and the origin projects onto the rect's centre.
 */
export function fitFrame(canvasW: number, canvasH: number, focus: Rect, fovDeg: number, boxH = 6): Frame {
  const ppu = focus.h / boxH; // pixels per world unit at z = 0
  const visibleH = canvasH / ppu;
  const distance = visibleH / (2 * Math.tan((fovDeg * Math.PI) / 360));
  return {
    boxW: focus.w / ppu,
    boxH,
    distance,
    offsetX: canvasW / 2 - (focus.x + focus.w / 2),
    offsetY: canvasH / 2 - (focus.y + focus.h / 2),
  };
}

/** Interleaves the bits of three 10-bit integers into a Morton (Z-order) code. */
function morton(x: number, y: number, z: number) {
  const spread = (v: number) => {
    v &= 0x3ff;
    v = (v | (v << 16)) & 0x030000ff;
    v = (v | (v << 8)) & 0x0300f00f;
    v = (v | (v << 4)) & 0x030c30c3;
    v = (v | (v << 2)) & 0x09249249;
    return v;
  };
  return spread(x) | (spread(y) << 1) | (spread(z) << 2);
}

/** Particle indices of an xyz array, sorted along a Z-order curve (near points stay near). */
export function zOrder(points: Float32Array): Uint32Array {
  const n = points.length / 3;
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = points[i * 3], y = points[i * 3 + 1], z = points[i * 3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const q = (v: number, lo: number, hi: number) => Math.floor(((v - lo) / (hi - lo || 1)) * 1023);
  const codes = new Uint32Array(n);
  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    codes[i] = morton(q(points[i * 3], minX, maxX), q(points[i * 3 + 1], minY, maxY), q(points[i * 3 + 2], minZ, maxZ));
    order[i] = i;
  }
  return order.sort((a, b) => codes[a] - codes[b]);
}

/**
 * Reorders `next` so particle i gets a target near its old target `prev[i]`.
 * Used for small edits (typing a letter): the word reflows in place instead of
 * every particle crossing the screen.
 */
export function pairLocal(prev: Float32Array, next: Float32Array): Float32Array {
  const from = zOrder(prev);
  const to = zOrder(next);
  const out = new Float32Array(next.length);
  for (let k = 0; k < from.length; k++) {
    const i = from[k] * 3, j = to[k] * 3;
    out[i] = next[j];
    out[i + 1] = next[j + 1];
    out[i + 2] = next[j + 2];
  }
  return out;
}

/** Shuffles target slots (Fisher-Yates) so a big morph swirls instead of sliding. */
export function shuffleTargets(next: Float32Array, random = Math.random): Float32Array {
  const n = next.length / 3;
  const out = next.slice();
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    for (let c = 0; c < 3; c++) {
      const t = out[i * 3 + c];
      out[i * 3 + c] = out[j * 3 + c];
      out[j * 3 + c] = t;
    }
  }
  return out;
}

/** Side of the square simulation texture: particle count is its square. */
export function fieldSize(opts: { phone: boolean; cores: number }) {
  if (opts.phone) return 72;
  return opts.cores > 0 && opts.cores <= 4 ? 96 : 128;
}

/** Splits the wordmark into the lines the swarm writes ("Muhammad Ahsan" → two lines). */
export function wordLines(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [" "];
  const words = clean.split(" ");
  if (words.length < 2 || clean.length <= 10) return [clean];
  // Break into two lines as evenly as the words allow.
  let best = [clean];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = [a, b];
    }
  }
  return best;
}
