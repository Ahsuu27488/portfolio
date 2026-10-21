"use client";

import { useEffect, useRef, useState } from "react";
import { SwarmCanvas } from "@/components/swarm-canvas";
import type { Product } from "@/content/site";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Featured work: the swarm stays in view and rebuilds itself into the mark of
// whichever product is being read; the column beside it scrolls.
export function WorkScene({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phones: the stage is not pinned (it would cover the text scrolling under
    // it), so while it is on screen it cycles through the four marks itself.
    const phone = window.matchMedia("(max-width: 899px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting && phone.matches && !reduced) {
        timer = setInterval(() => setActive((a) => (a + 1) % products.length), 3200);
      }
    });
    io.observe(stage.current!);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [products.length]);

  useEffect(() => {
    if (window.matchMedia("(max-width: 899px)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    panels.current.forEach((p) => p && io.observe(p));
    return () => io.disconnect();
  }, []);

  const current = products[active];
  const shape = current.shape === "name" ? { kind: "text" as const, text: current.name } : { kind: "mark" as const, id: current.shape };

  return (
    <div className="work-grid">
      <div ref={stage} className="work-stage">
        <SwarmCanvas
          className="size-full"
          shape={shape}
          count={{ desktop: 11000, phone: 4500 }}
          cool="#a7ff9c"
          hot="#ff6a2e"
          fill={0.78}
          label={`The ${current.name} mark, drawn in particles`}
          fallback={null}
        />
        <p className="work-stage-name text-body text-night-muted" aria-hidden>
          {current.name}
        </p>
      </div>

      <div className="work-column">
        {products.map((p, i) => (
          <article
            key={p.id}
            ref={(el) => {
              panels.current[i] = el;
            }}
            data-index={i}
            data-reveal
            className="work-panel"
          >
            <h3 className="text-head" style={{ "--i": 0 } as React.CSSProperties}>
              {p.name}
            </h3>
            <p className="text-lead mt-6 max-w-[34ch]" style={{ "--i": 1 } as React.CSSProperties}>
              {p.what}
            </p>
            <ul className="mt-6 max-w-[52ch] space-y-2 text-body text-night-muted" style={{ "--i": 2 } as React.CSSProperties}>
              {p.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="mt-8" style={{ "--i": 3 } as React.CSSProperties}>
              <Media media={p.media} />
            </div>
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-body" style={{ "--i": 4 } as React.CSSProperties}>
              {p.links.map((l) => (
                <a key={l.href} href={l.href} className="link" target="_blank" rel="noopener noreferrer">
                  {l.label}
                  <span className="sr-only"> for {p.name} (opens in a new tab)</span>
                </a>
              ))}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Media({ media }: { media: Product["media"] }) {
  if (media.kind === "image") {
    /* eslint-disable @next/next/no-img-element */
    return (
      <div className="grid gap-3">
        <img src={media.src} alt={media.alt} width={media.width} height={media.height} loading="lazy" className="w-full" />
        {media.second && (
          <img
            src={media.second.src}
            alt={media.second.alt}
            width={media.width}
            height={media.height}
            loading="lazy"
            className="media-second w-3/4 justify-self-end"
          />
        )}
      </div>
    );
    /* eslint-enable @next/next/no-img-element */
  }
  if (media.kind === "video") {
    return (
      <figure>
        <LazyVideo media={media} />
        <figcaption className="mt-2 text-small text-night-muted">{media.credit}</figcaption>
      </figure>
    );
  }
  return (
    <figure>
      <pre className="code-block">
        <code>{media.lines.join("\n")}</code>
      </pre>
      <figcaption className="mt-2 text-small text-night-muted">{media.caption}</figcaption>
    </figure>
  );
}

// Loads only when near the viewport; plays muted on loop unless the visitor
// prefers reduced motion, in which case it waits for the controls.
function LazyVideo({ media }: { media: Extract<Product["media"], { kind: "video" }> }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string>();
  const reduced = useReducedMotion();
  useEffect(() => {
    const video = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSrc(media.src);
          if (!reduced && video.currentSrc) void video.play().catch(() => {});
        } else video.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [media.src, reduced]);
  useEffect(() => {
    if (src && !reduced) void ref.current?.play().catch(() => {});
  }, [src, reduced]);
  return (
    <video
      ref={ref}
      src={src}
      poster={media.poster}
      width={media.width}
      height={media.height}
      muted
      loop
      playsInline
      controls={reduced}
      preload="none"
      aria-label={media.alt}
      className="w-full"
    />
  );
}
