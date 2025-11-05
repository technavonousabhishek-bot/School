import { useParams, useNavigate } from "react-router-dom";
import { getClassById } from "../../data/classesData";
import { FaCalendarAlt, FaUsers, FaClipboardList } from "react-icons/fa";

export default function ClassExams() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const cls = classId ? getClassById(Number(classId)) : null;

  if (!cls) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Back</button>
        <p className="text-gray-600">Class not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Class {cls.name} — Exams</h1>
          <p className="text-gray-500 text-sm">Choose an option to view or schedule exams for this class.</p>
        </div>
        <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md text-gray-600">Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div
          onClick={() => navigate(`/manage-exams/class/${cls.id}/mid-term`)}
          className="p-6 rounded-2xl bg-white shadow cursor-pointer transition hover:shadow-lg flex flex-col gap-3 items-start"
        >
          <div className="text-blue-600 bg-blue-50 rounded-full p-2">
            <FaClipboardList />
          </div>
          <h3 className="text-lg font-semibold">Mid Term</h3>
          <p className="text-sm text-gray-500">View or add mid-term exam schedules for this class.</p>
        </div>

        <div
          onClick={() => navigate(`/manage-exams/class/${cls.id}/annual`)}
          className="p-6 rounded-2xl bg-white shadow cursor-pointer transition hover:shadow-lg flex flex-col gap-3 items-start"
        >
          <div className="text-green-600 bg-green-50 rounded-full p-2">
            <FaCalendarAlt />
          </div>
          <h3 className="text-lg font-semibold">Annual Exam</h3>
          <p className="text-sm text-gray-500">View or add annual exam schedules for this class.</p>
        </div>

        <div
          onClick={() => navigate(`/manage-exams/class/${cls.id}/timetable`)}
          className="p-6 rounded-2xl bg-white shadow cursor-pointer transition hover:shadow-lg flex flex-col gap-3 items-start"
        >
          <div className="text-yellow-600 bg-yellow-50 rounded-full p-2">
            <FaUsers />
          </div>
          <h3 className="text-lg font-semibold">Timetable</h3>
          <p className="text-sm text-gray-500">View the timetable for Class {cls.name}.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        <p className="text-gray-600">Select an option above to manage exams or view timetable.</p>
      </div>
    </div>
  );
}
