import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ✅ Attendance Modal with Month/Year select
function AttendanceModal({ student, onClose, selectedClassId, onSaved }: { student: any; onClose: () => void; selectedClassId?: string | null; onSaved?: () => void }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [year, setYear] = useState(today.getFullYear());
  const [attendance, setAttendance] = useState<{ [key: string]: "Present" | "Absent" | "Normal" }>({});
  const [serverErrors, setServerErrors] = useState<any[]>([]);

  // Load attendance for selected month/year from server (fallback to localStorage)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!student || !student.id) return;
      const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      try {
        const resp = await fetch(`https://school-bos-backend.onrender.comschoolApp/attendance/?student=${student.id}&from=${from}&to=${to}`);
        const json = await resp.json();
        const records = Array.isArray(json) ? json : (json.results || []);
        if (!mounted) return;
        if (records.length) {
          const map: any = {};
          records.forEach((r: any) => {
            try {
              const d = new Date(r.date);
              const day = d.getDate();
              if (r.status === 'Leave') map[day] = 'Normal';
              else if (r.status === 'Present') map[day] = 'Present';
              else if (r.status === 'Absent') map[day] = 'Absent';
            } catch (e) {}
          });
          setAttendance(map);
          return;
        }
      } catch (e) {
        // ignore and fallback to localStorage
      }

      // fallback to localStorage
      const raw = localStorage.getItem("attendance");
      if (raw) {
        const allAttendance = JSON.parse(raw);
        const key = `${student.id}-${year}-${month}`;
        if (allAttendance[key]) setAttendance(allAttendance[key]);
        else setAttendance({});
      }
    };
    load();
    return () => { mounted = false; };
  }, [student, month, year]);

  // cycle: Present -> Absent -> Normal -> Present
  const handleDayClick = (day: number) => {
    setAttendance((prev) => {
      const cur = prev[day];
      let next: "Present" | "Absent" | "Normal";
      if (cur === "Present") next = "Absent";
      else if (cur === "Absent") next = "Normal";
      else next = "Present"; // undefined or Normal -> Present
      return {
        ...prev,
        [day]: next,
      };
    });
  };

  const saveAttendance = () => {
    // Build batch payload for server
    const lastDay = new Date(year, month + 1, 0).getDate();
    const records: any[] = [];
    for (let d = 1; d <= lastDay; d++) {
      const s = attendance[d];
      if (!s) continue; // skip unset days
      const status = s === 'Normal' ? 'Leave' : s; // map Normal->Leave for server
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec: any = { student: student.id, date: dateStr, status };
      if (selectedClassId) rec.selected_class = selectedClassId;
      records.push(rec);
    }

    if (records.length === 0) {
      // nothing to save; just close
      onClose();
      return;
    }

    setServerErrors([]);
    fetch('https://school-bos-backend.onrender.comschoolApp/attendance/batch/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, status: r.status, body: j })))
      .then(({ ok, status, body }) => {
        if (!ok && status === 400) {
          setServerErrors([{ error: body.detail || 'Bad request' }]);
          return;
        }
        // body contains data and errors arrays
        if (body && body.errors && body.errors.length) {
          setServerErrors(body.errors);
          return;
        }

        // success: persist locally and notify parent
        const raw = localStorage.getItem("attendance");
        const allAttendance = raw ? JSON.parse(raw) : {};
        const key = `${student.id}-${year}-${month}`;
        allAttendance[key] = attendance;
        localStorage.setItem("attendance", JSON.stringify(allAttendance));
        if (onSaved) onSaved();
        onClose();
      })
      .catch((err) => {
        setServerErrors([{ error: String(err) }]);
      });
  };

  // Render server errors if any
  const ErrorsBlock = () => {
    if (!serverErrors || serverErrors.length === 0) return null;
    return (
      <div className="mb-3 p-3 bg-red-50 text-red-700 rounded">
        <strong className="block mb-2">Save errors:</strong>
        <ul className="list-disc ml-5 text-sm">
          {serverErrors.map((err, i) => (
            <li key={i}>{err.error || err.message || JSON.stringify(err)}</li>
          ))}
        </ul>
      </div>
    );
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{student.name} - Attendance</h2>

        {/* Month & Year select */}
        <div className="flex gap-2 mb-4">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {[
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const status = attendance[day];
            return (
              <div
                key={day}
                className={`p-2 text-center rounded cursor-pointer border ${
                  status === "Present"
                    ? "bg-green-400 text-white"
                    : status === "Absent"
                    ? "bg-red-400 text-white"
                    : status === "Normal"
                    ? "bg-gray-300 text-black"
                    : "bg-gray-100"
                }`}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Show server-side validation errors if any */}
        <ErrorsBlock />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={saveAttendance}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ StudentList component with total attendance, Excel & PDF export
export default function StudentList() {
  const params = useParams<{ classId?: string; className?: string }>();
  const rawClassParam = params.classId ?? params.className ?? null;
  const [resolvedClassId, setResolvedClassId] = useState<string | null>(null);
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch students for the class from backend
  useEffect(() => {
    let mounted = true;
    const resolveAndFetch = async () => {
      if (!rawClassParam) return setAllStudents([]);

      // If rawClassParam is numeric, use directly as class id
      let classIdToUse: string | null = null;
      if (/^\d+$/.test(String(rawClassParam))) {
        classIdToUse = String(rawClassParam);
      } else {
        // Try to find class by name/label from classes list
        try {
          const res = await fetch("https://school-bos-backend.onrender.comschoolApp/classes/");
          const classes = await res.json();
          const decoded = decodeURIComponent(String(rawClassParam));
          const found = classes.find((c: any) => {
            const label = c.section ? `${c.class_name} - ${c.section}` : c.class_name;
            return (
              c.class_name === decoded ||
              String(c.id) === decoded ||
              label === decoded ||
              label === rawClassParam
            );
          });
          if (found) classIdToUse = String(found.id);
        } catch (e) {
          // ignore and fallthrough
        }
      }

      if (!classIdToUse) {
        // can't resolve class id
        if (mounted) setAllStudents([]);
        setResolvedClassId(null);
        setResolvedLabel(rawClassParam ? String(rawClassParam) : null);
        return;
      }

      try {
        const r = await fetch(`https://school-bos-backend.onrender.comschoolApp/class/${classIdToUse}/students/`);
        const data = await r.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          const mapped = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            enrollmentNo: s.enrollmentNo || s.enrollment_no || s.enrollmentNo,
            fatherName: s.parent_name || s.fatherName || s.parentName || '',
            parent_contact: s.parent_contact || s.parentContact || '',
            class: s.class || s.class_name || '',
            section: s.section || '',
          }));
          setAllStudents(mapped);
          setResolvedClassId(classIdToUse);
          // derive a label for header
          setResolvedLabel(`${mapped.length && mapped[0].class ? mapped[0].class : ''}` || String(rawClassParam));
        } else {
          setAllStudents([]);
        }
      } catch (err) {
        if (mounted) setAllStudents([]);
      }
    };

    resolveAndFetch();
    return () => {
      mounted = false;
    };
  }, [rawClassParam, refreshKey]);

  const filteredStudents = allStudents.filter((stu) =>
    (stu.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (stu.enrollmentNo || '').toLowerCase().includes(search.toLowerCase())
  );

  // Calculate total attendance %
  const getTotalAttendance = (stu: any) => {
    const raw = localStorage.getItem("attendance");
    if (!raw) return 0;
    const allAttendance = JSON.parse(raw);
    const keys = Object.keys(allAttendance).filter((k) => k.startsWith(stu.id));
    if (!keys.length) return 0;

    let totalDays = 0, presentDays = 0;
    keys.forEach((key) => {
      const monthData = allAttendance[key];
      for (const day in monthData) {
        // skip 'Normal' days from counting (treated like holiday/not counted)
        if (monthData[day] === "Normal") continue;
        totalDays++;
        if (monthData[day] === "Present") presentDays++;
      }
    });
    return totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
  };

  // Mark today's attendance quickly as Present or Absent
  const markTodayAttendance = (stuId: any, status: "Present" | "Absent") => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const raw = localStorage.getItem("attendance");
    const allAttendance = raw ? JSON.parse(raw) : {};
    const key = `${stuId}-${year}-${month}`;
    const monthData = allAttendance[key] || {};
    monthData[day] = status;
    allAttendance[key] = monthData;
    localStorage.setItem("attendance", JSON.stringify(allAttendance));

    // Sync to backend (mark today's attendance)
    fetch("https://school-bos-backend.onrender.comschoolApp/mark/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_room: resolvedClassId || rawClassParam,
        date: new Date().toISOString().slice(0, 10),
        records: [{ student: stuId, status }],
      }),
    }).catch(() => {
      // ignore network errors for now; local state is primary UI
    });

    // Trigger UI refresh
    setAllStudents((prev) => [...prev]);
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xl leading-none px-2 py-1 rounded hover:bg-gray-200"
          aria-label="Go back"
        >
          ←
        </button>

        <h1 className="text-2xl font-semibold text-gray-700">
          {resolvedLabel || rawClassParam || 'Class'} — Attendance
        </h1>
      </div>

      {/* Search & Export */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or enrollment no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-md w-1/2 shadow-sm focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          {/* PDF Export */}
          <button
            onClick={() => {
              const headers = ["#", "Name", "Father's Name", "Class", "Section", "Enrollment No", "Attendance %"];
              const rows = filteredStudents.map((s, i) => [
                String(i + 1),
                s.name,
                s.fatherName,
                s.class,
                s.section,
                s.enrollmentNo,
                String(getTotalAttendance(s)) + "%",
              ]);
              const csvContent = [headers, ...rows]
                .map((r) => r.map((c) => `"${c}"`).join(","))
                .join("\n");
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
                a.download = `${resolvedLabel || rawClassParam || 'class'}_attendance.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export Excel
          </button>

          {/* PDF Export */}
          <button
            onClick={() => {
              const headers = ["#", "Name", "Father's Name", "Class", "Section", "Enrollment No", "Attendance %"];
              const rows = filteredStudents.map((s, i) => [
                String(i + 1),
                s.name,
                s.fatherName,
                s.class,
                s.section,
                s.enrollmentNo,
                String(getTotalAttendance(s)) + "%",
              ]);
              let tableHtml = `<table border="1" style="border-collapse:collapse;width:100%">
                <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
                ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
              </table>`;
              const newWindow = window.open("", "_blank");
              if (newWindow) {
                newWindow.document.write(tableHtml);
                newWindow.document.close();
                newWindow.print();
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Father’s Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Section</th>
              <th className="p-3">Enrollment No</th>
              <th className="p-3 text-center">Attendance %</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((stu, index) => (
              <tr key={stu.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{stu.name}</td>
                <td className="p-3">{stu.fatherName}</td>
                <td className="p-3">{stu.class}</td>
                <td className="p-3">{stu.section}</td>
                <td className="p-3">{stu.enrollmentNo}</td>
                <td
                  className={`p-3 text-center font-semibold ${
                    getTotalAttendance(stu) >= 75
                      ? "text-green-600"
                      : getTotalAttendance(stu) >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {getTotalAttendance(stu)}%
                </td>

                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => markTodayAttendance(stu.id, "Present")}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                      title="Mark today Present"
                    >
                      Present
                    </button>

                    <button
                      onClick={() => markTodayAttendance(stu.id, "Absent")}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      title="Mark today Absent"
                    >
                      Absent
                    </button>

                    <button
                      onClick={() => {
                        setSelectedStudent(stu);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      title="Manage attendance for any date"
                    >
                      Mark Attendance
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  No students found for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Modal */}
      {selectedStudent && modalOpen && (
        <AttendanceModal
          student={selectedStudent}
          onClose={() => setModalOpen(false)}
          selectedClassId={resolvedClassId || rawClassParam}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </main>
  );
}



