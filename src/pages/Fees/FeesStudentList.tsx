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
  fatherName: string;
  contact: string;
  enrollmentNo: string;
  totalFee: number;
  paid: number;
  status: string;
  lastPaymentDate: string;
  feeBreakdown: FeeBreakdown[];
};

type FeesData = Record<string, Student[]>;

const mockFeesData: FeesData = {
  "Class 1": [
    {
      id: 1,
      name: "Rohan Mehta",
      fatherName: "Suresh Mehta",
      contact: "9876543210",
      enrollmentNo: "C1-101",
      totalFee: 40000,
      paid: 25000,
      status: "Partially Paid",
      lastPaymentDate: "2025-09-10",
      feeBreakdown: [
        { term: "Term 1", amount: 20000, status: "Paid" },
        { term: "Term 2", amount: 20000, status: "Pending" },
      ],
    },
    {
      id: 2,
      name: "Aarav Sharma",
      fatherName: "Manoj Sharma",
      contact: "9988776655",
      enrollmentNo: "C1-102",
      totalFee: 40000,
      paid: 40000,
      status: "Paid",
      lastPaymentDate: "2025-10-01",
      feeBreakdown: [
        { term: "Term 1", amount: 20000, status: "Paid" },
        { term: "Term 2", amount: 20000, status: "Paid" },
      ],
    },
  ],
  "Class 2": [
    {
      id: 1,
      name: "Simran Kaur",
      fatherName: "Harjeet Kaur",
      contact: "9090909090",
      enrollmentNo: "C2-201",
      totalFee: 42000,
      paid: 20000,
      status: "Partially Paid",
      lastPaymentDate: "2025-08-25",
      feeBreakdown: [
        { term: "Term 1", amount: 21000, status: "Paid" },
        { term: "Term 2", amount: 21000, status: "Pending" },
      ],
    },
  ],
};

export default function FeesStudentList() {
  const { className } = useParams<{ className: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (className && mockFeesData[className]) {
      setStudents(mockFeesData[className]);
    }
  }, [className]);

  return (
    <main className="p-6 bg-gray-50 min-h-screen relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {className} – Students Fee Record
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
              <th className="px-4 py-2 text-left">Father’s Name</th>
              <th className="px-4 py-2 text-left">Contact</th>
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
                <td className="px-4 py-2">{student.fatherName}</td>
                <td className="px-4 py-2">{student.contact}</td>
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
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Fee Details
                  </button>
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
