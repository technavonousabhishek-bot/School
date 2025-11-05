import { useState } from "react";
import  ResultForm from "./ResultForm";
import ResultCard from "./ResultCard";

interface ResultType {
  id: number;
  className: string;
  examType: string;
  totalStudents: number;
  averageScore: number;
  date: string;
}

export default function ManageResults() {
  const [results, setResults] = useState<ResultType[]>([
    {
      id: 1,
      className: "Class 10 - A",
      examType: "Mid Term",
      totalStudents: 45,
      averageScore: 78,
      date: "2025-10-15",
    },
    {
      id: 2,
      className: "Class 9 - B",
      examType: "Annual Exam",
      totalStudents: 40,
      averageScore: 82,
      date: "2025-03-25",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const handleAddResult = (newResult: Partial<ResultType>) => {
    setResults((prev) => [
      ...prev,
      { ...(newResult as ResultType), id: prev.length + 1 },
    ]);
    setShowForm(false);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Manage Results</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          ➕ Add Result
        </button>
      </div>

      {/* Result List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>

      {/* Add Result Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <ResultForm onSubmit={handleAddResult} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
