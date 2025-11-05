import { MoreHorizontal } from "lucide-react";

interface TopStudent {
  name: string;
  cls: string;
  marks: string;
}

const topStudents: TopStudent[] = [
  { name: "Olivia Brown", cls: "9th", marks: "98.5%" },
  { name: "Liam Johnson", cls: "10th", marks: "97.2%" },
  { name: "Sophia Martinez", cls: "9th", marks: "96.1%" },
  { name: "Ethan Davis", cls: "10th", marks: "95.8%" },
  { name: "Mason Lee", cls: "9th", marks: "95.2%" },
  { name: "Ava Thompson", cls: "10th", marks: "94.7%" },
];

export default function TopStudentsCard() {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 h-[260px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">Top Students</h3>
        <button
          type="button"
          aria-label="More options"
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Column headers */}
      <div className="mt-2 grid grid-cols-[7fr_3fr_2fr] px-3 text-xs font-medium text-gray-500">
        <div>Name</div>
        <div>Class</div>
        <div className="text-right">Marks</div>
      </div>

      <div className="mt-1 border-t border-gray-100" />

      {/* Scrollable students list */}
      <div
        className="mt-1 flex-1 overflow-y-auto [scrollbar-gutter:stable] pr-1"
        role="region"
        aria-label="Top students list"
      >
        <ul className="divide-y divide-gray-100">
          {topStudents.map((s, i) => (
            <li key={i} className="grid grid-cols-[7fr_3fr_2fr] items-center py-2 px-3">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-block h-7 w-7 shrink-0 rounded-full bg-gray-200" />
                <span className="text-[13px] font-semibold text-gray-800 truncate">
                  {s.name}
                </span>
              </div>

              {/* Class */}
              <div>
                <span className="text-[13px] text-gray-600">{s.cls}</span>
              </div>

              {/* Marks */}
              <div className="text-right">
                <span className="text-[13px] font-semibold text-gray-900">{s.marks}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
