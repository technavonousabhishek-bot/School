// 🧠 Importing React and necessary routing tools
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// 📦 Core components
import Sidebar from "./Components/Sidebar";

// 🏠 Main pages
import Dashboard from "./pages/Dashboard/Dashboard";


// 🏫 Classes module imports
import ClassesDashboard from "./pages/classes/ClassesDashboard";
import ClassDetails from "./pages/classes/ClassDetails";

// 💰 Fees module imports
import FeesMain from "./pages/Fees/FeesMain";
import FeesStudentList from "./pages/Fees/FeesStudentList";

// 🗓 Attendance module imports
import AttendanceMain from "./pages/Attendance/AttendanceMain";
import AttendanceStudentList from "./pages/Attendance/StudentList";
import AttendanceLanding from "./pages/Attendance/AttendanceLanding";
import TeachersMain from "./pages/Attendance/TeachersMain";
import AttendanceTeacherList from "./pages/Attendance/TeacherList";

// 📢 Notice module imports
import NoticeMain from "./pages/Notice/NoticeMain";
import NoticeStudents from "./pages/Notice/NoticeStudents";
import NoticeClassDetails from "./pages/Notice/NoticeClassDetails";
import NoticeTeachers from "./pages/Notice/NoticeTeachers";
import AddNotice from "./pages/Notice/AddNotice";

// 📚 Library module imports
import LibraryDashboard from "./pages/Library/LibraryDashboard";
import IssueBook from "./pages/Library/IssueBook";
import ReturnBook from "./pages/Library/ReturnBook";
import IssuedBooks from "./pages/Library/IssuedBooks";

// 📘 Homework module imports
import Homework from "./pages/Homework/Homework";
import HomeworkDetails from "./pages/Homework/HomeworkDetails";

// 🧩 Authentication pages
import LoginForm from "./pages/Login";
import SignupForm from "./pages/Signup";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";

// 🚌 Transport module
import BusRouteDetails from "./pages/Transport/BusRouteDetail";
import AddBus from "./pages/Transport/AddBus";
import TransportMain from "./pages/Transport/TransportMain";

// ⏰ Timetable
import TimetableMain from "./pages/Timetable/TimetableMain";

// 🧮 Exam module
import ManageExams from "./pages/ManageExams/ManageExams";
import ExamDetails from "./pages/ManageExams/ExamDetails";
import ClassExams from "./pages/ManageExams/ClassExams";
import ExamTypePage from "./pages/ManageExams/ExamTypePage";
import { ExamStoreProvider } from "./context/ExamStoreContext";

// 🧾 Results module
import ManageResults from "./pages/Results/ManageResults";
import ResultDetails from "./pages/Results/ResultDetails";
import ManageResultsLanding from "./pages/Results/ManageResultsLanding";
import ClassResults from "./pages/Results/ClassResults";
import ResultTypePage from "./pages/Results/ResultTypePage";
import ClassResultsActions from "./pages/Results/ClassResultsActions";
import ViewResultsPage from "./pages/Results/ViewResultsPage";

// 📘 Exams & Results Home Page (NEW)
import ExamsResultsHome from "./pages/ExamsResults/ExamsResultsHome";
import AddStudent from "./pages/Student/AddStudent";
import StudentList from "./pages/Student/StudentList";
import AddTeacher from "./pages/Teacher/AddTeacher";
import TeacherList from "./pages/Teacher/TeacherList";

