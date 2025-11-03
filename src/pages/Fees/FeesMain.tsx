import { useNavigate } from "react-router-dom";
import mockData from "./mockFeesData.json";

type Student = {
  id: number;
  name: string;
  fatherName: string;
  contact: string;
  enrollmentNo: string;
  totalFee: number;
  paid: number;
  status: string;
  lastPaymentDate: string | null; // ✅ fix here
  feeBreakdown: {
    term: string;
    amount: number;
    status: string;
  }[];
};

type FeesData = Record<string, Student[]>;

export default function FeesMain() {
  const navigate = useNavigate();
  const data: FeesData = mockData as FeesData; // 👈 type assertion
  const classNames = Object.keys(data);

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Fees Management</h2>
        <p className="text-gray-600">Select a class to view fee details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classNames.map((className) => {
          const students = data[className];
          const totalStudents = students.length;
          const totalFee = students.reduce((sum, s) => sum + s.totalFee, 0);
          const paidFee = students.reduce((sum, s) => sum + s.paid, 0);

          return (
            <div
              key={className}
              onClick={() => navigate(`/fees/${className}`)}
              className="bg-white shadow p-5 rounded-xl cursor-pointer hover:shadow-md transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{className}</h3>
              <p className="text-gray-500 text-sm mb-1">Total Students: {totalStudents}</p>
              <p className="text-gray-500 text-sm mb-1">Total Fee: ₹{totalFee}</p>
              <p className="text-gray-700 font-medium">
                Collected: ₹{paidFee} ({Math.round((paidFee / totalFee) * 100)}%)
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
