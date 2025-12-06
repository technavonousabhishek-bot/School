import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://school-bos-backend.onrender.comschoolApp/";

/**
 * AddEditClass component - updated multi-select for subjects so user can select multiple items at once.
 */

// Subjects will be added by the user via the input below (stored in formData.subjects)

export default function AddEditClass() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    className: "",
    section: "",
    classTeacher: "",
    subjects: [] as string[],
    maxSeats: "",
    roomNo: "",
    dob: "",
  });

  useEffect(() => {
    if (isEditMode) {
      (async () => {
        // try backend first
        try {
          const res = await axios.get(`${API_BASE}classes/${id}/`);
          const data = res.data;
          setFormData({
            className: data.class_name ?? "",
            section: data.section ?? "",
            classTeacher: "",
            subjects: Array.isArray(data.subjects) ? data.subjects : (data.subjects ? JSON.parse(data.subjects) : []),
            maxSeats: String(data.max_seats ?? ""),
            roomNo: data.room_no ?? "",
            dob: "",
          });
          return;
        } catch (e) {
          // fallback to localStorage when backend isn't available
        }

        const raw = localStorage.getItem("classes");
        const saved = raw ? JSON.parse(raw) : [];
        const existing = saved.find((cls: any) => cls.id === Number(id));
        if (existing) {
          setFormData({
            className: existing.className || "",
            section: existing.section || "",
            classTeacher: existing.classTeacher || "",
            subjects: existing.subjects || [],
            maxSeats: existing.maxSeats || "",
            roomNo: existing.roomNo || "",
            dob: existing.dob ? String(existing.dob).slice(0, 10) : "",
          });
        }
      })();
    }
  }, [id, isEditMode]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Subjects input: allow typing a subject and adding it to the subjects array
  const [subjectInput, setSubjectInput] = useState("");

  const addSubject = () => {
    const s = subjectInput.trim();
    if (!s) return;
    setFormData((prev) => ({ ...prev, subjects: prev.subjects.includes(s) ? prev.subjects : [...prev.subjects, s] }));
    setSubjectInput("");
  };

  const removeSubject = (s: string) => {
    setFormData((prev) => ({ ...prev, subjects: prev.subjects.filter((x) => x !== s) }));
  };

  // submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    (async () => {
      const payload: any = {
        class_name: formData.className,
        section: formData.section,
        // backend accepts subjects as JSON list (model uses JSONField)
        subjects: formData.subjects || [],
        max_seats: formData.maxSeats ? Number(formData.maxSeats) : undefined,
        room_no: formData.roomNo || undefined,
      };

      try {
        if (isEditMode) {
          await axios.put(`${API_BASE}classes/${id}/`, payload);
        } else {
          await axios.post(`${API_BASE}classes/`, payload);
        }
        navigate("/classes");
      } catch (err) {
        // fallback to localStorage behavior if API fails
        const raw = localStorage.getItem("classes");
        const saved = raw ? JSON.parse(raw) : [];

        const localPayload = {
          className: formData.className,
          section: formData.section,
          classTeacher: formData.classTeacher,
          subjects: formData.subjects,
          maxSeats: formData.maxSeats,
          roomNo: formData.roomNo,
          dob: formData.dob,
        };

        if (isEditMode) {
          const updated = saved.map((cls: any) => (cls.id === Number(id) ? { ...cls, ...localPayload } : cls));
          localStorage.setItem("classes", JSON.stringify(updated));
        } else {
          const newClass = { id: Date.now(), ...localPayload };
          localStorage.setItem("classes", JSON.stringify([...saved, newClass]));
        }

        navigate("/classes");
      }
    })();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg space-y-4">
        <h2 className={`text-2xl font-bold text-center ${isEditMode ? "text-yellow-600" : "text-blue-600"}`}>
          {isEditMode ? "Edit Class" : "Add New Class"}
        </h2>

        <input type="text" name="className" placeholder="Class Name (e.g. 1, 2, Nursery)" value={formData.className} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />

        <input type="text" name="section" placeholder="Section (e.g. A)" value={formData.section} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />

        <input type="text" name="classTeacher" placeholder="Class Teacher Name" value={formData.classTeacher} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

        {/* Subjects input with Add button */}
        <div className="col-span-2">
          <label className="font-medium block mb-1">Subjects</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="Type subject name"
              className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={addSubject} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {formData.subjects.map((s) => (
              <span key={s} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span>{s}</span>
                <button type="button" onClick={() => removeSubject(s)} className="text-red-600 text-xs">✖</button>
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-1">Add subjects one by one; they will be saved as an array.</p>
        </div>

        <input type="number" name="maxSeats" placeholder="Max Seats" value={formData.maxSeats} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <input type="text" name="roomNo" placeholder="Room No (e.g. R-101)" value={formData.roomNo} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <div className="relative">
          <input type="date" name="dob" placeholder="Date (optional)" value={formData.dob} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">📅</span>
        </div>

        <div className="flex justify-between mt-6">
          <button type="button" onClick={() => navigate("/classes")} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
          <button type="submit" className={`px-4 py-2 rounded text-white ${isEditMode ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"}`}>{isEditMode ? "Update" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
