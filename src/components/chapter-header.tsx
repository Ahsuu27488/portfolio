"use client";

import { useEffect, useState } from "react";

// The fixed header takes the ink of the chapter beneath it (DESIGN.md: colour by chapter).
export function ChapterHeader({ wordmark, action, href }: { wordmark: string; action: string; href: string }) {
  const [tone, setTone] = useState("night");
  useEffect(() => {
    const chapters = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setTone(e.target.getAttribute("data-chapter") ?? "night");
      },
      { rootMargin: "-28px 0px -96% 0px" },
    );
    chapters.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);
  return (
    <header data-tone={tone} className="chapter-header fixed inset-x-0 top-0 z-30">
      <div className="frame flex h-16 items-center justify-between">
        <a href="#top" className="wordmark text-[17px]">
          {wordmark}
        </a>
        <a href={href} className="btn btn-sm">
          {action}
        </a>
      </div>
    </header>
  );
}
