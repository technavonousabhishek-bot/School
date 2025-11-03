// src/pages/Attendance/data.js

// 🔹 All available classes
export const classes = [
  { id: 1, name: "Class 1A" },
  { id: 2, name: "Class 1B" },
  { id: 3, name: "Class 2A" },
  { id: 4, name: "Class 2B" },
  { id: 5, name: "Class 3A" },
];

// 🔹 Students list (mock)
export const students = [
  {
    id: 1,
    name: "Aarav Singh",
    fatherName: "Rajesh Singh",
    class: "Class 1A",
    section: "A",
    cno: "001",
    enrollmentNo: "2025-101",
    attendance: 95,
  },
  {
    id: 2,
    name: "Priya Patel",
    fatherName: "Manish Patel",
    class: "Class 1A",
    section: "A",
    cno: "002",
    enrollmentNo: "2025-102",
    attendance: 72,
  },
  {
    id: 3,
    name: "Rohan Mehta",
    fatherName: "Suresh Mehta",
    class: "Class 1A",
    section: "A",
    cno: "003",
    enrollmentNo: "2025-103",
    attendance: 88,
  },
];

// 🔹 Attendance records for charts (weekly, monthly, yearly)
export const attendanceRecords = {
  "Aarav Singh": {
    weekly: [1, 1, 1, 0, 1, 1, 0], // 1 = present, 0 = absent
    monthly: [20, 18, 22, 19, 25, 21, 23, 22, 24, 26],
    yearly: { present: 185, total: 220 },
  },
  "Priya Patel": {
    weekly: [1, 0, 0, 1, 1, 0, 1],
    monthly: [15, 14, 18, 12, 20, 17, 15, 18, 20, 21],
    yearly: { present: 168, total: 220 },
  },
  "Rohan Mehta": {
    weekly: [1, 1, 1, 1, 1, 1, 1],
    monthly: [22, 24, 25, 23, 26, 25, 26, 27, 28, 29],
    yearly: { present: 198, total: 220 },
  },
};
