import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://school-bos-backend.onrender.com/schoolApp/timetables/";
const BACKEND_ORIGIN = "http://127.0.0.1:8000";

type TimetableFile = {
  id: number | string;
  title: string;
  description: string;
  file: string;
  uploaded_by_name?: string;
  uploaded_on?: string;
};

type Props = {
  classId?: string | number;
};

const TimetableMain: React.FC<Props> = ({ classId }) => {
  const [files, setFiles] = useState<TimetableFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [editItem, setEditItem] = useState<TimetableFile | null>(null);

  useEffect(() => {
    loadTimetable();
  }, []);

  // ✔ Fetch all timetable files
  const loadTimetable = async () => {
    try {
      const res = await axios.get(API);
      setFiles(res.data);
    } catch (err: any) {
      console.error("Fetch error:", err?.response?.data ?? err?.message ?? err);
    }
  };

  // ✔ Upload timetable to backend
  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select a file");
      return;
    }
    if (!title.trim()) {
      alert("Enter a title");
      return;
    }
    // FileList supports indexed access in browsers; guard with null-check
    const file = selectedFiles[0] ?? selectedFiles.item(0);
    if (!file) {
      alert("Please select a valid file");
      return;
    }
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      // let axios set Content-Type (it will include the multipart boundary)
      if (classId !== undefined && classId !== null) {
        formData.append("class", String(classId));
      }

      await axios.post(API + "create/", formData);

      setTitle("");
      setDescription("");
      setSelectedFiles(null);
      await loadTimetable();
      alert("Uploaded!");
    } catch (err: any) {
      console.error("Upload error:", err?.response?.data ?? err?.message ?? err);
      if (err?.response?.data) {
        // show backend validation errors to the user for quick debugging
        alert("Upload failed: " + JSON.stringify(err.response.data));
      } else {
        alert("Upload failed. See console for details.");
      }
    }
  };

  // ✔ Delete timetable
  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete(`${API}${id}/delete/`);
      loadTimetable();
    } catch (err: any) {
      console.error("Delete error:", err?.response?.data ?? err?.message ?? err);
    }
  };

  // ✔ Edit timetable (only title + description)
  const handleUpdate = async () => {
    if (!editItem) return;

    try {
      await axios.put(`${API}${editItem.id}/update/`, {
        title,
        description,
      });

      setEditItem(null);
      setTitle("");
      setDescription("");
      await loadTimetable();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Helper: ensure file URLs point to backend so browser requests the actual file
  const makeFileUrl = (filePath: string | undefined) => {
    if (!filePath) return undefined;
    // If serializer already returned an absolute URL, use it
    if (/^https?:\/\//i.test(filePath)) return filePath;
    // Otherwise prefix with backend origin (handles '/media/...' paths)
    return `${BACKEND_ORIGIN}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  // Download file via fetch and trigger browser download (works across dev origins)
  const downloadFile = async (filePath: string | undefined) => {
    if (!filePath) return;
    const href = makeFileUrl(filePath);
    try {
      if (!href) return;
      const resp = await fetch(href, { method: "GET", credentials: "include" });
      if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Download error:", err);
      alert("Download failed. See console for details.");
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-4">📅 Timetable Management</h1>

      {/* UPLOAD BOX UI SAME */}
      <div
        className="border-2 border-dashed p-8 rounded-xl text-center"
      >
        <label className="text-blue-600 underline cursor-pointer">
          browse
          <input
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFiles(e.target.files)}
          />
        </label>

        {selectedFiles && (
          <p className="mt-3 text-gray-700">📄 {selectedFiles[0].name}</p>
        )}
      </div>

      {/* INPUTS */}
      <div className="mt-6 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          className="w-full border p-3 rounded-lg"
        />

        {editItem ? (
          <button
            onClick={handleUpdate}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Update
          </button>
        ) : (
          <button
            onClick={handleFileUpload}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Upload
          </button>
        )}
      </div>

      {/* HISTORY TABLE (UI SAME) */}
      <div className="mt-10 bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">📜 Upload History</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2">Title</th>
              <th className="p-2">File</th>
              <th className="p-2">Description</th>
              <th className="p-2">Uploaded By</th>
              <th className="p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {files.map((file) => (
              <tr key={String(file.id)} className="border-b">
                <td className="p-2">{file.title}</td>
                <td className="p-2">
                  {file.file ? (
                    (() => {
                      const href = makeFileUrl(file.file);
                      return (
                        <a
                          href={href}
                          // prevent default navigation and trigger fetch-download
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            downloadFile(file.file);
                          }}
                          rel="noopener noreferrer"
                          className="text-blue-600 cursor-pointer"
                        >
                          📎 {file.file.split("/").pop()}
                        </a>
                      );
                    })()
                  ) : (
                    <span className="text-gray-500">No file</span>
                  )}
                </td>
                <td className="p-2">{file.description}</td>
                <td className="p-2">{file.uploaded_by_name}</td>
                <td className="p-2">{file.uploaded_on}</td>

                <td className="p-2 flex gap-3">
                  <button
                    onClick={() => {
                      setEditItem(file);
                      setTitle(file.title);
                      setDescription(file.description);
                    }}
                    className="text-yellow-600"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600"
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default TimetableMain; 
