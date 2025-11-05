import { useNavigate } from "react-router-dom";
import { FaRegClipboard, FaCertificate, FaCalendarCheck } from "react-icons/fa";

export default function ManageResultsLanding() {
  const navigate = useNavigate();

  const options = [
    { key: "mid-term", title: "Mid Term", icon: <FaRegClipboard /> },
    { key: "half-yearly", title: "Half Yearly", icon: <FaCalendarCheck /> },
    { key: "annual", title: "Annual Exam", icon: <FaCertificate /> },
  ];

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Results</h1>
        <p className="text-gray-500">Choose an exam type to manage results</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => navigate(`/manage-results/type/${opt.key}`)}
            className="bg-white rounded-2xl p-5 shadow hover:shadow-md transition flex flex-col items-start gap-3"
          >
            <div className="text-2xl text-blue-600">{opt.icon}</div>
            <div className="text-lg font-semibold">{opt.title}</div>
            <div className="text-sm text-gray-500">Enter, edit or view marks for this exam</div>
          </button>
        ))}
      </div>
    </main>
  );
}
