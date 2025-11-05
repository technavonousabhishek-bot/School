import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

export default function AttendanceLanding() {
  const navigate = useNavigate();

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Attendance</h1>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div
          onClick={() => navigate("/attendance/students")}
          className="p-8 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer text-center transition"
        >
          <FaUserGraduate className="text-blue-600 text-4xl mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Manage Students</h3>
          <p className="text-gray-500 text-sm">Manage attendance for students across classes</p>
        </div>

        <div
          onClick={() => navigate("/attendance/teachers")}
          className="p-8 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer text-center transition"
        >
          <FaChalkboardTeacher className="text-green-600 text-4xl mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Manage Teachers</h3>
          <p className="text-gray-500 text-sm">Manage attendance for teaching staff</p>
        </div>
      </div>
    </main>
  );
}
