import { useParams } from "react-router-dom";
import { getClassById } from "../../data/classesData";

// Dummy data for display
const dummyResults = [
  { id: 1, name: "Aarav Sharma", admissionNo: "ENR101", marks: [{ subject: "Math", marks: 88 }, { subject: "Science", marks: 92 }], percent: 90.0 },
  { id: 2, name: "Neha Gupta", admissionNo: "ENR102", marks: [{ subject: "Math", marks: 76 }, { subject: "Science", marks: 81 }], percent: 78.5 },
  { id: 3, name: "Rohan Singh", admissionNo: "ENR103", marks: [{ subject: "Math", marks: 65 }, { subject: "Science", marks: 70 }], percent: 67.5 },
];

export default function ViewResultsPage() {
  const { classId, examType } = useParams<{ classId: string; examType: string }>();
  const cid = Number(classId || 0);
  const cls = getClassById(cid);

  if (!cls) return <div className="p-6">Class not found</div>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{cls.name} - {cls.section} — {(examType || "").replace("-", " ")}</h1>
        <p className="text-gray-500">Viewing results (dummy data)</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">#</th>
              <th>Name</th>
              <th>Admission No</th>
              <th>Subjects / Marks</th>
              <th>Percent</th>
            </tr>
          </thead>
          <tbody>
            {dummyResults.map((s, i) => (
              <tr key={s.id} className="border-t">
                <td className="py-2">{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.admissionNo}</td>
                <td>
                  <div className="flex flex-col gap-1">
                    {s.marks.map((m) => (
                      <div key={m.subject} className="text-xs text-gray-700">{m.subject}: <span className="font-medium">{m.marks}</span></div>
                    ))}
                  </div>
                </td>
                <td className="font-semibold">{s.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}



