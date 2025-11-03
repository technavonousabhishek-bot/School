export type ClassInfo = {
  id: number;
  name: string;
  section: string;
  teacher: string;
  maxSeats: number;
  studentsCount: number;
};

export const classes: ClassInfo[] = [
  { id: 1, name: "Nursery", section: "A", teacher: "Mrs. Gupta", maxSeats: 30, studentsCount: 28 },
  { id: 2, name: "LKG", section: "A", teacher: "Mrs. Nair", maxSeats: 30, studentsCount: 27 },
  { id: 3, name: "UKG", section: "A", teacher: "Mr. Sinha", maxSeats: 30, studentsCount: 29 },
  { id: 4, name: "1", section: "A", teacher: "Mrs. Meena", maxSeats: 35, studentsCount: 33 },
  { id: 5, name: "2", section: "A", teacher: "Mr. Rajesh", maxSeats: 35, studentsCount: 32 },
  { id: 6, name: "3", section: "A", teacher: "Mrs. Kavita", maxSeats: 35, studentsCount: 34 },
  { id: 7, name: "4", section: "A", teacher: "Mr. Vinod", maxSeats: 35, studentsCount: 30 },
  { id: 8, name: "5", section: "A", teacher: "Mrs. Sunita", maxSeats: 35, studentsCount: 33 },
  { id: 9, name: "6", section: "A", teacher: "Mr. Sharma", maxSeats: 40, studentsCount: 38 },
  { id: 10, name: "7", section: "A", teacher: "Mrs. Ritu", maxSeats: 40, studentsCount: 37 },
  { id: 11, name: "8", section: "A", teacher: "Mr. Ashok", maxSeats: 40, studentsCount: 39 },
  { id: 12, name: "9", section: "A", teacher: "Mrs. Seema", maxSeats: 40, studentsCount: 38 },
  { id: 13, name: "10", section: "A", teacher: "Mr. Prakash", maxSeats: 45, studentsCount: 42 },
  { id: 14, name: "11", section: "A", teacher: "Mrs. Kiran", maxSeats: 45, studentsCount: 40 },
  { id: 15, name: "12", section: "A", teacher: "Mr. Iyer", maxSeats: 45, studentsCount: 41 },
];

export function getClassById(id: number) {
  return classes.find((c) => c.id === id) ?? null;
}
