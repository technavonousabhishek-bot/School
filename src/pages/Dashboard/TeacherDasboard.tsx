import { Outlet } from "react-router-dom";

const TeacherDashboard = () => {
  const teacherName = localStorage.getItem("userName") || "Teacher";

  return (
    <div className="flex-1 p-4 bg-gray-100 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {teacherName}</h1>
      <Outlet />
    </div>
  );
};

export default TeacherDashboard;