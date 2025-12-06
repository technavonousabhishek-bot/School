import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://school-bos-backend.onrender.com/schoolApp/";

export default function ClassDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { className: stateClassName, section: stateSection } = (location.state || {}) as any;
  const { id } = useParams<{ id?: string }>();

  const [students, setStudents] = useState<any[]>([]);
  const [className, setClassName] = useState<string | undefined>(stateClassName);
  const [section, setSection] = useState<string | undefined>(stateSection);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    // Resolve className/section either from location.state or from the :id param
    let resolvedClassName = stateClassName;
    let resolvedSection = stateSection;
    (async () => {
      // If we have an id, try fetching class info and students from backend
      if (id) {
        try {
          const [classRes, studentsRes] = await Promise.all([
            axios.get(`${API_BASE}classes/${id}/`),
           axios.get(`${API_BASE}class/${id}/students/`),
          ]);

          const classData = classRes.data;
          const studentsData = studentsRes.data || [];

          const mappedStudents = (studentsData || []).map((s: any) => ({
            id: s.id,
            enrollmentNo: s.enrollment_no ?? s.id,
            name: s.name ?? s.user?.username ?? "",
            fatherName: s.father_name ?? "",
            contact: s.contact ?? s.phone ?? "",
            gender: s.gender ?? "",
            class: classData.class_name,
            section: classData.section,
          }));

          setClassName(classData.class_name ?? resolvedClassName);
          setSection(classData.section ?? resolvedSection);
          setSubjects(classData.subjects || []);
          setStudents(mappedStudents);
          return;
        } catch (e) {
          // fallback to localStorage below
        }
      }

      // Local fallback: resolve using stored classes & students
      if (id) {
        const saved = JSON.parse(localStorage.getItem("classes") || "[]") || [];
        const found = saved.find((c: any) => c.id === Number(id));
        if (found) {
          resolvedClassName = found.className;
          resolvedSection = found.section;
          setClassName(found.className);
          setSection(found.section);
          setSubjects(found.subjects || []);
        }
      }

      if (!subjects.length) {
        try {
          const savedAll = JSON.parse(localStorage.getItem("classes") || "[]") || [];
          const matched = savedAll.find((c: any) => c.className === resolvedClassName && c.section === resolvedSection);
          if (matched) setSubjects(matched.subjects || []);
        } catch (e) {
          // ignore
        }
      }

      const storedStudents = JSON.parse(localStorage.getItem("students") || "[]") || [];
      const finalFiltered = storedStudents.filter(
        (s: any) => s.class === resolvedClassName && s.section === resolvedSection
      );
      setStudents(finalFiltered);
    })();
  }, [id, stateClassName, stateSection]);

  if (!className || !section)
    return (
      <div className="p-6 text-center text-gray-500">
        No class selected.
        <button
          onClick={() => navigate(-1)}
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          ⬅ Back
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {className} - {section} Students
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
          >
            ⬅ Back
          </button>
          <button
            onClick={() => navigate(`/attendance/${encodeURIComponent(className || '')}/students`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Manage Attendance
          </button>
        </div>
      </div>

      {/* Subjects display */}
      {subjects && subjects.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Subjects:</div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s, idx) => {
              const colorClasses = [
                "bg-blue-100 text-blue-800",
                "bg-green-100 text-green-800",
                "bg-yellow-100 text-yellow-800",
                "bg-pink-100 text-pink-800",
                "bg-purple-100 text-purple-800",
                "bg-indigo-100 text-indigo-800",
                "bg-red-100 text-red-800",
                "bg-teal-100 text-teal-800",
              ];
              const cls = colorClasses[idx % colorClasses.length];
              return (
                <span key={s} className={`${cls} px-3 py-1 rounded-full text-sm`}>{s}</span>
              );
            })}
          </div>
        </div>
      )}

      {students.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Enroll No</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Father's Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Gender</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => (
                <tr key={stu.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{stu.enrollmentNo}</td>
                  <td className="px-6 py-3">{stu.name}</td>
                  <td className="px-6 py-3">{stu.fatherName}</td>
                  <td className="px-6 py-3">{stu.contact}</td>
                  <td className="px-6 py-3">{stu.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">No students found for this class.</p>
      )}
    </div>
  );
}