import { MemberAvatar } from "@/components/MemberAvatar";
import { getTeamGroups } from "@/sanity/lib/team";

export async function TeamSection() {
  const groups = await getTeamGroups();

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
          {groups.map((group) => (
            <div key={group.id}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">
                {group.label}
              </h3>
              <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {group.members.map((member) => (
                  <li key={member.name} className="flex flex-col items-center">
                    <MemberAvatar
                      name={member.name}
                      photo={member.photo}
                      photoAlt={member.photoAlt}
                    />
                    <p className="mt-1 max-w-[14rem] text-center text-sm leading-relaxed text-muted">
                      {member.role}
                    </p>
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
