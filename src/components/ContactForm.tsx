"use client";

import { useState, type FormEvent } from "react";
import { contactDetails } from "@/data/contact";

const interests = [
  "Website development",
  "UI / UX design",
  "Graphic design",
  "SEO & link building",
  "Sales manager / CRM",
  "Finance management",
  "Invoicing",
  "Warehouse / collection",
  "Order tracking",
  "Not sure yet",
];

function buildMailto(form: HTMLFormElement) {
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const company = String(data.get("company") || "").trim();
  const message = String(data.get("message") || "").trim();
  const selectedInterests = data
    .getAll("interest")
    .map(String)
    .filter(Boolean);

  const subject = name
    ? `Teqnowebs inquiry from ${name}`
    : "Teqnowebs inquiry";

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    selectedInterests.length
      ? `Interested in: ${selectedInterests.join(", ")}`
      : null,
    "",
    "Project details:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return `mailto:${contactDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const mailto = buildMailto(e.currentTarget);
    window.location.href = mailto;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-accent/30 bg-accent/5 p-8 sm:p-10">
        <h2 className="font-display text-2xl font-semibold text-ink">Thanks — open your email to send.</h2>
        <p className="mt-3 text-muted">
          Your message is addressed to{" "}
          <a
            href={`mailto:${contactDetails.email}`}
            className="font-semibold text-accent-deep"
          >
            {contactDetails.email}
          </a>
          . If your mail app did not open, tap that address to write us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      <p className="text-xs text-muted">
        Sends via your email app to{" "}
        <a
          href={`mailto:${contactDetails.email}`}
          className="font-medium text-accent-deep hover:underline"
        >
          {contactDetails.email}
        </a>
        .
      </p>
    </form>
  );
}
