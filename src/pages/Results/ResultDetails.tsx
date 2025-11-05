import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

interface SubjectMark {
  subject: string;
  marks: number;
  total: number;
}

interface ResultDetailsData {
  id: number;
  className: string;
  examType: string;
  date: string;
  subjects: SubjectMark[];
}

export default function ResultDetails() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState<ResultDetailsData | null>(null);

  useEffect(() => {
    // 🧠 Dummy data for now (later fetch from API)
    const dummyData: ResultDetailsData = {
      id: Number(examId),
      className: "Class 10 - A",
      examType: "Mid Term",
      date: "2025-08-15",
      subjects: [
        { subject: "Mathematics", marks: 85, total: 100 },
        { subject: "Science", marks: 78, total: 100 },
        { subject: "English", marks: 90, total: 100 },
        { subject: "Social Studies", marks: 82, total: 100 },
        { subject: "Hindi", marks: 88, total: 100 },
      ],
    };

    setResultData(dummyData);
  }, [examId]);

  if (!resultData) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  // 🧮 Calculate totals
  const totalMarks = resultData.subjects.reduce((sum, s) => sum + s.marks, 0);
  const totalOutOf = resultData.subjects.reduce((sum, s) => sum + s.total, 0);
  const percentage = ((totalMarks / totalOutOf) * 100).toFixed(2);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={22} /> Result Details
        </h1>
      </div>

      {/* Basic Info */}
      <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 mb-6">
        <p><strong>Class:</strong> {resultData.className}</p>
        <p><strong>Exam Type:</strong> {resultData.examType}</p>
        <p><strong>Date:</strong> {resultData.date}</p>
      </div>

      {/* Subject Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-200">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3">Out Of</th>
              <th className="px-4 py-3">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {resultData.subjects.map((s, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition-all duration-200"
              >
                <td className="px-4 py-2 font-medium text-gray-800">{s.subject}</td>
                <td className="px-4 py-2 text-gray-700">{s.marks}</td>
                <td className="px-4 py-2 text-gray-700">{s.total}</td>
                <td className="px-4 py-2 text-gray-700">
                  {((s.marks / s.total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3">{totalMarks}</td>
              <td className="px-4 py-3">{totalOutOf}</td>
              <td className="px-4 py-3">{percentage}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-xl font-medium shadow-sm">
        🎯 Overall Percentage: {percentage}% — {Number(percentage) >= 33 ? "Passed ✅" : "Failed ❌"}
      </div>
    </div>
  );
}
