// src/pages/ExamsResults/ExamsResultsHome.tsx
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaChartBar } from "react-icons/fa";

export default function ExamsResultsHome() {
  const navigate = useNavigate();

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-700">
        Exams & Results Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
        {/* Manage Exam Card */}
        <div
          onClick={() => navigate("/manage-exams")}
          className="bg-white shadow-md rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-300"
        >
          <FaFileAlt size={60} className="text-blue-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Manage Exams
          </h2>
          <p className="text-gray-500 mt-2 text-center">
            Create, update, and view exam schedules.
          </p>
        </div>

        {/* Manage Result Card */}
        <div
          onClick={() => navigate("/manage-results")}
          className="bg-white shadow-md rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-300"
        >
          <FaChartBar size={60} className="text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Manage Results
          </h2>
          <p className="text-gray-500 mt-2 text-center">
            Enter, view, and update student results.
          </p>
        </div>
      </div>
    </div>
  );
}

