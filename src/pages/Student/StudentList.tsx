import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { API_ENDPOINTS, getMediaUrl } from "../../config/api";

interface DocumentFile {
  name: string;
  data: string; // Base64 or file URL or relative path
  title: string;
}

interface Student {
  id: number;
  enrollment_no: string;
  student_name: string;
  class_display: string;
  class_name: string;
  parent_name: string;
  parent_contact: string;
  phone_number: string;
  email?: string;
  created_at?: string;
  dob?: string;
  age?: number;
  gender?: string;
  address?: string;
  admission_date?: string;
  aadhaarNumber?: string;
  documents?: DocumentFile[];
  profile_picture?: { data: string; name?: string } | string; // backend may return string URL or object
  language_preference?: string;
  is_active?: boolean;
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole") || "teacher";


  // Always return a consistent HeadersInit object
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Resolve profile_picture to a usable src string
  const resolveImageSrc = (img: any): string | undefined => {
    if (!img) return undefined;
    if (typeof img === "string") {
      if (img.startsWith("data:") || img.startsWith("http://") || img.startsWith("https://")) return img;
      return getMediaUrl(img); // relative path from backend like /media/...
    }
    if (typeof img === "object" && img.data) return img.data;
    return undefined;
  };

  // Fetch students from API
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(API_ENDPOINTS.account.students, {
        method: "GET",
        headers,
      });

      if (res.status === 401 || res.status === 403) {
        alert("Session expired or unauthorized. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to load students: ${res.status} ${text}`);
        const cached = localStorage.getItem("students");
        if (cached) setStudents(JSON.parse(cached));
        return;
      }

      const data = await res.json();
      const list: Student[] = Array.isArray(data) ? data : data.results || data.students || [];

      // Normalize server fields if necessary and keep profile_picture in place
      const normalized = list.map((s) => {
        const profile = (s as any).profile_picture ?? (s as any).profilePicture ?? s.profile_picture;
        return { ...s, profile_picture: profile } as Student;
      });

      setStudents(normalized);
      localStorage.setItem("students", JSON.stringify(normalized));
    } catch (err: any) {
      console.error("Fetch students error:", err);
      setError("Network error while fetching students.");
      const cached = localStorage.getItem("students");
      if (cached) setStudents(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classOptions = ["All Classes", ...Array.from(new Set(students.map((s) => s.class_display || ""))).filter(Boolean)];

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesNameOrEnroll =
      term === "" ||
      (student.student_name || "").toLowerCase().includes(term) ||
      ((student.enrollment_no || "") as string).toLowerCase().includes(term);
    const matchesClass = selectedClass === "All Classes" || student.class_display === selectedClass;
    return matchesNameOrEnroll && matchesClass;
  });





  // Delete student via API (and update local UI)
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const prev = students;
    setStudents((s) => s.filter((x) => x.id !== id));
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(`${API_ENDPOINTS.account.students}${id}/delete/`, {
        method: "DELETE",
        headers,
      });

