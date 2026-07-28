export type UserRole = "admin" | "staff";

export type LinkStatus =
  | "queued"
  | "in_progress"
  | "published"
  | "live"
  | "lost";

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
};

export type Client = {
  id: string;
  name: string;
  website: string | null;
  packageName: string | null;
  monthlyFee: number;
  startDate: string | null;
  active: boolean;
  notes: string | null;
};

export type LinkTask = {
  id: string;
  clientId: string;
  clientName?: string;
  targetUrl: string | null;
  siteDomain: string | null;
  linkType: string | null;
  status: LinkStatus;
  liveUrl: string | null;
  dr: number | null;
  price: number;
  cost: number;
  assigneeId: string | null;
  assigneeName?: string | null;
  workMonth: string;
  notes: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  month: string;
  amount: number;
  label: string;
  createdBy: string | null;
  createdAt: string;
};

export type AppSettings = {
  timezone: string;
  currency: string;
};

export type MonthPnL = {
  month: string;
  revenue: number;
  taskCosts: number;
  expenses: number;
  profit: number;
  byClient: { clientId: string; clientName: string; revenue: number; cost: number; profit: number }[];
  byStaff: { userId: string; userName: string; publishedCount: number; revenue: number; cost: number }[];
};

export const LINK_STATUSES: LinkStatus[] = [
  "queued",
  "in_progress",
  "published",
  "live",
  "lost",
];

export const STATUS_LABELS: Record<LinkStatus, string> = {
  queued: "Queued",
  in_progress: "In progress",
  published: "Published",
  live: "Live",
  lost: "Lost",
};
