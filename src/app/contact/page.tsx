import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { contactDetails } from "@/data/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get a quote from Teqnowebs for web, design, SEO, or custom software.",
};

export default function ContactPage() {
  return (
    <div className="pt-24">
      <section className="border-b border-line py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Contact
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Tell us what you want to build.
            </h1>
            <p className="mt-5 text-muted">
              Share a short brief. We respond with next steps, timeline thoughts, and a clear quote
              path.
            </p>
            <dl className="mt-10 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-ink">Contact</dt>
                <dd className="text-muted">{contactDetails.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Email</dt>
                <dd>
                  <a
                    href={`mailto:${contactDetails.email}`}
                    className="text-accent-deep hover:underline"
                  >
                    {contactDetails.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Phone</dt>
                <dd>
                  <a
                    href={contactDetails.phoneHref}
                    className="text-accent-deep hover:underline"
                  >
                    {contactDetails.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Address</dt>
                <dd className="text-muted">{contactDetails.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">LinkedIn</dt>
                <dd>
                  <a
                    href={contactDetails.linkedIn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-deep hover:underline"
                  >
                    {contactDetails.linkedIn.label}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Typical reply</dt>
                <dd className="text-muted">{contactDetails.replyTime}</dd>
              </div>
            </dl>
          </div>
          <div className="border border-line bg-mist/20 p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
