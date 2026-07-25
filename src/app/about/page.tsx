import type { Metadata } from "next";
import Link from "next/link";
import { memberInitials, teamGroups } from "@/data/team";

export const metadata: Metadata = {
  title: "About",
  description: "About Teqnowebs — the agency for web, design, SEO, and business software.",
};

const pillars = [
  {
    title: "Brand-first delivery",
    body: "Your name and story lead every project. Templates are a starting point — never the finish line.",
  },
  {
    title: "Practical tech",
    body: "We choose stacks your team can live with: maintainable sites, clear software, measurable SEO.",
  },
  {
    title: "One partner",
    body: "Fewer handoffs. Web, design, growth, and ops software stay aligned under one plan.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            About Teqnowebs
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            We build the face of your business — and the systems behind it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Teqnowebs is a digital agency for teams that need more than a pretty homepage. We design
            and develop websites, craft brand visuals, grow organic reach with SEO and link
            building, and ship custom software for sales, invoicing, warehouse, and order tracking.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-3">
          {pillars.map((item) => (
            <div key={item.title}>
              <h2 className="font-display text-xl font-semibold text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-mist/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Our team
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            The people behind the work.
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Web, AI, outreach, and content — one team building what customers see and what your
            business runs on.
          </p>

          <div className="mt-14 space-y-14">
            {teamGroups.map((group) => (
              <div key={group.id}>
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  {group.label}
                </h3>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {group.members.map((member) => (
                    <li key={member.name} className="flex items-start gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-white font-display text-sm font-semibold text-accent-deep"
                        aria-hidden
                      >
                        {memberInitials(member.name)}
                      </span>
                      <div>
                        <p className="font-display text-base font-semibold text-ink">{member.name}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{member.role}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band-soft border-t border-line py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Let&apos;s talk about your next build.
            </h2>
            <p className="mt-2 text-muted">No long decks — just a clear next step.</p>
          </div>
          <Link
            href="/contact"
            className="cta-gradient px-6 py-3.5 text-sm font-semibold text-white transition"
          >
            Contact Teqnowebs
          </Link>
        </div>
      </section>
    </div>
  );
}
