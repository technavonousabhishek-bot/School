import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { examApi } from "../../api/exams";
import type { Exam } from "../../api/exams";
import { FaPlus, FaList, FaTimes } from "react-icons/fa";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

export default function SelectExamPage() {
  const navigate = useNavigate();
  const [examList, setExamList] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Manage Exams Modal State
  const [showManageExams, setShowManageExams] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [classes, setClasses] = useState<any[]>([]);
  const [, setCreatingExam] = useState(false);

  // FORM State (Create + Edit)
  const [formExam, setFormExam] = useState<Partial<Exam>>({
    name: "",
    exam_type: "unit_test",
    academic_year: new Date().getFullYear().toString(),
    term: "Term 1",
    exam_date: new Date().toISOString().split("T")[0],
    status: "upcoming",
    class_name: undefined,
  });

  // Fetch Exams
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const exams = await examApi.getExams();
      setExamList(exams);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      alert("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.school.classes);
      setClasses(res.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const openManageExams = () => {
    setShowManageExams(true);
    setViewMode("list");
    fetchClasses();
  };

  // CREATE / UPDATE
  const handleSaveExam = async () => {
    try {
      if (!formExam.name || !formExam.exam_date || !formExam.class_name) {
        alert("Please fill all required fields!");
        return;
      }

      setCreatingExam(true);

      if (formExam.id) {
        await examApi.updateExam(formExam.id, formExam);
        alert("Exam updated successfully!");
      } else {
        await examApi.createExam(formExam as Exam);
        alert("Exam created successfully!");
      }

      fetchExams();
      setViewMode("list");
      resetForm();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save exam.");
    } finally {
      setCreatingExam(false);
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      await examApi.deleteExam(id);
      alert("Exam deleted!");
      fetchExams();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const resetForm = () => {
    setFormExam({
      name: "",
      exam_type: "unit_test",
      academic_year: new Date().getFullYear().toString(),
      term: "Term 1",
      exam_date: new Date().toISOString().split("T")[0],
      status: "upcoming",
      class_name: undefined,
    });
  };

  const handleNext = () => {
    if (!selectedExam) return alert("Please select an exam first!");
    navigate(`/exams/add-exams/select-class?exam=${selectedExam.id}&examName=${selectedExam.name}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading exams...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Select Exam</h1>
        <button
          onClick={openManageExams}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FaList /> Manage Exams
        </button>
      </div>

      {/* Exam List */}
      <div className="bg-white shadow-md p-6 rounded-lg max-w-2xl">
        <label className="block mb-4 font-medium text-lg">Available Exams</label>

        {examList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No exams available.</div>
        ) : (
          <div className="space-y-2">
            {examList.map((exam) => (
              <div
                key={exam.id}
                className={`flex justify-between items-center border p-4 rounded-lg cursor-pointer transition ${
                  selectedExam?.id === exam.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
                onClick={() => setSelectedExam(exam)}
              >
                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedExam?.id === exam.id}
                    onChange={() => setSelectedExam(exam)}
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{exam.name}</div>
                    <div className="text-sm text-gray-600">
                      {exam.exam_type} • {exam.academic_year} • {exam.term}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => navigate("/exams")} className="px-4 py-2 bg-gray-200 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedExam}
            className={`px-8 py-2 rounded-md ${
              selectedExam ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Manage Exam Modal */}
      {showManageExams && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">
                {viewMode === "list" ? "All Exams" : formExam.id ? "Edit Exam" : "Create Exam"}
              </h3>
              <button onClick={() => setShowManageExams(false)} className="text-gray-500 hover:text-red-500">
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* List View */}
              {viewMode === "list" ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        resetForm();
                        setViewMode("create");
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FaPlus /> Create New Exam
                    </button>
                  </div>

                  {examList.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No exams found.</p>
                  ) : (
                    examList.map((ex) => (
                      <div key={ex.id} className="border p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="font-bold">{ex.name}</h4>
                          <p className="text-sm text-gray-500">
                            {ex.exam_type} • {ex.academic_year} • {ex.term}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setFormExam(ex);
                              setViewMode("create");
                            }}
                            className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteExam(ex.id!)}
                            className="px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  {/* Exam Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Exam Name</label>
                      <input
                        type="text"
                        value={formExam.name || ""}
                        onChange={(e) => setFormExam({ ...formExam, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    {/* Class */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Class</label>
                      <select
                        value={formExam.class_name || ""}
                        onChange={(e) => setFormExam({ ...formExam, class_name: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.class_name} - {cls.section}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Exam Type + Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Exam Type</label>
                        <select
                          value={formExam.exam_type}
                          onChange={(e) =>
                            setFormExam({
                              ...formExam,
                              exam_type: e.target.value as Exam["exam_type"], // FIXED
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="unit_test">Unit Test</option>
                          <option value="mid_term">Mid Term</option>
                          <option value="final">Final</option>
                          <option value="quiz">Quiz</option>
                          <option value="assignment">Assignment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1">Date</label>
                        <input
                          type="date"
                          value={formExam.exam_date}
                          onChange={(e) => setFormExam({ ...formExam, exam_date: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setViewMode("list")} className="px-4 py-2 bg-gray-100 rounded-lg">
                        Cancel
                      </button>

                      <button
                        onClick={handleSaveExam}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {formExam.id ? "Update Exam" : "Create Exam"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
