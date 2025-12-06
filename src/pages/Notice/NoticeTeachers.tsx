// NoticeTeachers.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchNotices, deleteNotice } from "../../api/notices";

export default function NoticeTeachers() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchNotices('teachers');
        const normalized = data.map((r: any) => ({
          ...r,
          validTill: r.validTill ?? undefined,
          className: r.className ?? undefined,
          applicableTo: r.applicableTo ?? undefined,
        }));
        setNotices(normalized);
      } catch (err) {
        console.error('failed to load teacher notices', err);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const doDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('delete failed', err);
      alert('Failed to delete notice');
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">Notices — Teachers</h2>
      </div>

      <div className="space-y-4 max-w-3xl">
        {loading && <div className="text-gray-500">Loading notices…</div>}
        {!loading && notices.length === 0 && <div className="text-gray-500">No teacher notices yet.</div>}

        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{n.title}</h3>
                <p className="text-sm text-gray-600">{n.description}</p>
                <div className="text-xs text-gray-500 mt-2">Posted by: {n.postedBy} • Date: {n.applicableDate ?? (n.createdAt || '').split('T')[0]}</div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/notice/add', { state: { edit: n } })} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
                <button onClick={() => doDelete(n.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