      if (res.status === 401 || res.status === 403) {
        alert("Unauthorized. Please login again.");
        navigate("/login");
        return;
      }

      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        alert(`Delete failed: ${res.status} ${txt}`);
        setStudents(prev);
        return;
      }

      const updated = students.filter((s) => s.id !== id);
      localStorage.setItem("students", JSON.stringify(updated));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error while deleting. Please try again.");
      setStudents(prev);
    }
  };

  const handleDownload = (file: DocumentFile) => {
    try {
      const href = file.data.startsWith("data:")
        ? file.data
        : file.data.startsWith("http")
          ? file.data
          : getMediaUrl(file.data);
      const link = document.createElement("a");
      link.href = href;
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

  const handleImageDownload = (imageData: string, name?: string) => {
    const url = resolveImageSrc(imageData) || imageData;
    const link = document.createElement("a");
    link.href = url!;
    link.download = name || "student-profile.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FaUserPlus className="text-blue-600" />
          Student List
        </h2>

        {userRole === "admin" && (
          <button
            onClick={() => navigate("/add-student")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Student
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Name or Enroll No"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>


      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center py-6">Loading students...</div>}
      {error && <div className="text-red-600 py-2">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Enroll No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Class</th>
              <th className="px-4 py-2">Room-No</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{student.enrollment_no}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{student.student_name}</td>
                  <td className="px-4 py-2">{student.class_display.replace("Class ", "")}</td>
                  <td className="px-4 py-2">{student.class_name}</td>
                  <td className="px-4 py-2">{student.created_at ? student.created_at.slice(0, 10) : "-"}</td>
                  <td className="px-4 py-2">{student.phone_number || student.parent_contact}</td>
                  <td className="px-4 py-2 flex justify-center gap-3 text-lg">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-green-600 hover:text-green-800"
                    >
                      👁 View
                    </button>

                    <button
                      onClick={() => navigate(`/edit-student/${student.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️ Edit
                    </button>

                    {userRole === "admin" && (
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-6 italic">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✖
            </button>

            {/* Circular Image */}
            {resolveImageSrc(selectedStudent.profile_picture) && (
              <div className="flex justify-center mb-4">
                <img
                  src={resolveImageSrc(selectedStudent.profile_picture) as string}
                  alt="Student"
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md cursor-pointer"
                  onClick={() =>
                    handleImageDownload(
                      (selectedStudent.profile_picture as any).data || (selectedStudent.profile_picture as any),
                      selectedStudent.student_name
                    )
                  }
                  title="Click to Download Image"
                />
              </div>
            )}

            <h2 className="text-2xl font-semibold mb-4 text-blue-700 border-b pb-2 text-center">
              {selectedStudent.student_name}'s Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Enrollment No:</strong> {selectedStudent.enrollment_no}
              </p>
              <p>
                <strong>Class:</strong> {selectedStudent.class_display}
              </p>
              <p>
                <strong>Section:</strong> {selectedStudent.class_name}
              </p>
              <p>
                <strong>Parent Name:</strong> {selectedStudent.parent_name}
              </p>
              <p>
                <strong>Parent Contact:</strong> {selectedStudent.parent_contact}
              </p>
              <p>
                <strong>Phone:</strong> {selectedStudent.phone_number}
              </p>
              <p>
                <strong>Age:</strong> {selectedStudent.age}
              </p>
              <p>
                <strong>Gender:</strong> {selectedStudent.gender}
              </p>
              <p>
                <strong>DOB:</strong> {selectedStudent.dob}
              </p>
              <p>
                <strong>Admission Date:</strong> {selectedStudent.admission_date}
              </p>
              <p>
                <strong>Language Preference:</strong> {selectedStudent.language_preference}
              </p>
              <p className="col-span-2">
                <strong>Address:</strong> {selectedStudent.address}
              </p>
              <p>
                <strong>Email:</strong> {selectedStudent.email}
              </p>
              <p>
                <strong>Active:</strong> {selectedStudent.is_active ? "Yes" : "No"}
              </p>

              {/* Uploaded Documents */}
              {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                <div className="col-span-2 mt-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">📎 Uploaded Documents</h3>
                  <div className="space-y-2">
                    {resolveImageSrc(selectedStudent.profile_picture) && (
                      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="truncate">
                          <strong>Profile Picture:</strong>{" "}
                          {(selectedStudent.profile_picture as any)?.name || "profile.jpg"}
                        </span>
                        <button
                          onClick={() =>
                            handleImageDownload(
                              (selectedStudent.profile_picture as any).data ||
                              (selectedStudent.profile_picture as any),
                              (selectedStudent.profile_picture as any)?.name || selectedStudent.student_name
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          ⬇ Download
                        </button>
                      </div>
                    )}

                    {selectedStudent.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="truncate">
                          <strong>{doc.title}:</strong> {doc.name}
                        </span>
                        <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:text-blue-800 font-medium">
                          ⬇ Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}