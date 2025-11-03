// src/pages/Homework/HomeworkDetails.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiOutlineShare } from "react-icons/hi";

interface HomeworkItem {
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
  const [file, setFile] = useState<File | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // which history card is expanded
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const storageKey = "homework_data_v1";

  // load students list
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/HomeworkStudents.json");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Could not load HomeworkStudents.json:", err);
      }
    })();
  }, []);

  // load homeworks for this class
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      setHomeworks(parsed[className!] || []);
    } else {
      setHomeworks([]);
    }
  }, [className]);

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
    const updated = [newHomework, ...homeworks];
    saveToLocalStorage(updated);
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
        setFile(null);
        setShowSharePanel(false);
      };
      reader.readAsDataURL(file);
    } else {
      saveHomeworkWithRecipients(finalHomework);
      setText("");
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
      <button onClick={() => navigate("/homework")} className="mb-4 text-blue-600 hover:underline">
        ← Back to Classes
      </button>

      <h2 className="text-2xl font-bold mb-4">Homework for {displayClassTitle}</h2>

      {/* Assign New Homework Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="font-semibold text-lg mb-3">Assign New Homework</h3>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter homework text (max 1000 words)"
          maxLength={1000}
          className="border rounded-lg w-full p-3 mb-3 focus:ring focus:ring-blue-200"
        />

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-3" />

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendClick}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <HiOutlineShare className="w-5 h-5" />
            Send Homework
          </button>

          {/* Share panel */}
          {showSharePanel && (
            <div className="bg-white border rounded-lg p-4 shadow-md w-full max-w-xl">
              <div className="flex items-center justify-between mb-2">
                <strong>Select students to share with</strong>
                <div className="flex items-center gap-2">
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} />
                    Select All
                  </label>
                  <button onClick={() => setShowSharePanel(false)} className="text-sm text-gray-500 hover:underline">
                    Close
                  </button>
                </div>
              </div>

              <div className="max-h-40 overflow-auto border rounded-md p-2" role="list">
                {students.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No students loaded.</div>
                ) : (
                  students.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 rounded">
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

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleShareFinally}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Confirm & Share
                </button>
                <button onClick={() => setShowSharePanel(false)} className="px-3 py-2 rounded-lg border">
                  Cancel
                </button>
                <div className="text-sm text-gray-500 ml-auto">
                  {selectAll
                    ? `Will share to All students (${students.length})`
                    : `${selectedRecipients.size} selected`}
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
              const recipientsList =
                hw.recipientsAll
                  ? "All students"
                  : hw.recipients && hw.recipients.length > 0
                  ? `${hw.recipients.length} student(s)`
                  : "No recipients";

              return (
                <li
                  key={idx}
                  className="border rounded-lg p-4 bg-gray-50 flex flex-col gap-2 cursor-pointer"
                  onClick={() => setExpandedIndex((prev) => (prev === idx ? null : idx))}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {hw.text ? (hw.text.length > 120 ? hw.text.slice(0, 120) + "…" : hw.text) : "(No text)"}
                      </div>
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