function App() {
  // 🧩 Simple login state (dummy auth)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* 🔐 AUTH ROUTES */}
        <Route path="/login" element={<LoginForm setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* 🧩 Protected Routes */}
        {isLoggedIn ? (
          <Route
            path="/*"
            element=
              {
                <ExamStoreProvider>
                  <div className="flex h-screen overflow-hidden bg-gray-50">
                    <Sidebar />

                    <div className="flex-1 overflow-auto">
                      <Routes>
                    {/* 🏠 Dashboard */}
                    <Route path="/" element={<Dashboard />} />
                    
                  

                    {/* 🏫 Classes */}
                    <Route path="/classes" element={<ClassesDashboard />} />
                    <Route path="/classes/:id" element={<ClassDetails />} />

                    {/* 📘 Homework */}
                    <Route path="/homework" element={<Homework />} />
                    <Route path="/homework/:className" element={<HomeworkDetails />} />

                    {/* 🗓 Attendance */}
                    <Route path="/attendance" element={<AttendanceLanding />} />
                    <Route path="/attendance/students" element={<AttendanceMain />} />
                    <Route path="/attendance/teachers" element={<TeachersMain />} />
                    <Route
                      path="/attendance/:className/students"
                      element={<AttendanceStudentList />}
                    />
                    <Route
                      path="/attendance/:className/teachers"
                      element={<AttendanceTeacherList />}
                    />

                    {/* 💰 Fees */}
                    <Route path="/fees" element={<FeesMain />} />
                    <Route path="/fees/:className" element={<FeesStudentList />} />

                    {/* 📢 Notice */}
                    <Route path="/notice" element={<NoticeMain />} />
                    <Route path="/notice/students" element={<NoticeStudents />} />
                    <Route
                      path="/notice/students/:className"
                      element={<NoticeClassDetails />}
                    />
                    <Route path="/notice/teachers" element={<NoticeTeachers />} />
                    <Route path="/notice/add" element={<AddNotice />} />

                    {/* 📚 Library */}
                    <Route path="/library" element={<LibraryDashboard />} />
                    <Route path="/library/issue" element={<IssueBook />} />
                    <Route path="/library/return" element={<ReturnBook />} />
                    <Route path="/library/issued-books" element={<IssuedBooks />} />
                    <Route path="/library/issued" element={<IssuedBooks />} />

                    {/* 🚌 Transport */}
                    <Route path="/transport" element={<TransportMain />} />
                    <Route path="/transport/add-bus" element={<AddBus />} />
                    <Route path="/transport/route/:busId" element={<BusRouteDetails />} />

                    {/* ⏰ Timetable */}
                    <Route path="/timetable" element={<TimetableMain />} />

                    {/* 🧮 Exams & Results Section */}
                    <Route path="/exams-results" element={<ExamsResultsHome />} />

                    {/* 📘 Manage Exams */}
                    <Route path="/manage-exams" element={<ManageExams />} />
                    <Route path="/manage-exams/class/:classId" element={<ClassExams />} />
                    <Route path="/manage-exams/class/:classId/:examType" element={<ExamTypePage />} />
                    <Route path="/manage-exams/:examId" element={<ExamDetails />} />

                    {/* 📊 Manage Results */}
                    <Route path="/manage-results" element={<ManageResultsLanding />} />
                    <Route path="/manage-results/type/:examType" element={<ClassResults />} />
                                    <Route path="/manage-results/class/:classId/:examType/actions" element={<ClassResultsActions />} />
                                    <Route path="/manage-results/class/:classId/:examType/add" element={<ResultTypePage />} />
                                    <Route path="/manage-results/class/:classId/:examType/view" element={<ViewResultsPage />} />
                    <Route path="/manage-results/list" element={<ManageResults />} />
                    <Route path="/manage-results/:resultId" element={<ResultDetails />} />


 {/* Student */}
                    <Route path="/students" element={< StudentList />} />
                    <Route path="/add-student" element={< AddStudent />} />
                    <Route path="/edit-student/:id" element={<AddStudent />} />
                      


                      {/* Teacher management */}
                   <Route path="/add-teacher" element={<AddTeacher />} />
                    <Route path="/edit-teacher/:id" element={<AddTeacher />} />
                    <Route path="/teachers" element={<TeacherList />} />

                      </Routes>
                    </div>
                  </div>
                </ExamStoreProvider>
              }
          />
        ) : (
          // 🚪 Redirect to login if not logged in
          <Route path="/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;


