// AddNotice.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { addNotice, classes, updateNotice } from "./noticeData";
import type { Notice } from "./noticeData";

type LocationState = {
  audience?: "students" | "teachers";
  className?: string;
  edit?: Notice;
};

export default function AddNotice() {
  const navigate = useNavigate();
  const loc = useLocation();
  const state = (loc.state || {}) as LocationState;

  const editing = !!state.edit;
  const editNotice = state.edit as Notice | undefined;

  const [audience, setAudience] = useState<"students" | "teachers">(state.audience || "students");
  const [className, setClassName] = useState<string | "">((state.className as string) || (editNotice?.className ?? ""));
  const [title, setTitle] = useState(editNotice?.title ?? "");
  const [description, setDescription] = useState(editNotice?.description ?? "");
  const [applicableDate, setApplicableDate] = useState(editNotice?.applicableDate ?? "");
  const [applicableToText, setApplicableToText] = useState(editNotice?.applicableTo?.join(", ") ?? "");
  const [postedBy, setPostedBy] = useState(editNotice?.postedBy ?? "Admin");

  useEffect(() => {
    // if audience switched to teachers, clear class
    if (audience === "teachers") setClassName("");
  }, [audience]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const applicableTo = applicableToText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Omit<Notice, "id" | "createdAt"> = {
      audience,
      title,
      description,
      className: audience === "students" ? (className || undefined) : undefined,
      applicableDate: applicableDate || undefined,
      validTill: undefined,
      applicableTo,
      postedBy,
    };

    if (editing && editNotice) {
      updateNotice(editNotice.id, payload);
      alert("Notice updated");
    } else {
      addNotice(payload);
      alert("Notice added");
    }

    // go back to relevant list or specific class page so the new notice is visible immediately
    if (audience === "teachers") {
      navigate("/notice/teachers");
    } else {
      // students: if a specific class was selected, go to that class's notices page
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
          <div>
            <label className="block text-sm font-medium">Target</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value as any)} className="mt-1 p-2 border rounded w-full">
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
            </select>
          </div>

          {audience === "students" && (
            <div>
              <label className="block text-sm font-medium">Class</label>
              <select value={className} onChange={(e) => setClassName(e.target.value)} className="mt-1 p-2 border rounded w-full">
                <option value="">-- All Classes --</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
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

          {audience === "students" && (
            <div>
              <label className="block text-sm font-medium">Specific Students (comma-separated names or enrollment no.)</label>
              <input value={applicableToText} onChange={(e) => setApplicableToText(e.target.value)} className="mt-1 p-2 border rounded w-full" placeholder="Aarav Sharma, ENR101, Neha" />
              <p className="text-xs text-gray-500 mt-1">If left empty, notice applies to the whole class (or all classes if class not selected).</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Posted By</label>
            <input value={postedBy} onChange={(e) => setPostedBy(e.target.value)} className="mt-1 p-2 border rounded w-full" />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? "Update" : "Publish"}</button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </main>
  );
}
