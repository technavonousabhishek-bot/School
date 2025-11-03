import { useState } from "react";
import { useParams } from "react-router-dom";
import { students } from "./data";
import AttendanceDetailsModal from "./AttendanceDetailsModal";

export default function StudentList() {
  const { className } = useParams();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[number] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredStudents = students.filter(
    (stu) =>
      stu.class === className &&
      (stu.name.toLowerCase().includes(search.toLowerCase()) ||
        stu.enrollmentNo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        {className} — Attendance
      </h1>

      {/* Search and Export Controls */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or enrollment no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-md w-1/2 shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export Excel
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Father’s Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Section</th>
              <th className="p-3">Enrollment No</th>
              <th className="p-3 text-center">Attendance %</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((stu, index) => (
              <tr key={stu.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{stu.name}</td>
                <td className="p-3">{stu.fatherName}</td>
                <td className="p-3">{stu.class}</td>
                <td className="p-3">{stu.section}</td>
                <td className="p-3">{stu.enrollmentNo}</td>

                {/* Color coded attendance */}
                <td
                  className={`p-3 text-center font-semibold ${
                    stu.attendance >= 75
                      ? "text-green-600"
                      : stu.attendance >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {stu.attendance}%
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedStudent(stu);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  No students found for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <AttendanceDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        student={selectedStudent}
      />
    </main>
  );
}
