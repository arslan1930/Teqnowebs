export type AttendanceEventType = "check_in" | "check_out";

export type StaffProfile = {
  id: string;
  email: string;
  fullName: string;
};

export type AttendanceEvent = {
  id: string;
  userId: string;
  type: AttendanceEventType;
  createdAt: string;
  note?: string | null;
};

export type DayStatus = {
  checkedIn: boolean;
  checkedOut: boolean;
  lastEvent: AttendanceEvent | null;
};
