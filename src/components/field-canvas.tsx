"use client";

import { useEffect, useRef } from "react";
import { fieldSize, type Rect } from "@/lib/field-math";
import type { Field, FieldShape } from "@/lib/field";

type Props = {
  shape: FieldShape;
  label: string;
  className?: string;
  /**
   * Where the shape is framed: a selector inside the closest `<section>` (the
   * hero's focus cell), or the canvas itself shrunk to `fill`.
   */
  focus?: string;
  fill?: number;
  /** Text size as a fraction of the framed box. */
  textScale?: number;
  /** Particle budget: the hero gets the full one, other scenes a smaller one. */
  budget?: "full" | "scene";
  /** Element that receives pointer input: the closest section, or the canvas's parent. */
  input?: "section" | "parent";
  /** Called once: true when the 3D field runs, false when this browser can't run it. */
  onReady?: (ok: boolean) => void;
};

const keyOf = (s: FieldShape) => (s.kind === "text" ? `t:${s.lines.join("\n")}` : `m:${s.id}`);

/**
 * Mounts one 3D particle field (`lib/field.ts`) on a canvas: lazy boot after
 * first paint, colours from the theme, visibility pause, resize, and pointer
 * input (hover pushes, drag turns, click scatters).
 */
export function FieldCanvas({
  shape,
  label,
  className = "",
  focus,
  fill = 1,
  textScale = 1,
  budget = "full",
  input = "parent",
  onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<Field | null>(null);
  const shapeRef = useRef(shape);
  const readyRef = useRef(onReady);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const host = (input === "section" ? canvas.closest("section") : canvas.parentElement)!;
    const focusEl = focus ? canvas.closest("section")?.querySelector<HTMLElement>(focus) : null;
    let disposed = false;
    let cleanup = () => {};

    const boot = async () => {
      const [{ Field, fieldSupport }, { sampleShape }, { WebGLRenderer }] = await Promise.all([
        import("@/lib/field"),
        import("@/lib/shapes"),
        import("three"),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof WebGLRenderer>;
      try {
        renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      } catch {
        return readyRef.current?.(false);
      }
      const type = fieldSupport(renderer);
      if (!type) {
        renderer.dispose();
        return readyRef.current?.(false);
      }

      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mona").trim() || "sans-serif";
      await document.fonts.load(`900 100px ${family}`).catch(() => undefined);
      if (disposed) return renderer.dispose();

      // Theme colours are OKLCH, which three.js can't parse: let the 2D canvas convert them.
      const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const css = getComputedStyle(host);
      const color = (name: string, fallback: string) => {
        swatch.fillStyle = fallback;
        swatch.fillStyle = css.getPropertyValue(name).trim() || fallback;
        swatch.fillRect(0, 0, 1, 1);
        const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
        return `rgb(${r}, ${g}, ${b})`;
      };
      const phone = window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;
      const full = fieldSize({ phone, cores: navigator.hardwareConcurrency || 0 });
      let field: Field;
      try {
        field = new Field(renderer, canvas, type, {
          size: budget === "full" ? full : Math.round(full * 0.8),
          cool: color("--color-mint", "#b6f7a4"),
          hot: color("--color-orange", "#ff7a3d"),
          white: "#fff6ea",
          star: color("--color-night-muted", "#b9bfbb"),
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          sample: (s, count, w, h) => sampleShape(s, count, w, h, family, textScale),
        });
      } catch {
        renderer.dispose();
        return readyRef.current?.(false);
      }
      fieldRef.current = field;
      readyRef.current?.(true);

      const focusRect = (): Rect => {
        const c = canvas.getBoundingClientRect();
        if (focusEl) {
          const f = focusEl.getBoundingClientRect();
          return { x: f.left - c.left, y: f.top - c.top, w: f.width, h: f.height };
        }
        return { x: (c.width * (1 - fill)) / 2, y: (c.height * (1 - fill)) / 2, w: c.width * fill, h: c.height * fill };
      };
      field.resize(focusRect());
      field.setShape(shapeRef.current);

      let visible = false;
      const sync = () => (visible && !document.hidden ? field.start() : field.stop());
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      io.observe(canvas);
      document.addEventListener("visibilitychange", sync);
      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => field.resize(focusRect()), 120);
      });
      ro.observe(host);

      // Pointer: hover pushes particles; drag turns the camera; a click without a drag scatters.
      const interactive = (t: EventTarget | null) => t instanceof Element && !!t.closest("a, button, input, label, video");
      let down: { x: number; y: number; moved: number; id: number } | null = null;
      const onMove = (e: PointerEvent) => {
        const c = canvas.getBoundingClientRect();
        field.pointer(e.clientX - c.left, e.clientY - c.top);
        if (down && down.id === e.pointerId) {
          const dx = e.clientX - down.x, dy = e.clientY - down.y;
          down.moved += Math.abs(dx) + Math.abs(dy);
          down.x = e.clientX;
          down.y = e.clientY;
          if (down.moved > 6) field.drag(dx, dy);
        }
      };
      const onDown = (e: PointerEvent) => {
        if (interactive(e.target) || e.button !== 0) return;
        down = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
        onMove(e);
      };
      const onUp = (e: PointerEvent) => {
        if (!down || down.id !== e.pointerId) return;
        if (down.moved <= 6) field.blast();
        down = null;
        field.release();
        if (e.pointerType !== "mouse") field.pointer(null);
      };
      const onCancel = () => {
        down = null;
        field.release();
        field.pointer(null);
      };
      const onLeave = () => field.pointer(null);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointercancel", onCancel);
      window.addEventListener("pointerup", onUp);

      cleanup = () => {
        io.disconnect();
        ro.disconnect();
        clearTimeout(resizeTimer);
        document.removeEventListener("visibilitychange", sync);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointercancel", onCancel);
        window.removeEventListener("pointerup", onUp);
        field.dispose();
        renderer.dispose();
        fieldRef.current = null;
      };
    };

    // Mount after first paint so the HTML text is always what paints first.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const handle = idle(() => void boot());
    return () => {
      disposed = true;
      if (window.cancelIdleCallback && typeof handle === "number") window.cancelIdleCallback(handle);
      cleanup();
    };
    // Mounted once; shape changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const key = keyOf(shape);
  useEffect(() => {
    const prev = shapeRef.current;
    shapeRef.current = shape;
    if (!fieldRef.current || keyOf(prev) === key) return;
    // Typing one letter at a time reflows in place; anything else swirls in.
    const a = prev.kind === "text" ? prev.lines.join(" ") : null;
    const b = shape.kind === "text" ? shape.lines.join(" ") : null;
    const local = a !== null && b !== null && (a.startsWith(b) || b.startsWith(a));
    fieldRef.current.setShape(shape, local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
