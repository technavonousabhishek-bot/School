import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ImBooks } from "react-icons/im";
import { MdMenuOpen, MdDashboard } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import {FaChalkboardTeacher, FaUserCheck, FaMoneyBillWave, FaBookOpen, FaBook, FaUserCircle
} from "react-icons/fa";
import { IoMegaphoneOutline } from "react-icons/io5";

const menuItems = [
  { icon: <MdDashboard size={26} />, label: "Dashboard", path: "/" },
  { icon: <ImBooks size={26} />, label: "Subjects", path: "/subjects" },
  { icon: <SiGoogleclassroom size={26} />, label: "Classroom", path: "/classroom" },
  { icon: <FaChalkboardTeacher size={26} />, label: "Classes", path: "/classes" },
  { icon: <FaUserCheck size={26} />, label: "Attendance", path: "/attendance" },
  { icon: <IoMegaphoneOutline size={26} />, label: "Notice", path: "/notice" },
  { icon: <FaMoneyBillWave size={26} />, label: "Fees", path: "/fees" },
  { icon: <FaBookOpen size={26} />, label: "Homework", path: "/homework" },
  { icon: <FaBook size={26} />, label: "Library", path: "/library" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
          className={`cursor-pointer transition-transform duration-500 ${
            !open ? "rotate-180" : ""
          }`}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu */}
      <ul className="flex-1 overflow-auto">
        {menuItems.map((item, index) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

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
          className={`transition-all duration-500 ${
            !open ? "opacity-0 translate-x-5" : "opacity-100"
          }`}
        >
          <p>XYZ</p>
          <span className="text-xs text-blue-200">abc@gmail.com</span>
        </div>
      </div>
    </nav>
  );
}
