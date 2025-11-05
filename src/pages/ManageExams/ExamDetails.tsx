import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, Clock, BookOpen, Pencil, Trash2, ArrowLeft } from "lucide-react";

interface SubjectSchedule {
  subject: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
}

interface ExamType {
  id: number;
  exam_name: string;
  class_obj: string;
  exams: SubjectSchedule[];
}

export default function ExamDetails() {
  const { examId } = useParams(); // from URL (route param is :examId)
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamType | null>(null);

  // 🧠 Dummy data for now
  useEffect(() => {
    const dummyExam: ExamType = {
      id: Number(examId),
      exam_name: "Mid Term Examination",
      class_obj: "Class 10",
      exams: [
        {
          subject: "Mathematics",
          exam_date: "2025-11-10",
          start_time: "09:00",
          end_time: "11:00",
          max_marks: 100,
        },
        {
          subject: "Science",
          exam_date: "2025-11-12",
          start_time: "09:00",
          end_time: "11:00",
          max_marks: 100,
        },
        {
          subject: "English",
          exam_date: "2025-11-14",
          start_time: "09:00",
          end_time: "11:00",
          max_marks: 100,
        },
      ],
    };
    setExam(dummyExam);
  }, [examId]);

  const handleEdit = () => {
    alert("🛠 Edit exam functionality coming soon!");
  };

  const handleDelete = () => {
    const confirmDelete = confirm("Are you sure you want to delete this exam?");
    if (confirmDelete) {
      alert("🗑 Exam deleted successfully!");
      navigate("/manage-exams"); // redirect back to Manage Exams
    }
  };

  if (!exam) return <div className="p-6">Loading exam details...</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      {/* Exam Info Card */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{exam.exam_name}</h2>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-blue-50 text-blue-600 border-blue-200"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-red-50 text-red-600 border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{exam.class_obj}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <span>{exam.exams.length} Subjects</span>
          </div>
        </div>
      </div>

      {/* Subject Table */}
      <div className="bg-white shadow rounded-2xl p-6 border">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Exam Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left">Subject</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Time</th>
                <th className="py-3 px-4 text-left">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {exam.exams.map((sub, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">{sub.subject}</td>
                  <td className="py-3 px-4">{sub.exam_date}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {sub.start_time} - {sub.end_time}
                  </td>
                  <td className="py-3 px-4">{sub.max_marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
