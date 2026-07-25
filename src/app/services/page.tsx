import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description: "Web development, graphic design, SEO, and link building from Teqnowebs.",
};

const services = [
  {
    id: "web",
    n: "01",
    title: "Web development",
    body: "Sites that represent your brand and turn visitors into customers.",
    items: [
      "Business websites and marketing pages",
      "E-commerce and product catalogs",
      "CMS setup and content workflows",
      "Performance, accessibility, and ongoing care",
    ],
    bg: "bg-paper",
  },
  {
    id: "design",
    n: "02",
    title: "Graphic design",
    body: "Visual systems that feel owned — logos, brand kits, and campaign creatives.",
    items: [
      "Logo and brand identity",
      "Social and campaign creatives",
      "UI / UX for web and software",
      "Print and presentation design",
    ],
    bg: "bg-mist/30",
  },
  {
    id: "seo",
    n: "03",
    title: "SEO & link building",
    body: "Technical foundations, content that ranks, and links that build authority.",
    items: [
      "Technical and on-page SEO audits",
      "Keyword and content strategy",
      "Local SEO for service businesses",
      "Ethical link building and outreach",
    ],
    bg: "bg-paper",
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
            Everything your brand needs online — and the growth engine behind it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Web, design, SEO, and link building under one roof. Pair them with our{" "}
            <Link
              href="/software"
              className="font-semibold text-accent-deep underline-offset-2 hover:underline"
            >
              custom software
            </Link>{" "}
            when your operations need more than a website.
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
          Need software too — sales, invoices, warehouse?
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
