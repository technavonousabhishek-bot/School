// useState not required here
// Recharts removed for a quick-fix; use simple HTML visuals instead

interface Student {
  name: string;
  [key: string]: any;
}

interface Props {
  open: boolean;
  onClose: () => void;
  student?: Student | null;
}

export default function AttendanceDetailsModal({
  open,
  onClose,
  student,
}: Props) {
  if (!open || !student) return null;

  // Mock chart data (replace with real data later)
  const weeklyData = [
    { day: "Mon", attendance: 1 },
    { day: "Tue", attendance: 1 },
    { day: "Wed", attendance: 0 },
    { day: "Thu", attendance: 1 },
    { day: "Fri", attendance: 1 },
  ];

  const monthlyData = [
    { name: "Week 1", attendance: 80 },
    { name: "Week 2", attendance: 90 },
    { name: "Week 3", attendance: 70 },
    { name: "Week 4", attendance: 85 },
  ];

  const yearlyData = [
    { name: "Present", value: 220 },
    { name: "Absent", value: 40 },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    // Simple modal wrapper used instead of a missing Modal component
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 p-4 overflow-auto">
      <div className="p-6 w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg max-h-[90vh] overflow-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Attendance Summary – {student.name}
        </h2>

        <div className="space-y-8">
          {/* Weekly Attendance */}
          <section>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Weekly Attendance
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">{d.day}</div>
                  <div
                    className={`w-full h-4 rounded ${
                      d.attendance ? "bg-green-400" : "bg-red-400"
                    }`}
                    title={d.attendance ? "Present" : "Absent"}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Monthly Attendance */}
          <section>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Monthly Attendance (%)
            </h3>
            <div className="flex flex-col gap-2">
              {monthlyData.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">{m.name}</div>
                  <div className="flex-1 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-4 bg-green-500"
                      style={{ width: `${m.attendance}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-gray-600">
                    {m.attendance}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Yearly Attendance */}
          <section>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Yearly Summary
            </h3>
            <div className="flex gap-4 justify-center">
              {yearlyData.map((entry, i) => (
                <div
                  key={entry.name}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                    style={{ background: COLORS[i % COLORS.length] }}
                  >
                    {entry.value}
                  </div>
                  <div className="text-sm text-gray-600">{entry.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Close button */}
          <div className="text-right">
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
