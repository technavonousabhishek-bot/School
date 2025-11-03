// noticeData.ts
export type Audience = "students" | "teachers";

export type Notice = {
  id: number;
  title: string;
  description: string;
  audience: Audience;
  className?: string; // present when audience === 'students'
  applicableDate?: string; // yyyy-mm-dd
  validTill?: string | null;
  applicableTo?: string[]; // list of student enrollment nos or names (optional)
  postedBy: string;
  createdAt: string; // ISO date
};

export const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

let _nextId = 100;

// initial mock notices
export let notices: Notice[] = [
  {
    id: 1,
    title: "Diwali Holiday",
    description: "School will remain closed on 1st Nov due to Diwali.",
    audience: "students",
    className: undefined, // => whole school (or we treat undefined as all classes)
    applicableDate: "2025-11-01",
    validTill: "2025-11-02",
    applicableTo: [],
    postedBy: "Principal",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "PTM - Class 2",
    description: "Parent-teacher meeting for Class 2 on 5th Nov.",
    audience: "students",
    className: "Class 2",
    applicableDate: "2025-11-05",
    validTill: null,
    applicableTo: [],
    postedBy: "Class 2 Teacher",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Staff Meeting",
    description: "All teachers meet in staffroom at 9:00 AM on Monday.",
    audience: "teachers",
    postedBy: "Principal",
    createdAt: new Date().toISOString(),
  },
];

// helpers to manage notices in-memory (mocking persistence)
export function addNotice(n: Omit<Notice, "id" | "createdAt">): Notice {
  const notice: Notice = { ...n, id: _nextId++, createdAt: new Date().toISOString() };
  notices = [notice, ...notices];
  return notice;
}

export function updateNotice(id: number, update: Partial<Notice>): Notice | null {
  const idx = notices.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  notices[idx] = { ...notices[idx], ...update };
  return notices[idx];
}

export function deleteNotice(id: number): boolean {
  const before = notices.length;
  notices = notices.filter((n) => n.id !== id);
  return notices.length < before;
}

export function getNoticesForAudience(audience: Audience, className?: string) {
  if (audience === "teachers") return notices.filter((n) => n.audience === "teachers");
  // students
  // If a specific class is requested, include notices targeted to that class
  // as well as notices with undefined `className` (meaning "all classes").
  if (className) {
    return notices.filter(
      (n) => n.audience === "students" && (n.className === undefined || n.className === className)
    );
  }

  // No specific class requested — return all student notices
  return notices.filter((n) => n.audience === "students");
}
