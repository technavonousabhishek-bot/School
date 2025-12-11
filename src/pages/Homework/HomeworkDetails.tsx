// src/pages/Homework/HomeworkDetails.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiOutlineShare } from "react-icons/hi";
import { API_ENDPOINTS, buildApiUrl, SCHOOL_API_BASE } from "../../config/api";

interface HomeworkItem {
  title?: string;
  text?: string;
  file?: string;
  fileName?: string;
  timestamp: string;
  recipients?: number[]; // student ids
  recipientsAll?: boolean;
}

interface Student {
  id: number;
  admissionNo: string;
  name: string;
  class: string;
  section?: string;
  fatherName: string;
  contact: string;
  age: number;
  gender: string;
}

export default function HomeworkDetails() {
  const { className } = useParams(); // encoded as `${name}_${section}`
  const navigate = useNavigate();

  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // which history card is expanded
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const storageKey = "homework_data_v1";


  // load students list — prefer backend for students of a class, fall back to localStorage
  useEffect(() => {
    const resolveClassAndStudents = async () => {
      // decode className into name and section
      const decoded = className ? decodeURIComponent(className) : "";
      let namePart = decoded;
      let sectionPart = "";
      const lastUnderscore = decoded.lastIndexOf("_");
      if (lastUnderscore !== -1) {
        namePart = decoded.slice(0, lastUnderscore);
        sectionPart = decoded.slice(lastUnderscore + 1);
      }

      // Try to find class id from backend
      try {
        const clsRes = await fetch(API_ENDPOINTS.school.classes);
        if (clsRes.ok) {
          const clsData = await clsRes.json();
          const found = (clsData || []).find((c: any) => (c.class_name === namePart || c.class_name === namePart.replace(/^Class\s*/i, '')) && (sectionPart ? String(c.section) === String(sectionPart) : true));
          if (found) {
            setClassId(found.id);
            // fetch students for class via class students api
            try {
              const stRes = await fetch(buildApiUrl(SCHOOL_API_BASE, 'class', found.id, 'students/'));
              if (stRes.ok) {
                const st = await stRes.json();
                const mapped = (st || []).map((s: any) => ({ id: s.id, admissionNo: s.enrollment_no ?? s.id, name: s.name ?? s.user?.username ?? '', class: namePart, section: sectionPart || '' }));
                setStudents(mapped);
                return;
              }
            } catch (e) {
              console.warn('Failed to fetch students for class from backend', e);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to resolve class id from backend', e);
      }

      // Fallback to localStorage as before
      try {
        const raw = localStorage.getItem('students');
        if (raw) {
          const all = JSON.parse(raw) as Student[];
          const filtered = all.filter((s) => s.class === namePart && (sectionPart ? s.section === sectionPart : true));
          setStudents(filtered);
          return;
        }
      } catch (err) {
        console.error('Could not load students from localStorage:', err);
      }

      setStudents([]);
    };

    resolveClassAndStudents();
  }, [className]);

  // load homeworks for this class — prefer backend
  useEffect(() => {
    const load = async () => {
      if (classId) {
        try {
          const res = await fetch(`${API_ENDPOINTS.school.homeworks}?classroom=${classId}`);
          if (res.ok) {
            const data = await res.json();
            // map backend homework items to local HomeworkItem shape
            const mapped = (data || []).map((h: any) => ({
              title: h.title || '',
              text: h.description || h.text || '',
              file: h.file || undefined,
              fileName: h.file ? h.file.split('/').pop() : undefined,
              timestamp: h.created_at || new Date().toISOString(),
              recipients: h.student_ids || undefined,
              recipientsAll: !(h.student_ids && h.student_ids.length),
            }));
            setHomeworks(mapped);
            return;
          }
        } catch (e) {
          console.warn('Failed to load homeworks from backend', e);
        }
      }

      // fallback to localStorage
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHomeworks(parsed[className!] || []);
      } else {
        setHomeworks([]);
      }
    };

    load();
  }, [classId, className]);

  const resetRecipientSelection = () => {
    setSelectedRecipients(new Set());
    setSelectAll(false);
  };

  const openSharePanel = () => {
    resetRecipientSelection();
    setShowSharePanel(true);
  };

  const toggleRecipient = (id: number) => {
    setSelectedRecipients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectAll(next.size === students.length && students.length > 0);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRecipients(new Set(students.map((s) => s.id)));
    } else {
      setSelectedRecipients(new Set());
    }
  };

  const saveToLocalStorage = (updatedHomeworks: HomeworkItem[]) => {
    const stored = localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[className!] = updatedHomeworks;
    localStorage.setItem(storageKey, JSON.stringify(parsed));
    setHomeworks(updatedHomeworks);
  };

  const saveHomeworkWithRecipients = (newHomework: HomeworkItem) => {
    // prefer to POST to backend when classId available
    const postToBackend = async () => {
      if (!classId) return false;
      try {
        const fd = new FormData();

        // Required fields
        fd.append("title", newHomework.title || "");
        fd.append("description", newHomework.text || "");

        // Assignment type
        fd.append("assignment_type", newHomework.recipientsAll ? "class" : "student");

        // Backend-required fields (not in UI)
        fd.append("subject", newHomework.title || "General");   // FIXED
        fd.append("due_date", new Date().toISOString().slice(0, 10)); // FIXED
        fd.append("class_name", String(classId)); // FIXED

        // Students (if specific)
        if (newHomework.recipients && newHomework.recipients.length > 0) {
          newHomework.recipients.forEach(id => {
            fd.append("student_ids", String(id));
          });
        }

        // File (if exists)
        if (newHomework.file) {
          const arr = newHomework.file.split(",");
          const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
          const bstr = atob(arr[1]);

          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);

          const fileObj = new File([u8arr], newHomework.fileName || "upload.bin", {
            type: mime,
          });

          fd.append("file", fileObj);
        }

        const res = await fetch(API_ENDPOINTS.school.homeworks, {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          const created = await res.json();
          // prepend to list
          const mapped: HomeworkItem = {
            title: created.title || newHomework.title,
            text: created.description || newHomework.text,
            file: created.file || newHomework.file,
            fileName: created.file ? created.file.split('/').pop() : newHomework.fileName,
            timestamp: created.created_at || newHomework.timestamp,
            recipients: created.student_ids || undefined,
            recipientsAll: !(created.student_ids && created.student_ids.length),
          };
          setHomeworks((prev) => [mapped, ...prev]);
          return true;
        }
      } catch (e) {
        console.warn('Failed to POST homework to backend', e);
      }
      return false;
    };

    postToBackend().then((ok) => {
      if (!ok) {
        const updated = [newHomework, ...homeworks];
        saveToLocalStorage(updated);
      }
    });
  };

  const handleSendClick = () => {
    openSharePanel();
  };

  const handleShareFinally = () => {
    if (!text && !file) {
      alert("Please provide either text or a media file.");
      return;
    }

    const baseHomework: HomeworkItem = {
      title,
      text,
      timestamp: new Date().toISOString(),
    };

    const recipientsArray = Array.from(selectedRecipients);
    const recipientsAllFlag = selectAll || recipientsArray.length === students.length;

    const finalHomework: HomeworkItem = {
      ...baseHomework,
      recipients: recipientsAllFlag ? undefined : recipientsArray,
      recipientsAll: recipientsAllFlag ? true : false,
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        finalHomework.file = reader.result as string;
        finalHomework.fileName = file.name;
        saveHomeworkWithRecipients(finalHomework);
        setText("");
        setTitle("");
        setFile(null);
        setShowSharePanel(false);
      };
      reader.readAsDataURL(file);
    } else {
      saveHomeworkWithRecipients(finalHomework);
      setText("");
      setTitle("");
      setShowSharePanel(false);
    }
  };

  const handleEdit = (hw: HomeworkItem, idx: number) => {
    setEditingHomework(hw);
    setEditingIndex(idx);
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (editingHomework && editingIndex !== null) {
      const updated = [...homeworks];
      updated[editingIndex] = { ...editingHomework };
      saveToLocalStorage(updated);
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = (idx: number) => {
    if (confirm("Are you sure you want to delete this homework?")) {
      const updated = homeworks.filter((_, i) => i !== idx);
      saveToLocalStorage(updated);
    }
  };

  const displayClassTitle = decodeURIComponent(className || "").replace(/_/g, " - ");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Homework for {displayClassTitle}</h2>

        <button
          onClick={() => navigate("/homework")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          Back to Classes
        </button>
      </div>


      {/* Assign New Homework Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="font-semibold text-lg mb-3">Assign New Homework</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="border rounded-lg px-3 py-2 mb-3 w-64 focus:ring focus:ring-blue-200"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter homework text (max 1000 words)"
          maxLength={1000}
          className="border rounded-lg w-full p-3 mb-3 focus:ring focus:ring-blue-200"
        />

        <label className="mb-3 inline-flex items-center gap-3 cursor-pointer">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Choose file
          </span>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          {file && <span className="text-blue-600 text-sm truncate max-w-sm">{file.name}</span>}
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendClick}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <HiOutlineShare className="w-5 h-5" />
            Send Homework
          </button>

          {/* Share panel modal (bigger) */}
          {showSharePanel && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
              onClick={() => setShowSharePanel(false)}
            >
              <div
                className="bg-white border rounded-lg p-6 shadow-md w-full max-w-4xl max-h-[80vh] overflow-auto mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-lg">Select students to share with</strong>
                  <div className="flex items-center gap-3">
                    <label className="text-sm flex items-center gap-2">
                      <input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} />
                      Select All
                    </label>
                    <button onClick={() => setShowSharePanel(false)} className="text-sm text-gray-500 hover:underline">
                      Close
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="max-h-[60vh] overflow-auto border rounded-md p-2" role="list">
                    {students.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">No students loaded.</div>
                    ) : (
                      students.map((s) => (
                        <label key={s.id} className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectAll || selectedRecipients.has(s.id)}
                            onChange={() => toggleRecipient(s.id)}
                          />
                          <div className="text-sm">
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-gray-500">
                              {s.admissionNo} · {s.class} · {s.contact}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="text-sm text-gray-700">Selected: {selectedRecipients.size} / {students.length}</div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleShareFinally}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Confirm & Share
                      </button>
                      <button onClick={() => setShowSharePanel(false)} className="px-3 py-2 rounded-lg border">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Homework History */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold text-lg mb-4">Homework History</h3>
        {homeworks.length === 0 ? (
          <p className="text-gray-500 italic">No homework assigned yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {homeworks.map((hw, idx) => {
              const dateStr = new Date(hw.timestamp).toLocaleString();
              // Compute recipients display: prefer student names when IDs are present
              let recipientsList = "No recipients";
              let recipientNames: string[] = [];

              // helper: try to resolve student name by id from current class students first,
              // then fall back to the global students list stored in localStorage.
              const resolveStudentName = (rawId: any) => {
                const idNum = typeof rawId === "string" ? Number(rawId) : rawId;
                const found = students.find((st) => st.id === idNum);
                if (found) return found.name;
                try {
                  const globalRaw = localStorage.getItem("students");
                  if (globalRaw) {
                    const all = JSON.parse(globalRaw) as Student[];
                    const g = all.find((st) => st.id === idNum);
                    if (g) return g.name;
                  }
                } catch (e) {
                  // ignore parse errors
                }
                return String(rawId);
              };

              if (hw.recipientsAll) {
                recipientsList = "All students";
              } else if (hw.recipients && hw.recipients.length > 0) {
                // map ids to student names, with fallback to global students
                recipientNames = hw.recipients.map((id) => resolveStudentName(id));
                // show either full list when small, or a truncated preview
                if (recipientNames.length <= 5) recipientsList = recipientNames.join(", ");
                else recipientsList = `${recipientNames.slice(0, 5).join(", ")}, +${recipientNames.length - 5} more`;
              }

              return (
                <li
                  key={idx}
                  className="border rounded-lg p-4 bg-gray-50 flex flex-col gap-2 cursor-pointer"
                  onClick={() => setExpandedIndex((prev) => (prev === idx ? null : idx))}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {hw.title
                          ? hw.title.length > 80
                            ? hw.title.slice(0, 80) + "…"
                            : hw.title
                          : hw.text
                            ? hw.text.length > 120
                              ? hw.text.slice(0, 120) + "…"
                              : hw.text
                            : "(No text)"}
                      </div>
                      {hw.title && hw.text && (
                        <div className="text-sm text-gray-600 mt-1">
                          {hw.text.length > 120 ? hw.text.slice(0, 120) + "…" : hw.text}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {recipientsList} · {dateStr}
                      </div>
                    </div>

                    <div className="flex gap-3 text-lg">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(hw, idx);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(idx);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {expandedIndex === idx && (
                    <div className="mt-3 bg-white border rounded-md p-3">
                      {hw.title && (
                        <div className="mb-2">
                          <strong>Title:</strong>
                          <div className="text-sm mt-1">{hw.title}</div>
                        </div>
                      )}
                      {hw.text && (
                        <div className="mb-2">
                          <strong>Text:</strong>
                          <div className="text-sm mt-1">{hw.text}</div>
                        </div>
                      )}

                      {hw.file && (
                        <div className="mb-2">
                          <strong>Attachment:</strong>
                          <div className="mt-1">
                            <a
                              href={hw.file}
                              download={hw.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                            >
                              {hw.fileName}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        <strong>Date:</strong> {dateStr}
                      </div>
                      {recipientNames && recipientNames.length > 0 && (
                        <div className="mt-3 text-sm text-gray-700">
                          <strong>Recipients:</strong> {recipientNames.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Edit Homework Modal */}
      {isEditModalOpen && editingHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Homework</h3>

            <div className="flex flex-col gap-3">
              <input
                value={editingHomework.title || ""}
                onChange={(e) => setEditingHomework({ ...editingHomework, title: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Title (optional)"
              />
              <textarea
                value={editingHomework.text || ""}
                onChange={(e) =>
                  setEditingHomework({ ...editingHomework, text: e.target.value })
                }
                className="border rounded-lg p-3"
                placeholder="Edit text"
              />
              {editingHomework.fileName && (
                <div className="text-sm text-gray-600">
                  Attached file: {editingHomework.fileName}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
