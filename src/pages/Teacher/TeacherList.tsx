import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

interface DocumentFile {
  name: string;
  data: string;
  title: string;
}

interface Teacher {
  id: number;
  staffId: string;
  name: string;
  subject: string;
  department: string;
  contact: string;
  gender: string;
  address: string;
  aadhaarNumber?: string;
  lastExperience?: string;
  joiningDate: string;
  documents?: DocumentFile[];
}

export default function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTeachers = localStorage.getItem("teachers");
    if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
  }, []);

  const deptOptions = ["All Departments", ...new Set(teachers.map((t) => t.department))];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesName = teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      selectedDept === "All Departments" || teacher.department === selectedDept;
    return matchesName && matchesDept;
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      const updated = teachers.filter((t) => t.id !== id);
      setTeachers(updated);
      localStorage.setItem("teachers", JSON.stringify(updated));
    }
  };

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
    Teacher List
  </h2>
        <button
          onClick={() => navigate("/add-teacher")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Teacher
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
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {deptOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Staff ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-3">{teacher.staffId}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {teacher.name}
                  </td>
                  <td className="px-6 py-3">{teacher.subject}</td>
                  <td className="px-6 py-3">{teacher.department}</td>
                  <td className="px-6 py-3 flex justify-center gap-3 text-lg">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="text-green-600 hover:text-green-800"
                    >
                      👁 View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-teacher/${teacher.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6 italic">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl relative">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✖
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-blue-700 border-b pb-2">
              {selectedTeacher.name}'s Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Staff ID:</strong> {selectedTeacher.staffId}
              </p>
              <p>
                <strong>Subject:</strong> {selectedTeacher.subject}
              </p>
              <p>
                <strong>Department:</strong> {selectedTeacher.department}
              </p>
              <p>
                <strong>Contact:</strong> {selectedTeacher.contact}
              </p>
              <p>
                <strong>Gender:</strong> {selectedTeacher.gender}
              </p>
              <p>
                <strong>Joining Date:</strong> {selectedTeacher.joiningDate}
              </p>
              <p>
                <strong>Last Experience:</strong>{" "}
                {selectedTeacher.lastExperience || "N/A"}
              </p>
              <p>
                <strong>Aadhaar:</strong>{" "}
                {selectedTeacher.aadhaarNumber || "N/A"}
              </p>
              <p className="col-span-2">
                <strong>Address:</strong> {selectedTeacher.address}
              </p>

              {selectedTeacher.documents && selectedTeacher.documents.length > 0 && (
                <div className="col-span-2 mt-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    📎 Uploaded Documents
                  </h3>
                  <div className="space-y-2">
                    {selectedTeacher.documents.map((doc, index) => (
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