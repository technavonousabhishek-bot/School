import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ClassItem {
  id: number;
  class_name?: string;
  section?: string | null;
}

export default function AttendanceMain() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Fetch classes from backend
  useEffect(() => {
    let mounted = true;
    fetch("https://school-bos-backend.onrender.com/schoolApp/classes/")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setClasses(data);
        else setClasses([]);
      })
      .catch(() => setClasses([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
  {/* Heading left */}
  <h1 className="text-2xl font-semibold text-gray-700">
    Attendance Management
  </h1>

  {/* Back Button right */}
  <button
    onClick={() => navigate(-1)}
    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
    aria-label="Go back"
  >
    Back
  </button>
</div>


      {/* Classes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {classes.map((cls) => {
          let displayName = cls.class_name || "Unnamed";
          if (cls.section) displayName = `${displayName} - ${cls.section}`;
          const encoded = cls.id;
          return (
          <div
            key={cls.id}
            onClick={() => navigate(`/attendance/${encoded}/students`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(`/attendance/${encoded}/students`);
            }}
            className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:bg-blue-600 hover:text-white duration-300 border border-gray-200 flex flex-col items-center justify-center"
          >
            <p className="text-lg font-medium">{displayName}</p>
          </div>
        );
  })}
      </div>
    </main>
  );
}
