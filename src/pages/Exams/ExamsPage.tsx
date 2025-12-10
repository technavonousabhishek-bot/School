import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaFileAlt } from "react-icons/fa";

export default function ExamsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-6">Exams & Grades Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ===========================
            CARD 1 - ADD MARKS
        ============================ */}
        <div
          className="cursor-pointer bg-white shadow-lg p-6 rounded-xl border hover:shadow-xl transition"
          onClick={() => navigate("/exams/add-exams")}
        >
          <div className="flex items-center gap-4">
            <FaClipboardList size={40} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Add Marks</h2>
              <p className="text-gray-600">
                Enter marks exam-wise for each class and student.
              </p>
            </div>
          </div>
        </div>

        {/* ===========================
            CARD 2 - RESULTS / REPORT CARD
        ============================ */}
        <div
          className="cursor-pointer bg-white shadow-lg p-6 rounded-xl border hover:shadow-xl transition"
          onClick={() => navigate("/exams/results")}
        >
          <div className="flex items-center gap-4">
            <FaFileAlt size={40} className="text-green-600" />
            <div>
              <h2 className="text-xl font-semibold">View Results</h2>
              <p className="text-gray-600">
                Generate report cards exam-wise & class-wise.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
