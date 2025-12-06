import { useNavigate } from "react-router-dom";
import TeacherList from "./TeacherList";

// Show the teacher list directly (Manage Teachers should show teachers, not class cards)
export default function TeachersMain() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xl leading-none px-2 py-1 rounded hover:bg-gray-200"
          aria-label="Go back"
        >
          ←
        </button>

        <h1 className="text-2xl font-semibold">Teachers</h1>
      </div>

      <TeacherList />
    </main>
  );
}

