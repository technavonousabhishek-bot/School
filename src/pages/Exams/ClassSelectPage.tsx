import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { API_ENDPOINTS } from "../../config/api";

type ClassType = {
  id: number;
  class_name: string;
  section?: string;
};

export default function SelectClassPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedExamId = queryParams.get("exam") || "";
  const selectedExamName = queryParams.get("examName") || "";


  const [classes, setClasses] = useState<ClassType[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.school.classes);
        setClasses(res.data);
      } catch (e) {
        console.error("Failed to fetch classes", e);
      }
    };
    fetchClasses();
  }, []);

  const handleNext = () => {
    if (!selectedClass) return alert("Please select a class!");
    // navigate to marks entry with class + exam
    navigate(`/exams/add-marks/marks-entry`, {
      state: {
        id: selectedClass.id,
        className: selectedClass.class_name,
        section: selectedClass.section || "",
        exam: selectedExamName,
        examId: selectedExamId,
      },
    });
  };

  const handleBack = () => {
    navigate(`/exams/add-exams`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Select Class</h1>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
        >
          Back
        </button>
      </div>

      {/* Selected Exam */}
      {selectedExamName && (
        <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg max-w-lg">
          <p className="font-medium text-gray-800">
            Selected Exam: <span className="font-semibold">{selectedExamName}</span>
          </p>
        </div>
      )}

      {/* Class Select Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {classes.length === 0 && (
          <p className="text-gray-500 col-span-3">No classes available</p>
        )}
        {classes.map((cls) => {
          const fullClassName = cls.section
            ? `${cls.class_name} - ${cls.section}`
            : cls.class_name;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-6 rounded-lg cursor-pointer border transition-all ${selectedClass?.id === cls.id
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white border-gray-300 hover:shadow-md"
                }`}
            >
              <p className="text-lg font-semibold">{fullClassName}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
