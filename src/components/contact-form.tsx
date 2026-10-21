"use client";

import { useState } from "react";
import { contact, mailto } from "@/content/site";

export function ContactForm() {
  const [msg, setMsg] = useState("");
  const href = mailto("A project for Ahsan", msg || "Hi Ahsan,\n\n");
  return (
    <form
      action={`mailto:${contact.rows[0].value}`}
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = href;
      }}
    >
      <label htmlFor="need" className="sr-only">
        What do you need?
      </label>
      <div className="contact-field">
        <input
          id="need"
          name="body"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={contact.placeholder}
          className="contact-input text-body"
        />
        <button type="submit" aria-label="Send to Ahsan by email" className="contact-send">
          <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <p className="mt-4 text-small text-muted">{contact.next}</p>
    </form>
  );
}
