import { useEffect, useState } from "react";

type SubjectRow = {
  id: number;
  name: string;
  total: number | "";
  obtained: number | "";
};

type ResultItem = {
  id: number;
  examType: string;
  className: string;
  studentName: string;
  subjects: SubjectRow[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  createdAt: string;
};

const DEFAULT_EXAM_TYPES = ["Unit Test", "Mid Term", "Final Exam", "Other / Custom"];

export default function ManageResults() {
  const [mode, setMode] = useState<"home" | "add" | "list" | "view">("home");

  // form states
  const [examType, setExamType] = useState("");
  const [customExam, setCustomExam] = useState("");
  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subjectRows, setSubjectRows] = useState<SubjectRow[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // data
  const [classList, setClassList] = useState<string[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [viewItem, setViewItem] = useState<ResultItem | null>(null);
  const [alertMsg, setAlertMsg] = useState("");

  // ✅ Load all data initially
  useEffect(() => {
    loadAllData();
  }, []);

  // ✅ Reload results whenever mode changes (important fix)
  useEffect(() => {
    if (mode === "list" || mode === "home") {
      const saved = localStorage.getItem("school_results");
      if (saved) {
        try {
          setResults(JSON.parse(saved));
        } catch {
          setResults([]);
        }
      }
    }
  }, [mode]);

  const loadAllData = () => {
    // classes
    try {
      const raw = localStorage.getItem("classes") || localStorage.getItem("school_classes");
      if (raw) {
        const parsed = JSON.parse(raw);
        const names = Array.isArray(parsed)
          ? parsed.map((c: any) => c?.className ?? c?.name ?? (typeof c === "string" ? c : ""))
          : [];
        setClassList(names.filter(Boolean));
      }
    } catch {}
    // students
    try {
      const raw = localStorage.getItem("students");
      if (raw) {
        const parsed = JSON.parse(raw);
        const names = Array.isArray(parsed)
          ? parsed.map((s: any) => s?.name ?? s?.studentName ?? (typeof s === "string" ? s : ""))
          : [];
        setStudents(names.filter(Boolean));
      }
    } catch {}
    // results
    try {
      const saved = localStorage.getItem("school_results");
      if (saved) setResults(JSON.parse(saved));
    } catch {
      setResults([]);
    }
  };

  // ✅ Save data to localStorage
  const saveResults = (data: ResultItem[]) => {
    localStorage.setItem("school_results", JSON.stringify(data));
    setResults(data);
  };

  // helpers
  const newSubjectRow = (): SubjectRow => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: "",
    total: "",
    obtained: "",
  });

  const resetForm = () => {
    setExamType("");
    setCustomExam("");
    setClassName("");
    setStudentName("");
    setSubjectRows([]);
    setEditingId(null);
  };

  const addSubject = () => setSubjectRows((s) => [...s, newSubjectRow()]);
  const updateSubject = (id: number, patch: Partial<SubjectRow>) =>
    setSubjectRows((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeSubject = (id: number) => setSubjectRows((s) => s.filter((r) => r.id !== id));

  const calculateTotals = (rows: SubjectRow[]) => {
    let total = 0;
    let obtained = 0;
    for (const r of rows) {
      total += Number(r.total) || 0;
      obtained += Number(r.obtained) || 0;
    }
    const percentage = total ? (obtained / total) * 100 : 0;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 40) grade = "D";
    else grade = "F";
    return { total, obtained, percentage: Number(percentage.toFixed(2)), grade };
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 2000);
  };

  // ✅ Save Result (Add / Update)
  const handleSaveResult = () => {
    const examName = examType === "Other / Custom" ? (customExam || "Custom Exam") : examType;
    if (!examName) return alert("Select exam type");
    if (!className) return alert("Select class");
    if (!studentName) return alert("Enter student name");
    if (subjectRows.length === 0) return alert("Add at least one subject");

    for (const r of subjectRows) {
      if (!r.name) return alert("Fill all subject names");
      if (r.total === "" || r.obtained === "") return alert("Fill all marks");
      if (Number(r.obtained) > Number(r.total))
        return alert(`Obtained marks > total in ${r.name}`);
    }

    const { total, obtained, percentage, grade } = calculateTotals(subjectRows);

    if (editingId) {
      const updated = results.map((res) =>
        res.id === editingId
          ? { ...res, examType: examName, className, studentName, subjects: subjectRows, totalMarks: total, obtainedMarks: obtained, percentage, grade }
          : res
      );
      saveResults(updated);
      showAlert("✅ Result updated successfully!");
    } else {
      const newItem: ResultItem = {
        id: Date.now(),
        examType: examName,
        className,
        studentName,
        subjects: subjectRows,
        totalMarks: total,
        obtainedMarks: obtained,
        percentage,
        grade,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...results];
      saveResults(updated);
      showAlert("✅ Result saved successfully!");
    }

    resetForm();
    setMode("list");
  };

  const handleEdit = (id: number) => {
    const item = results.find((r) => r.id === id);
    if (!item) return;
    setEditingId(id);
    setExamType(DEFAULT_EXAM_TYPES.includes(item.examType) ? item.examType : "Other / Custom");
    setCustomExam(DEFAULT_EXAM_TYPES.includes(item.examType) ? "" : item.examType);
    setClassName(item.className);
    setStudentName(item.studentName);
    setSubjectRows(item.subjects.map((s) => ({ ...s })));
    setMode("add");
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this result?")) return;
    const updated = results.filter((x) => x.id !== id);
    saveResults(updated);
    showAlert("🗑️ Result deleted!");
  };

  const handleView = (id: number) => {
    const item = results.find((r) => r.id === id) || null;
    setViewItem(item);
    setMode("view");
  };

  const visibleResults = results.filter((r) => {
    if (filterClass && r.className !== filterClass) return false;
    if (filterExam && r.examType !== filterExam) return false;
    return true;
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Manage Results</h1>

      {alertMsg && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50">
          {alertMsg}
        </div>
      )}

      {/* Home */}
      {mode === "home" && (
        <div className="flex justify-center gap-4">
          <button onClick={() => { resetForm(); setMode("add"); }} className="bg-green-600 text-white px-6 py-3 rounded-xl">➕ Add New Result</button>
          <button onClick={() => setMode("list")} className="bg-blue-600 text-white px-6 py-3 rounded-xl">📋 View Results</button>
        </div>
      )}

      {/* Add/Edit */}
      {mode === "add" && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow mt-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Result" : "Add Result"}</h2>
            <button onClick={() => setMode("list")} className="bg-gray-200 px-3 py-1 rounded">Back</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select value={examType} onChange={(e) => setExamType(e.target.value)} className="p-2 border rounded">
              <option value="">Select Exam</option>
              {DEFAULT_EXAM_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {examType === "Other / Custom" && (
              <input value={customExam} onChange={(e) => setCustomExam(e.target.value)} placeholder="Custom Exam Name" className="p-2 border rounded" />
            )}

            <select value={className} onChange={(e) => setClassName(e.target.value)} className="p-2 border rounded">
              <option value="">Select Class</option>
              {classList.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select value={studentName} onChange={(e) => setStudentName(e.target.value)} className="p-2 border rounded">
              <option value="">Select Student (or type below)</option>
              {students.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Or enter student name" className="p-2 border rounded" />
          </div>

          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Subjects</h3>
            <button onClick={addSubject} className="bg-green-500 text-white px-3 py-1 rounded">+ Add Subject</button>
          </div>

          <div className="space-y-2">
            {subjectRows.map((r) => (
              <div key={r.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                <input value={r.name} onChange={(e) => updateSubject(r.id, { name: e.target.value })} placeholder="Subject" className="p-2 border rounded" />
                <input type="number" value={r.total} onChange={(e) => updateSubject(r.id, { total: Number(e.target.value) })} placeholder="Total" className="p-2 border rounded" />
                <input type="number" value={r.obtained} onChange={(e) => updateSubject(r.id, { obtained: Number(e.target.value) })} placeholder="Obtained" className="p-2 border rounded" />
                <div className="text-sm text-gray-600">{r.obtained}/{r.total}</div>
                <button onClick={() => removeSubject(r.id)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4 gap-3">
            <button onClick={handleSaveResult} className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update" : "Save"}</button>
            <button onClick={() => setMode("home")} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {mode === "list" && (
        <div className="max-w-6xl mx-auto mt-4">
          <div className="flex gap-3 mb-4">
            <button onClick={() => { resetForm(); setMode("add"); }} className="bg-green-600 text-white px-4 py-2 rounded">+ Add</button>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="p-2 border rounded">
              <option value="">All Classes</option>
              {classList.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} className="p-2 border rounded">
              <option value="">All Exams</option>
              {[...new Set(results.map((r) => r.examType))].map((et) => <option key={et}>{et}</option>)}
            </select>
            <button onClick={() => { setFilterClass(""); setFilterExam(""); }} className="bg-gray-200 px-3 py-1 rounded">Clear Filters</button>
          </div>

          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-2 border">Exam</th>
                  <th className="p-2 border">Class</th>
                  <th className="p-2 border">Student</th>
                  <th className="p-2 border">%</th>
                  <th className="p-2 border">Grade</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleResults.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 border">{r.examType}</td>
                    <td className="p-2 border">{r.className}</td>
                    <td className="p-2 border">{r.studentName}</td>
                    <td className="p-2 border">{r.percentage}%</td>
                    <td className="p-2 border">{r.grade}</td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(r.id)} className="bg-blue-600 text-white px-2 py-1 rounded">View</button>
                        <button onClick={() => handleEdit(r.id)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white px-2 py-1 rounded">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleResults.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">No results found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View */}
      {mode === "view" && viewItem && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow mt-4">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-semibold">Result Details</h3>
            <button onClick={() => setMode("list")} className="bg-gray-200 px-3 py-1 rounded">Back</button>
          </div>
          <div><b>Exam:</b> {viewItem.examType}</div>
          <div><b>Class:</b> {viewItem.className}</div>
          <div><b>Student:</b> {viewItem.studentName}</div>
          <div className="mt-2">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Subject</th>
                  <th className="p-2 border">Obtained</th>
                  <th className="p-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewItem.subjects.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2 border">{s.name}</td>
                    <td className="p-2 border">{s.obtained}</td>
                    <td className="p-2 border">{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 font-medium">
            Total: {viewItem.obtainedMarks}/{viewItem.totalMarks} | {viewItem.percentage}% | Grade: {viewItem.grade}
          </div>
        </div>
      )}
    </div>
  );
}