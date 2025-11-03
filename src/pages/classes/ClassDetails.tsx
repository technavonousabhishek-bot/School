import { useParams, useNavigate } from "react-router-dom";
import { getClassById } from "../../data/classesData";

export default function ClassDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const classId = Number(id);
  const classRecord = isNaN(classId) ? null : getClassById(classId);

  if (!classRecord) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="text-gray-600">Class not found.</div>
          <button onClick={() => navigate(-1)} className="mt-4 px-3 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </main>
    );
  }

  // Example students and subjects (could come from backend per-class)
  const students = Array.from({ length: classRecord.studentsCount }).map((_, i) => ({
    name: `Student ${i + 1}`,
    enrollmentNo: `ENR${String(i + 1).padStart(3, "0")}`,
  }));

  const subjects = ["Maths", "Science", "English", "Social Studies", "Hindi"];

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          Class {classRecord.name} - Section {classRecord.section}
        </h2>
        <p className="text-gray-600 mb-4">
          <strong>Class Teacher:</strong> {classRecord.teacher}
          <br />
          <strong>Maximum Seats:</strong> {classRecord.maxSeats}
          <br />
          <strong>Current Students:</strong> {classRecord.studentsCount}
        </p>

        {/* Students List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Students</h3>
          <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Enrollment No</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={index}
                  className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
                >
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3">{student.name}</td>
                  <td className="py-2 px-3">{student.enrollmentNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subjects */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Subjects</h3>
          <ul className="list-disc pl-6 text-gray-700">
            {subjects.map((subject, i) => (
              <li key={i}>{subject}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
