import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface DocumentFile {
  name: string;
  title: string;
  data: string;
}

export default function AddStudent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    enrollmentNo: "",
    name: "",
    class: "",
    section: "",
    fatherName: "",
    contact: "",
    age: "",
    gender: "",
    address: "",
    admissionDate: new Date().toISOString().split("T")[0],
    aadhaarNumber: "",
    documents: [] as DocumentFile[],
  });

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem("students");
      if (stored) {
        const students = JSON.parse(stored);
        const existing = students.find((s: any) => s.id === Number(id));
        if (existing) {
          setFormData(existing);
          setIsEditMode(true);
        }
      }
    }
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any, title: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc: DocumentFile = {
        name: file.name,
        title,
        data: reader.result as string, // Base64 string
      };

      setFormData((prev) => ({
        ...prev,
        documents: [
          ...prev.documents.filter((d) => d.title !== title), // replace old one if same title
          newDoc,
        ],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const stored = localStorage.getItem("students");
    let students = stored ? JSON.parse(stored) : [];

    if (isEditMode) {
      students = students.map((s: any) =>
        s.id === Number(id) ? { ...s, ...formData } : s
      );
    } else {
      const newStudent = { id: Date.now(), ...formData };
      students.push(newStudent);
    }

    localStorage.setItem("students", JSON.stringify(students));
    navigate("/students");
  };

  const handleCancel = () => navigate("/students");

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
          onChange={(e) => handleFileChange(e, title)}
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? "Edit Student" : "Add Student"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          name="enrollmentNo"
          value={formData.enrollmentNo}
          onChange={handleChange}
          placeholder="Enrollment No"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="class"
          value={formData.class}
          onChange={handleChange}
          placeholder="Class"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="section"
          value={formData.section}
          onChange={handleChange}
          placeholder="Section"
          className="border rounded-lg px-4 py-2"
        />
        <input
          name="fatherName"
          value={formData.fatherName}
          onChange={handleChange}
          placeholder="Father's Name"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Contact"
          className="border rounded-lg px-4 py-2"
          required
        />
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age"
          className="border rounded-lg px-4 py-2"
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
          required
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          type="date"
          name="admissionDate"
          value={formData.admissionDate}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2"
        />

        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="border rounded-lg px-4 py-2 col-span-2"
        />

        <div className="col-span-2">
          <label className="font-medium">Aadhaar Number</label>
          <input
            name="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={handleChange}
            placeholder="Enter Aadhaar Number"
            className="border rounded-lg px-4 py-2 w-full mt-2"
          />
        </div>

        <FileUploadBox label="Upload Aadhaar Document" title="Aadhaar Document" />
        <FileUploadBox label="Last Class Result" title="Last Class Result" />
        <FileUploadBox label="Transfer Certificate (TC)" title="Transfer Certificate" />

        <div className="col-span-2 flex justify-between mt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            {isEditMode ? "Update Student" : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}