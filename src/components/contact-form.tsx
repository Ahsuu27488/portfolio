"use client";

import { useState } from "react";
import { contact } from "@/content/site";
import {
  contactMode,
  mailtoFor,
  validate,
  WEB3FORMS_URL,
  web3formsPayload,
  type ContactFields,
} from "@/lib/contact";

const KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const mode = contactMode(KEY);

export function ContactForm() {
  const [fields, setFields] = useState<ContactFields>({
    name: "",
    email: "",
    message: "",
    botcheck: false,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(fields);
    if (err) {
      setStatus("error");
      setErrorMsg(err);
      return;
    }

    if (fields.botcheck) {
      setFields({ name: "", email: "", message: "", botcheck: false });
      setStatus("sent");
      setErrorMsg("");
      return;
    }

    if (mode === "mailto") {
      window.location.href = mailtoFor(fields);
      setStatus("idle");
      setErrorMsg("");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(web3formsPayload(fields, KEY)),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success === true) {
        setFields({ name: "", email: "", message: "", botcheck: false });
        setStatus("sent");
      } else {
        setStatus("error");
        setErrorMsg("");
      }
    } catch {
      setStatus("error");
      setErrorMsg("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="contact-name" className="text-small text-muted">
          Name
        </label>
        <div className="contact-field">
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={fields.name}
            onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
            className="contact-input text-body"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="contact-email" className="text-small text-muted">
          Email
        </label>
        <div className="contact-field">
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={fields.email}
            onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
            className="contact-input text-body"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="contact-message" className="text-small text-muted">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder={contact.placeholder}
          value={fields.message}
          onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
          className="contact-area text-body"
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <input
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
          checked={fields.botcheck}
          onChange={(e) => setFields((f) => ({ ...f, botcheck: e.target.checked }))}
        />
      </div>

      <div>
        <button type="submit" disabled={status === "sending"} className="btn btn-ink">
          {status === "sending" ? "Sending…" : "Send to Ahsan"}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={`mt-4 text-small ${status === "idle" || status === "sending" ? "text-muted" : ""}`}
        >
          {status === "sent" ? (
            contact.sent
          ) : status === "error" ? (
            errorMsg ? (
              errorMsg
            ) : (
              <>
                {contact.failed}{" "}
                <a href={mailtoFor(fields)} className="link">
                  email Ahsan directly
                </a>
                .
              </>
            )
          ) : (
            contact.next[mode]
          )}
        </p>
      </div>
    </form>
  );
}
