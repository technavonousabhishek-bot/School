// src/pages/Homework/Homework.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SchoolClass {
  name: string;
  section: string;
  boardType: string[];
  capacity: number;
  location: string;
  maxSeats: number;
  subjects: string[];
  studentCount: number;
  facilities: string[];
  ratio: string;
}

export default function Homework() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("classes_data_v1");
    if (stored) {
      try {
        setClasses(JSON.parse(stored));
        return;
      } catch {}
    }

    (async () => {
      try {
        const res = await fetch("/classes.json");
        const data = await res.json();
        const normalized: SchoolClass[] = data.map((d: any) => ({
          name: d.name,
          section: d.section,
          boardType: d.board_type || d.boardType || [],
          capacity: d.capacity ?? 0,
          maxSeats: d.max_seats ?? d.maxSeats ?? 0,
          subjects: d.subjects || [],
          studentCount: d.student_count ?? d.studentCount ?? 0,
          facilities: d.facilities || [],
          location: d.location || "",
          ratio: d.student_teacher_ratio || d.ratio || "",
        }));
        setClasses(normalized);
        localStorage.setItem("classes_data_v1", JSON.stringify(normalized));
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    })();
  }, []);

  const sectionOptions = [
    "All Sections",
    ...Array.from(new Set(classes.map((c) => c.section))),
  ];

  const filteredClasses = classes.filter((cls) => {
    const matchesName = cls.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSection =
      selectedSection === "All Sections" || cls.section === selectedSection;
    return matchesName && matchesSection;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Homework</h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Class Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring focus:ring-blue-200"
          />
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          >
            {sectionOptions.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls, idx) => (
            <div
              key={idx}
              onClick={() =>
                navigate(
                  `/homework/${encodeURIComponent(cls.name)}_${encodeURIComponent(
                    cls.section
                  )}`
                )
              }
              className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-700 font-semibold text-lg">
                  {cls.name}
                </h3>
                <span className="text-sm text-gray-500">
                  Section {cls.section}
                </span>
              </div>
              <p className="text-sm text-gray-500">{cls.location}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-6 italic">
            No classes found.
          </div>
        )}
      </div>
    </div>
  );
}
