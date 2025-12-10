import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SelectExamPage() {
  const navigate = useNavigate();
  const [examList, setExamList] = useState<string[]>([]); // user added exams
  const [newExam, setNewExam] = useState("");   // input field
  const [selectedExam, setSelectedExam] = useState("");

  const handleAddExam = () => {
    if (!newExam.trim()) return;
    setExamList([...examList, newExam.trim()]);
    setNewExam("");
  };

  const handleDeleteExam = (exam: string) => {
    setExamList(examList.filter(e => e !== exam));
    if (selectedExam === exam) setSelectedExam("");
  };

  const handleNext = () => {
    if (!selectedExam) return alert("Please select an exam first!");
    navigate(`/exams/add-exams/select-class?exam=${selectedExam}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Select Exam</h1>

      <div className="bg-white shadow-md p-6 rounded-lg max-w-lg">
        <label className="block mb-2 font-medium">Add / Select Exam</label>

        {/* Input to add new exam */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter exam name"
            value={newExam}
            onChange={(e) => setNewExam(e.target.value)}
            className="border p-2 rounded-md flex-1"
          />
          <button
            onClick={handleAddExam}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>

        {/* List of exams */}
        {examList.length > 0 && (
          <div className="mb-4">
            {examList.map((exam, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border p-2 rounded mb-2"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="selectedExam"
                    value={exam}
                    checked={selectedExam === exam}
                    onChange={() => setSelectedExam(exam)}
                  />
                  {exam}
                </label>
                <button
                  onClick={() => handleDeleteExam(exam)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate("/exams")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
