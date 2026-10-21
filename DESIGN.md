# Design

Direction: **Type and nothing else** (taste-skill, seed 2101421277), with the
owner's binding addition: a GPU particle swarm that writes words and rebuilds
itself into the marks of his four products. Full reasoning:
`.taste-skill/notes.md`. Rules: `../../docs/design/workflow-brief.md`.

## Idea

The marks of Ahsan's shipped products (Taskvane's pulse, Chronos's clock,
Foreman's hard hat and crew, edit-recreator's twin frames) become one particle
swarm that rebuilds itself into each product as you read about it. Particles
warm from mint to orange near the pointer — Taskvane's temperature status.

## Tokens (all colour in OKLCH; no pure black or white)

| Token | Value | Role |
|---|---|---|
| `--ground` | `oklch(0.985 0.004 145)` | paper chapters |
| `--ink` | `oklch(0.19 0.012 150)` | all text on light fields |
| `--muted` | `oklch(0.40 0.012 150)` | secondary text (AA on ground and grey) |
| `--grey` | `oklch(0.86 0.005 150)` | grey chapter |
| `--mint` | `oklch(0.93 0.16 143)` | accent: buttons, live chapter, cool particles |
| `--orange` | `oklch(0.72 0.19 42)` | about chapter, hot particles |
| `--night` | `oklch(0.165 0.012 150)` | hero + work chapters, footer |
| `--night-ink` | `oklch(0.965 0.008 145)` | text on night |
| `--night-muted` | `oklch(0.76 0.01 150)` | secondary text on night |

Chapters: hero + work = night · live = mint · services = ground · index =
grey · toolbox = ground · about = orange · contact = ground · footer = night.
The fixed header takes the ink of the chapter beneath it (300 ms colour
transition) — the signature move besides the swarm.

## Type

One family: **Hanken Grotesk** 400/500 (next/font). Five steps only:

| Step | Size | Use |
|---|---|---|
| small | 14px | captions, meta |
| body | 18px (17px phone) | running text, leading 1.5 |
| lead | 24–28px | supporting sentences, statements, list items |
| head | clamp(40px, 6vw, 96px) | every section heading, tracking -0.04em, leading 0.95 |
| display | clamp(60px, 11vw, 190px) | hero h1, live input, footer name |

Headlines: two lines or fewer at every width.

## Shape and space

- Square corners everywhere (radius 0); one button: square, mint fill, ink text, 48px tall.
- Page margin: `clamp(16px, 3vw, 48px)` both sides; section gap 160px desktop / 96px phone.
- No rules/hairlines, no shadows at rest, no gradients, no glass, no emoji, no eyebrows, no index numbers.

## Motion (Emil's rules)

- Only `transform` and `opacity`; ease-out `cubic-bezier(0.23, 1, 0.32, 1)`.
- Section entrances: heading → text → picture, 70 ms stagger, rise 24px, 280 ms, once.
- Button press: `scale(0.97)` 120 ms. Hover only on `(hover: hover)`.
- Swarm morphs on the GPU (vertex shader), per-particle delay; pointer repulsion in the shader.
- `prefers-reduced-motion`: no entrances, swarm drawn once as a still frame, no morph travel (cuts).
- Nothing animates while disabled.

## 3D guardrails

Plain three.js, one `Points` mesh per canvas, ≤16k particles desktop / ≤6k
phone, DPR ≤ 1.5, render only while visible and the tab is active, mounted
after first paint. HTML text is always the LCP; without WebGL the page shows
the same words as text.
