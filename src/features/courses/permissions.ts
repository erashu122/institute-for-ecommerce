export class CourseError extends Error {
  constructor(public code: "UNAUTHORIZED" | "FORBIDDEN" | "INVALID" | "CONFLICT" | "NOT_FOUND", message: string) {
    super(message);
  }
}

export function assertStaff(staff: { active: boolean; role: string } | null, publish = false) {
  if (!staff) throw new CourseError("UNAUTHORIZED", "Staff sign-in is required.");
  if (!staff.active || !["ADMIN", "EDITOR"].includes(staff.role) || (publish && staff.role !== "ADMIN")) {
    throw new CourseError("FORBIDDEN", "You do not have permission for this action.");
  }
}
