import { useEffect, useState } from "react";

// ✅ Define what a Student looks like
interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  subject: string;
  contact: string;
  address: string;
  gender: string;
  staffId?: string;
  department?: string;
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");

  // ✅ Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // teachers.json is in public/teachers.json — served at /teachers.json
    fetch("/teachers.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Student[]) => setStudents(data))
      .catch((err) => {
        console.error("Error fetching teachers:", err);
        setError(String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Filter controls
  const classOptions = [
    "All Classes",
    ...new Set(students.map((s) => s.class)),
  ];
  const filteredStudents = students.filter((student) => {
    const matchesName = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDept = departmentSearch
      ? (student.department ?? "")
          .toLowerCase()
          .includes(departmentSearch.toLowerCase())
      : true;
    const matchesClass =
      selectedClass === "All Classes" || student.class === selectedClass;
    return matchesName && matchesClass && matchesDept;
  });

  // ✅ Edit handler
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  // ✅ Save changes (locally)
  const handleSave = () => {
    if (!editingStudent) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
    );
    setIsModalOpen(false);
  };

  // ✅ Delete handler
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this Teacgher?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Teacher List</h2>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full sm:w-48 focus:outline-none focus:ring focus:ring-blue-200"
          />

          <input
            type="text"
            placeholder="Search by Department"
            value={departmentSearch}
            onChange={(e) => setDepartmentSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full sm:w-48 focus:outline-none focus:ring focus:ring-blue-200"
          />

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          >
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">
          Loading teachers...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          Error loading teachers: {error}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Staff ID</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Classes</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{student.name}</td>
                    <td className="px-6 py-3">{student.email}</td>
                    <td className="px-6 py-3">{student.staffId ?? "-"}</td>
                    <td className="px-6 py-3">{student.department ?? "-"}</td>
                    <td className="px-6 py-3">{student.class}</td>
                    <td className="px-6 py-3">{student.subject}</td>
                    <td className="px-6 py-3">{student.contact}</td>
                    <td className="px-6 py-3">{student.address}</td>
                    <td className="px-6 py-3">{student.gender}</td>
                    <td className="px-6 py-3 flex gap-3 text-lg">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-gray-500 py-6 italic"
                  >
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✏️ Edit Modal */}
      {isModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Student</h3>

            {/* Form fields */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editingStudent.name}
                onChange={(e) =>
                  setEditingStudent({ ...editingStudent, name: e.target.value })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Name"
              />
              <input
                type="email"
                value={editingStudent.email}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    email: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Email"
              />
              <input
                type="text"
                value={editingStudent.staffId ?? ""}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    staffId: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Staff ID"
              />
              <input
                type="text"
                value={editingStudent.department ?? ""}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    department: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Department"
              />
              <input
                type="text"
                value={editingStudent.class}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    class: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Class"
              />
              <input
                type="text"
                value={editingStudent.subject}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    subject: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Subject"
              />
              <input
                type="text"
                value={editingStudent.contact}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    contact: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Contact"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
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
