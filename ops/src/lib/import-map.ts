import {
  dbFindClientByName,
  dbFindUserByEmail,
  dbUpsertClient,
  dbUpsertTask,
} from "./db";
import type { LinkStatus } from "./types";
import { LINK_STATUSES } from "./types";

/** Normalize CSV header → field key */
const HEADER_MAP: Record<string, string> = {
  client: "client",
  "client name": "client",
  "target url": "targetUrl",
  target: "targetUrl",
  "target page": "targetUrl",
  site: "siteDomain",
  "site domain": "siteDomain",
  "site placed on": "siteDomain",
  domain: "siteDomain",
  type: "linkType",
  "link type": "linkType",
  status: "status",
  "live url": "liveUrl",
  live: "liveUrl",
  dr: "dr",
  price: "price",
  "price charged": "price",
  cost: "cost",
  "cost to you": "cost",
  assignee: "assigneeEmail",
  "assignee email": "assigneeEmail",
  "assigned to": "assigneeEmail",
  month: "workMonth",
  "work month": "workMonth",
  notes: "notes",
  note: "notes",
};

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/_/g, " ");
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((c) => c.trim())) rows.push(row);
  }
  return rows;
}

function mapStatus(raw: string): LinkStatus {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (s === "in-progress" || s === "progress") return "in_progress";
  if (LINK_STATUSES.includes(s as LinkStatus)) return s as LinkStatus;
  if (s.includes("live")) return "live";
  if (s.includes("publish")) return "published";
  if (s.includes("lost") || s.includes("drop")) return "lost";
  if (s.includes("queue") || s.includes("pending")) return "queued";
  return "queued";
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function importLinkCsv(text: string): { imported: number; errors: string[] } {
  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one data row");
  const headers = rows[0].map(normalizeHeader);
  const keys = headers.map((h) => HEADER_MAP[h] || "");
  if (!keys.includes("client")) {
    throw new Error('CSV must include a "Client" column');
  }

  let imported = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    try {
      const raw: Record<string, string> = {};
      rows[i].forEach((val, idx) => {
        const key = keys[idx];
        if (key) raw[key] = val.trim();
      });
      if (!raw.client) {
        errors.push(`Row ${i + 1}: missing client`);
        continue;
      }
      let client = dbFindClientByName(raw.client);
      if (!client) {
        client = dbUpsertClient({ name: raw.client, website: null, monthlyFee: 0 });
      }
      let assigneeId: string | null = null;
      if (raw.assigneeEmail) {
        const u = dbFindUserByEmail(raw.assigneeEmail);
        assigneeId = u?.id || null;
      }
      const month = raw.workMonth?.match(/^\d{4}-\d{2}/)
        ? raw.workMonth.slice(0, 7)
        : currentMonth();
      dbUpsertTask({
        clientId: client.id,
        targetUrl: raw.targetUrl || null,
        siteDomain: raw.siteDomain || null,
        linkType: raw.linkType || null,
        status: mapStatus(raw.status || "queued"),
        liveUrl: raw.liveUrl || null,
        dr: raw.dr ? Number(raw.dr) : null,
        price: raw.price ? Number(raw.price) : 0,
        cost: raw.cost ? Number(raw.cost) : 0,
        assigneeId,
        workMonth: month,
        notes: raw.notes || null,
      });
      imported++;
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }

  return { imported, errors };
}
