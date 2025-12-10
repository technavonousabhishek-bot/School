import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://school-bos-backend.onrender.com/schoolApp/";

type StudentType = {
  id: number;
  name: string;
  enrollmentNo?: string;
};

export default function MarksEntryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { id, className, section, exam } = (location.state || {}) as {
    id: number;
    className: string;
    section: string;
    exam: string;
  };

  const [students, setStudents] = useState<StudentType[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [marks, setMarks] = useState<Record<number, Record<string, number>>>({});

  const [userTotalMarks, setUserTotalMarks] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const resStudents = await axios.get(`${API_BASE}class/${id}/students/`);
        const studentsData = (resStudents.data || []).map((s: any) => ({
          id: s.id,
          enrollmentNo: s.enrollment_no ?? s.id,
          name: s.name ?? s.user?.username ?? "",
        }));
        setStudents(studentsData);

        const resClass = await axios.get(`${API_BASE}classes/${id}/`);
        const subjectList = resClass.data.subjects || [];
        setSubjects(subjectList);

        const initialMarks: Record<number, Record<string, number>> = {};
        studentsData.forEach((stu: StudentType) => {
          initialMarks[stu.id] = {};
          subjectList.forEach((sub: string) => {
            initialMarks[stu.id][sub] = 0;
          });
        });

        setMarks(initialMarks);
      } catch (e) {
        console.error("Failed", e);
      }
    };

    fetchData();
  }, [id]);

  const handleMarkChange = (studentId: number, subject: string, value: number) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subject]: value },
    }));
  };

  // ⭐ AUTO CALCULATE TOTAL FOR EACH STUDENT
  const getAutoTotal = (studentId: number) => {
    return subjects.reduce((sum, sub) => sum + (marks[studentId]?.[sub] || 0), 0);
  };

  const handleSave = async () => {
    try {
      const payload = students.map((stu) => ({
        studentId: stu.id,
        obtained: marks[stu.id],
        totalMarks: {
          auto: getAutoTotal(stu.id),
          user: userTotalMarks,
        },
      }));

      console.log("Saving marks", payload);
      alert("Marks saved!");
    } catch (e) {
      console.error("Failed to save", e);
      alert("Failed");
    }
  };

  if (!id) return <p className="p-6 text-red-500">No class selected.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {className} - {section} Marks Entry
        </h2>
      </div>

      {exam && (
        <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg max-w-lg">
          <p className="font-medium text-gray-800">
            Selected Exam: <span className="font-semibold">{exam}</span>
          </p>
        </div>
      )}

      {/* User total marks input */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="font-medium text-gray-700">Total Marks</label>
          <input
            type="number"
            min={0}
            value={userTotalMarks}
            onChange={(e) => setUserTotalMarks(Number(e.target.value))}
            className="w-40 mt-1 px-3 py-2 border rounded"
            placeholder="e.g. 100"
          />
        </div>
      </div>

      {students.length > 0 && subjects.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Enroll No</th>
                <th className="px-6 py-3">Name</th>

                {subjects.map((sub) => (
                  <th key={sub} className="px-6 py-3">{sub} (Obtained)</th>
                ))}

                <th className="px-6 py-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {students.map((stu) => (
                <tr key={stu.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{stu.enrollmentNo}</td>
                  <td className="px-6 py-3">{stu.name}</td>

                  {subjects.map((sub) => (
                    <td key={sub} className="px-3 py-1">
                      <input
                        type="number"
                        min={0}
                        value={marks[stu.id]?.[sub] ?? 0}
                        onChange={(e) =>
                          handleMarkChange(stu.id, sub, Number(e.target.value))
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                  ))}

                  {/* AUTO TOTAL CALCULATION */}
                  <td className="px-6 py-2 font-semibold text-blue-700">
                    {getAutoTotal(stu.id)} / {userTotalMarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">No students or subjects found.</p>
      )}

      <div className="mt-4 flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg"
        >
          Back
        </button>

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>

      {/* Top 3 Toppers */}
{students.length > 0 && (
  <div className="mt-6 p-4 bg-yellow-50 rounded-xl shadow border">
    <h3 className="text-xl font-bold mb-3 text-yellow-800">🏆 Top 3 Toppers</h3>

    {students
      .map((stu) => {
        const obtainedSum = Object.values(marks[stu.id] || {}).reduce(
          (a, b) => a + b,
          0
        );
        return { ...stu, totalObtained: obtainedSum };
      })
      .sort((a, b) => b.totalObtained - a.totalObtained)
      .slice(0, 3)
      .map((stu, index) => (
        <div
          key={stu.id}
          className="flex justify-between items-center bg-white p-3 mb-2 rounded-lg shadow-sm border"
        >
          <span className="font-bold text-lg text-gray-700">
            #{index + 1}
          </span>
          <span className="font-medium text-gray-800">{stu.name}</span>
          <span className="font-semibold text-blue-700">
            {stu.totalObtained} / {userTotalMarks}
          </span>
        </div>
      ))}
  </div>
)}

    </div>
  );
}
