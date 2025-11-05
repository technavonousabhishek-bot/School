import { Link } from "react-router-dom";
import { classes } from "../../data/classesData";
import type { ClassInfo } from "../../data/classesData";
import { FaSchool } from "react-icons/fa";

export default function ManageExams() {
  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Exams</h1>
          <p className="text-gray-500 text-sm">Select a class to view or schedule exams</p>
        </div>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c: ClassInfo) => (
          <Link
            to={`/manage-exams/class/${c.id}`}
            key={c.id}
            className="block transition-transform hover:scale-[1.02]"
          >
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-600 rounded-md p-2">
                    <FaSchool />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Class {c.name}</h2>
                </div>
                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Section {c.section}</span>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-700">
                <div>Teacher: <span className="font-medium text-gray-800">{c.teacher}</span></div>
                <div>Students: <span className="font-medium text-gray-800">{c.studentsCount}/{c.maxSeats}</span></div>
              </div>

              <div className="flex justify-between items-center text-gray-500 text-sm">
                <span className="text-blue-600 font-medium">View Options →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
