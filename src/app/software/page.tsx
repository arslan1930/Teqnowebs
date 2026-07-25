import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software",
  description:
    "Custom sales manager/CRM, finance management, invoicing, warehouse, and order tracking software from Teqnowebs.",
};

const modules = [
  {
    id: "sales",
    n: "01",
    title: "Sales manager / CRM",
    body: "Run the pipeline from first lead to closed deal — with clear owners, follow-ups, and targets.",
    items: [
      "Lead capture and pipeline stages",
      "Contact and company records",
      "Quotes, proposals, and deal value",
      "Task reminders and follow-up cadences",
      "Team assignment and ownership",
      "Targets, forecasts, and sales reporting",
      "Notes and activity history per deal",
      "Handoff into invoicing when you win",
    ],
    bg: "bg-paper",
  },
  {
    id: "finance",
    n: "02",
    title: "Finance management",
    body: "Keep money visible — expenses, cashflow, and reports your finance team can trust.",
    items: [
      "Income and expense tracking",
      "Cashflow visibility by period",
      "Charts of accounts tailored to you",
      "Category budgets and alerts",
      "Vendor and payer records",
      "Export-ready financial reports",
      "Role-based access for owners and finance",
      "Works alongside invoicing and sales",
    ],
    bg: "bg-mist/30",
  },
  {
    id: "invoicing",
    n: "03",
    title: "Invoicing",
    body: "Send professional invoices and keep payment status clear for finance and clients.",
    items: [
      "Invoice creation and numbering",
      "Payment status and reminders",
      "Tax-ready records",
      "Partial payments and balances",
      "Client billing history in one view",
      "PDF and shareable invoice links",
    ],
    bg: "bg-paper",
  },
  {
    id: "warehouse",
    n: "04",
    title: "Warehouse & collection",
    body: "Know what you have, where it is, and what is ready for pickup or dispatch.",
    items: [
      "Stock levels and locations",
      "Collection and receiving workflows",
      "Low-stock alerts",
      "Simple ops dashboards for the floor",
      "SKU and batch tracking basics",
      "Handoff into order fulfillment",
    ],
    bg: "bg-mist/30",
  },
  {
    id: "tracking",
    n: "05",
    title: "Order tracking",
    body: "Give your team — and your customers — a live path from order to delivery.",
    items: [
      "Order status timelines",
      "Customer-facing tracking links",
      "Internal handoff between teams",
      "Exceptions and delay alerts",
      "Delivery and collection confirmation",
      "Reporting on fulfillment speed",
    ],
    bg: "bg-paper",
  },
];

export default function SoftwarePage() {
  return (
    <div className="pt-24">
      <section className="band-soft relative overflow-hidden border-b border-line py-20 text-ink sm:py-28">
        <div className="pointer-events-none absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Software
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Sales, finance, and ops systems for the work behind the website.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            We build sales manager/CRM, finance management, invoicing, warehouse, and order tracking
            so your teams stay in sync — tailored to how your company actually works.
          </p>
        </div>
      </section>

      {modules.map((mod) => (
        <section
          key={mod.id}
          id={mod.id}
          className={`scroll-mt-24 border-b border-line py-16 sm:py-24 ${mod.bg}`}
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <span className="font-display text-5xl font-semibold text-accent/25">{mod.n}</span>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-ink">
                {mod.title}
              </h2>
              <p className="mt-4 text-muted">{mod.body}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {mod.items.map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-accent/40 py-1 pl-4 text-sm leading-relaxed text-ink-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="atmosphere relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Tell us how your operations run today.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            We will scope the modules you need — standalone or connected.
          </p>
          <Link
            href="/contact"
            className="cta-gradient mt-8 inline-flex px-6 py-3.5 text-sm font-semibold text-white transition"
          >
            Start a software project
          </Link>
        </div>
      </section>
    </div>
  );
}
