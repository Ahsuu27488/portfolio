# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js 16 (App Router, static) + TypeScript + Tailwind CSS v4, with
plain three.js (no R3F) for one GPU particle swarm. Chosen to match HQ ADR-0003
and keep the 3D layer small; deploy on Vercel at ahsandev.site (confirmed).

## Users

Owners and managers of small businesses abroad (US, UK, Gulf) — dentists,
salons, restaurants, cleaning firms, coaches — who found Muhammad Ahsan through
Upwork, Fiverr or a cold email and are deciding, in a minute or two, whether to
trust him with a website, an AI chatbot or an automation. Secondary: Upwork
reviewers and Discord-server owners checking the bot/scraping gigs. (Confirmed:
"Bahar ke clients" first.)

## Product Purpose

Turn a curious visitor into an email/project request by proving, with shipped
work, that he builds software that actually ships — then telling them plainly
what he can build for them and what it costs to start.

## Positioning

He ships his own products end to end: a Windows task manager with its own
installer and website (Taskvane), a multi-agent AI assistant on Kubernetes
(Chronos), an open-source Claude Code plugin (Foreman), a frame-by-frame video
edit recreator (edit-recreator). A template freelancer cannot truthfully show
these.

## Capabilities and Constraints

- Services: websites (Next.js), AI chatbots, automations, Discord bots, scraping
  and data cleaning. Starter prices from HQ `docs/business/strategy.md`.
- Contact: email only — ahsanraj2748@gmail.com (confirmed public). Also the public
  GitHub (Ahsuu27488) and LinkedIn from his GitHub profile.
- Must NOT show (owner did not approve): his age, his city/region/country, the
  family shop website or anything about the family business.
- No backend: contact opens a prefilled email.

## Brand Commitments

Name: Muhammad Ahsan; wordmark "Ahsan". Featured (confirmed): Taskvane, Chronos,
Foreman, edit-recreator. Owner's binding requirement: a 3D/particle hero that
competes with musa.ai — but faster, mobile-friendly, and with real content.

## Evidence on Hand

- Taskvane screenshots (overview, performance, sensors) and live site
  taskvane.ahsandev.site.
- Chronos live app screenshot (evolution-of-todo-tau.vercel.app).
- edit-recreator side-by-side demo video (docs/demo.mp4).
- Foreman README facts (CI, v0.4.3, supported worker CLIs).
- PCAO-F study pack live page; scraper-demo sample output image.
- Absent, never fabricate: testimonials, client logos, reviews, revenue,
  download counts, star counts.

## Product Principles

1. Proof before claims: every claim on the page points at a real thing.
2. Say what it costs to start; no "contact for pricing".
3. One action everywhere: tell Ahsan what you need.
4. Spectacle never blocks reading: text renders first, 3D is an enhancement.

## Accessibility & Inclusion

WCAG 2.1 AA contrast; full keyboard use; `prefers-reduced-motion` gets a still
particle frame and no travel; everything works by touch.
