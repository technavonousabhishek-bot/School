import { FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

type Notice = {
  id: number;
  title: string;
  summary: string;
  date: string;
  type?: "info" | "warning";
};

const dummyNotices: Notice[] = [
  {
    id: 1,
    title: "Sports Day Announcement",
    summary: "Annual Sports Day will be held on May 12.",
    date: "May 12, 2025",
    type: "info",
  },
  {
    id: 2,
    title: "Summer Break Start Date",
    summary: "Summer break begins on May 25.",
    date: "May 25, 2025",
    type: "warning",
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting",
    summary: "Meeting scheduled for all grades on June 2.",
    date: "June 2, 2025",
    type: "info",
  },
  {
    id: 4,
    title: "Library Renovation",
    summary: "Library will be closed for renovation till June 10.",
    date: "June 10, 2025",
    type: "warning",
  },
  {
    id: 5,
    title: "New Academic Session",
    summary: "Classes for new session start from July 1.",
    date: "July 1, 2025",
    type: "info",
  },
];

export default function NoticeBoardCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 h-64 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Notice Board</h3>
        <button className="text-sm text-blue-600 hover:underline">View all</button>
      </div>

      {/* Notices List */}
      <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {dummyNotices.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full text-lg ${
                n.type === "warning"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {n.type === "warning" ? (
                <FaExclamationTriangle />
              ) : (
                <FaInfoCircle />
              )}
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">
                {n.title}
              </div>
              <div className="text-xs text-gray-500">{n.summary}</div>
              <div className="text-xs text-gray-400 mt-1">{n.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
