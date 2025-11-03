// NoticeMain.tsx
import { useNavigate } from "react-router-dom";

export default function NoticeMain() {
  const navigate = useNavigate();

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Notice Management</h1>
      <p className="text-gray-600 mb-6">Choose where you want to manage notices.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
        <div
          onClick={() => navigate("/notice/students")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="text-xl font-semibold mb-2">Notices for Students</div>
          <div className="text-sm text-gray-500">Class-wise notices (click a class to view)</div>
        </div>

        <div
          onClick={() => navigate("/notice/teachers")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="text-xl font-semibold mb-2">Notices for Teachers</div>
          <div className="text-sm text-gray-500">All staff notices</div>
        </div>

        <div
          onClick={() => navigate("/notice/add")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 hover:shadow-md transition"
        >
          <div className="text-xl font-semibold mb-2">Add Notice</div>
          <div className="text-sm text-gray-500">Create a new notice for students or teachers</div>
        </div>
      </div>
    </main>
  );
}
