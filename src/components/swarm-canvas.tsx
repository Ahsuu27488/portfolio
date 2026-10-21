"use client";

import { useEffect, useRef, useState } from "react";
import type { Swarm } from "@/lib/swarm";
import type { Draw, Shape } from "@/lib/shapes";
import type { ShapeId } from "@/content/site";

export type ShapeRef = { kind: "text"; text: string } | { kind: "mark"; id: Exclude<ShapeId, "name"> };

type Props = {
  shape: ShapeRef;
  count: { desktop: number; phone: number };
  cool: string;
  hot: string;
  fill?: number;
  label: string;
  /** Shown instead of the canvas when WebGL is unavailable. */
  fallback: React.ReactNode;
  className?: string;
};

export function SwarmCanvas({ shape, count, cool, hot, fill, label, fallback, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const swarmRef = useRef<Swarm | null>(null);
  const shapeRef = useRef(shape);
  const marksRef = useRef<Record<string, Draw> | null>(null);
  const toShape = (s: ShapeRef): Shape =>
    s.kind === "text" ? { kind: "text", text: s.text } : { kind: "mark", draw: marksRef.current![s.id] };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let disposed = false;
    let visible = false;
    let cleanup = () => {};

    const boot = async () => {
      const [{ Swarm, webglAvailable }, { marks }] = await Promise.all([import("@/lib/swarm"), import("@/lib/shapes")]);
      if (disposed) return;
      if (!webglAvailable()) return setFailed(true);
      await document.fonts.ready;
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const phone = window.matchMedia("(max-width: 640px)").matches;
      const swarm = new Swarm(canvas, {
        count: phone ? count.phone : count.desktop,
        font: getComputedStyle(document.body).fontFamily,
        cool,
        hot,
        fill,
        reducedMotion: reduced,
      });
      marksRef.current = marks;
      swarmRef.current = swarm;
      swarm.setShape(toShape(shapeRef.current));

      const sync = () => (visible && !document.hidden ? swarm.start() : swarm.stop());
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      io.observe(canvas);
      const ro = new ResizeObserver(() => swarm.resize());
      ro.observe(canvas);
      document.addEventListener("visibilitychange", sync);

      const move = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        swarm.pointer(e.clientX - r.left, e.clientY - r.top);
      };
      const leave = () => swarm.pointer(null);
      const host = canvas.parentElement!;
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerdown", move);
      host.addEventListener("pointerleave", leave);
      host.addEventListener("pointerup", (e) => e.pointerType !== "mouse" && leave());

      cleanup = () => {
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", sync);
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerdown", move);
        host.removeEventListener("pointerleave", leave);
        swarm.dispose();
        swarmRef.current = null;
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

  const key = shape.kind === "text" ? `t:${shape.text}` : `m:${shape.id}`;
  useEffect(() => {
    shapeRef.current = shape;
    swarmRef.current?.setShape(toShape(shape));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (failed) return <div className={className}>{fallback}</div>;
  return (
    <div className={`${className} touch-pan-y`}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="block size-full" />
    </div>
  );
}
