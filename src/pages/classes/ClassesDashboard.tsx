import { useNavigate } from "react-router-dom";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://school-bos-backend.onrender.com/schoolApp/";

export default function ClassesDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);

  // ✅ Role fetch
  const userRole = localStorage.getItem("userRole") || "teacher";

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await axios.get(`${API_BASE}classes/`);
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((c: any) => ({
          id: String(c.id),
          className: c.class_name ?? c.className ?? "",
          section: c.section ?? "",
          teacher: c.class_teacher_name ?? c.teacher ?? "",
          studentsCount: c.student_count ?? 0,
          maxSeats: c.max_seats ?? c.maxSeats ?? "",
        }));
        setClasses(mapped);
        return;
      } catch (err: any) {
        // fallback to localStorage if backend not available
        // eslint-disable-next-line no-console
        console.error("ClassesDashboard: failed to fetch classes", err?.message ?? err, err?.response?.data ?? err?.response);
      }

      const saved = JSON.parse(localStorage.getItem("classes") || "[]") || [];
      if (!mounted) return;
      setClasses(saved);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = (id: any) => {
    (async () => {
      if (!confirm("Are you sure you want to delete this class?")) return;
      try {
        await axios.delete(`${API_BASE}classes/${id}/`);
        const updated = classes.filter((cls: any) => cls.id !== id);
        setClasses(updated);
        // update local cache
        localStorage.setItem("classes", JSON.stringify(updated));
      } catch (err: any) {
        // fallback to local removal if API fails
        // eslint-disable-next-line no-console
        console.error("ClassesDashboard: failed to delete class via API", err?.message ?? err, err?.response?.data ?? err?.response);
        const updated = classes.filter((cls: any) => cls.id !== id);
        setClasses(updated);
        localStorage.setItem("classes", JSON.stringify(updated));
      }
    })();
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaChalkboardTeacher className="text-blue-600" /> Classes Overview
        </h1>

        {/* ✅ Role-based Add Class button */}
        {userRole === "admin" && (
          <button
            onClick={() => navigate("/add-class")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Class
          </button>
        )}
      </div>

      {/* Class Cards */}
      {classes.length === 0 ? (
        <p className="text-gray-600 italic text-center mt-12">
          No classes available. {userRole === "admin" && 'Click “+ Add Class” to create one.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {classes.map((cls: any) => (
            <div
              key={cls.id}
              className="bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <h2 className="text-xl font-semibold text-blue-700">
                {cls.className ? `Class ${cls.className}` : "Unnamed Class"} - {cls.section || "N/A"}
              </h2>
              <p className="text-gray-600 mt-2">
                <strong>Teacher:</strong> {cls.teacher || "Not Assigned"}
              </p>
              <p className="text-gray-600">
                <strong>Students:</strong> {cls.studentsCount || 0}/{cls.maxSeats || "—"}
              </p>

              {/* Buttons */}
              <div className="flex justify-between mt-5">
                <button
                  onClick={() => navigate(`/view-class/${cls.id}`)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                >
                  View
                </button>
                <button
                  onClick={() => navigate(`/edit-class/${cls.id}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>

                {/* ✅ Delete only for admin */}
                {userRole === "admin" && (
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
