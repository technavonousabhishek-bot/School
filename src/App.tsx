// 🧠 Importing React and necessary routing tools
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// 📦 Core components
import Sidebar from "./Components/Sidebar";
import Profile from "./Components/Profile";

// 🏠 Main pages
import Dashboard from "./pages/Dashboard";
import TeacherList from "./pages/TeacherList";
import StudentList from "./pages/StudentList";

// 🏫 Classes module imports
import ClassesDashboard from "./pages/classes/ClassesDashboard";
import ClassDetails from "./pages/classes/ClassDetails";

// 💰 Fees module imports
import FeesMain from "./pages/Fees/FeesMain";
import FeesStudentList from "./pages/Fees/FeesStudentList";

// 🗓 Attendance module imports
import AttendanceMain from "./pages/Attendance/AttendanceMain";
import AttendanceOptions from "./pages/Attendance/AttendanceOptions";
import AttendanceStudentList from "./pages/Attendance/StudentList";

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

// 🧩 Added: Authentication pages
import LoginForm from "./pages/Login";
import SignupForm from "./pages/Signup";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  // 🧩 Added: simple login state (no real authentication)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* 🔐 AUTH ROUTES — Always accessible */}
        {/* 🧩 Added all the authentication routes */}
        <Route path="/login" element={<LoginForm setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* 🧩 Protected Routes — only accessible if logged in */}
        {isLoggedIn ? (
          <Route
            path="/*"
            element={
              // 🧱 Sidebar and profile visible after login
              <div className="flex h-screen overflow-hidden bg-gray-50">
                <Profile />
                <Sidebar />

                {/* Main content area for pages */}
                <div className="flex-1 overflow-auto">
                  <Routes>
                    {/* 🏠 Main routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/teachers" element={<TeacherList />} />
                    <Route path="/students" element={<StudentList />} />

                    {/* 🏫 Classes module */}
                    <Route path="/classes" element={<ClassesDashboard />} />
                    <Route path="/classes/:id" element={<ClassDetails />} />

                    {/* 📘 Homework module */}
                    <Route path="/homework" element={<Homework />} />
                    <Route path="/homework/:className" element={<HomeworkDetails />} />

                    {/* 🗓 Attendance module */}
                    <Route path="/attendance" element={<AttendanceMain />} />
                    <Route path="/attendance/:className" element={<AttendanceOptions />} />
                    <Route
                      path="/attendance/:className/students"
                      element={<AttendanceStudentList />}
                    />

                    {/* 💰 Fees module */}
                    <Route path="/fees" element={<FeesMain />} />
                    <Route path="/fees/:className" element={<FeesStudentList />} />

                    {/* 📢 Notice module */}
                    <Route path="/notice" element={<NoticeMain />} />
                    <Route path="/notice/students" element={<NoticeStudents />} />
                    <Route
                      path="/notice/students/:className"
                      element={<NoticeClassDetails />}
                    />
                    <Route path="/notice/teachers" element={<NoticeTeachers />} />
                    <Route path="/notice/add" element={<AddNotice />} />

                    {/* 📚 Library module */}
                    <Route path="/library" element={<LibraryDashboard />} />
                    <Route path="/library/issue" element={<IssueBook />} />
                    <Route path="/library/return" element={<ReturnBook />} />
                    <Route path="/library/issued-books" element={<IssuedBooks />} />
                    {/* 🧩 alias route for older link */}
                    <Route path="/library/issued" element={<IssuedBooks />} />
                  </Routes>
                </div>
              </div>
            }
          />
        ) : (
          // 🧩 Redirect all routes to login if not logged in
          <Route path="/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
