// NoticeStudents.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NoticeStudents() {
  const navigate = useNavigate();
  const [classesList, setClassesList] = useState<string[]>([]);

  useEffect(() => {
    // Prefer the explicit `classes` storage (created by Class add screen). If missing,
    // fall back to deriving class names from students stored in localStorage.
    try {
      const rawClasses = localStorage.getItem("classes");
      if (rawClasses) {
        const parsed = JSON.parse(rawClasses) as any[];
        const names = parsed
          .map((c) => c.className || c.name || "")
          .filter((n) => !!n);
        if (names.length) {
          setClassesList(names);
          return;
        }
      }
    } catch (e) {
      // ignore and try students
    }

    try {
      const rawStudents = localStorage.getItem("students");
      if (rawStudents) {
        const students = JSON.parse(rawStudents) as any[];
        const names = Array.from(new Set(students.map((s) => s.class).filter(Boolean)));
        setClassesList(names);
        return;
      }
    } catch (e) {
      // ignore
    }

    setClassesList([]);
  }, []);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
  {/* Heading left */}
  <h2 className="text-2xl font-bold">Notices — Students (Class-wise)</h2>

  {/* Button right */}
  <button
    onClick={() => navigate(-1)}
    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
    aria-label="Go back"
  >
    Back
  </button>
</div>


      {classesList.length === 0 ? (
        <div className="text-gray-500">No classes found. Add classes or students to show notices.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl">
          {classesList.map((c) => {
            const raw = String(c || "").trim();
            const displayName = /^\d+$/.test(raw) ? `Class ${raw}` : raw || "Unnamed";
            return (
              <div
                key={c}
                onClick={() => navigate(`/notice/students/${encodeURIComponent(c)}`)}
                className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <p className="text-sm text-gray-500 mt-2">View notices for {displayName}</p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
