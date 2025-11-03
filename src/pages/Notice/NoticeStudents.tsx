// NoticeStudents.tsx
import { useNavigate } from "react-router-dom";
import { classes } from "./noticeData";

export default function NoticeStudents() {
  const navigate = useNavigate();

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Notices — Students (Class-wise)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl">
        {classes.map((c) => (
          <div
            key={c}
            onClick={() => navigate(`/notice/students/${encodeURIComponent(c)}`)}
            className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{c}</h3>
            <p className="text-sm text-gray-500 mt-2">View notices for {c}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
