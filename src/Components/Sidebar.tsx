import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ImBooks } from "react-icons/im";
import { MdMenuOpen, MdDashboard } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import {
  FaChalkboardTeacher,
  FaUserCircle,
  FaBookOpen,
  FaMoneyBillWave,
  FaUserCheck,
  FaBook,
  FaBusAlt,
  FaUserGraduate,
} from "react-icons/fa";
import { IoMegaphoneOutline } from "react-icons/io5";

// ✅ All menu items with roles
const allMenuItems = [
  { icon: <MdDashboard size={26} />, label: "Dashboard", path: "/", roles: ["admin"] },
  { icon: <FaUserGraduate size={26} />, label: "Students", path: "/students", roles: ["admin", "teacher"] },
  { icon: <FaChalkboardTeacher size={26} />, label: "Teachers", path: "/teachers", roles: ["admin"] },
  { icon: <FaChalkboardTeacher size={26} />, label: "Classes", path: "/classes", roles: ["admin", "teacher"] },
  { icon: <FaUserCheck size={26} />, label: "Attendance", path: "/attendance", roles: ["admin", "teacher"] },
  { icon: <IoMegaphoneOutline size={26} />, label: "Notice", path: "/notice", roles: ["admin", "teacher"] },
  { icon: <FaMoneyBillWave size={26} />, label: "Fees", path: "/fees", roles: ["admin"] },
  { icon: <FaBookOpen size={26} />, label: "Homework", path: "/homework", roles: ["admin", "teacher"] },
  { icon: <FaBook size={26} />, label: "Library", path: "/library", roles: ["admin"] },
  { icon: <MdDashboard size={26} />, label: "Timetable", path: "/timetable", roles: ["admin", "teacher"] },
  { icon: <FaBusAlt size={26} />, label: "Transport", path: "/transport", roles: ["admin", "teacher"] },
];

export default function Sidebar({ userRole = "teacher", userName = "Teacher", userEmail = "" }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Filter menu items based on role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <nav
      className={`shadow-md h-full p-2 flex flex-col duration-500 bg-blue-600 text-white ${
        open ? "w-60" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="px-3 py-2 h-20 flex justify-between items-center">
        <img
          src="/images/Navonous_Logo.png"
          alt="Logo"
          className={`${open ? "w-20" : "w-0"} rounded-md transition-all`}
        />
        <MdMenuOpen
          size={30}
          className={`cursor-pointer transition-transform duration-500 ${!open ? "rotate-180" : ""}`}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu */}
      <ul className="flex-1 overflow-auto">
        {menuItems.map((item, index) => {
          const isActive =
            item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

          return (
            <li
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 my-2 rounded-md cursor-pointer transition-all duration-300
                ${isActive ? "bg-blue-800" : "bg-transparent hover:bg-blue-800"}
                ${!open ? "justify-center" : ""}`}
            >
              <div className={`${!open ? "mx-auto" : ""}`}>{item.icon}</div>
              <p
                className={`whitespace-nowrap transition-all duration-500 ${
                  !open ? "opacity-0 translate-x-5" : "opacity-100"
                }`}
              >
                {item.label}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border-t border-blue-400 ${
          !open ? "justify-center" : ""
        }`}
      >
        <FaUserCircle size={30} />
        <div
          className={`transition-all duration-500 ${!open ? "opacity-0 translate-x-5" : "opacity-100"}`}
        >
          <p>{userName}</p>
          <span className="text-xs text-blue-200">{userEmail || "example@gmail.com"}</span>
        </div>
      </div>
    </nav>
  );
}