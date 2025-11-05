import { Link } from "react-router-dom";
import { CalendarDays, BookOpen, Clock } from "lucide-react";

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

interface ExamCardProps {
  exam: ExamType;
}

export default function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link
      to={`/manage-exams/${exam.id}`}
      className="block transition-transform hover:scale-[1.02]"
    >
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            {exam.exam_name}
          </h2>
          <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            {exam.class_obj}
          </span>
        </div>

        {/* Subject list */}
        <div className="space-y-2 mb-4">
          {exam.exams.slice(0, 3).map((sub: SubjectSchedule, i: number) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-500" />
                <span>{sub.subject}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <CalendarDays size={14} />
                {sub.exam_date}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-gray-400" />
            <span>
              {exam.exams[0]?.start_time} - {exam.exams[0]?.end_time}
            </span>
          </div>
          <span className="text-blue-600 font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  );
}
