import { memberInitials, teamGroups } from "@/data/team";

export function TeamSection() {
  return (
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
  );
}
