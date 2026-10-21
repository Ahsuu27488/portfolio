import { describe, expect, it } from "vitest";
import { fieldSize, fitFrame, pairLocal, shuffleTargets, wordLines, zOrder } from "./field-math";

describe("fitFrame", () => {
  it("makes the focus rect show boxH world units and centres the origin on it", () => {
    const fov = 35;
    const focus = { x: 40, y: 300, w: 900, h: 400 };
    const f = fitFrame(1440, 900, focus, fov, 6);
    // Visible height at z = 0 from this distance, in world units.
    const visibleH = 2 * f.distance * Math.tan((fov * Math.PI) / 360);
    expect((visibleH / 900) * focus.h).toBeCloseTo(6, 6);
    expect(f.boxW / f.boxH).toBeCloseTo(focus.w / focus.h, 6);
    expect(f.offsetX).toBe(720 - (40 + 450));
    expect(f.offsetY).toBe(450 - (300 + 200));
  });

  it("keeps the word inside a narrow phone focus rect", () => {
    const f = fitFrame(390, 844, { x: 16, y: 260, w: 358, h: 300 }, 35);
    expect(f.boxW).toBeCloseTo((358 / 300) * 6, 6);
  });
});

describe("zOrder and pairLocal", () => {
  it("returns every index once", () => {
    const pts = new Float32Array([3, 0, 0, 0, 0, 0, 1, 1, 0, 2, 2, 2]);
    expect([...zOrder(pts)].sort()).toEqual([0, 1, 2, 3]);
  });

  it("gives each particle a target near its old one when the shape barely moves", () => {
    const n = 400;
    const prev = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) prev.set([Math.random() * 10, Math.random() * 4, 0], i * 3);
    // The same points, shifted a little and listed in reverse order.
    const next = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) next.set([prev[(n - 1 - i) * 3] + 0.05, prev[(n - 1 - i) * 3 + 1], 0], i * 3);
    const out = pairLocal(prev, next);
    let travel = 0;
    for (let i = 0; i < n; i++) travel += Math.hypot(out[i * 3] - prev[i * 3], out[i * 3 + 1] - prev[i * 3 + 1]);
    // Random pairing would travel ~4 units each; local pairing stays close.
    expect(travel / n).toBeLessThan(1);
  });

  it("shuffle keeps the same set of points", () => {
    const pts = new Float32Array([0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
    const out = shuffleTargets(pts, () => 0.3);
    const key = (a: Float32Array) => [0, 1, 2, 3].map((i) => a[i * 3]).sort().join();
    expect(key(out)).toBe(key(pts));
  });
});

describe("fieldSize", () => {
  it("scales the particle budget by device", () => {
    expect(fieldSize({ phone: true, cores: 8 })).toBe(72);
    expect(fieldSize({ phone: false, cores: 4 })).toBe(96);
    expect(fieldSize({ phone: false, cores: 12 })).toBe(128);
    expect(fieldSize({ phone: false, cores: 0 })).toBe(128);
  });
});

describe("wordLines", () => {
  it("writes the full name on two lines", () => {
    expect(wordLines("Muhammad Ahsan")).toEqual(["Muhammad", "Ahsan"]);
  });
  it("keeps short words on one line and balances longer names", () => {
    expect(wordLines("hire me")).toEqual(["hire me"]);
    expect(wordLines("Bright Smile Dental Care")).toEqual(["Bright Smile", "Dental Care"]);
    expect(wordLines("   ")).toEqual([" "]);
  });
});
