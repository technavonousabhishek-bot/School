// NoticeTeachers.tsx
import { useNavigate } from "react-router-dom";
import { getNoticesForAudience, deleteNotice } from "./noticeData";
import { useState } from "react";

export default function NoticeTeachers() {
  const navigate = useNavigate();
  const [, setRefreshKey] = useState(0);

  const notices = getNoticesForAudience("teachers");

  const doDelete = (id: number) => {
    if (!confirm("Delete this notice?")) return;
    deleteNotice(id);
    setRefreshKey((k) => k + 1);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notices — Teachers</h2>
        <button onClick={() => navigate("/notice/add", { state: { audience: "teachers" } })} className="px-3 py-2 bg-blue-600 text-white rounded">Add Notice</button>
      </div>

      <div className="space-y-4 max-w-3xl">
        {notices.length === 0 && <div className="text-gray-500">No teacher notices yet.</div>}

        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{n.title}</h3>
                <p className="text-sm text-gray-600">{n.description}</p>
                <div className="text-xs text-gray-500 mt-2">Posted by: {n.postedBy} • Date: {n.applicableDate ?? n.createdAt.split("T")[0]}</div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => navigate("/notice/add", { state: { edit: n } })} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
                <button onClick={() => doDelete(n.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
