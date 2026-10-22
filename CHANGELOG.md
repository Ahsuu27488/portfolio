# Changelog

## 2026-10-22

- Header: GitHub and LinkedIn icon links next to "Start a project" (audit: they
  were only at the bottom of the page); they take the chapter's ink and get an
  ink focus ring on light chapters.
- About: the owner's real photo (`public/ahsan.webp`, 480×600, 23 KB), square,
  beside the text on desktop and above it on phones. Owner approved showing it
  (PRODUCT.md updated).
- SEO basics (audit: /robots.txt and /sitemap.xml were 404, share image was a
  Taskvane screenshot): `robots.ts` and `sitemap.ts` metadata routes, and a
  1200×630 `opengraph-image.tsx` card ("Muhammad Ahsan", "Software that ships.",
  "Websites, AI chatbots, automation") in night + mint with Mona Sans 900 wide
  and Hanken Grotesk 500 (static TTFs in `assets/fonts/`, OFL). Layout metadata
  adds the Twitter large card, `og:site_name` and a canonical URL; the
  screenshot is no longer the share image. All three routes build static.
- Contact works on phones: a name/email/message form posted to Web3Forms
  (`NEXT_PUBLIC_WEB3FORMS_KEY`, see `.env.example`) with sending/sent/error
  states and a honeypot; without the key it opens a prefilled email as before,
  so the live site keeps working until the owner adds the key. Logic in
  `src/lib/contact.ts` with unit tests.
- Prices now match the Fiverr gigs' Basic packages (Website $80, AI chatbot $50,
  Automation $40, Discord bots $15), so buyers coming from Fiverr see one price.
- `contact.hire.fiverr` / `.upwork` in `site.ts`: "Hire me on Fiverr / Upwork"
  links show in the contact section only once a URL is filled (empty today).
  Screenshots: `docs/screenshots/contact-prices/`.

## 2026-10-21

- Hero v2 (owner: v1 looked like "a static picture with a cursor effect"):
  new 3D field (`lib/field.ts`) with a GPU spring simulation, orbit camera
  (fly-in, sway, drag to turn), click shockwave, heat colours and a star
  layer; writes "Muhammad Ahsan" in Mona Sans 900 wide; a real input lets
  visitors (also on phones) type a word into it. Plan: `docs/plans/2026-10-21-hero-v2.md`.
- The product-mark scene uses the same 3D field (`FieldCanvas`), v1 swarm kept
  as the fallback for browsers without float render targets.
- Pointer pushes along its ray, so it reaches every letter when the word is
  turned (owner: it only worked at the centre). Smaller cursor hole and name.
- Wordmark is "Muhammad Ahsan" in the header and footer too.
- Prices proof row: PCAO-F study pack replaced with Chronos (live AI assistant).
- Built the portfolio: GPU particle hero, sticky work scene that morphs into
  the Taskvane / Chronos / Foreman / edit-recreator marks, "type your business"
  live preview, prices table with proof, book-spine index, toolbox, about,
  contact (prefilled email), colour-by-chapter header.
- Design workflow (HQ ADR-0005): taste direction "Type and nothing else",
  three critique rounds, inspector 0 FAIL at 1440/768/390, Impeccable detector clean.
- Fixed during review: phone overflow from the code block, sticky stage
  covering text on phones, reveals not firing after fast jumps, header without
  ground, clipped live input, morph stalling on slow frames.
