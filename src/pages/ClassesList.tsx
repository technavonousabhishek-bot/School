import { useEffect, useState } from "react";

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

export default function ClassesList() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("All Sections");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("classes_data_v1");
    if (stored) {
      try {
        setClasses(JSON.parse(stored));
        return;
      } catch {
        // fallthrough
      }
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
        try {
          localStorage.setItem("classes_data_v1", JSON.stringify(normalized));
        } catch {}
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

  const handleEdit = (cls: SchoolClass) => {
    setEditingClass({ ...cls });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingClass) return;
    setClasses((prev) => {
      const next = prev.map((c) =>
        c.name === editingClass.name && c.section === editingClass.section
          ? editingClass
          : c
      );
      try {
        localStorage.setItem("classes_data_v1", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not persist classes:", e);
      }
      return next;
    });
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleDelete = (cls: SchoolClass) => {
    if (
      !confirm(`Are you sure you want to delete ${cls.name} (${cls.section})?`)
    )
      return;
    setClasses((prev) => {
      const next = prev.filter(
        (c) => !(c.name === cls.name && c.section === cls.section)
      );
      try {
        localStorage.setItem("classes_data_v1", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not persist classes:", e);
      }
      return next;
    });
    if (
      editingClass &&
      editingClass.name === cls.name &&
      editingClass.section === cls.section
    ) {
      setIsModalOpen(false);
      setEditingClass(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Classroom List</h2>

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
          filteredClasses.map((cls, idx) => {
            const raw = String(cls.name || "").trim();
            const displayName = /^\d+$/.test(raw) ? `Class ${raw}` : raw || "Unnamed";
            return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => handleEdit(cls)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleEdit(cls);
              }}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-700 font-semibold text-lg">
                  {displayName}
                </h3>
                <span className="text-sm text-gray-500">
                  Section {cls.section}
                </span>
              </div>

              <p className="text-sm text-gray-500">{cls.location}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-3 text-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(cls);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Edit ${cls.name} ${cls.section}`}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cls);
                    }}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Delete ${cls.name} ${cls.section}`}
                  >
                    🗑️
                  </button>
                </div>

                <div />
              </div>
            </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-6 italic">
            No classes found.
          </div>
        )}
      </div>

      {isModalOpen && editingClass && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center overflow-auto p-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-2">Edit Class</h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Class</label>
              <input
                type="text"
                value={editingClass.name}
                onChange={(e) =>
                  setEditingClass({ ...editingClass, name: e.target.value })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Class Name"
              />

              <label className="text-sm font-medium text-gray-700">
                Section
              </label>
              <input
                type="text"
                value={editingClass.section}
                onChange={(e) =>
                  setEditingClass({ ...editingClass, section: e.target.value })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Section"
              />

              <label className="text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={editingClass.location}
                onChange={(e) =>
                  setEditingClass({ ...editingClass, location: e.target.value })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Location"
              />

              <label className="text-sm font-medium text-gray-700">
                Board types
              </label>
              <input
                type="text"
                value={editingClass.boardType.join(", ")}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    boardType: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Board types (comma separated)"
              />

              <label className="text-sm font-medium text-gray-700">
                Subjects
              </label>
              <input
                type="text"
                value={editingClass.subjects.join(", ")}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    subjects: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Subjects (comma separated)"
              />

              <label className="text-sm font-medium text-gray-700">
                Facilities
              </label>
              <input
                type="text"
                value={editingClass.facilities.join(", ")}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    facilities: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Facilities (comma separated)"
              />

              <label className="text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                type="number"
                value={editingClass.capacity}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    capacity: Number(e.target.value) || 0,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Capacity"
              />

              <label className="text-sm font-medium text-gray-700">
                Max seats
              </label>
              <input
                type="number"
                value={editingClass.maxSeats}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    maxSeats: Number(e.target.value) || 0,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Max seats"
              />

              <label className="text-sm font-medium text-gray-700">
                Student count
              </label>
              <input
                type="number"
                value={editingClass.studentCount}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    studentCount: Number(e.target.value) || 0,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Student count"
              />

              <label className="text-sm font-medium text-gray-700">
                Student-teacher ratio
              </label>
              <input
                type="text"
                value={editingClass.ratio}
                onChange={(e) =>
                  setEditingClass({ ...editingClass, ratio: e.target.value })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Student-teacher ratio"
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClass(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
