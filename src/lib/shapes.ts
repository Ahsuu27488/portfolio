// Target shapes for the particle swarm. Each shape is drawn with the 2D canvas
// API into a square 512×512 design box (or as text), then sampled into points.
// The marks are redrawn from each product's real logo, not invented.

export type Draw = (ctx: CanvasRenderingContext2D) => void;

const ROUND = { lineCap: "round", lineJoin: "round" } as const;

export const marks: Record<"taskvane" | "chronos" | "foreman" | "editRecreator", Draw> = {
  // Taskvane: the heartbeat/pulse line from its app icon.
  taskvane(ctx) {
    Object.assign(ctx, ROUND);
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.moveTo(40, 268);
    ctx.lineTo(168, 268);
    ctx.lineTo(214, 120);
    ctx.lineTo(286, 404);
    ctx.lineTo(338, 216);
    ctx.lineTo(372, 268);
    ctx.lineTo(472, 268);
    ctx.stroke();
  },
  // Chronos: a clock face with its hands and an orbit, like its icon.
  chronos(ctx) {
    Object.assign(ctx, ROUND);
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(256, 256, 168, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256, 140);
    ctx.moveTo(256, 256);
    ctx.lineTo(338, 304);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(256, 256, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(256, 256, 236, 92, -0.42, 0, Math.PI * 2);
    ctx.stroke();
  },
  // Foreman: the hard hat leading a crew of three (from its logo.svg).
  foreman(ctx) {
    Object.assign(ctx, ROUND);
    ctx.beginPath();
    ctx.moveTo(146, 282);
    ctx.bezierCurveTo(146, 186, 196, 128, 256, 128);
    ctx.bezierCurveTo(316, 128, 366, 186, 366, 282);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(104, 274, 304, 44);
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(256, 322);
    ctx.lineTo(256, 386);
    ctx.moveTo(256, 322);
    ctx.bezierCurveTo(256, 360, 166, 352, 166, 386);
    ctx.moveTo(256, 322);
    ctx.bezierCurveTo(256, 360, 346, 352, 346, 386);
    ctx.stroke();
    for (const x of [166, 256, 346]) {
      ctx.beginPath();
      ctx.arc(x, 410, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // edit-recreator: two film frames, "=" between them, a timeline below.
  editRecreator(ctx) {
    Object.assign(ctx, ROUND);
    const frame = (x: number) => {
      ctx.lineWidth = 18;
      ctx.strokeRect(x, 150, 150, 190);
      ctx.beginPath();
      ctx.moveTo(x + 56, 200);
      ctx.lineTo(x + 56, 290);
      ctx.lineTo(x + 112, 245);
      ctx.closePath();
      ctx.fill();
    };
    frame(36);
    frame(326);
    ctx.fillRect(220, 214, 72, 18);
    ctx.fillRect(220, 258, 72, 18);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(40, 412);
    ctx.lineTo(472, 412);
    for (let x = 40; x <= 472; x += 36) {
      ctx.moveTo(x, 412);
      ctx.lineTo(x, x % 108 === 40 ? 382 : 396);
    }
    ctx.stroke();
  },
};

export type Shape = { kind: "mark"; draw: Draw } | { kind: "text"; text: string };

/**
 * Sampler for the 3D field: text goes through `sampleLines` (at `textScale` of
 * the box), marks through `samplePoints` with a thickness added in z.
 */
export function sampleShape(
  shape: { kind: "text"; lines: string[] } | { kind: "mark"; id: string },
  count: number,
  boxW: number,
  boxH: number,
  family: string,
  textScale = 1,
): Float32Array {
  if (shape.kind === "text") return sampleLines(shape.lines, count, boxW, boxH, family, textScale);
  const draw = marks[shape.id as keyof typeof marks];
  const out = samplePoints({ kind: "mark", draw }, count, boxW, boxH, family);
  const depth = Math.min(boxW, boxH) * 0.07;
  for (let i = 2; i < out.length; i += 3) out[i] = (Math.random() - 0.5) * depth;
  return out;
}

/**
 * Samples `count` points from lines of display text (heavy, expanded) fitted
 * into `boxW × boxH` world units around the origin. Letters get a thickness in
 * z so the word has a body when the camera turns. Returns xyz triples.
 */
export function sampleLines(
  lines: string[],
  count: number,
  boxW: number,
  boxH: number,
  family: string,
  scale = 1,
): Float32Array {
  const w = 1024;
  const h = Math.max(64, Math.round((w * boxH) / boxW));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lead = 0.96;
  // Setting `font` resets `fontStretch`, so set both every time.
  const setSize = (s: number) => {
    ctx.font = `900 ${s}px ${family}`;
    ctx.fontStretch = "semi-expanded";
  };
  let size = (h * 0.92 * scale) / (lines.length * lead);
  setSize(size);
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width), 1);
  size = Math.min(size, (size * w * 0.9 * scale) / widest);
  setSize(size);
  const top = h / 2 - ((lines.length - 1) * size * lead) / 2;
  lines.forEach((l, i) => ctx.fillText(l, w / 2, top + i * size * lead + size * 0.04));

  const data = ctx.getImageData(0, 0, w, h).data;
  const hits: number[] = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > 128) hits.push(x, y);
    }
  }

  const out = new Float32Array(count * 3);
  const n = hits.length / 2;
  const depth = (size / h) * boxH * 0.1; // letter thickness, relative to letter height
  for (let i = 0; i < count; i++) {
    if (n === 0) {
      out.set([(Math.random() - 0.5) * boxW, (Math.random() - 0.5) * boxH, 0], i * 3);
      continue;
    }
    const j = Math.floor(Math.random() * n) * 2;
    out[i * 3] = ((hits[j] + Math.random()) / w - 0.5) * boxW;
    out[i * 3 + 1] = -((hits[j + 1] + Math.random()) / h - 0.5) * boxH;
    out[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return out;
}

/**
 * Samples `count` points from a shape fitted ("contain") into a box of
 * `boxW × boxH` world units, centred on the origin. Returns xyz triples.
 * `font` is the CSS font family used for text shapes.
 */
export function samplePoints(shape: Shape, count: number, boxW: number, boxH: number, font: string): Float32Array {
  const res = 640; // sampling raster width; height follows the box aspect
  const w = res;
  const h = Math.max(32, Math.round((res * boxH) / boxW));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";

  if (shape.kind === "text") {
    const text = shape.text.trim() || " ";
    let size = h * 0.8;
    ctx.font = `500 ${size}px ${font}`;
    const measured = ctx.measureText(text).width;
    size = Math.min(size, (size * w * 0.94) / Math.max(1, measured));
    ctx.font = `500 ${size}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + size * 0.04);
  } else {
    const scale = Math.min(w, h) / 512;
    ctx.translate((w - 512 * scale) / 2, (h - 512 * scale) / 2);
    ctx.scale(scale, scale);
    shape.draw(ctx);
  }

  const data = ctx.getImageData(0, 0, w, h).data;
  const hits: number[] = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > 128) hits.push(x, y);
    }
  }

  const out = new Float32Array(count * 3);
  const n = hits.length / 2;
  for (let i = 0; i < count; i++) {
    if (n === 0) {
      out.set([(Math.random() - 0.5) * boxW, (Math.random() - 0.5) * boxH, 0], i * 3);
      continue;
    }
    const j = Math.floor(Math.random() * n) * 2;
    const px = hits[j] + Math.random();
    const py = hits[j + 1] + Math.random();
    out[i * 3] = (px / w - 0.5) * boxW;
    out[i * 3 + 1] = -(py / h - 0.5) * boxH;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
  }
  return out;
}
