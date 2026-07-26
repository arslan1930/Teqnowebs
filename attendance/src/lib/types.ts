export type AttendanceEventType = "check_in" | "check_out";
export type StaffRole = "admin" | "staff";
export type StaffGroup = "female" | "male";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type PunchStatus =
  | "on_time"
  | "late"
  | "holiday"
  | "on_leave"
  | "missing_checkout"
  | "absent"
  | "none";

export type StaffProfile = {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  staffGroup: StaffGroup;
  active: boolean;
};

export type AttendanceEvent = {
  id: string;
  userId: string;
  type: AttendanceEventType;
  createdAt: string;
  note?: string | null;
  clientIp?: string | null;
  isManual?: boolean;
  editedBy?: string | null;
};

export type DayStatus = {
  checkedIn: boolean;
  checkedOut: boolean;
  lastEvent: AttendanceEvent | null;
  punchStatus: PunchStatus;
  message: string;
};

export type OfficeTiming = {
  staffGroup: StaffGroup;
  startTime: string; // HH:MM
  endTime: string;
  lateAfterMinutes: number;
};

export type CompanyHoliday = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  note?: string | null;
};

export type LeaveRequest = {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  reason?: string | null;
  status: LeaveStatus;
  createdAt: string;
};

export type RosterRow = {
  profile: StaffProfile;
  checkedIn: boolean;
  checkedOut: boolean;
  punchStatus: PunchStatus;
  checkInAt?: string | null;
  onLeave: boolean;
  isHoliday: boolean;
};

export type AppSettings = {
  timezone: string;
  allowedIps: string[];
};

export type DayAttendanceRow = {
  date: string;
  userId: string;
  userName: string;
  staffGroup: StaffGroup;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInIp: string | null;
  checkOutIp: string | null;
  status: PunchStatus;
  note: string | null;
  isManual: boolean;
};

export const GROUP_LABELS: Record<StaffGroup, string> = {
  female: "Female staff",
  male: "Male staff",
};

export const DEFAULT_TIMEZONE = "Asia/Karachi";
