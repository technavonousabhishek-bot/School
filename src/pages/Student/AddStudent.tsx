import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";

interface DocumentFile {
  name: string;
  title: string;
  data: string; // data URL or remote URL
}

interface ProfilePicture {
  name: string;
  data: string; // data URL or remote URL
}

interface StudentForm {
  enrollment_no?: string;
  student_name: string;
  class_name: number;
  section_name: string;
  parent_name: string;
  parent_contact: string;
  phone_number: string;
  email: string;
  age: string;
  gender: string;
  dob: string; // YYYY-MM-DD
  address: string;
  admission_date: string; // YYYY-MM-DD
  documents: DocumentFile[];
  profile_picture?: ProfilePicture | null;
  is_active: boolean;
  created_at: string; // ISO
  language_preference: string;
}



export default function AddStudent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<StudentForm>({
    student_name: "",
    class_name: 0,
    section_name: "",
    parent_name: "",
    parent_contact: "",
    phone_number: "",
    email: "",
    age: "",
    gender: "",
    dob: "",
    address: "",
    admission_date: new Date().toISOString().split("T")[0],
    documents: [],
    profile_picture: null,
    is_active: true,
    created_at: new Date().toISOString(),
    language_preference: "English",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classesList, setClassesList] = useState<any[]>([]);

  // Helpers
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("accessToken");
    return token ? ({ Authorization: `Bearer ${token}` } as HeadersInit) : {};
  };

  const formatDateForInput = (value: any) => {
    if (!value) return "";
    const asString = String(value);
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return asString.slice(0, 10);
  };

  // convert dataURL (base64) to Blob
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // convert dataURL to File (with filename)
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const blob = dataURLtoBlob(dataurl);
    return new File([blob], filename, { type: blob.type });
  };

  // Load single student from API when editing
  useEffect(() => {
    const loadStudentFromApi = async (studentId: string) => {
      setLoading(true);
      try {
        const res = await fetch(buildApiUrl(API_ENDPOINTS.account.students, studentId), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });

        if (res.status === 401 || res.status === 403) {
          alert("Unauthorized. Please login again.");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          const txt = await res.text();
          console.warn("Failed to fetch student:", res.status, txt);
          return;
        }

        const data = await res.json();
        // Normalize server response to our form shape (adjust if backend uses different keys)
        setFormData((prev) => ({
          ...prev,
          ...data,
          dob: formatDateForInput(data.dob || data.date_of_birth || prev.dob),
          admission_date: formatDateForInput(data.admission_date || prev.admission_date),
          created_at: data.created_at || prev.created_at,
          // profile_picture may be URL string or object — keep as { name?, data: string }
          profile_picture:
            typeof data.profile_picture === "string"
              ? { name: data.profile_picture.split("/").pop() || "profile.jpg", data: `${data.profile_picture}` }
              : data.profile_picture || prev.profile_picture,
          documents: data.documents || prev.documents || [],
          is_active: typeof data.is_active === "boolean" ? data.is_active : prev.is_active,
          language_preference: data.language_preference || prev.language_preference,
          student_name: data.student_name || prev.student_name,
          // store the class id in `class_name` (backend expects class id in this field)
          class_name: (data.class && data.class.id) ? data.class.id : (data.class_name && !isNaN(Number(data.class_name)) ? Number(data.class_name) : prev.class_name),
          section_name: data.section_name || prev.section_name,
          parent_name: data.parent_name || prev.parent_name,
          parent_contact: data.parent_contact || prev.parent_contact,
          phone_number: data.phone_number || prev.phone_number,
          email: data.email || prev.email,
          age: data.age ? String(data.age) : prev.age,
          gender: data.gender || prev.gender,
          address: data.address || prev.address,
          enrollment_no: data.enrollment_no || prev.enrollment_no,
        }));
        setIsEditMode(true);
      } catch (err) {
        console.error("Error loading student:", err);
      } finally {
        setLoading(false);
      }
    };

    // Load classes list for class dropdown
    const loadClasses = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.school.classes, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setClassesList(Array.isArray(data) ? data : []);
        } else {
          console.warn("Failed to load classes for dropdown", res.status);
        }
      } catch (err) {
        console.warn("Error loading classes:", err);
      }
    };

    if (id) {
      loadStudentFromApi(id);
    } else {
      // new student
      setFormData((prev) => ({ ...prev, created_at: prev.created_at || new Date().toISOString() }));
    }
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // handle class select (store the selected class id in class_name)
  const handleClassSelect = (e: any) => {
    const val = e.target.value;
    if (!val) {
      setFormData((prev) => ({ ...prev, class_name: 0 }));
      return;
    }
    const idNum = Number(val);
    setFormData((prev) => ({ ...prev, class_name: idNum }));
  };

  // Input handlers
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profile_picture: { name: file.name, data: reader.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: any, title: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc: DocumentFile = {
        name: file.name,
        title,
        data: reader.result as string,
      };
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents.filter((d) => d.title !== title), newDoc],
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit: POST for create, PUT for update. Use multipart/form-data to include files.
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();

      // Append scalar fields (ensure server field names match)
      fd.append("student_name", formData.student_name || "");
      fd.append("email", formData.email || "");
      fd.append("phone_number", formData.phone_number || "");
      fd.append("gender", formData.gender || "");
      fd.append("dob", formData.dob || "");
      fd.append("age", String(formData.age || ""));
      fd.append("address", formData.address || "");
      fd.append("language_preference", formData.language_preference || "English");
      fd.append("admission_date", formData.admission_date || "");
      // backend expects the class id in `class_name` field — send the selected id
      fd.append("class_name", String(formData.class_name || ""));
      fd.append("section_name", formData.section_name || "");
      fd.append("parent_name", formData.parent_name || "");
      fd.append("parent_contact", formData.parent_contact || "");
      fd.append("is_active", formData.is_active ? "true" : "false");
      fd.append("created_at", formData.created_at || new Date().toISOString());
      if (formData.enrollment_no) fd.append("enrollment_no", String(formData.enrollment_no));

      // Profile picture: if present and is data URL, convert to File
      if (formData.profile_picture) {
        const pp = formData.profile_picture;
        if (pp.data && pp.data.startsWith("data:")) {
          const file = dataURLtoFile(pp.data, pp.name || "profile.jpg");
          fd.append("profile_picture", file);
        } else if (pp.data && (pp.data.startsWith("http://") || pp.data.startsWith("https://") || pp.data.startsWith("/"))) {
          // If backend wants URL instead of file, send the URL as string field (fallback)
          fd.append("profile_picture_url", pp.data);
        }
      }

      // Documents: append each as "documents" file and metadata as JSON field
      // Many backends expect files under the same key (e.g., documents) or specific keys.
      // We'll append files under "documents" and metadata JSON in "documents_meta"
      const docsMeta: any[] = [];
      formData.documents.forEach((doc, idx) => {
        if (doc.data && doc.data.startsWith("data:")) {
          const file = dataURLtoFile(doc.data, doc.name || `doc-${idx}.bin`);
          fd.append("documents", file);
        } else if (doc.data && (doc.data.startsWith("http://") || doc.data.startsWith("https://") || doc.data.startsWith("/"))) {
          // if remote URL, just include it in metadata
        }
        docsMeta.push({ title: doc.title, name: doc.name, url: doc.data });
      });
      fd.append("documents_meta", JSON.stringify(docsMeta));

      // Decide endpoint/method
      const url = isEditMode && id ? buildApiUrl(API_ENDPOINTS.account.students, id, 'update') : buildApiUrl(API_ENDPOINTS.account.students, 'create');
      const method = isEditMode && id ? "PUT" : "POST";

      // Build headers: do NOT set Content-Type for multipart; browser will set boundary
      const headers: HeadersInit = { ...getAuthHeaders() };

      const res = await fetch(url, {
        method,
        headers,
        body: fd,
      });

      if (res.status === 401 || res.status === 403) {
        alert("Unauthorized. Please login again.");
        navigate("/login");
        return;
      }

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        // not JSON
      }

      if (!res.ok) {
        console.error("Student save failed:", res.status, data || text);
        const errMsg = (data && (data.detail || JSON.stringify(data))) || text || `HTTP ${res.status}`;
        alert("Save failed: " + errMsg);
        setLoading(false);
        return;
      }

      // success: backend returns created/updated student. Update local cache (optional)
      const returned = Object.keys(data).length ? data : {};
      // Refresh local students cache by fetching list or update saved localStorage list
      try {
        const stored = localStorage.getItem("students");
        const students = stored ? JSON.parse(stored) : [];
        if (isEditMode && id) {
          const updated = students.map((s: any) => (s.id === Number(id) ? { ...s, ...returned } : s));
          localStorage.setItem("students", JSON.stringify(updated));
        } else {
          // add new locally (use returned.id if present)
          const newItem = { id: returned.id || Date.now(), ...formData, ...returned };
          students.push(newItem);
          localStorage.setItem("students", JSON.stringify(students));
        }
      } catch (err) {
        // ignore cache failure
      }

      alert(isEditMode ? "Student updated successfully." : "Student created successfully.");
      navigate("/students");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network error while saving student.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/students");

  const FileUploadBox = ({ label, title }: { label: string; title: string }) => {
    const fileExists = formData.documents.some((d) => d.title === title);
    return (
      <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition">
        <label className="block font-medium mb-2">{label}</label>
        <label htmlFor={title} className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span className="text-sm text-gray-600">Click to upload (PDF / Image)</span>
        </label>
        <input id={title} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, title)} className="hidden" />
        {fileExists && <p className="mt-2 text-sm text-green-600 font-medium">📎 File attached successfully</p>}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? "Edit Student" : "Add Student"}</h2>
        <button
          type="button"
          onClick={() => navigate("/students")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
        >
          Back
        </button>
      </div>


      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="student_name" value={formData.student_name} onChange={handleChange} placeholder="Student Name" className="border rounded-lg px-4 py-2" required />

        <select
          name="class_name"
          value={formData.class_name ? String(formData.class_name) : ""}
          onChange={handleClassSelect}
          className="border rounded-lg px-4 py-2"
          required
        >
          <option value="">Select Class</option>
          {classesList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.section ? `${c.class_name} - ${c.section}` : c.class_name}
            </option>
          ))}
        </select>

        <input name="section_name" value={formData.section_name} onChange={handleChange} placeholder="Section" className="border rounded-lg px-4 py-2" />

        <input name="parent_name" value={formData.parent_name} onChange={handleChange} placeholder="Parent Name" className="border rounded-lg px-4 py-2" required />

        <input name="parent_contact" value={formData.parent_contact} onChange={handleChange} placeholder="Parent Contact" className="border rounded-lg px-4 py-2" required />

        <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" className="border rounded-lg px-4 py-2" required />

        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="border rounded-lg px-4 py-2" />

        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="border rounded-lg px-4 py-2" required />

        <select name="gender" value={formData.gender} onChange={handleChange} className="border rounded-lg px-4 py-2" required>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="border rounded-lg px-4 py-2" placeholder="Date of Birth" />

        <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} className="border rounded-lg px-4 py-2" />

        <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border rounded-lg px-4 py-2 col-span-2" />

        {/* language preference */}
        <div className="col-span-2">
          <label className="font-medium">Language Preference</label>
          <select name="language_preference" value={formData.language_preference} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full mt-2">
            <option>English</option>
            <option>Hindi</option>
            <option>Bengali</option>
            <option>Telugu</option>
            <option>Marathi</option>
            <option>Tamil</option>
            <option>Urdu</option>
            <option>Gujarati</option>
            <option>Kannada</option>
            <option>Malayalam</option>
            <option>Odia</option>
            <option>Punjabi</option>
            <option>Assamese</option>
            <option>Maithili</option>
            <option>Santali</option>
            <option>Nepali</option>
            <option>Sanskrit</option>
            <option>Other</option>
          </select>
        </div>

        {/* is_active */}
        <div className="col-span-2">
          <label className="font-medium">Active</label>
          <div className="mt-2">
            <select name="is_active" value={formData.is_active ? "true" : "false"} onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === "true" }))} className="border rounded-lg px-4 py-2">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {/* created_at */}
        <div className="col-span-2">
          <label className="font-medium">Created At</label>
          <input type="date" name="created_at" value={formatDateForInput(formData.created_at)} onChange={(e) => setFormData((prev) => ({ ...prev, created_at: e.target.value }))} className="border rounded-lg px-4 py-2 w-full mt-2" readOnly={isEditMode} />
        </div>

        {/* Profile picture upload */}
        <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition">
          <label className="block font-medium mb-2">Profile Picture</label>
          <label htmlFor="profilePicture" className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
            {formData.profile_picture ? <img src={formData.profile_picture.data} alt="profile preview" className="h-24 w-24 rounded-full object-cover mb-2" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5m0 0l5 5m-5-5v12" /></svg>}
            <span className="text-sm text-gray-600">Click to upload profile picture (JPG / PNG)</span>
          </label>
          <input id="profilePicture" type="file" accept=".jpg,.jpeg,.png" onChange={handleProfilePictureChange} className="hidden" />
          {formData.profile_picture && <p className="mt-2 text-sm text-green-600 font-medium">📸 Profile picture attached</p>}
        </div>

        {/* Document uploads */}
        <FileUploadBox label="Upload Aadhaar Document" title="Aadhaar Document" />
        <FileUploadBox label="Last Class Result" title="Last Class Result" />
        <FileUploadBox label="Transfer Certificate (TC)" title="Transfer Certificate" />

        <div className="col-span-2 flex justify-between mt-2">
          <button type="button" onClick={handleCancel} className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            {loading ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update Student" : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}