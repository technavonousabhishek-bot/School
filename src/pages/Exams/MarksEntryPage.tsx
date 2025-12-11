import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { marksApi } from "../../api/exams";

import { API_BASE_URL } from "../../config/api";

type StudentType = {
  id: number;
  name: string;
  enrollmentNo?: string;
};

type SubjectType = {
  name: string;
  id: number;
};

export default function MarksEntryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { id, className, section, exam, examId } = (location.state || {}) as {
    id: number;
    className: string;
    section: string;
    exam: string;
    examId: string;
  };

  const [students, setStudents] = useState<StudentType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [marks, setMarks] = useState<Record<number, Record<number, number>>>({});
  const [maxMarks, setMaxMarks] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);



  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch students
        const resStudents = await axios.get(`${API_BASE_URL}/schoolApp/class/${id}/students/`);
        const studentsData = (resStudents.data || []).map((s: any) => ({
          id: s.id,
          enrollmentNo: s.enrollmentNo ?? s.enrollment_no ?? s.id,
          name: s.name ?? s.user?.username ?? "",
        }));
        setStudents(studentsData);

        // Fetch all subjects to get real IDs
        const resAllSubjects = await axios.get(`${API_BASE_URL}/schoolApp/subjects/`);
        const allSubjects = resAllSubjects.data || [];

        // Fetch class to get subjects list (names)
        const resClass = await axios.get(`${API_BASE_URL}/schoolApp/classes/${id}/`);
        const classSubjectNames = resClass.data.subjects || [];

        // Map class subject names to real subject objects
        const subjectList = classSubjectNames.map((subName: string) => {
          const foundSub = allSubjects.find((s: any) => s.subject === subName);
          return {
            name: subName,
            id: foundSub ? foundSub.id : 0, // Use real ID or 0 if not found (should be handled)
          };
        }).filter((s: SubjectType) => s.id !== 0); // Filter out subjects that weren't found in DB

        setSubjects(subjectList);

        // Initialize marks
        const initialMarks: Record<number, Record<number, number>> = {};
        const initialMaxMarks: Record<number, number> = {};

        studentsData.forEach((stu: StudentType) => {
          initialMarks[stu.id] = {};
          subjectList.forEach((sub: SubjectType) => {
            initialMarks[stu.id][sub.id] = 0;
            initialMaxMarks[sub.id] = 100; // Default max marks
          });
        });

        setMarks(initialMarks);
        setMaxMarks(initialMaxMarks);

        // Fetch existing marks if available
        if (examId) {
          try {
            await marksApi.getMarks({ exam: Number(examId), class: id });
            // TODO: Populate existing marks if needed
          } catch (err) {
            console.log("No existing marks found");
          }
        }
      } catch (e) {
        console.error("Failed to fetch data:", e);
        alert("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [id, examId]);

  const handleMarkChange = (studentId: number, subjectId: number, value: number) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: value },
    }));
  };

  const handleMaxMarksChange = (subjectId: number, value: number) => {
    setMaxMarks((prev) => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  const getAutoTotal = (studentId: number) => {
    return subjects.reduce((sum, sub) => sum + (marks[studentId]?.[sub.id] || 0), 0);
  };

  const getTotalMaxMarks = () => {
    return subjects.reduce((sum, sub) => sum + (maxMarks[sub.id] || 0), 0);
  };

  const handleSave = async () => {
    if (!examId) {
      alert("No exam selected. Please go back and select an exam.");
      return;
    }

    try {
      setSaving(true);

      // Prepare marks data for bulk entry
      const marksData: Array<{
        student: number;
        subject: number;
        marks_obtained: number;
        max_marks: number;
      }> = [];

      students.forEach((student) => {
        subjects.forEach((subject) => {
          marksData.push({
            student: student.id,
            subject: subject.id,
            marks_obtained: marks[student.id]?.[subject.id] || 0,
            max_marks: maxMarks[subject.id] || 100,
          });
        });
      });

      await marksApi.bulkCreateMarks({
        exam: Number(examId),
        class_name: id,
        marks: marksData,
      });

      // Fetch top performers
      const topPerf = await marksApi.getTopPerformers({
        exam: Number(examId),
        class: id,
        limit: 3,
      });
      setTopPerformers(topPerf);

      alert("Marks saved successfully!");
    } catch (e: any) {
      console.error("Failed to save marks:", e);
      alert(e.response?.data?.error || "Failed to save marks. Please try again.");
    } finally {
      setSaving(false);
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

      {/* Max marks input for each subject */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Set Maximum Marks for Each Subject</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((sub) => (
            <div key={sub.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {sub.name}
              </label>
              <input
                type="number"
                min={0}
                value={maxMarks[sub.id] || 100}
                onChange={(e) => handleMaxMarksChange(sub.id, Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                placeholder="Max marks"
              />
            </div>
          ))}
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
                  <th key={sub.id} className="px-6 py-3">
                    {sub.name} (/{maxMarks[sub.id] || 100})
                  </th>
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
                    <td key={sub.id} className="px-3 py-1">
                      <input
                        type="number"
                        min={0}
                        max={maxMarks[sub.id] || 100}
                        value={marks[stu.id]?.[sub.id] ?? 0}
                        onChange={(e) =>
                          handleMarkChange(stu.id, sub.id, Number(e.target.value))
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                  ))}

                  <td className="px-6 py-2 font-semibold text-blue-700">
                    {getAutoTotal(stu.id)} / {getTotalMaxMarks()}
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
          disabled={saving}
          className={`px-6 py-2 rounded ${saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
            } text-white`}
        >
          {saving ? "Saving..." : "Save Marks"}
        </button>
      </div>

      {/* Top 3 Toppers */}
      {topPerformers.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl shadow border">
          <h3 className="text-xl font-bold mb-3 text-yellow-800">🏆 Top 3 Toppers</h3>

          {topPerformers.map((performer, index) => (
            <div
              key={performer.student_id}
              className="flex justify-between items-center bg-white p-3 mb-2 rounded-lg shadow-sm border"
            >
              <span className="font-bold text-lg text-gray-700">#{index + 1}</span>
              <span className="font-medium text-gray-800">{performer.student_name}</span>
              <span className="font-semibold text-blue-700">
                {performer.total_obtained} / {performer.total_max} ({performer.percentage}%)
              </span>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}
