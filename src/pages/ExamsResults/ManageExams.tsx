import React, { useState, useEffect } from "react";

interface UploadedFile {
  id: number;
  name: string;
  base64: string;
}

const ManageExams: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [tempFile, setTempFile] = useState<UploadedFile | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // 🔹 Load saved files
  useEffect(() => {
    const saved = localStorage.getItem("uploadedTimetableFiles");
    if (saved) setFiles(JSON.parse(saved));
  }, []);

  // 🔹 Save files to localStorage
  // Note: we persist explicitly on user actions (save/delete) to avoid accidental
  // overwrites on mount from other effects. This prevents losing files between reloads.

  // 🔹 Convert File to Base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // 🔹 Handle File Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const uploadedFile = selectedFiles[0];
    const base64 = await toBase64(uploadedFile);

    setTempFile({
      id: Date.now(),
      name: uploadedFile.name,
      base64,
    });
    setIsHighlighted(false);
  };

  // 🔹 Handle Save
  const handleSave = () => {
    if (!tempFile) return alert("⚠️ Please select a file first!");
    // Persist immediately to localStorage and update state so the file appears in history
    const updated = [...files, tempFile];
    setFiles(updated);
    try {
      localStorage.setItem("uploadedTimetableFiles", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save uploaded file to localStorage:", e);
      alert("Could not save file to local storage. Please try again.");
      return;
    }
    // Also save into the timetableFiles_v2 map under the 'global' key so other timetable pages
    // that read from `timetableFiles_v2` can see the uploaded file (keeps behaviour similar to Homework attachments)
    try {
      const raw = localStorage.getItem("timetableFiles_v2");
      const map = raw ? JSON.parse(raw) : {};
      const key = "global";
      const entry = {
        name: tempFile.name,
        size: "",
        type: "",
        title: tempFile.name,
        description: "",
        date: new Date().toLocaleString(),
        data: tempFile.base64,
      };
      map[key] = map[key] ? [entry, ...map[key]] : [entry];
      localStorage.setItem("timetableFiles_v2", JSON.stringify(map));
    } catch (e) {
      // non-fatal; log and continue
      console.warn("Could not mirror file into timetableFiles_v2:", e);
    }
    setTempFile(null);
    alert("✅ File saved successfully and will appear in history.");
  };

  // 🔹 Handle Delete
  const handleDelete = (id: number) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    try {
      localStorage.setItem("uploadedTimetableFiles", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update uploadedTimetableFiles after delete:", e);
    }
    // also try to remove mirrored entries from timetableFiles_v2 if present
    try {
      const raw = localStorage.getItem("timetableFiles_v2");
      if (raw) {
        const map = JSON.parse(raw);
        const key = "global";
        if (map[key]) {
          // remove first matching entry by name (best-effort)
          const idx = map[key].findIndex((e: any) => e.name === files.find((f) => f.id === id)?.name);
          if (idx !== -1) {
            map[key].splice(idx, 1);
            localStorage.setItem("timetableFiles_v2", JSON.stringify(map));
          }
        }
      }
    } catch (e) {
      // non-fatal
      console.warn("Could not update timetableFiles_v2 on delete:", e);
    }
  };

  // 🔹 Handle Download
  const handleDownload = (base64: string, name: string) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = name;
    link.click();
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        📚 Upload Your Exam Timetable
      </h1>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg mx-auto text-center">
        <label
          htmlFor="fileUpload"
          className={`block w-full p-6 border-2 rounded-xl cursor-pointer transition-all duration-300
            ${
              isHighlighted
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
          onDragEnter={() => setIsHighlighted(true)}
          onDragLeave={() => setIsHighlighted(false)}
        >
          <input
            id="fileUpload"
            type="file"
            accept="*"
            onChange={handleFileSelect}
            onFocus={() => setIsHighlighted(true)}
            onBlur={() => setIsHighlighted(false)}
            className="hidden"
          />
          <p className="text-lg text-gray-700 font-medium">
            {isHighlighted
              ? "📂 Drop file here or click to upload"
              : tempFile
              ? `Selected: ${tempFile.name}`
              : "Choose a file to upload"}
          </p>
        </label>

        {/* Show Save button only after a file has been selected */}
        {tempFile ? (
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
          >
            💾 Save
          </button>
        ) : null}

        <p className="mt-3 text-gray-500 text-sm">
          Upload your Exam timetable (PDF, Excel, Image, etc.)
        </p>
      </div>

      {/* Uploaded Files History */}
      {files.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
            📂 Uploaded Timetable Files
          </h2>
          <table className="min-w-full border text-center">
            <thead className="bg-blue-100">
              <tr>
                <th className="border p-2">File Name</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="border p-2 text-gray-700">{file.name}</td>
                  <td className="border p-2 flex justify-center gap-3">
                    <button
                      onClick={() => handleDownload(file.base64, file.name)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageExams;