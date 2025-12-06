import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

export default function AttendanceOptions() {
  const params = useParams<{ classId?: string; className?: string }>();
  const rawClassParam = params.classId ?? params.className ?? null;
  const navigate = useNavigate();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadLabel = async () => {
      if (!rawClassParam) return setLabel(null);
      try {
        if (/^\d+$/.test(String(rawClassParam))) {
          const r = await fetch(`https://school-bos-backend.onrender.comschoolApp/classes/${rawClassParam}/`);
          const data = await r.json();
          if (!mounted) return;
          const sec = data.section ? ` - ${data.section}` : '';
          setLabel(`${data.class_name}${sec}`);
          return;
        }

        // fallback: search classes list for matching label
        const res = await fetch("https://school-bos-backend.onrender.comschoolApp/classes/");
        const classes = await res.json();
        const decoded = decodeURIComponent(String(rawClassParam));
        const found = classes.find((c: any) => {
          const label = c.section ? `${c.class_name} - ${c.section}` : c.class_name;
          return c.class_name === decoded || label === decoded || String(c.id) === decoded;
        });
        if (mounted) setLabel(found ? (found.section ? `${found.class_name} - ${found.section}` : found.class_name) : decoded);
      } catch (e) {
        if (mounted) setLabel(null);
      }
    };
    loadLabel();
    return () => { mounted = false; };
  }, [rawClassParam]);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xl leading-none px-2 py-1 rounded hover:bg-gray-200"
          aria-label="Go back"
        >
          ←
        </button>

        <h2 className="text-2xl font-bold">Attendance Management - {label || rawClassParam}</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div
          onClick={() => navigate(`/attendance/${rawClassParam}/students`)}
          className="p-8 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer text-center transition"
        >
          <FaUserGraduate className="text-blue-600 text-4xl mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Manage Students Attendance</h3>
          <p className="text-gray-500 text-sm">
            Mark or view student attendance
          </p>
        </div>

        <div
          onClick={() => navigate(`/attendance/${rawClassParam}/teachers`)}
          className="p-8 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer text-center transition"
        >
          <FaChalkboardTeacher className="text-green-600 text-4xl mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Manage Teachers Attendance</h3>
          <p className="text-gray-500 text-sm">
            Mark or view teacher attendance
          </p>
        </div>
      </div>
    </main>
  );
}


