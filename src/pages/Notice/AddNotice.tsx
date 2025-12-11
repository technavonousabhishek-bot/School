// AddNotice.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_ENDPOINTS, buildApiUrl, SCHOOL_API_BASE } from "../../config/api";

type Notice = {
  id: string;
  audience: "students" | "teachers";
  title: string;
  description: string;
  className?: string;
  applicableDate?: string;
  validTill?: string;
  applicableTo?: string[];
  postedBy: string;
  createdAt: string;
};

type LocationState = {
  audience?: "students" | "teachers";
  className?: string;
  edit?: Notice;
};

// minimal local types for students/teachers loaded from localStorage
type Student = {
  id: number | string;
  admissionNo?: string;
  name: string;
  class?: string;
  section?: string;
  contact?: string;
};

type Teacher = {
  id: number | string;
  name: string;
  contact?: string;
};

export default function AddNotice() {
  const navigate = useNavigate();
  const loc = useLocation();
  const state = (loc.state || {}) as LocationState;

  const editing = !!state.edit;
  const editNotice = state.edit as Notice | undefined;

  const userRole = localStorage.getItem("userRole") || "teacher"; // fetch role

  // ✅ Audience logic: teacher can only select "students"
  const initialAudience = userRole === "teacher" ? "students" : state.audience || "students";

  const [audience, setAudience] = useState<"students" | "teachers">(initialAudience);
  const [className, setClassName] = useState<string | "">((state.className as string) || (editNotice?.className ?? ""));
  const [classId, setClassId] = useState<number | "">("");
  const [title, setTitle] = useState(editNotice?.title ?? "");
  const [description, setDescription] = useState(editNotice?.description ?? "");
  const [applicableDate, setApplicableDate] = useState(editNotice?.applicableDate ?? "");
  const [classesList, setClassesList] = useState<Array<{ id: number | string; name: string }>>([]);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [teachersList] = useState<Teacher[]>([]);
  const [selectedApplicable, setSelectedApplicable] = useState<Set<string>>(new Set(editNotice?.applicableTo ?? []));
  const [selectAllApplicable, setSelectAllApplicable] = useState(false);

  useEffect(() => {
    if (audience === "teachers") setClassName("");
  }, [audience]);

  useEffect(() => {
    // Load classes from backend if available; fall back to localStorage
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.school.classes);
        if (!res.ok) throw new Error('no classes');
        const data = await res.json();
        if (cancelled) return;
        // data expected as array of Class objects with id and class_name
        const classes = (data || []).map((c: any) => ({ id: c.id ?? c.pk ?? c.id, name: c.class_name || c.className || String(c.id) }));
        if (classes.length) {
          setClassesList(classes);
          return;
        }
      } catch (err) {
        // fallback to localStorage
        try {
          const raw = localStorage.getItem("classes");
          if (raw) {
            const parsed = JSON.parse(raw) as any[];
            const classes = parsed.map((c) => ({ id: c.id ?? c.className ?? c.name ?? String(c.id), name: c.className || c.name || String(c.id) }));
            if (classes.length) {
              setClassesList(classes as any);
              return;
            }
          }
        } catch (e) { }

        try {
          const rawStudents = localStorage.getItem("students");
          if (rawStudents) {
            const studs = JSON.parse(rawStudents) as any[];
            const names = Array.from(new Set(studs.map((s) => s.class).filter(Boolean)));
            const classes = names.map((n) => ({ id: n, name: n }));
            setClassesList(classes as any);
            return;
          }
        } catch (e) { }

        setClassesList([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // load students and teachers from storage for applicable-to lists
  useEffect(() => {
    // When classId changes, fetch students for that class from backend; fallback to localStorage by className
    let cancelled = false;
    const loadStudents = async () => {
      if (classId) {
        try {
          const res = await fetch(buildApiUrl(SCHOOL_API_BASE, 'class', classId, 'students/'));
          if (!res.ok) throw new Error('failed');
          const data = await res.json();
          if (cancelled) return;
          // backend returns array with {id, name, enrollmentNo, parent_name, parent_contact, class, section}
          const mapped = (data || []).map((s: any) => ({ id: s.id, name: s.name || s.student_name || '', admissionNo: s.enrollmentNo || '', class: s.class || '', section: s.section || '', contact: s.parent_contact || '' }));
          setStudentsInClass(mapped);
          return;
        } catch (err) {
          // fallback below
        }
      }

      // fallback: use localStorage students filtered by className
      try {
        const raw = localStorage.getItem("students");
        if (raw) {
          const all = JSON.parse(raw) as Student[];
          if (className) {
            const filtered = all.filter((s) => s.class === className || String(s.class) === String(className));
            setStudentsInClass(filtered);
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      setStudentsInClass([]);
    };
    loadStudents();
    return () => { cancelled = true; };
  }, [classId, className]);

  // reset applicable selection when audience or class changes
  useEffect(() => {
    setSelectedApplicable(new Set());
    setSelectAllApplicable(false);
  }, [audience, className, classId]);

  const toggleApplicable = (key: string) => {
    setSelectedApplicable((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelectAllApplicable(false);
      return next;
    });
  };

  const handleSelectAllApplicable = (checked: boolean) => {
    if (checked) {
      if (audience === "students") {
        setSelectedApplicable(new Set(studentsInClass.map((s) => s.name)));
      } else {
        setSelectedApplicable(new Set(teachersList.map((t) => t.name)));
      }
      setSelectAllApplicable(true);
    } else {
      setSelectedApplicable(new Set());
      setSelectAllApplicable(false);
    }
  };

  // Notices are saved to backend via API
  // Use backend API for notices
  // API helpers imported at bottom of file (to keep patch minimal)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // per-student targeting removed from UI; postedBy is derived from current user
    const payload = {
      audience,
      title,
      description,
      className: audience === "students" ? className || undefined : undefined,
      applicableDate: applicableDate || undefined,
      applicableTo: selectedApplicable.size > 0
        ? studentsInClass.filter(s => selectedApplicable.has(s.name)).map(s => s.id)
        : undefined
    };

    try {
      if (editing && editNotice) {
        // update via API
        const { updateNotice } = await import('../../api/notices');
        await updateNotice(editNotice.id, payload as any);
        alert('Notice updated');
      } else {
        const { createNotice } = await import('../../api/notices');
        await createNotice(payload as any);
        alert('Notice added');
      }
    } catch (err) {
      console.error('notice save failed', err);
      alert('Failed to save notice to server.');
    }

    // navigate based on audience
    if (audience === "teachers") {
      navigate("/notice/teachers");
    } else {
      if (payload.className) {
        navigate(`/notice/students/${encodeURIComponent(payload.className)}`);
      } else {
        navigate("/notice/students");
      }
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">{editing ? "Edit Notice" : "Add Notice"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Audience dropdown hidden for teacher */}
          {userRole === "admin" ? (
            <div>
              <label className="block text-sm font-medium">Target</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value as any)} className="mt-1 p-2 border rounded w-full">
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
              </select>
            </div>
          ) : (
            <input type="hidden" value="students" />
          )}

          {audience === "students" && (
            <div>
              <label className="block text-sm font-medium">Class</label>
              <select value={String(classId || '')} onChange={(e) => {
                const val = e.target.value;
                if (!val) { setClassId(''); setClassName(''); return; }
                // try to parse numeric id first
                const parsed = Number(val);
                if (!isNaN(parsed) && parsed !== 0) {
                  // find class name from classesList if present (we stored names only), otherwise set from option text
                  setClassId(parsed);
                  const option = e.target.selectedOptions?.[0]?.text || '';
                  setClassName(option);
                } else {
                  setClassId('');
                  setClassName(val);
                }
              }} className="mt-1 p-2 border rounded w-full">
                <option value="">-- All Classes --</option>
                {classesList.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Leave class empty to target all classes.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 p-2 border rounded w-full" required />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 p-2 border rounded w-full" rows={4} required />
          </div>

          <div>
            <label className="block text-sm font-medium">Applicable Date</label>
            <input type="date" value={applicableDate} onChange={(e) => setApplicableDate(e.target.value)} className="mt-1 p-2 border rounded w-full" />
          </div>

          {/* Applicable To: show checkboxes for students of chosen class, or for all teachers when audience=teachers */}
          {audience === "students" && (classId || className) && (
            <div>
              <label className="block text-sm font-medium">Applicable To</label>

              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectAllApplicable || (studentsInClass.length > 0 && selectedApplicable.size === studentsInClass.length)}
                    onChange={(e) => handleSelectAllApplicable(e.target.checked)}
                  />
                  Select All
                </label>
                <div className="text-sm text-gray-500 ml-auto">{selectedApplicable.size} selected</div>
              </div>

              <div className="max-h-48 overflow-auto border rounded p-2 mt-2">
                {studentsInClass.length === 0 ? (
                  <div className="text-sm text-gray-500">No students found for selected class.</div>
                ) : (
                  studentsInClass.map((s) => (
                    <label key={s.id} className="flex items-center gap-3 py-1 px-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" checked={selectedApplicable.has(s.name)} onChange={() => toggleApplicable(s.name)} />
                      <div className="text-sm">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.admissionNo || s.id} · {s.contact || ""}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {audience === "teachers" && (
            <div>
              <label className="block text-sm font-medium">Applicable To</label>

              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectAllApplicable || (teachersList.length > 0 && selectedApplicable.size === teachersList.length)}
                    onChange={(e) => handleSelectAllApplicable(e.target.checked)}
                  />
                  Select All
                </label>
                <div className="text-sm text-gray-500 ml-auto">{selectedApplicable.size} selected</div>
              </div>

              <div className="max-h-48 overflow-auto border rounded p-2 mt-2">
                {teachersList.length === 0 ? (
                  <div className="text-sm text-gray-500">No teachers found.</div>
                ) : (
                  teachersList.map((t) => (
                    <label key={t.id} className="flex items-center gap-3 py-1 px-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" checked={selectedApplicable.has(t.name)} onChange={() => toggleApplicable(t.name)} />
                      <div className="text-sm">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.contact || ""}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? "Update" : "Publish"}</button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </main>
  );
}