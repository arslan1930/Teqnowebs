export type TeamMember = {
  name: string;
  role: string;
};

export type TeamGroup = {
  id: string;
  label: string;
  members: TeamMember[];
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function memberInitials(name: string): string {
  return initials(name);
}

/** Full Teqnowebs roster shown on /about */
export const teamGroups: TeamGroup[] = [
  {
    id: "leadership-tech",
    label: "Leadership & Tech",
    members: [
      { name: "M Arslan", role: "Head of Technical Operations" },
      { name: "Shaharyar", role: "Lead Web Developer" },
      { name: "Rehan Haider", role: "AI Solutions Specialist" },
      { name: "Umar Ul Zaman", role: "Human Resources Manager" },
    ],
  },
  {
    id: "growth-outreach",
    label: "Growth & Outreach",
    members: [
      { name: "Subhan Hameed", role: "Outreach Manager" },
      { name: "Muhammad Zohaib", role: "Partnerships Manager" },
      { name: "Faizan Raza", role: "Communications Manager" },
    ],
  },
  {
    id: "content-seo",
    label: "Content & SEO",
    members: [
      { name: "Mahnoor Kanwal", role: "Communications & Link Building Lead" },
      { name: "Maleeha", role: "SEO Link Building Specialist" },
      { name: "Maneesa Mahin", role: "SEO Link Building Specialist" },
      { name: "Ayesha", role: "Senior Content Strategist" },
    ],
  },
];

export const teamMembers: TeamMember[] = teamGroups.flatMap((group) => group.members);
