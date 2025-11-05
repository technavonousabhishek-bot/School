import { Link, useNavigate, useParams } from "react-router-dom";
import { classes } from "../../data/classesData";
import type { ClassInfo } from "../../data/classesData";
import { FaSchool } from "react-icons/fa";

export default function ClassResults() {
  const navigate = useNavigate();
  const { examType } = useParams<{ examType: string }>();

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{(examType || "").replace("-", " ")}</h1>
          <p className="text-gray-500">Select a class to manage {examType} results</p>
        </div>
        <div>
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c: ClassInfo) => (
          <Link key={c.id} to={`/manage-results/class/${c.id}/${examType}/actions`} className="block">
            <div className="bg-white border border-gray-100 rounded-2xl shadow p-5 hover:shadow-md transition">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-600 rounded-md p-2"><FaSchool /></div>
                  <h2 className="text-lg font-semibold">Class {c.name}</h2>
                </div>
                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Section {c.section}</span>
              </div>
              <div className="text-sm text-gray-600">Teacher: <span className="font-medium text-gray-800">{c.teacher}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
