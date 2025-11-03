import { useEffect, useState } from "react";

interface Student {
  id: number;
  enrollmentNo: string;
  name: string;
  class: string;
  fatherName: string;
  contact: string;
  age: number;
  gender: string;
  address: string;
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetch("/students.json")
      .then((res) => res.json())
      .then((data: any[]) =>
        setStudents(
          data.map((d) => ({
            id: d.id,
            enrollmentNo: d.admissionNo ?? d.enrollmentNo ?? "",
            name: d.name,
            class: d.class,
            fatherName: d.fatherName,
            contact: d.contact,
            age: d.age,
            gender: d.gender,
            address: d.address,
          }))
        )
      )
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  const classOptions = [
    "All Classes",
    ...new Set(students.map((s) => s.class)),
  ];

  const filteredStudents = students.filter((student) => {
    const matchesName = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "All Classes" || student.class === selectedClass;
    return matchesName && matchesClass;
  });

  // Edit
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  // Save edit
  const handleSave = () => {
    if (!editingStudent) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
    );
    setIsModalOpen(false);
  };

  // Delete
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Student List</h2>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring focus:ring-blue-200"
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
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Enrollment No</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Father's Name</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Age</th>
              <th className="px-6 py-3">Gender</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{student.enrollmentNo}</td>
                  <td className="px-6 py-3">{student.name}</td>
                  <td className="px-6 py-3">{student.class}</td>
                  <td className="px-6 py-3">{student.fatherName}</td>
                  <td className="px-6 py-3">{student.contact}</td>
                  <td className="px-6 py-3">{student.age}</td>
                  <td className="px-6 py-3">{student.gender}</td>
                  <td className="px-6 py-3">{student.address}</td>
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
                  colSpan={9}
                  className="text-center text-gray-500 py-6 italic"
                >
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Student</h3>

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
                value={editingStudent.fatherName}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    fatherName: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Father's Name"
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
              <input
                type="number"
                value={editingStudent.age}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    age: Number(e.target.value),
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Age"
              />
              <input
                type="text"
                value={editingStudent.gender}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    gender: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Gender"
              />
              <input
                type="text"
                value={editingStudent.address}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    address: e.target.value,
                  })
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Address"
              />
            </div>

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
