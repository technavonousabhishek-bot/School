import { useEffect, useState } from "react";
import { reportCardApi, examApi } from "../../api/exams";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type ReportCard = {
  id: number;
  student: number;
  student_name: string;
  exam: number;
  exam_details: any;
  grades: Array<{
    subject_name: string;
    marks_obtained: number;
    max_marks: number;
    percentage: number;
    grade: string;
  }>;
  total_marks: number;
  obtained_marks: number;
  overall_percentage: number;
  overall_grade: string;
  rank?: number;
};

export default function ManageResults() {
  const [mode, setMode] = useState<"home" | "list" | "view">("home");
  const [results, setResults] = useState<ReportCard[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [examList, setExamList] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [viewItem, setViewItem] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (mode === "list") {
      fetchResults();
    }
  }, [mode, filterClass, filterExam]);

  const loadAllData = async () => {
    try {
      // Fetch classes
      const classRes = await axios.get(`${API_BASE}/schoolApp/classes/`);
      setClassList(classRes.data || []);

      // Fetch exams
      const examRes = await examApi.getExams();
      setExamList(examRes || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filterClass) params.class = filterClass;
      if (filterExam) params.exam = filterExam;

      const data = await reportCardApi.getReportCards(params);
      setResults(data || []);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => {
    const item = results.find((r) => r.id === id) || null;
    setViewItem(item);
    setMode("view");
  };

  const visibleResults = results;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Manage Results</h1>

      {/* Home */}
      {mode === "home" && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setMode("list")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            📋 View Results
          </button>
        </div>
      )}

      {/* List */}
      {mode === "list" && (
        <div className="max-w-6xl mx-auto mt-4">
          <div className="flex gap-3 mb-4 flex-wrap">
            <button
              onClick={() => setMode("home")}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              ← Back
            </button>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Classes</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name} {c.section || ""}
                </option>
              ))}
            </select>

            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Exams</option>
              {examList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} - {e.exam_type}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setFilterClass("");
                setFilterExam("");
              }}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>

            <button
              onClick={fetchResults}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">Loading results...</div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-2 border">Exam</th>
                    <th className="p-2 border">Student</th>
                    <th className="p-2 border">Total Marks</th>
                    <th className="p-2 border">Obtained</th>
                    <th className="p-2 border">%</th>
                    <th className="p-2 border">Grade</th>
                    <th className="p-2 border">Rank</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleResults.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 border">
                        {r.exam_details?.name || `Exam #${r.exam}`}
                      </td>
                      <td className="p-2 border">{r.student_name}</td>
                      <td className="p-2 border">{r.total_marks}</td>
                      <td className="p-2 border">{r.obtained_marks}</td>
                      <td className="p-2 border">{r.overall_percentage}%</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded ${r.overall_grade === "A+" || r.overall_grade === "A"
                              ? "bg-green-100 text-green-800"
                              : r.overall_grade === "B"
                                ? "bg-blue-100 text-blue-800"
                                : r.overall_grade === "C"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                        >
                          {r.overall_grade}
                        </span>
                      </td>
                      <td className="p-2 border">
                        {r.rank ? `#${r.rank}` : "-"}
                      </td>
                      <td className="p-2 border">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(r.id)}
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleResults.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-500">
                        No results found. Marks need to be entered first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View */}
      {mode === "view" && viewItem && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow mt-4">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-semibold">Result Details</h3>
            <button
              onClick={() => setMode("list")}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Back
            </button>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <b>Exam:</b> {viewItem.exam_details?.name || `Exam #${viewItem.exam}`}
              </div>
              <div>
                <b>Student:</b> {viewItem.student_name}
              </div>
              <div>
                <b>Overall Percentage:</b> {viewItem.overall_percentage}%
              </div>
              <div>
                <b>Overall Grade:</b>{" "}
                <span className="font-bold text-lg">{viewItem.overall_grade}</span>
              </div>
              {viewItem.rank && (
                <div>
                  <b>Rank:</b> #{viewItem.rank}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Subject-wise Marks</h4>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Subject</th>
                  <th className="p-2 border">Obtained</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">%</th>
                  <th className="p-2 border">Grade</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.grades?.map((g, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{g.subject_name}</td>
                    <td className="p-2 border">{g.marks_obtained}</td>
                    <td className="p-2 border">{g.max_marks}</td>
                    <td className="p-2 border">{g.percentage}%</td>
                    <td className="p-2 border">{g.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 font-medium text-lg border-t pt-4">
            Total: {viewItem.obtained_marks}/{viewItem.total_marks} |{" "}
            {viewItem.overall_percentage}% | Grade: {viewItem.overall_grade}
          </div>
        </div>
      )}
    </div>
  );
}