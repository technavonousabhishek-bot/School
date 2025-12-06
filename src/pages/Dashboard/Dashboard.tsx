import { useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { MdOutlineClass } from "react-icons/md";
// note: `useEffect` used to ensure dashboard is reachable without login

// Cards
import StudentsCard from "./StudentsCard";
import TopStudentsCard from "./TopStudentsCard";
import NoticeBoardCard from "./NoticeBoardCard";
import AttendanceCard from "./AttendanceCard";
import ExamResultsCard from "./ExamResultsCard"; // ← make sure this exists
import Profile from "../../Components/Profile";

type StatItem = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  onClick: () => void;
};

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // If no user role is present (no login), set a harmless default so
    // routes or components that check for `userRole` do not redirect.
    if (!localStorage.getItem("userRole")) {
      localStorage.setItem("userRole", "guest");
    }
  }, []);

  const stats: StatItem[] = [
    {
      title: "Total Students",
      value: "1064",
      subtitle: "Active students this year",
      icon: <FaUserGraduate className="text-blue-600 text-2xl" />,
      onClick: () => navigate("/students"),
    },
    {
      title: "Teachers",
      value: "32",
      subtitle: "Active teaching staff",
      icon: <FaChalkboardTeacher className="text-green-600 text-2xl" />,
      onClick: () => navigate("/teachers"),
    },
    {
      title: "Classes",
      value: "62",
      subtitle: "Active academic classrooms",
      icon: <MdOutlineClass className="text-purple-600 text-2xl" />,
      onClick: () => navigate("/classes"),
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
      {/* Profile (shown only on Dashboard) */}
      <Profile />
      {/* Header */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-600">Welcome to the school management system</p>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="text-left bg-white p-5 rounded-2xl shadow hover:shadow-md transition-all cursor-pointer h-36 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 font-semibold">{item.title}</h3>
              {item.icon}
            </div>
            <div className="text-3xl font-bold text-gray-900">{item.value}</div>
            <p className="text-sm text-gray-500">{item.subtitle}</p>
          </button>
        ))}
      </div>

      {/* Row 1: Students | Top Students | Notice Board (3/5/4) */}
      <div className="mt-10 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-3">
          <StudentsCard />
        </div>
        <div className="xl:col-span-5">
          <TopStudentsCard />
        </div>
        <div className="xl:col-span-4">
          <NoticeBoardCard />
        </div>
      </div>

      {/* Row 2: ALWAYS same row → Attendance 60% | Exams 40% */}
      <div className="mt-6 flex gap-6">
        <div className="basis-[60%] min-w-0">
          <AttendanceCard /> {/* root uses w-full in your latest file */}
        </div>
        <div className="basis-[40%] min-w-0">
          <ExamResultsCard />
        </div>
      </div>
    </main>
  );
}
