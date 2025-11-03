import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type FeeBreakdown = {
  term: string;
  amount: number;
  status: string;
};

type Student = {
  id: number;
  name: string;
  fatherName: string;
  enrollmentNo: string;
  totalFee: number;
  paid: number;
  status: string;
  lastPaymentDate: string;
  feeBreakdown: FeeBreakdown[];
};

interface FeeDetailsModalProps {
  student: Student | null;
  onClose: () => void;
}

const COLORS = ["#22c55e", "#ef4444"]; // green for paid, red for pending

export default function FeesDetailsModal({ student, onClose }: FeeDetailsModalProps) {
  if (!student) return null;

  const chartData = [
    { name: "Paid", value: student.paid },
    { name: "Pending", value: student.totalFee - student.paid },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Fee Details – {student.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-lg font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Father’s Name</p>
            <p className="font-medium">{student.fatherName}</p>
          </div>
          <div>
            <p className="text-gray-500">Enrollment No</p>
            <p className="font-medium">{student.enrollmentNo}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Fee</p>
            <p className="font-medium text-gray-800">₹{student.totalFee}</p>
          </div>
          <div>
            <p className="text-gray-500">Paid</p>
            <p className="font-medium text-green-600">₹{student.paid}</p>
          </div>
          <div>
            <p className="text-gray-500">Pending</p>
            <p className="font-medium text-red-600">
              ₹{student.totalFee - student.paid}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Last Payment</p>
            <p className="font-medium">{student.lastPaymentDate}</p>
          </div>
        </div>

        {/* Fee Breakdown Table */}
        <h3 className="text-lg font-semibold mb-2">Term-wise Breakdown</h3>
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden mb-6 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Term</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {student.feeBreakdown.map((f, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{f.term}</td>
                <td className="px-3 py-2">₹{f.amount}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      f.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pie Chart */}
        <h3 className="text-lg font-semibold mb-2">Fee Summary</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
