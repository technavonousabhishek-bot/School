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
  const [isEditing, setIsEditing] = useState(true); // default editable

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Load students
        const resStudents = await axios.get(`${API_BASE_URL}/schoolApp/class/${id}/students/`);
        const studentsData = (resStudents.data || []).map((s: any) => ({
          id: s.id,
          enrollmentNo: s.enrollmentNo ?? s.enrollment_no ?? s.id,
          name: s.name ?? s.user?.username ?? "",
        }));
        setStudents(studentsData);

        // Load subjects
        const resAllSubjects = await axios.get(`${API_BASE_URL}/schoolApp/subjects/`);
        const allSubjects = resAllSubjects.data || [];

        const resClass = await axios.get(`${API_BASE_URL}/schoolApp/classes/${id}/`);
        const classSubjectNames = resClass.data.subjects || [];

        const subjectList = classSubjectNames
          .map((subName: string) => {
            const found = allSubjects.find((s: any) => s.subject === subName);
            return found ? { name: subName, id: found.id } : null;
          })
          .filter(Boolean) as SubjectType[];

        setSubjects(subjectList);

        let initialMarks: Record<number, Record<number, number>> = {};
        let initialMaxMarks: Record<number, number> = {};

        studentsData.forEach((stu: StudentType) => {
          initialMarks[stu.id] = {};
          subjectList.forEach((sub) => {
            initialMarks[stu.id][sub.id] = 0;
            initialMaxMarks[sub.id] = 100;
          });
        });

        // Load existing marks
        if (examId) {
          try {
            const existingMarks = await marksApi.getMarks({
              exam: Number(examId),
              class: id,
            });

            existingMarks.forEach((m: any) => {
              initialMarks[m.student][m.subject] = Number(m.marks_obtained);
              initialMaxMarks[m.subject] = Number(m.max_marks);
            });

            setIsEditing(false); // marks are saved → disable editing by default
          } catch {
            console.log("No existing marks found");
          }
        }

        setMarks(initialMarks);
        setMaxMarks(initialMaxMarks);

      } catch (err) {
        console.error("Failed:", err);
        alert("Failed to load data.");
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
    setMaxMarks((prev) => ({ ...prev, [subjectId]: value }));
  };

  const getAutoTotal = (studentId: number) => {
    return subjects.reduce(
      (sum, sub) => sum + Number(marks[studentId]?.[sub.id] || 0),
      0
    );
  };

  const getTotalMaxMarks = () => {
    return subjects.reduce(
      (sum, sub) => sum + Number(maxMarks[sub.id] || 0),
      0
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const marksData: any[] = [];

      students.forEach((student) => {
        subjects.forEach((subject) => {
          marksData.push({
            student: student.id,
            subject: subject.id,
            marks_obtained: marks[student.id][subject.id],
            max_marks: maxMarks[subject.id],
          });
        });
      });

      await marksApi.bulkCreateMarks({
        exam: Number(examId),
        class_name: id,
        marks: marksData,
      });

      setIsEditing(false); // lock fields after save

      alert("Marks saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save marks.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {className} - {section} Marks Entry
        </h2>
      </div>

      {/* Selected Exam */}
      {exam && (
        <div className="mb-4 p-4 bg-blue-100 rounded-lg">
          <p className="font-medium">
            Selected Exam: <b>{exam}</b>
          </p>
        </div>
      )}

      {/* MAX MARKS SECTION */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-3">Maximum Marks</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((sub) => (
            <div key={sub.id}>
              <label>{sub.name}</label>
              <input
                type="number"
                disabled={!isEditing}
                value={Number(maxMarks[sub.id])}
                onChange={(e) => handleMaxMarksChange(sub.id, Number(e.target.value))}
                className={`border rounded px-2 py-2 w-full ${
                  !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* MARKS TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Enroll No</th>
              <th className="px-4 py-2">Name</th>

              {subjects.map((sub) => (
                <th key={sub.id} className="px-4 py-2">{sub.name}</th>
              ))}

              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>

          <tbody>
            {students.map((stu) => (
              <tr key={stu.id} className="border-b">
                <td className="px-4 py-2">{stu.enrollmentNo}</td>
                <td className="px-4 py-2">{stu.name}</td>

                {subjects.map((sub) => (
                  <td key={sub.id} className="px-4 py-2">
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={Number(marks[stu.id]?.[sub.id] ?? 0)}
                      onChange={(e) =>
                        handleMarkChange(stu.id, sub.id, Number(e.target.value))
                      }
                      className={`border rounded px-2 py-1 w-full ${
                        !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </td>
                ))}

                <td className="px-4 py-2 font-semibold text-blue-600">
                  {getAutoTotal(stu.id)} / {getTotalMaxMarks()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BUTTON ROW */}
      <div className="mt-4 flex justify-end gap-4">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg"
        >
          Back
        </button>

        {/* EDIT BUTTON */}
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Edit Marks
        </button>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving || !isEditing}
          className={`px-6 py-2 rounded text-white ${
            saving || !isEditing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Save Marks"}
        </button>

      </div>
    </div>
  );
}
