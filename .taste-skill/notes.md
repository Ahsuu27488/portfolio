# Portfolio notes (taste-skill run)

## 1. Inventory — things only this subject has
1. Muhammad Ahsan, 18, from Bandhi/Nawabshah, Sindh, Pakistan. Handle Ahsuu27488. Domain ahsandev.site (root currently unhosted, 522).
2. Taskvane — his own Windows 11 task manager: CPU/GPU temperatures, power draw in watts, 100+ sensors, ~0.4% CPU, installer + portable via GitHub Actions, Astro site at taskvane.ahsandev.site. Real screenshots exist.
3. Chronos — "AI time guardian": multi-agent (Chronos → Planning / Query agents), 7 self-written MCP tools, Whisper voice tuned for Urdu speakers, Qdrant semantic search, Kubernetes/Helm/Dapr/Kafka on Oracle OKE. Live on Vercel.
4. Foreman — Claude Code plugin: "make your best model the lead engineer"; logo = a hard hat leading a crew of three. CI, v0.4.3.
5. edit-recreator — rebuilds TikTok/Reels edits frame by frame in Remotion, checks side by side. Real demo.mp4 / demo.gif (side-by-side).
6. Physical AI textbook — RAG chatbot over the book, one-click Urdu translation (live site currently broken: baseUrl).
7. PCAO-F study pack — 180 questions, timed mock, English / Roman Urdu / Urdu with RTL flip.
8. Gamer tools — GameLoop keymap copier ("no re-dragging 130 buttons"), WASD speed fix.
9. Trilingual: English, Urdu, Roman Urdu. Builds RTL Urdu UIs (shop site, PCAO-F).
10. Family kiryana store on Moro Road by Bandhi railway station, 20+ years — he built its bilingual WhatsApp-order site.
11. New service demos: polite scraper (60 rows → clean XLSX), Discord bot (welcome/roles/tickets/moderation).
12. Panaversity / GIAIC student; builds with Claude Code, publishes his own plugins.

## 2. Argument — claims and proof, one per section
- Hero: Ahsan builds software that ships end to end (AI agents, web apps, desktop tools). Proof: Taskvane running, live.
- Featured work: four shipped products — Taskvane, Chronos, Foreman, edit-recreator. Proof: their real screens / video / repos.
- More work: smaller shipped things (shop site, scraper, Discord bot, PCAO-F, game tools, hackathon builds). Proof: links.
- For clients: what he can build for a small business and what it costs to start. Proof: the starter prices (strategy.md), the demos above.
- About: who he is — 18, Sindh, trilingual, Panaversity. Proof: facts.
- Contact: one action — email him / book a call. Links to GitHub, LinkedIn.
No testimonials, logos or stats that don't exist.

## Owner answers (2026-10-21)
Audience: clients abroad. Public: email only (no age, no location, no shop site). Featured: Taskvane, Chronos, Foreman, edit-recreator. Domain: ahsandev.site.

## 3. Direction
Dealt `type-only-statement` (seed 2101421277) — Hanken Grotesk, grey/mint/orange, colour by chapter.
Chosen over page-is-the-object / split-stage: the owner's binding brief is a musa.ai-class particle hero; particles that *write words* are type made of light, which this direction carries. Dealt "Architecture" photographs not used: the project has its own product imagery (preferred order #1).
Deviations (with reasons): near-black/near-white in OKLCH instead of #000/#fff (owner's brief §4); hero chapter is the black field (field-4) because light particles need a dark ground; a pinned "work" scene is added before the index because the four featured products need their real pictures and the swarm morph (owner's 3D requirement).

## 4. Idea
On this page, **the marks of Ahsan's own shipped products (Taskvane's pulse, Chronos's clock, Foreman's hard hat and crew, edit-recreator's twin frames)** become **one particle swarm that rebuilds itself into each product as you read about it**.
Competitor test: another freelancer cannot put these four marks in the sentence. Passes.
Heat: particles warm from mint to orange near the pointer — Taskvane's temperature status as colour.
Live thing: "Type your business" — the visitor types their business name; the swarm writes it and a live preview shows the first screen + chatbot greeting he'd build, with a prefilled email. Works by touch; plain fallback without script (form posts to mailto).

## Critique log

ROUND 1
Seen in one second: a dark poster — "Software that ships." with "Ahsan" written in green particles.
Idea (one sentence): the marks of his four shipped products become one particle swarm that rebuilds itself as you read.
Live thing: type your business → preview + chat greeting + prefilled email; the hero swarm writes the name.
Layout words by section: hero=statement+swarm / work=sticky swarm beside scrolling column / try=headline you can type / services=large table / index=book spines / tools=two-ended rows / about=two columns highlighted / contact=one field / footer=name.
Scores: design 7 · usability 6 · creativity 8 · content 8 → overall 7.0.
Caps applied: inspector FAILs (eyebrow, blank-gap, off-centre, covered text) → overall ≤ 6.0.
Top three problems:
1. Phone stack of plans was also visible on desktop (custom CSS beat `md:hidden`) → page too long, false eyebrows. Fixed with a media query.
2. Phone work section overflowed 287px (grid column grew to the code block) and the sticky stage covered headings. Fixed with minmax(0,1fr) and an unpinned, self-cycling phone stage.
3. Global smooth scroll stopped reveals firing on fast jumps. Removed; reveals also fire for anything scrolled past.

ROUND 2
Seen in one second: same; the sentence and action now sit on the first screen.
Scores: design 7.5 · usability 8 · creativity 8 · content 8 → overall 7.8.
Caps applied: none (0 FAIL).
Top three problems:
1. Fixed header had no ground; text slid under the wordmark on phones → header takes the chapter's field colour.
2. Live input clipped "Bright Smile De" on phones → own size step, shorter examples.
3. Morph stalled into a cloud on slow frames → morph timed by wall clock.

ROUND 3 (final)
Seen in one second: "Software that ships." over a particle "Ahsan"; one green button.
Scores: design 8 · usability 8 · creativity 8.5 · content 8 → overall 8.1.
Caps applied: none. Inspector: 0 FAIL, 2 WARN (defended below). Impeccable detect: no findings.
Defended WARNs:
- statement-length (about): the dealt blueprint sets 110–160 words at 22–32px in two columns by design.
- blank-gap 476px at the services→index colour change: it is the section gap across a change of field colour, the page's one rest.
Still short of a 9: no photographs of the person (owner chose not to show more than email); the toolbox list is the quietest section.
