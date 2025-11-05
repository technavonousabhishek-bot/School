import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface DocumentFile {
  title: string;
  name: string;
  data: string;
}

export default function AddTeacher() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    staffId: "",
    department: "",
    classes: "",
    subject: "",
    contact: "",
    experience: "",
    address: "",
    gender: "",
    aadhaarNumber: "",
    documents: [] as DocumentFile[],
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // 🧩 Load existing data in edit mode
  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem("teachers");
      if (stored) {
        const teachers = JSON.parse(stored);
        const existing = teachers.find((t: any) => t.id === Number(id));
        if (existing) {
          setFormData(existing);
          setIsEditMode(true);
        }
      }
    }
  }, [id]);

  // 📝 Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 📎 Handle document uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    title: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: DocumentFile = {
        title,
        name: file.name,
        data: reader.result as string,
      };

      setFormData((prev) => ({
        ...prev,
        documents: [
          ...prev.documents.filter((d) => d.title !== title),
          newDoc,
        ],
      }));
    };
    reader.readAsDataURL(file);
  };

  // ❌ Remove uploaded document
  const removeDocument = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.name !== name),
    }));
  };

  // 🚀 Handle form submit (Add / Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const stored = localStorage.getItem("teachers");
    let teachers = stored ? JSON.parse(stored) : [];

    if (isEditMode) {
      teachers = teachers.map((t: any) =>
        t.id === Number(id) ? { ...t, ...formData } : t
      );
    } else {
      const newTeacher = { id: Date.now(), ...formData };
      teachers.push(newTeacher);
    }

    localStorage.setItem("teachers", JSON.stringify(teachers));
    navigate("/teachers");
  };

  // 📤 Reusable File Upload Component
  const FileUploadBox = ({
    label,
    title,
  }: {
    label: string;
    title: string;
  }) => {
    const fileExists = formData.documents.some((d) => d.title === title);

    return (
      <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition">
        <label className="block font-medium mb-2">{label}</label>
        <label
          htmlFor={title}
          className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
          <span className="text-sm text-gray-600">
            Click to upload (PDF / Image)
          </span>
        </label>
        <input
          id={title}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, title)}
          className="hidden"
        />
        {fileExists && (
          <p className="mt-2 text-sm text-green-600 font-medium">
            📎 File attached successfully
          </p>
        )}
      </div>
    );
  };

  // 🧾 Main Form
  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? "Edit Teacher" : "Add Teacher"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="staffId"
          value={formData.staffId}
          onChange={handleChange}
          placeholder="Staff ID"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Department"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="classes"
          value={formData.classes}
          onChange={handleChange}
          placeholder="Classes (e.g. 9th, 10th)"
          className="border rounded-lg px-4 py-2"
        />
        <input
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="border rounded-lg px-4 py-2"
        />
        <input
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Contact Number"
          className="border rounded-lg px-4 py-2"
        />
        <input
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Total Years of Experience"
          className="border rounded-lg px-4 py-2"
        />
        

        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="border rounded-lg px-4 py-2 col-span-2"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          name="aadhaarNumber"
          value={formData.aadhaarNumber}
          onChange={handleChange}
          placeholder="Aadhaar Number"
          className="border rounded-lg px-4 py-2"
        />

        <FileUploadBox label="Upload Aadhaar Document" title="Aadhaar Card" />
        <FileUploadBox label="Upload Experience Letter" title="Experience Letter" />

        {formData.documents.length > 0 && (
          <div className="col-span-2 bg-gray-50 p-3 rounded-lg mt-2">
            <h3 className="font-semibold text-gray-700 mb-2">Uploaded Files:</h3>
            <ul className="space-y-1">
              {formData.documents.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded-md shadow-sm"
                >
                  <span>
                    {doc.title}: <strong>{doc.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✖ Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="col-span-2 flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate("/teachers")}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            {isEditMode ? "Update Teacher" : "Add Teacher"}
          </button>
        </div>
      </form>
    </main>
  );
}