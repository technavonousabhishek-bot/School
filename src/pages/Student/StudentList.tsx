import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

interface DocumentFile {
  name: string;
  data: string; // Base64 ya file URL
  title: string;
}

interface Student {
  id: number;
  enrollmentNo: string;
  name: string;
  class: string;
  section: string;
  fatherName: string;
  contact: string;
  age: number;
  gender: string;
  address: string;
  admissionDate: string;
  aadhaarNumber?: string;
  documents?: DocumentFile[];
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) setStudents(JSON.parse(storedStudents));
  }, []);

  const classOptions = ["All Classes", ...new Set(students.map((s) => s.class))];

  const filteredStudents = students.filter((student) => {
    const matchesName = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "All Classes" || student.class === selectedClass;
    return matchesName && matchesClass;
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      localStorage.setItem("students", JSON.stringify(updated));
    }
  };

  // ✅ Fixed Download Function — Works for Base64 PDFs & Images both
  const handleDownload = (file: DocumentFile) => {
    try {
      const link = document.createElement("a");
      link.href = file.data.startsWith("data:")
        ? file.data
        : URL.createObjectURL(new Blob([file.data]));
      link.download = file.name || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Unable to download the file.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
    <FaUserPlus className="text-blue-600" />
    Student List
  </h2>

        <button
          onClick={() => navigate("/add-student")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Student
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Enroll No</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Section</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-3">{student.enrollmentNo}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {student.name}
                  </td>
                  <td className="px-6 py-3">{student.class}</td>
                  <td className="px-6 py-3">{student.section}</td>
                  <td className="px-6 py-3 flex justify-center gap-3 text-lg">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-green-600 hover:text-green-800"
                    >
                      👁 View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-student/${student.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 py-6 italic"
                >
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✖
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-blue-700 border-b pb-2">
              {selectedStudent.name}'s Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Enrollment No:</strong> {selectedStudent.enrollmentNo}
              </p>
              <p>
                <strong>Class:</strong> {selectedStudent.class}
              </p>
              <p>
                <strong>Section:</strong> {selectedStudent.section}
              </p>
              <p>
                <strong>Father's Name:</strong> {selectedStudent.fatherName}
              </p>
              <p>
                <strong>Contact:</strong> {selectedStudent.contact}
              </p>
              <p>
                <strong>Age:</strong> {selectedStudent.age}
              </p>
              <p>
                <strong>Gender:</strong> {selectedStudent.gender}
              </p>
              <p>
                <strong>Admission Date:</strong>{" "}
                {selectedStudent.admissionDate}
              </p>
              <p className="col-span-2">
                <strong>Address:</strong> {selectedStudent.address}
              </p>

              {/* 📎 Uploaded Documents */}
              {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                <div className="col-span-2 mt-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    📎 Uploaded Documents
                  </h3>
                  <div className="space-y-2">
                    {selectedStudent.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                      >
                        <span className="truncate">
                          <strong>{doc.title}:</strong> {doc.name}
                        </span>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          ⬇ Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}