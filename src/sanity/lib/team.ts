import {
  teamGroupLabels,
  teamGroupOrder,
  teamGroups as fallbackGroups,
  type TeamGroup,
  type TeamMember,
} from "@/data/team";
import { hasSanityConfig } from "../env";
import { client } from "./client";
import { urlForImage } from "./image";
import { teamMembersQuery } from "./queries";
import type { SanityTeamMember } from "./types";

function groupSanityMembers(members: SanityTeamMember[]): TeamGroup[] {
  const byGroup = new Map<string, TeamMember[]>();

  for (const member of members) {
    const photoUrl = member.photo
      ? urlForImage(member.photo)?.width(320).height(320).fit("crop").url()
      : null;

    const mapped: TeamMember = {
      name: member.name,
      role: member.role,
      photo: photoUrl,
      photoAlt: member.photo?.alt || member.name,
    };

    const list = byGroup.get(member.group) ?? [];
    list.push(mapped);
    byGroup.set(member.group, list);
  }

  const known = teamGroupOrder
    .filter((id) => byGroup.has(id))
    .map((id) => ({
      id,
      label: teamGroupLabels[id] || id,
      members: byGroup.get(id) ?? [],
    }));

  const extras = Array.from(byGroup.entries())
    .filter(([id]) => !(teamGroupOrder as readonly string[]).includes(id))
    .map(([id, groupMembers]) => ({
      id,
      label: teamGroupLabels[id] || id,
      members: groupMembers,
    }));

  return [...known, ...extras];
}

export async function getTeamGroups(): Promise<TeamGroup[]> {
  if (!client || !hasSanityConfig) {
    return fallbackGroups;
  }

  try {
    const members = await client.fetch<SanityTeamMember[]>(teamMembersQuery);
    if (!members?.length) return fallbackGroups;
    return groupSanityMembers(members);
  } catch {
    return fallbackGroups;
  }
}
