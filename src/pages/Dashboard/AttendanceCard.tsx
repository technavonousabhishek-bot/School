import { Ellipsis } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface AttendanceData {
  month: string;
  students: number;
  teachers: number;
}

const data: AttendanceData[] = [
  { month: "Jan", students: 150, teachers: 60 },
  { month: "Feb", students: 230, teachers: 45 },
  { month: "Mar", students: 340, teachers: 80 },
  { month: "Apr", students: 200, teachers: 70 },
  { month: "May", students: 310, teachers: 20 },
];

export default function AttendanceCard() {
  return (
    // ⬇️ make width fluid so it fills its grid span
    <div className="w-full h-[320px] bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-[15px] font-semibold text-gray-900">Attendance</h3>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-600" />
              Students
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-gray-300" />
              Teachers
            </span>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="More options"
        >
          <Ellipsis className="w-5 h-5" />
        </button>
      </div>

      {/* Chart */}
      <div className="mt-2 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={20}>
            <CartesianGrid vertical={false} stroke="#f0f2f5" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickCount={6}
            />
            <Bar dataKey="students" radius={[4, 4, 0, 0]} fill="#1d4ed8" />
            <Bar dataKey="teachers" radius={[4, 4, 0, 0]} fill="#d1d5db" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
