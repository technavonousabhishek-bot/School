import { useNavigate } from "react-router-dom";
import { FaChalkboardTeacher } from "react-icons/fa";
import { classes } from "../../data/classesData";

export default function ClassesDashboard() {
  const navigate = useNavigate();

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaChalkboardTeacher className="text-blue-600" /> Classes Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            onClick={() => navigate(`/classes/${cls.id}`)}
            className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg cursor-pointer transition"
          >
            <h2 className="text-xl font-semibold text-blue-700">
              Class {cls.name} - {cls.section}
            </h2>
            <p className="text-gray-600 mt-2">
              <strong>Teacher:</strong> {cls.teacher}
            </p>
            <p className="text-gray-600">
              <strong>Students:</strong> {cls.studentsCount}/{cls.maxSeats}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
