"use client";

import { useState } from "react";

const interests = [
  "Web development",
  "Graphic design",
  "SEO & link building",
  "Sales software",
  "Invoicing",
  "Warehouse / collection",
  "Order tracking",
  "Not sure yet",
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border border-accent/30 bg-accent/5 p-8 sm:p-10">
        <h2 className="font-display text-2xl font-semibold text-ink">Thanks — we got it.</h2>
        <p className="mt-3 text-muted">
          A Teqnowebs teammate will reply shortly. For faster replies, email{" "}
          <a href="mailto:hello@teqnowebs.com" className="font-semibold text-accent-deep">
            hello@teqnowebs.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Name</span>
          <input
            required
            name="name"
            className="mt-2 w-full border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-accent"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            required
            type="email"
            name="email"
            className="mt-2 w-full border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-accent"
            placeholder="you@company.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-ink">Company</span>
        <input
          name="company"
          className="mt-2 w-full border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-accent"
          placeholder="Optional"
        />
      </label>
      <fieldset>
        <legend className="text-sm font-medium text-ink">What are you interested in?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <label
              key={interest}
              className="cursor-pointer border border-line bg-white px-3 py-2 text-sm text-ink-soft has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-accent-deep"
            >
              <input type="checkbox" name="interest" value={interest} className="sr-only" />
              {interest}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-sm font-medium text-ink">Project details</span>
        <textarea
          required
          name="message"
          rows={5}
          className="mt-2 w-full resize-y border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-accent"
          placeholder="Tell us about the site, design, SEO, or software you need…"
        />
      </label>
      <button
        type="submit"
        className="cta-gradient px-6 py-3.5 text-sm font-semibold text-white transition"
      >
        Send message
      </button>
    </form>
  );
}
