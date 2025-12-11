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
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [classes, setClasses] = useState<any[]>([]);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    name: '',
    exam_type: 'unit_test',
    academic_year: new Date().getFullYear().toString(),
    term: 'Term 1',
    exam_date: new Date().toISOString().split('T')[0],
    status: 'upcoming',
    class_name: undefined // Will be selected by user
  });
  const [creatingExam, setCreatingExam] = useState(false);

  // Fetch exams from backend
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

  const handleCreateExam = async () => {
    try {
      if (!newExam.name || !newExam.exam_date || !newExam.class_name) {
        alert("Please fill in all required fields (including Class)");
        return;
      }

      setCreatingExam(true);
      await examApi.createExam(newExam as Exam);

      alert("Exam created successfully!");
      setViewMode('list');
      fetchExams(); // Refresh the main list and modal list
      // Reset form
      setNewExam({
        name: '',
        exam_type: 'unit_test',
        academic_year: new Date().getFullYear().toString(),
        term: 'Term 1',
        exam_date: new Date().toISOString().split('T')[0],
        status: 'upcoming',
        class_name: undefined
      });
    } catch (error) {
      console.error("Failed to create exam:", error);
      alert("Failed to create exam. Please try again.");
    } finally {
      setCreatingExam(false);
    }
  };

  const openManageExams = () => {
    setShowManageExams(true);
    fetchClasses(); // Fetch classes when opening modal (needed for create)
    setViewMode('list');
  };

  const handleNext = () => {
    if (!selectedExam) return alert("Please select an exam first!");
    navigate(`/exams/add-exams/select-class?exam=${selectedExam.id}&examName=${selectedExam.name}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading exams...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Select Exam</h1>
        <button
          onClick={openManageExams}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <FaList /> Manage Exams
        </button>
      </div>

      <div className="bg-white shadow-md p-6 rounded-lg max-w-2xl">
        <label className="block mb-4 font-medium text-lg">Available Exams</label>

        {examList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No exams available yet.</p>
            <p className="text-sm text-gray-400">
              Exams need to be created by administrators. Please contact your admin.
            </p>
          </div>
        ) : (
          <div className="mb-4 space-y-2">
            {examList.map((exam) => (
              <div
                key={exam.id}
                className={`flex justify-between items-center border p-4 rounded-lg cursor-pointer transition-all ${selectedExam?.id === exam.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-300"
                  }`}
                onClick={() => setSelectedExam(exam)}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="selectedExam"
                    checked={selectedExam?.id === exam.id}
                    onChange={() => setSelectedExam(exam)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{exam.name}</div>
                    <div className="text-sm text-gray-600">
                      {exam.exam_type.replace('_', ' ').toUpperCase()} • {exam.academic_year} • {exam.term}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Date: {new Date(exam.exam_date).toLocaleDateString()} • Status: {exam.status}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate("/exams")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedExam}
            className={`px-8 py-2 rounded-md ${selectedExam
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Manage Exams Modal */}
      {showManageExams && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {viewMode === 'list' ? 'All Exams' : 'Create New Exam'}
              </h3>
              <button
                onClick={() => setShowManageExams(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6">
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setViewMode('create')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <FaPlus /> Create New Exam
                    </button>
                  </div>

                  {examList.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No exams found.</p>
                  ) : (
                    <div className="space-y-3">
                      {examList.map((ex) => (
                        <div key={ex.id} className="border p-4 rounded-lg hover:bg-gray-50 transition flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-lg">{ex.name}</h4>
                            <p className="text-sm text-gray-600">
                              {ex.exam_type} • {ex.academic_year} • {ex.term}
                            </p>
                            <p className="text-xs text-gray-500">
                              Date: {new Date(ex.exam_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${ex.status === 'completed' ? 'bg-green-100 text-green-800' :
                            ex.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {ex.status?.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newExam.name}
                      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                      placeholder="e.g., Mid Term 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newExam.class_name || ''}
                      onChange={(e) => setNewExam({ ...newExam, class_name: Number(e.target.value) })}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name} {cls.section ? `- ${cls.section}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={newExam.exam_type}
                        onChange={(e) => setNewExam({ ...newExam, exam_type: e.target.value as any })}
                      >
                        <option value="unit_test">Unit Test</option>
                        <option value="mid_term">Mid Term</option>
                        <option value="final">Final</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={newExam.exam_date}
                        onChange={(e) => setNewExam({ ...newExam, exam_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={newExam.academic_year}
                        onChange={(e) => setNewExam({ ...newExam, academic_year: e.target.value })}
                        placeholder="e.g., 2024-2025"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={newExam.term}
                        onChange={(e) => setNewExam({ ...newExam, term: e.target.value })}
                        placeholder="e.g., Term 1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setViewMode('list')}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateExam}
                      disabled={creatingExam}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {creatingExam ? 'Creating...' : 'Create Exam'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
