import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


// Small modal used for marking attendance for a teacher (month/year calendar)
function AttendanceModal({ teacher, onClose, selectedClassParam }: { teacher: any; onClose: () => void; selectedClassParam?: string | null }) {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [attendance, setAttendance] = useState<{ [day: number]: "Present" | "Absent" | "Normal" }>({});
  const [serverErrors, setServerErrors] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // try server first
      try {
        const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        const resp = await fetch(`https://school-bos-backend.onrender.com/schoolApp/teacher-attendance/?teacher=${teacher.id}&from=${from}&to=${to}`);
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
        // fallback to localStorage
      }

      const raw = localStorage.getItem("attendance");
      const all = raw ? JSON.parse(raw) : {};
      const key = `${teacher.id}-${year}-${month}`;
      if (mounted) setAttendance(all[key] || {});
    };
    load();
    return () => { mounted = false; };
  }, [teacher, month, year]);

  // cycle state: Present -> Absent -> Normal -> Present
  const toggleDay = (d: number) => {
    setAttendance((prev) => {
      const cur = prev[d];
      let next: "Present" | "Absent" | "Normal";
      if (cur === "Present") next = "Absent";
      else if (cur === "Absent") next = "Normal";
      else next = "Present"; // undefined or Normal -> Present
      return { ...prev, [d]: next };
    });
  };

  const save = () => {
    // Build records array and POST to server, fallback to localStorage on network error
    const lastDay = new Date(year, month + 1, 0).getDate();
    const records: any[] = [];
    for (let d = 1; d <= lastDay; d++) {
      const s = attendance[d];
      if (!s) continue;
      const status = s === 'Normal' ? 'Leave' : s;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec: any = { teacher: teacher.id, date: dateStr, status };
      if (selectedClassParam) rec.selected_class = selectedClassParam;
      records.push(rec);
    }

    if (records.length === 0) {
      onClose();
      return;
    }

    setServerErrors([]);
    fetch('https://school-bos-backend.onrender.com/schoolApp/teacher-attendance/batch/', {
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
        if (body && body.errors && body.errors.length) {
          setServerErrors(body.errors);
          return;
        }

        // success: persist locally and close
        const raw = localStorage.getItem("attendance");
        const all = raw ? JSON.parse(raw) : {};
        const key = `${teacher.id}-${year}-${month}`;
        all[key] = attendance;
        localStorage.setItem("attendance", JSON.stringify(all));
        onClose();
      })
      .catch(() => {
        // network error: persist locally
        const raw = localStorage.getItem("attendance");
        const all = raw ? JSON.parse(raw) : {};
        const key = `${teacher.id}-${year}-${month}`;
        all[key] = attendance;
        localStorage.setItem("attendance", JSON.stringify(all));
        onClose();
      });
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">{teacher.name} — Attendance</h3>

        <div className="flex gap-2 mb-4">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border px-2 py-1 rounded">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>{new Date(0, i).toLocaleString(undefined, { month: 'short' })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border px-2 py-1 rounded">
            {Array.from({ length: 5 }).map((_, i) => (
              <option key={i} value={today.getFullYear() - i}>{today.getFullYear() - i}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const s = attendance[d];
                return (
                  <div
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`p-2 text-center rounded cursor-pointer border ${
                      s === 'Present' ? 'bg-green-400 text-white' : s === 'Absent' ? 'bg-red-400 text-white' : s === 'Normal' ? 'bg-gray-300 text-black' : 'bg-gray-100'
                    }`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>

        {ErrorsBlock()}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherList() {
  const params = useParams<{ classId?: string; className?: string }>();
  const classParam = params.classId ?? params.className ?? null;
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [selectedForAttendance, setSelectedForAttendance] = useState<any | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [, setAttendanceUpdatedAt] = useState(0);
  

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('https://school-bos-backend.onrender.com/Account/teachers/');
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            name: t.teacher_name || t.name || (t.user && t.user.username) || '',
            email: t.email || (t.user && t.user.email) || '',
            staffId: t.staff_id || t.staffId || t.staffID || '',
            specialization: t.specialization || t.department || '',
            classes: t.class_teacher_of ? (Array.isArray(t.class_teacher_of) ? t.class_teacher_of.map((c: any) => c.name).join(', ') : String(t.class_teacher_of)) : (t.classes || t.class || ''),
            subjects: t.subjects || t.subject || [],
          }));
          setAllTeachers(mapped);
          return;
        }
      } catch (err) {
        try {
          const raw = localStorage.getItem('teachers');
          if (mounted) setAllTeachers(raw ? JSON.parse(raw) : []);
        } catch (e) {
          if (mounted) setAllTeachers([]);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredTeachers = allTeachers.filter((t: any) =>
    (classParam ? t.class === classParam : true) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || (t.cno || '').toLowerCase().includes(search.toLowerCase()))
  );

  // compute attendance % from localStorage
  const getTotalAttendance = (teacher: any) => {
    const raw = localStorage.getItem('attendance');
    if (!raw) return 0;
    const all = JSON.parse(raw);
    const keys = Object.keys(all).filter(k => k.startsWith(String(teacher.id)));
    if (!keys.length) return 0;
    let total = 0, present = 0;
    keys.forEach((k) => {
      const monthData = all[k] || {};
      Object.values(monthData).forEach((v: any) => { if (v === 'Normal') return; total++; if (v === 'Present') present++; });
    });
    return total ? Math.round((present / total) * 100) : 0;
  };

  // quick mark today's attendance for a teacher
  const markTodayAttendance = (teacherId: any, status: 'Present' | 'Absent') => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const raw = localStorage.getItem('attendance');
    const all = raw ? JSON.parse(raw) : {};
    const key = `${teacherId}-${year}-${month}`;
    const monthData = all[key] || {};
    monthData[day] = status;
    all[key] = monthData;
    localStorage.setItem('attendance', JSON.stringify(all));
    // sync to backend (best-effort)
    const class_room = (/^\d+$/.test(String(classParam)) ? String(classParam) : undefined);
    fetch('https://school-bos-backend.onrender.com/schoolApp/mark/teacher/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_room: class_room, date: new Date().toISOString().slice(0,10), records: [{ teacher: teacherId, status }] }),
    }).catch(() => {});

    // refresh teachers to update UI
    const tRaw = localStorage.getItem('teachers');
    setAllTeachers(tRaw ? JSON.parse(tRaw) : []);
  };

  // Export CSV helper
  const exportCSV = (rows: any[], fileName: string) => {
    const csv = rows.map((r) => r.map((c: any) => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        {classParam && (
          <button onClick={() => navigate(-1)} className="text-xl leading-none px-2 py-1 rounded hover:bg-gray-200" aria-label="Go back">←</button>
        )}
        <h1 className="text-2xl font-semibold text-gray-700">{classParam ? `${classParam} — Teachers Attendance` : 'Teachers Attendance'}</h1>
      </div>

      <div className="flex items-center justify-between mb-4">
        <input type="text" placeholder="Search by name or code" value={search} onChange={(e) => setSearch(e.target.value)} className="border px-4 py-2 rounded-md w-1/2 shadow-sm" />

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md" onClick={async () => {
            const headers = ['#','Name','Email','Staff ID','Department','Classes','Subject','Attendance %'];
            const rows = filteredTeachers.map((t: any, i: number) => [String(i+1), t.name||'', t.email||'', t.staffId||t.staffID||'', t.department||'', (t.classes||t.class||''), t.subject||'', String(getTotalAttendance(t))+'%']);
            try {
              const jsPDFCtor = (window as any).jspdf?.jsPDF || (window as any).jsPDF || await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
                s.onload = () => resolve((window as any).jspdf?.jsPDF || (window as any).jsPDF);
                s.onerror = reject;
                document.head.appendChild(s);
              });
              const doc = new (jsPDFCtor as any)({ unit: 'pt', format: 'a4' });
              const margin = 40; const pageWidth = doc.internal.pageSize.getWidth(); const usable = pageWidth - margin*2; const colW = usable / headers.length;
              let y = margin + 20; doc.setFontSize(14); doc.text((classParam||'Teachers') + ' - Attendance', margin, y); y+=24; doc.setFontSize(10);
              headers.forEach((h,i)=> doc.text(String(h), margin + i*colW + 2, y)); y+=18;
              rows.forEach((row)=>{ row.forEach((cell,i)=> doc.text(String(cell), margin + i*colW + 2, y)); y+=16; if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }});
              doc.save(`${(classParam||'teachers').replace(/\s+/g,'_')}_attendance.pdf`);
            } catch (e) {
              exportCSV([['#','Name','Email','Staff ID','Department','Classes','Subject','Attendance %'], ...filteredTeachers.map((t,i)=>[String(i+1), t.name||'', t.email||'', t.staffId||t.staffID||'', t.department||'', (t.classes||t.class||''), t.subject||'', String(getTotalAttendance(t))+'%'])], `${(classParam||'teachers').replace(/\s+/g,'_')}_attendance.csv`);
            }
          }}>Export PDF</button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => {
            const headers = ['#','Name','Email','Staff ID','Department','Classes','Subject','Attendance %'];
            const rows = filteredTeachers.map((t: any, i: number) => [String(i+1), t.name||'', t.email||'', t.staffId||t.staffID||'', t.department||'', (t.classes||t.class||''), t.subject||'', String(getTotalAttendance(t))]);
            exportCSV([headers, ...rows], `${(classParam||'teachers').replace(/\s+/g,'_')}_attendance.csv`);
          }}>Export Excel</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Staff ID</th>
              <th className="p-3">Department</th>
              <th className="p-3">Classes</th>
              <th className="p-3">Subject</th>
              <th className="p-3 text-center">Attendance %</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTeachers.map((t: any, idx: number) => (
              <tr key={t.id || idx} className="border-t hover:bg-gray-50">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.staffId || t.staffID}</td>
                <td className="p-3">{t.specialization || t.department}</td>
                <td className="p-3">{t.classes || t.class}</td>
                <td className="p-3">
                  {Array.isArray(t.subjects) && t.subjects.length > 0
                    ? t.subjects.join(", ")
                    : Array.isArray(t.subject)
                    ? t.subject.join(", ")
                    : (t.subject && String(t.subject)) || "-"}
                </td>
                <td className={`p-3 text-center font-semibold ${getTotalAttendance(t) >= 75 ? 'text-green-600' : getTotalAttendance(t) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {String(getTotalAttendance(t))}%
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => markTodayAttendance(t.id, 'Present')}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                      title="Mark today Present"
                    >
                      Present
                    </button>

                    <button
                      onClick={() => markTodayAttendance(t.id, 'Absent')}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      title="Mark today Absent"
                    >
                      Absent
                    </button>

                    <button onClick={() => { setSelectedForAttendance(t); setAttendanceModalOpen(true); }} className="px-3 py-1 bg-blue-600 text-white rounded-md">Mark Attendance</button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTeachers.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center p-6 text-gray-500">No teachers found for this class.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedForAttendance && attendanceModalOpen && (
        <AttendanceModal
          teacher={selectedForAttendance}
          onClose={() => { setAttendanceModalOpen(false); setAttendanceUpdatedAt(Date.now()); }}
          selectedClassParam={classParam}
        />
      )}

    
    </main>
  );
}


