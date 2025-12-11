import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

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

export default function FeesMain() {
  const navigate = useNavigate();
  const [data, setData] = useState<Record<number, { class_name: string; section?: string; students?: Student[] }>>({});
  const classEntries = Object.entries(data); // [id, {class_name,...}]

  useEffect(() => {
    // Try fetching real fee data from backend if available. This endpoint is optional
    // and may be implemented later. If unavailable, the page shows a friendly message.
    fetch(API_ENDPOINTS.school.classes)
      .then((res) => {
        if (!res.ok) throw new Error("no classes API");
        return res.json();
      })
      .then((json: any[]) => {
        // assume json is array of class objects with id, class_name, section
        const map: any = {};
        json.forEach((c) => {
          map[c.id] = c;
        });
        setData(map);
      })
      .catch(() => {
        // ignore — leave empty
      });
  }, []);

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Fees Management</h2>
        <p className="text-gray-600">Select a class to view fee details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classEntries.length === 0 && (
          <div className="col-span-3 text-center text-gray-500">No classes available yet.</div>
        )}
        {classEntries.map(([idStr, cls]) => {
          const id = Number(idStr);
          const label = `${cls.class_name}${cls.section ? ` - ${cls.section}` : ''}`;
          return (
            <div
              key={id}
              onClick={() => navigate(`/fees/${id}`)}
              className="bg-white shadow p-5 rounded-xl cursor-pointer hover:shadow-md transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{label}</h3>
              <p className="text-gray-500 text-sm mb-1">Total Students: {cls.students?.length ?? '—'}</p>
              <p className="text-gray-500 text-sm mb-1">Total Fee: ₹{/* unknown without API */ '—'}</p>
              <p className="text-gray-700 font-medium">Collected: ₹{'—'}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
