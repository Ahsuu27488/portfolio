"use client";

import { useEffect, useRef, useState } from "react";
import { FieldCanvas } from "@/components/field-canvas";
import { person } from "@/content/site";
import { wordLines } from "@/lib/field-math";

export const BUSINESS_EVENT = "ahsan:business";

/**
 * The hero's 3D swarm: a full-bleed canvas behind the hero text that writes
 * "Muhammad Ahsan" (or whatever the visitor types) into the hero's focus cell
 * (`[data-hero-focus]`). Without WebGL float textures the section gets
 * `data-field="off"` and shows the wordmark as text instead.
 */
export function HeroSwarm({ className = "" }: { className?: string }) {
  const [text, setText] = useState(person.wordmark);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: Event) => setText((e as CustomEvent<string>).detail.trim() || person.wordmark);
    window.addEventListener(BUSINESS_EVENT, on);
    return () => window.removeEventListener(BUSINESS_EVENT, on);
  }, []);
  return (
    <div ref={ref} className={className}>
      <FieldCanvas
        className="block size-full"
        shape={{ kind: "text", lines: wordLines(text) }}
        label={`${text}, written in particles`}
        focus="[data-hero-focus]"
        textScale={0.78}
        input="section"
        onReady={(ok) => {
          const section = ref.current?.closest("section");
          if (section) section.dataset.field = ok ? "on" : "off";
        }}
      />
    </div>
  );
}
