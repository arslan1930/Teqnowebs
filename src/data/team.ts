export type TeamMember = {
  name: string;
  role: string;
  /** Local path under /public (e.g. /team/m-arslan.jpg) or resolved Sanity CDN URL */
  photo?: string | null;
  photoAlt?: string | null;
};

export type TeamGroup = {
  id: string;
  label: string;
  members: TeamMember[];
};

export const teamGroupLabels: Record<string, string> = {
  "leadership-tech": "Leadership & Tech",
  "growth-outreach": "Growth & Outreach",
  "content-seo": "Content & SEO",
};

export const teamGroupOrder = [
  "leadership-tech",
  "growth-outreach",
  "content-seo",
] as const;

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

/** Slug used for optional local photos in public/team/<slug>.jpg */
export function memberPhotoSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Fallback roster when Sanity has no team members yet.
 * Drop a photo at public/team/<slug>.jpg (or .png/.webp) and set `photo`
 * to that path — or manage photos in Sanity Studio (preferred).
 */
export const teamGroups: TeamGroup[] = [
  {
    id: "leadership-tech",
    label: "Leadership & Tech",
    members: [
      {
        name: "M Arslan",
        role: "Head of Technical Operations",
        photo: "/team/m-arslan.jpg",
        photoAlt: "M Arslan",
      },
      {
        name: "Shaharyar",
        role: "Lead Web Developer",
        photo: "/team/shaharyar.jpg",
        photoAlt: "Shaharyar",
      },
      {
        name: "Rehan Haider",
        role: "AI Solutions Specialist",
        photo: "/team/rehan-haider.jpg",
        photoAlt: "Rehan Haider",
      },
      {
        name: "Umar Ul Zaman",
        role: "Human Resources Manager",
        photo: "/team/umar-ul-zaman.jpg",
        photoAlt: "Umar Ul Zaman",
      },
    ],
  },
  {
    id: "growth-outreach",
    label: "Growth & Outreach",
    members: [
      {
        name: "Subhan Hameed",
        role: "Outreach Manager",
        photo: "/team/subhan-hameed.jpg",
        photoAlt: "Subhan Hameed",
      },
      {
        name: "Muhammad Zohaib",
        role: "Partnerships Manager",
        photo: "/team/muhammad-zohaib.jpg",
        photoAlt: "Muhammad Zohaib",
      },
      {
        name: "Faizan Raza",
        role: "Communications Manager",
        photo: "/team/faizan-raza.jpg",
        photoAlt: "Faizan Raza",
      },
    ],
  },
  {
    id: "content-seo",
    label: "Content & SEO",
    members: [
      {
        name: "Mahnoor Kanwal",
        role: "Communications & Link Building Lead",
        photo: "/team/mahnoor-kanwal.jpg",
        photoAlt: "Mahnoor Kanwal",
      },
      {
        name: "Maleeha",
        role: "SEO Link Building Specialist",
        photo: "/team/maleeha.jpg",
        photoAlt: "Maleeha",
      },
      {
        name: "Maneesa Mahin",
        role: "SEO Link Building Specialist",
        photo: "/team/maneesa-mahin.jpg",
        photoAlt: "Maneesa Mahin",
      },
      {
        name: "Ayesha",
        role: "Senior Content Strategist",
        photo: "/team/ayesha.jpg",
        photoAlt: "Ayesha",
      },
    ],
  },
];

export const teamMembers: TeamMember[] = teamGroups.flatMap((group) => group.members);
