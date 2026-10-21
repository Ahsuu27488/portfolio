"use client";

import { useEffect, useState } from "react";
import { SwarmCanvas } from "@/components/swarm-canvas";
import { person } from "@/content/site";

export const BUSINESS_EVENT = "ahsan:business";

// The hero swarm writes "Ahsan" — or the business a visitor typed further down.
export function HeroSwarm({ className }: { className?: string }) {
  const [text, setText] = useState(person.wordmark);
  useEffect(() => {
    const on = (e: Event) => setText((e as CustomEvent<string>).detail.trim() || person.wordmark);
    window.addEventListener(BUSINESS_EVENT, on);
    return () => window.removeEventListener(BUSINESS_EVENT, on);
  }, []);
  return (
    <SwarmCanvas
      className={className}
      shape={{ kind: "text", text }}
      count={{ desktop: 16000, phone: 6000 }}
      cool="#a7ff9c"
      hot="#ff6a2e"
      fill={0.96}
      label={`${text}, written in particles`}
      fallback={<p className="text-display text-mint">{text}</p>}
    />
  );
}
