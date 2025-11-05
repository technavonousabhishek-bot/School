import { useParams, useNavigate } from "react-router-dom";
import { useExamStore } from "../../context/ExamStoreContext";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import TimetableMain from "../Timetable/TimetableMain";

export default function ExamTypePage() {
  const { classId, examType } = useParams();
  const navigate = useNavigate();
  const { exams, addExam, updateExam, deleteExam } = useExamStore();
  const cid = classId ? Number(classId) : null;
  const type = (examType as "mid-term" | "annual" | "timetable" | undefined) ?? undefined;

  type SubjectRow = { subject: string; exam_date: string; start_time: string; end_time: string; max_marks: number };
  const [form, setForm] = useState<{ exam_name: string; subjects: SubjectRow[] }>({ exam_name: "", subjects: [{ subject: "", exam_date: "", start_time: "09:00", end_time: "11:00", max_marks: 100 }] });
  const [editId, setEditId] = useState<number | null>(null);

  const startEdit = (ex: any) => {
    setEditId(ex.id);
    const sList: SubjectRow[] = (ex.subjects && ex.subjects.length > 0) ? ex.subjects.map((s: any) => ({ subject: s.subject || "", exam_date: s.exam_date || "", start_time: s.start_time || "09:00", end_time: s.end_time || "11:00", max_marks: s.max_marks || 100 })) : [{ subject: "", exam_date: "", start_time: "09:00", end_time: "11:00", max_marks: 100 }];
    setForm({ exam_name: ex.exam_name || "", subjects: sList });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ exam_name: "", subjects: [{ subject: "", exam_date: "", start_time: "09:00", end_time: "11:00", max_marks: 100 }] });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !cid) return;
    updateExam(cid, editId, {
      exam_name: form.exam_name,
      subjects: form.subjects,
    });
    alert("Exam updated.");
    cancelEdit();
  };

  if (!cid || !type) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Back</button>
        <p className="text-gray-600">Invalid class or exam type.</p>
      </div>
    );
  }

  const list = exams[cid] ? exams[cid].filter((e) => e.type === type) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExam(cid, {
      exam_name: form.exam_name || (type === "mid-term" ? "Mid Term" : "Annual Exam"),
      type: type === "timetable" ? "mid-term" : (type as "mid-term" | "annual"),
      subjects: form.subjects.map((s) => ({ subject: s.subject || "Subject", exam_date: s.exam_date, start_time: s.start_time, end_time: s.end_time, max_marks: s.max_marks })),
    });
    setForm({ exam_name: "", subjects: [{ subject: "", exam_date: "", start_time: "09:00", end_time: "11:00", max_marks: 100 }] });
    alert("Exam saved.");
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Class {cid} — {type?.replace("-", " ")}</h1>
          <p className="text-gray-500 text-sm">List and create {type} exams for this class.</p>
        </div>
        <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md text-gray-600">Back</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow border">
          <h3 className="text-lg font-semibold mb-4">Existing {type} exams</h3>
          {list.length === 0 && <p className="text-gray-500">No exams yet.</p>}
          {list.map((ex) => (
            <div key={ex.id} className="py-3 border-b last:border-b-0">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="text-blue-500 mt-1" />
                  <div>
                    <div className="font-medium">{ex.exam_name}</div>
                    <div className="text-sm text-gray-500">{ex.subjects.length} subjects</div>
                    <div className="mt-2 text-sm text-gray-600">
                      {ex.subjects.map((s, i) => (
                        <div key={i}>{s.subject} — {s.exam_date} ({s.start_time} - {s.end_time})</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 flex flex-col items-end gap-2">
                  <div>ID: {ex.id}</div>
                    <div className="flex gap-2">
                    <button onClick={() => startEdit(ex)} className="text-yellow-600 hover:text-yellow-800">✏️ Edit</button>
                    <button onClick={() => { if (confirm('Delete this exam?')) { deleteExam(cid, ex.id); alert('Exam deleted.'); } }} className="text-red-600 hover:text-red-800">🗑 Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <h3 className="text-lg font-semibold mb-4">{editId ? 'Edit exam' : `Add ${type} exam`}</h3>
          {type === "timetable" ? (
            // embed timetable manager for class (full page component) and pass classId
            <TimetableMain classId={cid} />
          ) : editId ? (
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Exam Name</label>
                <input value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
              </div>
              {/* Subjects dynamic rows */}
              {form.subjects.map((s, idx) => (
                <div key={idx} className="space-y-2 border rounded p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Subject #{idx + 1}</div>
                    <div className="flex gap-2">
                      {form.subjects.length > 1 && (
                        <button type="button" onClick={() => setForm((prev) => ({ ...prev, subjects: prev.subjects.filter((_, i) => i !== idx) }))} className="text-red-600">Remove</button>
                      )}
                      {idx === form.subjects.length - 1 && (
                        <button type="button" onClick={() => setForm((prev) => ({ ...prev, subjects: [...prev.subjects, { subject: "", exam_date: "", start_time: "09:00", end_time: "11:00", max_marks: 100 }] }))} className="text-blue-600">Add</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Subject</label>
                    <input value={s.subject} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], subject: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Date</label>
                      <input type="date" value={s.exam_date} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], exam_date: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max Marks</label>
                      <input type="number" value={s.max_marks} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], max_marks: Number(e.target.value) }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Start Time</label>
                      <input type="time" value={s.start_time} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], start_time: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">End Time</label>
                      <input type="time" value={s.end_time} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], end_time: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between">
                <button type="button" onClick={cancelEdit} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Save Changes</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Exam Name</label>
                <input value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
              </div>
              {/* Subjects dynamic rows for create */}
              {form.subjects.map((s, idx) => (
                <div key={idx} className="space-y-2 border rounded p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Subject #{idx + 1}</div>
                    <div className="flex gap-2">
                      {form.subjects.length > 1 && (
                        <button type="button" onClick={() => setForm((prev) => ({ ...prev, subjects: prev.subjects.filter((_, i) => i !== idx) }))} className="text-red-600">Remove</button>
                      )}
                      {idx === form.subjects.length - 1 && (
                        <button type="button" onClick={() => setForm((prev) => ({ ...prev, subjects: [...prev.subjects, { subject: "", exam_date: "", start_time: "09:00", end_time: "11:00", max_marks: 100 }] }))} className="text-blue-600">Add</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Subject</label>
                    <input value={s.subject} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], subject: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Date</label>
                      <input type="date" value={s.exam_date} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], exam_date: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max Marks</label>
                      <input type="number" value={s.max_marks} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], max_marks: Number(e.target.value) }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Start Time</label>
                      <input type="time" value={s.start_time} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], start_time: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">End Time</label>
                      <input type="time" value={s.end_time} onChange={(e) => setForm((prev) => { const copy = [...prev.subjects]; copy[idx] = { ...copy[idx], end_time: e.target.value }; return { ...prev, subjects: copy }; })} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Exam</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
