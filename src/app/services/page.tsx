import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website development, UI/UX design, graphic design, SEO, and link building from Teqnowebs.",
};

const services = [
  {
    id: "web",
    n: "01",
    title: "Website development",
    body: "Sites that represent your brand, load fast, and turn visitors into customers.",
    items: [
      "Business websites and company sites",
      "Marketing and conversion landing pages",
      "E-commerce stores and product catalogs",
      "CMS setup and content workflows",
      "Responsive builds for mobile and desktop",
      "Performance, accessibility, and security basics",
      "Hosting handoff and ongoing maintenance",
      "Integrations for forms, CRM, and analytics",
    ],
    bg: "bg-paper",
  },
  {
    id: "uiux",
    n: "02",
    title: "UI / UX design",
    body: "Interfaces people understand quickly — researched, wired, and built to convert.",
    items: [
      "User research and journey mapping",
      "Information architecture and flows",
      "Wireframes for key screens",
      "Interactive prototypes for stakeholder review",
      "UI kits and design systems",
      "Usability reviews and iteration",
      "Conversion-focused UX for marketing sites",
      "Product UX for custom software dashboards",
    ],
    bg: "bg-mist/30",
  },
  {
    id: "design",
    n: "03",
    title: "Graphic design",
    body: "Visual systems that feel owned — logos, brand kits, and campaign creatives.",
    items: [
      "Logo and brand identity",
      "Brand guidelines and visual kits",
      "Social and campaign creatives",
      "Presentation and pitch decks",
      "Print and collateral design",
      "Ad creatives for paid campaigns",
    ],
    bg: "bg-paper",
  },
  {
    id: "seo",
    n: "04",
    title: "SEO & link building",
    body: "Technical foundations, content that ranks, and links that build authority.",
    items: [
      "Technical SEO audits and fixes",
      "On-page SEO and content structure",
      "Keyword research and content strategy",
      "Local SEO for service businesses",
      "Ethical link building and outreach",
      "Competitor and SERP analysis",
      "Site migrations and SEO hygiene",
      "Rankings, traffic, and reporting dashboards",
    ],
    bg: "bg-mist/30",
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-24">
      <section className="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Services
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Websites, UI/UX, design, and SEO — built to grow together.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Full website delivery, interface design, brand creatives, and search growth under one
            roof. Pair them with our{" "}
            <Link
              href="/software"
              className="font-semibold text-accent-deep underline-offset-2 hover:underline"
            >
              custom software
            </Link>{" "}
            when sales, finance, and operations need more than a website.
          </p>
        </div>
      </section>

      {services.map((service) => (
        <section
          key={service.id}
          id={service.id}
          className={`scroll-mt-24 border-b border-line py-16 sm:py-24 ${service.bg}`}
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <span className="font-display text-sm text-muted">{service.n}</span>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-ink">
                {service.title}
              </h2>
              <p className="mt-4 text-muted">{service.body}</p>
            </div>
            <ul className="space-y-4 self-center">
              {service.items.map((item) => (
                <li key={item} className="flex gap-3 text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="band-soft border-y border-line py-16 text-center text-ink sm:py-20">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Need software too — sales manager, finance, warehouse?
        </h2>
        <Link
          href="/software"
          className="cta-gradient mt-6 inline-flex px-6 py-3 text-sm font-semibold text-white transition"
        >
          View software solutions
        </Link>
      </section>
    </div>
  );
}
