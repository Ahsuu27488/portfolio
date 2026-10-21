"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS_EVENT } from "@/components/hero-swarm";

const MAX = 18;

// A real input, so typing works on phones too. On desktop, typing anywhere while
// the hero is on screen goes into it. Escape (or clearing it) gives the name back.
export function HeroType({ label, placeholder }: { label: string; placeholder: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  const send = (v: string) => window.dispatchEvent(new CustomEvent(BUSINESS_EVENT, { detail: v }));
  const update = (v: string) => {
    const next = v.slice(0, MAX);
    setValue(next);
    send(next);
  };

  useEffect(() => {
    const input = inputRef.current!;
    const section = input.closest("section")!;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
    io.observe(section);
    const onKey = (e: KeyboardEvent) => {
      if (!visible || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const t = e.target as HTMLElement | null;
      if (t && t !== document.body && t.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      input.focus({ preventScroll: true });
      update(input.value + e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <label className="hero-type">
      <span className="sr-only">{label}</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        maxLength={MAX}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") update("");
          if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
        }}
      />
    </label>
  );
}
