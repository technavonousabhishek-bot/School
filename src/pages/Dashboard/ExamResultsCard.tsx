import { MoreHorizontal, CalendarDays, FileText, GraduationCap } from "lucide-react";

type ExamItem = {
  id: string;
  subject: string;
  cls: string;
  date: string; // display-ready
};

const upcomingExams: ExamItem[] = [
  { id: "e1", subject: "Mathematics", cls: "10th", date: "May 28, 2025" },
  { id: "e2", subject: "Science", cls: "9th", date: "May 30, 2025" },
  { id: "e3", subject: "English", cls: "8th", date: "Jun 02, 2025" },
];

const passRate = 88; // %
const failRate = 12; // %
const avgScore = 78; // %

function Donut({
  percent,
  size = 92,
  stroke = "#16a34a", // emerald-600
  track = "#e5e7eb",  // gray-200
}: {
  percent: number;
  size?: number;
  stroke?: string;
  track?: string;
}) {
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center rotate-90">
        <div className="text-center leading-tight">
          <div className="text-xl font-bold text-gray-900">{percent}%</div>
          <div className="text-[11px] text-gray-500">Pass</div>
        </div>
      </div>
    </div>
  );
}

export default function ExamResultsCard() {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 h-[320px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">Exams & Results</h3>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="More options">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Result summary */}
      <div className="mt-2 grid grid-cols-12 gap-3">
        {/* Donut */}
        <div className="col-span-5 lg:col-span-4 flex items-center justify-center">
          <Donut percent={passRate} />
</div>

        {/* KPIs & bars */}
        <div className="col-span-7 lg:col-span-8 space-y-2">
          {/* Avg score */}
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{avgScore}%</span> Average Score
            </span>
          </div>

          {/* Pass */}
          <div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Pass
              </span>
              <span className="font-medium text-gray-700">{passRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${passRate}%` }} />
            </div>
          </div>

          {/* Fail */}
          <div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Fail
              </span>
              <span className="font-medium text-gray-700">{failRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${failRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-gray-100" />

      {/* Upcoming exams */}
      <div className="mt-3 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
        <div className="text-xs font-medium text-gray-500 px-1 mb-2">Upcoming Exams</div>

        <ul className="space-y-2 pr-1">
          {upcomingExams.map((ex) => (
            <li
              key={ex.id}
              className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2 hover:bg-gray-100 transition"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-100 grid place-items-center">
                <FileText className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{ex.subject}</div>
                <div className="text-xs text-gray-500 flex items-center gap-3">
                  <span>Class {ex.cls}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                    {ex.date}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
