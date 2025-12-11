import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";

interface DocumentFile {
  name: string;
  data: string;
  title: string;
}

interface Teacher {
  id: number;
  staffId: string;
  name: string;
  subject: string[];
  classTeacherOf?: string;
  isActive?: boolean;
  languagePreference?: string;
  classesHandled?: string;
  updatedAt?: string;
  department: string;
  // subjects?: string[];
  contact: string;
  gender: string;
  address: string;
  aadhaarNumber?: string;
  lastExperience?: string;

  joiningDate: string;
  documents?: DocumentFile[];
  profilePicture?: { data: string; name?: string };
  qualifications?: string;
  specialization?: string;
}

export default function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const navigate = useNavigate();



  // Normalize teacher objects from backend/localStorage so UI can rely on consistent fields
  const normalizeTeacher = (t: any): Teacher => {
    return {
      id: Number(t.id ?? t.pk ?? 0),
      staffId: t.staffId ?? t.staff_id ?? t.staff ?? "",
      name: (t.name ?? t.teacher_name ?? "").toString(),
      // Normalize subject into an array of names
      subject: (function () {
        // backend may return subject as: [] of strings, [] of objects, a comma string, or a subject_display field
        const raw = t.subject ?? t.subject_display ?? t.subject_display_raw ?? null;
        if (!raw) {
          // try other possibilities
          if (Array.isArray(t.subject)) {
            return t.subject.map((s: any) => (typeof s === "string" ? s : s?.name || String(s)));
          }
          if (typeof t.subject === "string" && t.subject.includes(",")) {
            return t.subject.split(",").map((s: string) => s.trim()).filter(Boolean);
          }
          return [];
        }
        if (Array.isArray(raw)) return raw.map((s: any) => (typeof s === "string" ? s : s?.name || String(s)));
        if (typeof raw === "string") return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
        return [];
      })(),
      department: t.department ?? t.specialization ?? "",
      contact: t.contact ?? "",
      gender: t.gender ?? "",
      address: t.address ?? "",
      aadhaarNumber: t.aadhaarNumber ?? t.aadhaar_number ?? undefined,
      lastExperience: t.lastExperience ?? t.last_experience ?? undefined,
      joiningDate: t.joiningDate ?? t.joining_date ?? "",
      updatedAt: t.updatedAt ?? t.updated_at ?? undefined,
      classTeacherOf: (((t.class_teacher_of && (t.class_teacher_of.name || t.class_teacher_of.class_name)) || t.class_teacher_of) ?? ""),
      isActive: typeof t.is_active !== 'undefined' ? t.is_active : (typeof t.isActive !== 'undefined' ? t.isActive : true),
      languagePreference: t.language_preference ?? t.languagePreference ?? undefined,
      classesHandled: t.classes_handled ?? t.classesHandled ?? undefined,
      documents: t.documents ?? [],
      profilePicture: t.profilePicture ?? t.profile_picture ?? undefined,
      qualifications: t.qualifications ?? t.qualification ?? undefined,
      specialization: t.specialization ?? undefined,
    };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Try backend first
        const res = await fetch(API_ENDPOINTS.account.teachers);
        if (res.ok) {
          const data = await res.json();
          // backend might return array or paginated {results: []}
          const raw = Array.isArray(data)
            ? data
            : (Array.isArray(data.results) ? data.results : []);
          setTeachers(raw.map(normalizeTeacher));
          setLoading(false);
          return;
        } else {
          // log server error and fall back
          console.warn("Teachers fetch returned non-ok status", res.status);
        }
      } catch (e) {
        console.warn("Teachers fetch failed, falling back to localStorage", e);
      }

      // fallback to localStorage
      try {
        const storedTeachers = localStorage.getItem("teachers");
        if (storedTeachers) {
          const parsed = JSON.parse(storedTeachers);
          if (Array.isArray(parsed)) setTeachers(parsed.map(normalizeTeacher));
        }
      } catch (e) {
        console.warn("Failed reading teachers from localStorage", e);
      }
      setLoading(false);
    })();
  }, []);

  const deptOptions = ["All Departments", ...Array.from(new Set(teachers.map((t) => t.department || "").filter(Boolean)))];

  const filteredTeachers = teachers.filter((teacher) => {
    const nameValue = (teacher.name || "").toString();
    const matchesName = nameValue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      selectedDept === "All Departments" || teacher.department === selectedDept;
    return matchesName && matchesDept;
  });

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    (async () => {
      // try backend delete first
      try {
        // try conventional delete endpoints: with /delete/ and without
        let res = await fetch(buildApiUrl(API_ENDPOINTS.account.teachers, id, 'delete/'), { method: "DELETE" });
        if (!res.ok && res.status !== 204) {
          res = await fetch(buildApiUrl(API_ENDPOINTS.account.teachers, `${id}/`), { method: "DELETE" });
        }
        if (res.ok || res.status === 204) {
          const updated = teachers.filter((t) => t.id !== id);
          setTeachers(updated);
          // update local cache too
          localStorage.setItem("teachers", JSON.stringify(updated));
          return;
        }
        console.warn("Delete returned non-ok", res.status);
      } catch (e) {
        console.warn("Delete request failed, falling back to localStorage", e);
      }

      // fallback: localStorage
      const updated = teachers.filter((t) => t.id !== id);
      setTeachers(updated);
      localStorage.setItem("teachers", JSON.stringify(updated));
    })();
  };



  const handleDownload = (file: DocumentFile) => {
    try {
      const link = document.createElement("a");
      link.href = file.data.startsWith("data:")
        ? file.data
        : URL.createObjectURL(new Blob([file.data]));
      link.download = file.name || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Unable to download the file.");
    }
  };

  // image download helper
  const handleImageDownload = (imageData: string, name?: string) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = name || "teacher-profile.jpg";
    link.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FaUserPlus className="text-blue-600" />
          Teacher List
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/add-teacher")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Teacher
          </button>

        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {deptOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading && (
        <div className="text-center py-4 text-gray-600">Loading teachers...</div>
      )}
      {error && (
        <div className="text-center py-2 text-red-600">Error: {error}</div>
      )}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Staff ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">subject</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Qualifications</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-3">{teacher.staffId}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {teacher.name}
                  </td>
                  <td className="px-6 py-3">{
                    Array.isArray(teacher.subject) && teacher.subject.length > 0
                      ? teacher.subject.join(", ")
                      : "-"
                  }</td>
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-800">{teacher.department}</div>

                  </td>
                  <td className="px-6 py-3">{teacher.qualifications || "-"}</td>
                  <td className="px-6 py-3 flex justify-center gap-3 text-lg">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="text-green-600 hover:text-green-800"
                    >
                      👁 View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-teacher/${teacher.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6 italic">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl relative">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✖
            </button>

            {/* Circular Image Added */}
            {selectedTeacher.profilePicture?.data && (
              <div className="flex justify-center mb-4">
                <img
                  src={selectedTeacher.profilePicture.data}
                  alt="Teacher"
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md cursor-pointer"
                  onClick={() => handleImageDownload(selectedTeacher.profilePicture!.data, selectedTeacher.name)}
                  title="Click to Download Image"
                />
              </div>
            )}

            <h2 className="text-2xl font-semibold mb-4 text-blue-700 border-b pb-2 text-center">
              {selectedTeacher.name}'s Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Staff ID:</strong> {selectedTeacher.staffId}
              </p>
              <p>
                <strong>Class Teacher Of:</strong> {selectedTeacher.classTeacherOf || "-"}
              </p>
              <p>
                <strong>Active:</strong> {selectedTeacher.isActive ? "Yes" : "No"}
              </p>
              <p>
                <strong>subject:</strong>{" "}
                {(selectedTeacher.subject && selectedTeacher.subject.length > 0)
                  ? selectedTeacher.subject.join(", ")
                  : "-"}
              </p>
              <p>
                <strong>Classes Handled:</strong> {selectedTeacher.classesHandled || "-"}
              </p>
              <p>
                <strong>Language:</strong> {selectedTeacher.languagePreference || "-"}
              </p>
              <p>
                <strong>Department:</strong> {selectedTeacher.department}
              </p>
              <p>
                <strong>Specialization:</strong> {selectedTeacher.specialization || "N/A"}
              </p>
              <p>
                <strong>Qualifications:</strong> {selectedTeacher.qualifications || "N/A"}
              </p>
              <p>
                <strong>Contact:</strong> {selectedTeacher.contact}
              </p>
              <p>
                <strong>Gender:</strong> {selectedTeacher.gender}
              </p>
              <p>
                <strong>Joining Date:</strong> {selectedTeacher.joiningDate}
              </p>
              <p>
                <strong>Updated At:</strong> {selectedTeacher.updatedAt || "-"}
              </p>
              <p>
                <strong>Last Experience:</strong>{" "}
                {selectedTeacher.lastExperience || "N/A"}
              </p>
              <p>
                <strong>Aadhaar:</strong>{" "}
                {selectedTeacher.aadhaarNumber || "N/A"}
              </p>
              <p className="col-span-2">
                <strong>Address:</strong> {selectedTeacher.address}
              </p>

              <div className="col-span-2 mt-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">📎 Uploaded Documents</h3>
                <div className="space-y-2">
                  {/* If backend exposes aadhaar_doc or experience_doc as URLs, show them */}
                  {Array.isArray(selectedTeacher.documents) && selectedTeacher.documents.length > 0 && (
                    <>
                      {selectedTeacher.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                          <span className="truncate"><strong>{doc.title}:</strong> {doc.name}</span>
                          <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:text-blue-800 font-medium">⬇ Download</button>
                        </div>
                      ))}
                    </>
                  )}
                  {/* Profile picture exposed as a downloadable document */}
                  {selectedTeacher.profilePicture?.data && (
                    <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                      <span className="truncate">
                        <strong>Profile Picture:</strong> {selectedTeacher.profilePicture.name || "profile.jpg"}
                      </span>
                      <button
                        onClick={() => handleImageDownload(selectedTeacher.profilePicture!.data, selectedTeacher.profilePicture!.name || selectedTeacher.name)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ⬇ Download
                      </button>
                    </div>
                  )}

                  {selectedTeacher.documents && selectedTeacher.documents.length > 0 ? (
                    selectedTeacher.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                      >
                        <span className="truncate">
                          <strong>{doc.title}:</strong> {doc.name}
                        </span>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          ⬇ Download
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic bg-gray-50 px-4 py-2 rounded-lg">No documents uploaded.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}