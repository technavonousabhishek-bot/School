import React, { useState, useEffect } from "react";
import { examTimetableApi, examApi } from "../../api/exams";

interface UploadedFile {
  id: number;
  title: string;
  exam?: number;
  exam_name?: string;
  file: string;
  file_type?: string;
  uploaded_on?: string;
  uploaded_by_name?: string;
}

const ManageExams: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [examList, setExamList] = useState<any[]>([]);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load timetables
      const timetables = await examTimetableApi.getTimetables();
      setFiles(timetables || []);

      // Load exams
      const exams = await examApi.getExams();
      setExamList(exams || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setTempFile(selectedFiles[0]);
    setIsHighlighted(false);
  };

  const handleSave = async () => {
    if (!tempFile) return alert("⚠️ Please select a file first!");
    if (!title.trim()) return alert("⚠️ Please enter a title!");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", tempFile);
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (selectedExam) formData.append("exam", selectedExam.toString());

      await examTimetableApi.uploadTimetable(formData);

      // Reload files
      await loadData();

      // Reset form
      setTempFile(null);
      setTitle("");
      setDescription("");
      setSelectedExam(null);

      alert("✅ Timetable uploaded successfully!");
    } catch (error: any) {
      console.error("Failed to upload timetable:", error);
      alert(error.response?.data?.error || "Failed to upload timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return;

    try {
      await examTimetableApi.deleteTimetable(id);
      await loadData();
      alert("✅ Timetable deleted successfully!");
    } catch (error) {
      console.error("Failed to delete timetable:", error);
      alert("Failed to delete timetable. Please try again.");
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        📚 Upload Exam Timetable
      </h1>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Upload New Timetable</h2>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Mid Term Exam Timetable 2024"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details about this timetable..."
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
        </div>

        {/* Exam Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Link to Exam (Optional)</label>
          <select
            value={selectedExam || ""}
            onChange={(e) => setSelectedExam(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">-- Select Exam (Optional) --</option>
            {examList.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} - {exam.exam_type} ({exam.academic_year})
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <label
          htmlFor="fileUpload"
          className={`block w-full p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center ${isHighlighted
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

        <p className="mt-3 text-gray-500 text-sm text-center">
          Upload your Exam timetable (PDF, Excel, Image, etc.)
        </p>

        {/* Save Button */}
        {tempFile && (
          <button
            onClick={handleSave}
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-xl text-white font-semibold ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Uploading..." : "💾 Upload Timetable"}
          </button>
        )}
      </div>

      {/* Uploaded Files History */}
      {files.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
            📂 Uploaded Timetables
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-center">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Exam</th>
                  <th className="border p-2">File Type</th>
                  <th className="border p-2">Uploaded On</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-gray-700 font-medium">{file.title}</td>
                    <td className="border p-2 text-gray-600">
                      {file.exam_name || "General"}
                    </td>
                    <td className="border p-2 text-gray-600 uppercase">
                      {file.file_type || "file"}
                    </td>
                    <td className="border p-2 text-gray-600">
                      {file.uploaded_on
                        ? new Date(file.uploaded_on).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border p-2 flex justify-center gap-3">
                      <button
                        onClick={() => handleDownload(file.file, file.title)}
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
        </div>
      )}
    </div>
  );
};

export default ManageExams;