"use client";

import { useEffect, useState } from "react";
import { BUSINESS_EVENT } from "@/components/hero-swarm";
import { live, mailto } from "@/content/site";
import { domainFor } from "@/lib/business";

// The live thing: type a business, see the first screen and chat greeting
// Ahsan would start from, and send it to him as a prefilled email.
export function BusinessPreview() {
  const [name, setName] = useState(live.placeholder);
  const [touched, setTouched] = useState(false);
  const display = name.trim() || live.placeholder;

  // Only a visitor's own input re-writes the hero swarm, never the default example.
  useEffect(() => {
    if (!touched) return;
    const t = setTimeout(() => window.dispatchEvent(new CustomEvent(BUSINESS_EVENT, { detail: name })), 300);
    return () => clearTimeout(t);
  }, [name, touched]);

  const choose = (value: string) => {
    setTouched(true);
    setName(value);
  };

  const email = mailto(
    `Website for ${display}`,
    `Hi Ahsan,\n\nI run ${display}. I'd like a website and an AI chat assistant like the preview on your site.\n\nA bit about us:\n\n`,
  );

  return (
    <form action={email} method="get" onSubmit={(e) => (e.preventDefault(), (window.location.href = email))}>
      <label htmlFor="business" className="sr-only">
        Your business name
      </label>
      <div data-ui className="live-input-wrap">
        <input
          id="business"
          value={name}
          onChange={(e) => choose(e.target.value)}
          maxLength={40}
          autoComplete="organization"
          spellCheck={false}
          className="live-input text-display leading-none"
        />
      </div>

      <div data-ui className="live-answer mt-12" aria-live="polite">
        <div className="live-browser">
          <p className="live-url text-small">{domainFor(display)}</p>
          <div className="live-site">
            <p className="text-lead font-medium">{display}</p>
            <p className="mt-1 text-body">Book online in under a minute.</p>
            <span className="live-site-btn text-small">Book a visit</span>
          </div>
        </div>
        <p className="live-chat text-body">Hi! Welcome to {display}. Want to book, or ask about prices and hours?</p>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button type="submit" className="btn btn-ink">
          Ask Ahsan to build this
        </button>
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-body">
          {live.examples.map((ex) => (
            <button key={ex} type="button" onClick={() => choose(ex)} className="link">
              {ex}
            </button>
          ))}
        </p>
      </div>
    </form>
  );
}
