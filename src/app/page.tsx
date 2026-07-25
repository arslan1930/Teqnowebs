import Link from "next/link";
import { Logo } from "@/components/Logo";

const pillars = [
  {
    n: "01",
    title: "Website development",
    body: "Business sites, stores, and landing pages that load fast and convert.",
    href: "/services#web",
  },
  {
    n: "02",
    title: "UI / UX design",
    body: "Research, wireframes, and interfaces built for clarity and conversion.",
    href: "/services#uiux",
  },
  {
    n: "03",
    title: "SEO & link building",
    body: "Technical SEO, content, and authority so the right people find you.",
    href: "/services#seo",
  },
  {
    n: "04",
    title: "Graphic design",
    body: "Brand identity and creatives that look intentional — not templated.",
    href: "/services#design",
  },
  {
    n: "05",
    title: "Custom software",
    body: "Sales manager, finance, invoicing, warehouse, and order tracking.",
    href: "/software",
  },
];

const software = [
  {
    href: "/software#sales",
    title: "Sales manager",
    body: "CRM pipeline, leads, follow-ups, and team targets.",
  },
  {
    href: "/software#finance",
    title: "Finance",
    body: "Expenses, cashflow, and reports finance can trust.",
  },
  { href: "/software#invoicing", title: "Invoicing", body: "Clean invoices, payments, and records." },
  {
    href: "/software#warehouse",
    title: "Warehouse",
    body: "Stock, collection, and inventory clarity.",
  },
  {
    href: "/software#tracking",
    title: "Order tracking",
    body: "Status from order to delivery — visible.",
  },
];

const steps = [
  { n: "01", title: "Discover", body: "Goals, audience, and the systems you already run." },
  { n: "02", title: "Design", body: "Brand, UX, and architecture before a line of waste." },
  { n: "03", title: "Build", body: "Ship the site, creatives, or software your team needs." },
  { n: "04", title: "Grow", body: "SEO, links, and iteration so results compound." },
];

export default function HomePage() {
  return (
    <>
      <section className="atmosphere relative min-h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-overlay" />
        <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-end gap-10 px-5 pb-12 pt-28 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-24">
          <div className="z-10">
            <div className="animate-rise">
              <Logo
                href="/"
                ariaLabel="Teqnowebs"
                variant="wordmark"
                sizeClassName="text-5xl sm:text-6xl md:text-7xl"
              />
            </div>
            <div className="animate-draw mt-5 h-1 w-24 bg-accent" />
            <h1 className="animate-rise-delay-1 font-display mt-8 max-w-xl text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              Web, design, growth, and software that run your business.
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              From websites, UI/UX, and SEO to sales, finance, and order tracking — Teqnowebs builds
              what customers see and what your team uses every day.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="cta-gradient px-6 py-3.5 text-sm font-semibold text-white transition"
              >
                Book a call
              </Link>
              <Link
                href="/services"
                className="border border-ink/20 bg-white/50 px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur transition hover:border-accent hover:text-accent-deep"
              >
                Explore services
              </Link>
            </div>
          </div>

          <div className="animate-fade relative -mx-5 sm:mx-0 lg:self-stretch">
            <div className="relative h-full min-h-[280px] w-full overflow-hidden sm:min-h-[360px] lg:min-h-[480px]">
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(150deg, #eef2f8 0%, #f6f9fc 50%, #e9eef6 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(37,99,235,0.18), transparent 70%), radial-gradient(ellipse 40% 35% at 25% 70%, rgba(100,116,139,0.12), transparent 65%)",
                }}
              />
              <div className="absolute inset-0 grid-overlay opacity-60" />
              <div className="animate-drift absolute left-[8%] top-[18%] right-[8%] bottom-[12%] rounded-xl border border-accent/15 bg-white/70 p-4 shadow-2xl shadow-accent/10 backdrop-blur-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-signal/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
                  <span className="ml-3 font-display text-xs tracking-wide text-muted">
                    teqnowebs · live systems
                  </span>
                </div>
                <div className="grid h-[calc(100%-2rem)] grid-cols-12 gap-3">
                  <div className="col-span-4 flex flex-col gap-2 rounded-lg border border-line bg-white/80 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-accent">Sales</p>
                    <div className="mt-1 h-2 w-3/4 rounded-full bg-ink/10" />
                    <div className="h-2 w-1/2 rounded-full bg-ink/[0.07]" />
                    <div className="mt-auto space-y-1.5">
                      <div className="h-8 rounded border border-accent/25 bg-accent/10" />
                      <div className="h-8 rounded border border-line bg-mist/60" />
                    </div>
                  </div>
                  <div className="col-span-5 flex flex-col gap-2 rounded-lg border border-line bg-white/80 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-signal">Orders</p>
                    <div className="mt-2 flex flex-1 flex-col justify-between gap-2">
                      {[72, 45, 88, 56].map((pct) => (
                        <div key={pct} className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-ink/[0.08]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-deep"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[10px] text-muted">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-3 flex flex-col gap-2">
                    <div className="flex-1 rounded-lg border border-line bg-white/80 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted">Invoice</p>
                      <p className="mt-3 font-display text-2xl text-ink">$4.2k</p>
                      <p className="mt-1 text-[10px] text-accent">+12 this week</p>
                    </div>
                    <div className="flex-1 rounded-lg border border-line bg-white/80 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted">Warehouse</p>
                      <div className="mt-3 grid grid-cols-3 gap-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-sm ${i % 3 === 0 ? "bg-accent/50" : "bg-ink/[0.08]"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="animate-pulse-soft pointer-events-none absolute -right-8 top-1/4 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            What we do
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            One agency for websites, design, growth, and systems.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {pillars.map((item) => (
              <Link key={item.title} href={item.href} className="group block">
                <span className="font-display text-xs text-muted">{item.n}</span>
                <h3 className="font-display mt-3 text-xl font-semibold text-ink transition group-hover:text-accent-deep">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-accent opacity-0 transition group-hover:opacity-100">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band-soft border-y border-line py-20 text-ink sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Business systems
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Software for sales, finance, stock, and delivery.
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Custom modules that connect — so you stop stitching spreadsheets together.
          </p>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {software.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="card-soft p-8 transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-mist/40 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            How we work
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Discover → Design → Build → Grow
          </h2>
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n}>
                <span className="font-display text-3xl font-semibold text-accent/40">{step.n}</span>
                <h3 className="font-display mt-3 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="atmosphere relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Ready when your next site, brand, or system is.
          </h2>
          <p className="mt-4 max-w-lg text-muted">
            Tell us what you need — a new website, UI/UX, SEO push, or sales and finance software.
            We will map the path.
          </p>
          <Link
            href="/contact"
            className="cta-gradient mt-8 inline-flex px-6 py-3.5 text-sm font-semibold text-white transition"
          >
            Get a quote
          </Link>
        </div>
      </section>
    </>
  );
}
