import { useState } from "react";

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

interface ExamFormProps {
  onSubmit: (newExam: ExamType) => void;
  onClose: () => void; // 👈 Add this
}

export default function ExamForm({ onSubmit, onClose }: ExamFormProps) {
  const [exam_name, setExamName] = useState("");
  const [class_obj, setClassObj] = useState("");
  const [subject, setSubject] = useState("");
  const [exam_date, setExamDate] = useState("");
  const [start_time, setStartTime] = useState("");
  const [end_time, setEndTime] = useState("");
  const [max_marks, setMaxMarks] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newExam: ExamType = {
      id: Date.now(),
      exam_name,
      class_obj,
      exams: [
        { subject, exam_date, start_time, end_time, max_marks },
      ],
    };

    onSubmit(newExam);
    onClose(); // 👈 close modal after submit
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-gray-600">Exam Name</label>
        <input
          type="text"
          value={exam_name}
          onChange={(e) => setExamName(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="e.g., Mid Term"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Class</label>
        <input
          type="text"
          value={class_obj}
          onChange={(e) => setClassObj(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="e.g., Class 10"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="e.g., Science"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Exam Date</label>
          <input
            type="date"
            value={exam_date}
            onChange={(e) => setExamDate(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Max Marks</label>
          <input
            type="number"
            value={max_marks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Start Time</label>
          <input
            type="time"
            value={start_time}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">End Time</label>
          <input
            type="time"
            value={end_time}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Save Exam
        </button>
      </div>
    </form>
  );
}
