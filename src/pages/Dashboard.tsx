import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { MdOutlineClass } from "react-icons/md";

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalClassrooms, setTotalClassrooms] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/students.json");
        setTotalStudents(res.ok ? (await res.json()).length : 0);
      } catch {
        setTotalStudents(0);
      }

      try {
        const resT = await fetch("/teachers.json");
        setTotalTeachers(resT.ok ? (await resT.json()).length : 0);
      } catch {
        setTotalTeachers(0);
      }

      try {
        const resC = await fetch("/classrooms.json");
        setTotalClassrooms(resC.ok ? (await resC.json()).length : 0);
      } catch {
        setTotalClassrooms(0);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Teachers",
      value: totalTeachers.toString(),
      subtitle: "Active teaching staff",
      icon: <FaChalkboardTeacher className="text-green-600 text-2xl" />,
      onClick: () => navigate("/teachers"),
    },
    {
      title: "Total Students",
      value: totalStudents.toString(),
      subtitle: "Active students this year",
      icon: <FaUserGraduate className="text-blue-600 text-2xl" />,
      onClick: () => navigate("/students"),
    },
    {
      title: "Classrooms",
      value: totalClassrooms.toString(),
      subtitle: "Active academic classrooms",
      icon: <MdOutlineClass className="text-purple-600 text-2xl" />,
      onClick: () => navigate("/classroom"),
    },
    {
      title: "Attendance",
      value: "912 / 1064",
      subtitle: "Active students present",
      icon: <BsFillPersonLinesFill className="text-orange-600 text-2xl" />,
      onClick: () => navigate("/attendance"),
    },
  ];

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="mt-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-600">Welcome to the school management system</p>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 font-semibold">{item.title}</h3>
              {item.icon}
            </div>
            <div className="text-3xl font-bold text-gray-900">{item.value}</div>
            <p className="text-sm text-gray-500">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
