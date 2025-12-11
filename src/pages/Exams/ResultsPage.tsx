import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { examApi, reportCardApi, type ReportCard } from "../../api/exams";
import { API_ENDPOINTS } from "../../config/api";
import { FaArrowLeft, FaEye, FaSearch } from "react-icons/fa";

export default function ResultsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    const [selectedExam, setSelectedExam] = useState<string>("");
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [results, setResults] = useState<ReportCard[]>([]);

    const [viewItem, setViewItem] = useState<ReportCard | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [examsRes, classesRes] = await Promise.all([
                examApi.getExams(),
                axios.get(API_ENDPOINTS.school.classes)
            ]);
            setExams(examsRes || []);
            setClasses(classesRes.data || []);
        } catch (error) {
            console.error("Failed to load initial data:", error);
        }
    };

    const handleSearch = async () => {
        if (!selectedExam || !selectedClass) {
            alert("Please select both Exam and Class");
            return;
        }

        try {
            setLoading(true);
            const data = await reportCardApi.getReportCards({
                exam: Number(selectedExam),
                class: Number(selectedClass)
            });
            setResults(data || []);
        } catch (error) {
            console.error("Failed to fetch results:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/exams")}
                    className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">View Results</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                        >
                            <option value="">-- Select Exam --</option>
                            {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.name} ({exam.academic_year})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name} {cls.section ? `- ${cls.section}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 h-10"
                    >
                        {loading ? 'Loading...' : <><FaSearch /> View Results</>}
                    </button>
                </div>
            </div>

            {results.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4">Id</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4">Total Marks</th>
                                <th className="p-4">Obtained</th>
                                <th className="p-4">Percentage</th>
                                <th className="p-4">Grade</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {results.map((result) => (
                                <tr key={result.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-500">{result.student || '-'}</td>
                                    <td className="p-4 font-semibold text-gray-800">{result.student_name}</td>
                                    <td className="p-4 text-gray-600">{result.total_marks}</td>
                                    <td className="p-4 text-gray-600">{result.obtained_marks}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${result.overall_percentage >= 75 ? 'bg-green-100 text-green-700' :
                                            result.overall_percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {result.overall_percentage}%
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-gray-700">{result.overall_grade}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setViewItem(result)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition"
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && selectedExam && selectedClass && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500">No results found for the selected criteria.</p>
                    </div>
                )
            )}

            {/* Result Details Modal */}
            {viewItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">Result Details</h3>
                            <button
                                onClick={() => setViewItem(null)}
                                className="text-gray-400 hover:text-red-500 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Student Name</p>
                                    <p className="font-bold text-lg">{viewItem.student_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Exam</p>
                                    <p className="font-bold text-lg">{viewItem.exam_details?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Overall Grade</p>
                                    <p className="font-bold text-lg text-blue-600">{viewItem.overall_grade}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Rank</p>
                                    <p className="font-bold text-lg">#{viewItem.rank || '-'}</p>
                                </div>
                            </div>

                            <h4 className="font-semibold mb-3 text-gray-700">Subject-wise Performance</h4>
                            <table className="w-full border rounded-lg overflow-hidden">
                                <thead className="bg-gray-100 text-sm">
                                    <tr>
                                        <th className="p-3 text-left">Subject</th>
                                        <th className="p-3 text-center">Marks</th>
                                        <th className="p-3 text-center">Total</th>
                                        <th className="p-3 text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {viewItem.grades?.map((grade, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3 font-medium">{grade.subject_name}</td>
                                            <td className="p-3 text-center">{grade.marks_obtained}</td>
                                            <td className="p-3 text-center text-gray-500">{grade.max_marks}</td>
                                            <td className="p-3 text-center font-semibold">{grade.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setViewItem(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
