import { useParams, useNavigate } from "react-router-dom";
import { getClassById } from "../../data/classesData";
import { FaPlusCircle, FaEye } from "react-icons/fa";

export default function ClassResultsActions() {
  const { classId, examType } = useParams<{ classId: string; examType: string }>();
  const navigate = useNavigate();
  const cid = Number(classId || 0);
  const cls = getClassById(cid);

  if (!cls) return <div className="p-6">Class not found</div>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{cls.name} - {cls.section}</h1>
          <p className="text-gray-500">Choose an action for {(examType || "").replace("-", " ")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
        <button onClick={() => navigate(`/manage-results/class/${cid}/${examType}/add`)} className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition text-left flex items-center gap-4">
          <FaPlusCircle className="text-blue-600 text-2xl" />
          <div>
            <div className="font-semibold">Add Marks</div>
            <div className="text-sm text-gray-500">Enter marks for all students for this exam</div>
          </div>
        </button>

        <button onClick={() => navigate(`/manage-results/class/${cid}/${examType}/view`)} className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition text-left flex items-center gap-4">
          <FaEye className="text-green-600 text-2xl" />
          <div>
            <div className="font-semibold">View Marks</div>
            <div className="text-sm text-gray-500">See saved results and student grades</div>
          </div>
        </button>
      </div>
    </main>
  );
}
