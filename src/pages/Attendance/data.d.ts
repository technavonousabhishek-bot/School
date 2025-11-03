export interface ClassItem { id: number; name: string }
export interface StudentItem { id: number; name: string; fatherName: string; class: string; section: string; cno: string; enrollmentNo: string; attendance: number }
export const classes: ClassItem[];
export const students: StudentItem[];
export const attendanceRecords: Record<string, { weekly: number[]; monthly: number[]; yearly: { present: number; total: number } }>;
