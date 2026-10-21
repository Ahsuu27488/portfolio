# CLAUDE.md — portfolio (ahsandev.site)

Muhammad Ahsan's personal portfolio, aimed at small-business clients abroad.
Part of Agency HQ (`../../`, read its CLAUDE.md for how the business works).
Read `PRODUCT.md` (facts, what may and may not be shown) and `DESIGN.md`
(tokens, type, motion) before any change. Also read `AGENTS.md`: Next.js 16
with Cache Components — check `node_modules/next/dist/docs/` before using an
unfamiliar Next.js API.

## Commands

| Task | Command |
|---|---|
| Dev | `pnpm dev` |
| Build | `pnpm build` |
| Tests | `pnpm test` |
| Lint | `pnpm lint` |
| Design gate | `node ../../.claude/skills/design-taste-frontend/scripts/lint.mjs src` and `.../inspect.mjs http://localhost:3000` (needs `CHROME_PATH`; as root wrap Chrome with `--no-sandbox`) |
| Impeccable detector | `../../.claude/skills/impeccable/scripts/impeccable detect --json src` |

## Structure

- `src/content/site.ts` — every word, link and project on the site. Edit copy here only.
- `src/lib/shapes.ts` — the four product marks (redrawn from their real logos) + text sampling.
- `src/lib/swarm.ts` — the GPU particle swarm (three.js, shaders). Lazy-loaded.
- `src/components/swarm-canvas.tsx` — mounts a swarm: visibility, pointer, reduced motion, fallback.
- `src/components/hero-swarm.tsx`, `work-scene.tsx`, `business-preview.tsx` (the live thing),
  `chapter-header.tsx` (header takes the chapter's colour), `contact-form.tsx`, `reveals.tsx`.
- `src/app/page.tsx` — the page, one `<section data-chapter="…">` per chapter.
- `public/work/` — real screenshots/video of the owner's products (webp/mp4).
- `.taste-skill/notes.md` — inventory, idea, direction choice, critique rounds.

## Rules

- Owner-approved public info only: name, email, GitHub, LinkedIn. Never add his
  age, location, or the family business. Never invent clients, reviews or numbers.
- Follow `../../docs/design/workflow-brief.md` (ADR-0005): taste lint + inspect
  with 0 FAIL, screenshots at 1440/768/390 reviewed, Emil's motion rules.
- Custom CSS classes are unlayered and beat Tailwind utilities: don't combine a
  custom `display` rule with `md:hidden`-style utilities on the same element.
- Swarm: keep motion in the shader; never per-particle work on the main thread.
- After changes: update `CHANGELOG.md`; keep test, lint and build green.
