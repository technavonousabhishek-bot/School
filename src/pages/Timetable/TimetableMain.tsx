import React, { useState } from "react";

const TimetableMain = ({ classId }: { classId?: number }) => {
  // store files per-class under a single key (map classId -> files[])
  const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem("timetableFiles_v2");
    return saved ? JSON.parse(saved) : {};
  });

  const key = classId ? String(classId) : "global";
  const uploadedFiles = uploadedFilesMap[key] ?? [];

  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Convert File → Base64 string
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title for the file.");
      return;
    }

    const validFiles: any[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    for (const file of Array.from(selectedFiles)) {
      if (file.size > maxSize) {
        alert(`${file.name} is larger than 5MB and was skipped.`);
        continue;
      }

      const base64 = await fileToBase64(file);

      const newFile = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        type: file.type || "application/octet-stream",
        title,
        description,
        date: new Date().toLocaleString(),
        data: base64, // actual file content
      };
      validFiles.push(newFile);
    }

    if (validFiles.length > 0) {
      const updatedMap = { ...uploadedFilesMap, [key]: [...validFiles, ...uploadedFiles] };
      setUploadedFilesMap(updatedMap);
      localStorage.setItem("timetableFiles_v2", JSON.stringify(updatedMap));
      setTitle("");
      setDescription("");
      setSelectedFiles(null);
      alert("File uploaded successfully!");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    setSelectedFiles(e.dataTransfer.files);
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      const updated = uploadedFiles.filter((_: any, i: number) => i !== index);
      const updatedMap = { ...uploadedFilesMap, [key]: updated };
      setUploadedFilesMap(updatedMap);
      localStorage.setItem("timetableFiles_v2", JSON.stringify(updatedMap));
    }
  };

  const handleEdit = (index: number) => {
    const file = uploadedFiles[index];
    setTitle(file.title);
    setDescription(file.description);
    setEditIndex(index);
  };

  const handleUpdate = () => {
    if (editIndex === null) return;
    const updatedFiles = [...uploadedFiles];
    updatedFiles[editIndex] = {
      ...updatedFiles[editIndex],
      title,
      description,
      date: new Date().toLocaleString(),
    };
    const updatedMap = { ...uploadedFilesMap, [key]: updatedFiles };
    setUploadedFilesMap(updatedMap);
    localStorage.setItem("timetableFiles_v2", JSON.stringify(updatedMap));
    setEditIndex(null);
    setTitle("");
    setDescription("");
  };

  // ✅ This ensures download works for any Base64 data
  const handleDownload = (file: any) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">📅 Timetable Management</h1>

      {/* Upload Section */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p className="text-gray-700 mb-2">
          Drag & drop files here, or{" "}
          <label className="text-blue-600 cursor-pointer underline">
            browse
            <input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-sm text-gray-500">
          Supports: PDF, Image, Excel, Sheets, etc. (Max 5MB each)
        </p>

        {selectedFiles && (
          <div className="mt-4 text-gray-600">
            {Array.from(selectedFiles).map((file, index) => (
              <p key={index}>📄 {file.name}</p>
            ))}
          </div>
        )}
      </div>

      {/* Title + Description Inputs */}
      <div className="mt-6 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title for the timetable"
          className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description (optional)"
          rows={3}
          className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
        />
        {editIndex !== null ? (
          <button
            onClick={handleUpdate}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Update Details
          </button>
        ) : (
          <button
            onClick={handleFileUpload}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload File
          </button>
        )}
      </div>

      {/* History Section */}
      <div className="mt-10 bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">📜 Upload History</h2>
        {uploadedFiles.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Title</th>
                <th className="p-2">File Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">Size</th>
                <th className="p-2">Description</th>
                <th className="p-2">Uploaded On</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file: any, index: number) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{file.title}</td>
                  <td
                    className="p-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleDownload(file)}
                  >
                    📎 {file.name}
                  </td>
                  <td className="p-2">{file.type}</td>
                  <td className="p-2">{file.size}</td>
                  <td className="p-2">{file.description}</td>
                  <td className="p-2">{file.date}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TimetableMain;
