import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FeesDetailsModal from "./FeesDetailsModal";

type FeeBreakdown = {
  term: string;
  amount: number;
  status: string;
};

type Student = {
  id: number;
  name: string;
  parent_name: string;
  parent_contact: string;
  enrollmentNo: string;
  totalFee: number;
  paid: number;
  status: string;
  lastPaymentDate: string | null;
  feeBreakdown: FeeBreakdown[];
};

export default function FeesStudentList() {
  const params = useParams<{ classId?: string; className?: string }>();
  const classId = params.classId ?? params.className ?? null;
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [classLabel, setClassLabel] = useState<string | null>(null);

  const SCHOOL_API_BASE = (window as any).__SCHOOL_API_BASE__ || (window as any).REACT_APP_SCHOOL_API_BASE || "https://school-bos-backend.onrender.com/schoolApp";

  useEffect(() => {
    // Attempt to fetch students for the class from backend if endpoint exists.
    // Endpoint is optional; if not present, the list will be empty and the UI shows a message.
    if (!classId) return;
    // fetch class details to show a readable label
    fetch(`${SCHOOL_API_BASE}/classes/${encodeURIComponent(classId)}/`)
      .then((r) => r.ok ? r.json() : null)
      .then((c) => { if (c) setClassLabel(`${c.class_name}${c.section ? ` - ${c.section}` : ''}`); })
      .catch(() => {});

    const url = `${SCHOOL_API_BASE}/class/${encodeURIComponent(classId)}/students/`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("no fees students API");
        return res.json();
      })
        .then((json: any[]) => {
          // class-students endpoint returns minimal records like {id, name, enrollment_no}
          const mapped: Student[] = (json || []).map((s) => ({
            id: s.id,
            name: s.name,
            parent_name: s.parent_name || '',
            parent_contact: s.parent_contact || s.parent_contact || '',
            enrollmentNo: s.enrollment_no || s.enrollmentNo || '',
            totalFee: 0,
            paid: 0,
            status: 'Pending',
            lastPaymentDate: null,
            feeBreakdown: [],
          }));
          setStudents(mapped);

          // fetch fees for each student and compute totals
          (async () => {
            try {
              const updated = await Promise.all(mapped.map(async (stu) => {
                try {
                  const resp = await fetch(`${SCHOOL_API_BASE}/fee/?student=${stu.id}`);
                  if (!resp.ok) return stu;
                  const fees = await resp.json();
                  if (!Array.isArray(fees) || fees.length === 0) return stu;
                  const total = fees.reduce((sum: number, f: any) => sum + (Number(f.total_amount) || 0), 0);
                  const paid = fees.reduce((sum: number, f: any) => sum + (Number(f.paid_amount) || 0), 0);
                  const status = paid >= total ? 'Paid' : (paid > 0 ? 'Partially Paid' : 'Pending');
                  const last = fees.sort((a:any,b:any) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
                  const lastDate = last ? (last.due_date || last.dueDate || null) : null;
                  return { ...stu, totalFee: total, paid: paid, status: status, lastPaymentDate: lastDate };
                } catch (e) {
                  return stu;
                }
              }));
              setStudents(updated);
            } catch (e) {
              // ignore
            }
          })();
        })
      .catch(() => {
        // ignore and keep empty until real API is added
      });
  }, [classId]);

  // Add fee for a student (simple prompt flow)
  const addFee = async (studentId: number) => {
    const total = window.prompt('Enter total amount (₹):');
    if (!total) return;
    const paid = window.prompt('Enter paid amount (₹):', '0');
    if (paid === null) return;
    const dueDate = window.prompt('Enter due date (YYYY-MM-DD):', new Date().toISOString().slice(0,10));
    if (!dueDate) return;

    try {
      const res = await fetch(`${SCHOOL_API_BASE}/fee/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: studentId, total_amount: Number(total), paid_amount: Number(paid), due_date: dueDate, status: Number(total)===Number(paid) ? 'Paid' : 'Pending' }),
      });
      if (res.ok) {
        // Try to read returned fee data; if not available, use entered values
        const respJson = await res.json().catch(() => null);
        const newTotal = respJson && respJson.total_amount !== undefined ? Number(respJson.total_amount) : Number(total);
        const newPaid = respJson && respJson.paid_amount !== undefined ? Number(respJson.paid_amount) : Number(paid);
        const newStatus = newPaid >= newTotal ? 'Paid' : (newPaid > 0 ? 'Partially Paid' : 'Pending');

        // update students list state
        setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, totalFee: newTotal, paid: newPaid, status: newStatus, lastPaymentDate: dueDate } : s));

        // if modal is open for this student, update it too
        setSelectedStudent((cur) => (cur && cur.id === studentId ? { ...cur, totalFee: newTotal, paid: newPaid, status: newStatus, lastPaymentDate: dueDate } : cur));

        alert('Fee added/updated successfully');
      } else {
        const err = await res.json().catch(() => null);
        alert('Failed to add fee: ' + (err ? JSON.stringify(err) : res.statusText));
      }
    } catch (e) {
      alert('Network error while adding fee');
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {classLabel ?? `Class ${classId}`} – Students Fee Record
        </h2>
        <button
          onClick={() => navigate("/fees")}
          className="px-4 py-2 text-sm font-medium bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          Back to Classes
        </button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search student..."
        className="w-full sm:w-1/3 mb-4 p-2 border border-gray-300 rounded-lg"
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Parent Name</th>
              <th className="px-4 py-2 text-left">Parent Contact</th>
              <th className="px-4 py-2 text-left">Enrollment No</th>
              <th className="px-4 py-2 text-left">Total Fee</th>
              <th className="px-4 py-2 text-left">Paid</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.parent_name}</td>
                <td className="px-4 py-2">{student.parent_contact}</td>
                <td className="px-4 py-2">{student.enrollmentNo}</td>
                <td className="px-4 py-2">₹{student.totalFee}</td>
                <td className="px-4 py-2">₹{student.paid}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      student.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          View Fee Details
                        </button>
                        <button
                          onClick={() => addFee(student.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add / Update Fee
                        </button>
                      </div>
                    </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fee Details Modal */}
      {selectedStudent && (
        <FeesDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </main>
  );
}
