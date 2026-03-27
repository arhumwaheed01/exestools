"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export function ContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams({
      subject: subject.trim() || "ExesTools: inquiry",
      body: message.trim(),
    });
    window.location.href = `mailto:${site.contactEmail}?${params.toString()}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-2xl border border-input-border bg-background p-6 shadow-sm md:p-8"
      noValidate
    >
      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-semibold text-secondary-text"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          autoComplete="off"
          placeholder="What is your message about?"
          className="mt-2 w-full rounded-xl border border-input-border bg-surface px-4 py-3 text-base text-secondary-text outline-none ring-primary/25 transition-shadow focus:border-primary/40 focus:ring-4"
        />
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-secondary-text"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Write your message here. Your mail app will open when you send."
          className="mt-2 w-full resize-y rounded-xl border border-input-border bg-surface px-4 py-3 text-base text-secondary-text outline-none ring-primary/25 transition-shadow focus:border-primary/40 focus:ring-4"
        />
      </div>
      <button type="submit" className="btn w-full sm:w-auto">
        Open email to send
      </button>
      <p className="text-sm text-secondary-text/75">
        This opens your email client addressed to{" "}
        <a
          href={`mailto:${site.contactEmail}`}
          className="font-semibold text-primary no-underline hover:underline"
        >
          {site.contactEmail}
        </a>
        . No message is stored on our servers from this step.
      </p>
    </form>
  );
}
