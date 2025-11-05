import { useNavigate } from "react-router-dom";
import { Calendar, BarChart2 } from "lucide-react";
import type { ResultType } from "./ResultForm";

interface ResultCardProps {
  result: ResultType;
}

export default function ResultCard({ result }: ResultCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {result.className} - {result.examType}
        </h2>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar size={16} /> {result.date}
        </span>
      </div>

      <div className="text-gray-700 mb-3">
        <p>Total Students: <span className="font-semibold">{result.totalStudents}</span></p>
        <p>Average Score: <span className="font-semibold">{result.averageScore}%</span></p>
      </div>

      <button
        onClick={() => navigate(`/results/${result.id}`)}
        className="flex items-center gap-2 mt-3 text-blue-600 font-medium hover:underline"
      >
        <BarChart2 size={18} /> View Details
      </button>
    </div>
  );
}
