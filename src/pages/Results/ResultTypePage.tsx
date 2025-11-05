import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassById } from "../../data/classesData";

type SubjectMark = { subject: string; marks?: number };

type StudentRow = {
  id: number;
  admissionNo?: string;
  name: string;
  marks: SubjectMark[]; // per-subject marks
  percent?: number;
};

type SavedResult = {
  id: number;
  classId: number;
  className: string;
  examType: string;
  date: string;
  subjects: string[];
  students: StudentRow[];
};

const STORAGE_KEY = "school_results_v1";

function loadResults(): SavedResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveResults(list: SavedResult[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function ResultTypePage() {
  const { classId, examType } = useParams<{ classId: string; examType: string }>();
  const navigate = useNavigate();
  const cid = Number(classId || 0);

  const cls = getClassById(cid);

  const defaultSubjects = ["Mathematics", "Science", "English"];

  const [subjects] = useState<string[]>(defaultSubjects);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [saved, setSaved] = useState<SavedResult | null>(null);

  useEffect(() => {
    // fetch students.json and filter by class string; fallback to dummy data
    const clsStr = cls ? `${cls.name} - ${cls.section}` : undefined;
    fetch("/students.json")
      .then((r) => r.json())
      .then((data: any[]) => {
        const filtered = clsStr ? data.filter((s) => s.class === clsStr) : data;
        const rows: StudentRow[] = filtered.map((s) => ({
          id: s.id,
          admissionNo: s.admissionNo,
          name: s.name,
          marks: subjects.map((sub) => ({ subject: sub, marks: undefined })),
        }));
        setStudents(rows);
      })
      .catch(() => {
        // dummy fallback
        const dummy = [
          { id: 1, admissionNo: "ENR101", name: "Aarav Sharma" },
          { id: 2, admissionNo: "ENR102", name: "Neha Gupta" },
          { id: 3, admissionNo: "ENR103", name: "Rohan Singh" },
        ];
        const rows: StudentRow[] = dummy.map((s) => ({ id: s.id, admissionNo: s.admissionNo, name: s.name, marks: subjects.map((sub) => ({ subject: sub, marks: undefined })) }));
        setStudents(rows);
      });

    // load saved
    const all = loadResults();
    const found = all.find((r) => r.classId === cid && r.examType === (examType || ""));
    if (found) {
      setSaved(found);
      // populate students from saved result
      setStudents(found.students);
    }
  }, [classId, examType]);

  const handleMarkChange = (studentId: number, subjectIndex: number, value: string) => {
    const num = value === "" ? undefined : Number(value);
    setStudents((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? { ...p, marks: p.marks.map((m, idx) => (idx === subjectIndex ? { ...m, marks: num } : m)) }
          : p
      )
    );
  };

  const handleSave = () => {
    const all = loadResults();
    // compute percent for each student and include subjects in payload
    const studentsWithPercent = students.map((s) => {
      const totalObtained = s.marks.reduce((acc, m) => acc + (m.marks ?? 0), 0);
      const maxTotal = subjects.length * 100;
      const percent = maxTotal > 0 ? Number(((totalObtained / maxTotal) * 100).toFixed(2)) : 0;
      return { ...s, percent };
    });

    const payload: SavedResult = {
      id: Date.now(),
      classId: cid,
      className: cls ? `${cls.name} - ${cls.section}` : "",
      examType: examType || "",
      date: new Date().toISOString().split("T")[0],
      subjects,
      students: studentsWithPercent,
    };

    // if existing, replace
    const existingIndex = all.findIndex((r) => r.classId === cid && r.examType === (examType || ""));
    if (existingIndex >= 0) {
      all[existingIndex] = payload;
    } else {
      all.push(payload);
    }
    saveResults(all);
    setSaved(payload);
    alert("Results saved");
  };

  const handleDelete = () => {
    if (!confirm("Delete saved results for this class and exam type?")) return;
    const all = loadResults().filter((r) => !(r.classId === cid && r.examType === (examType || "")));
    saveResults(all);
    setSaved(null);
    alert("Deleted");
  };

  if (!cls) return <div className="p-6">Class not found</div>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{cls.name} - {cls.section} — {(examType || "").replace("-", " ")}</h1>
          <p className="text-gray-500">Add or edit marks for students in this class</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-200 rounded">Back</button>
          {saved && <button onClick={handleDelete} className="px-3 py-2 bg-red-100 text-red-600 rounded">Delete Saved</button>}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">#</th>
              <th>Name</th>
              <th>Admission No</th>
              {subjects.map((sub) => (
                <th key={sub}>{sub}</th>
              ))}
              <th>Percent</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className="border-t">
                <td className="py-2">{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.admissionNo ?? "-"}</td>
                {subjects.map((sub, idx) => {
                  const markObj = s.marks[idx];
                  return (
                    <td key={sub}>
                      <input
                        type="number"
                        value={markObj?.marks ?? ""}
                        onChange={(e) => handleMarkChange(s.id, idx, e.target.value)}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                  );
                })}
                <td>{s.percent ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() =>
              setStudents((prev) => prev.map((p) => ({ ...p, marks: subjects.map((sub) => ({ subject: sub, marks: undefined })) })))
            }
            className="px-4 py-2 border rounded"
          >
            Clear
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save Marks</button>
        </div>
      </div>

      {/* View saved result */}
      {saved && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Saved Result ({saved.date})</h3>
          <div className="text-sm text-gray-600">Students recorded: {saved.students.length}</div>
          <button onClick={() => navigate(`/manage-results/${saved.id}`)} className="mt-3 px-3 py-2 bg-green-600 text-white rounded">View Details</button>
        </div>
      )}
    </main>
  );
}
