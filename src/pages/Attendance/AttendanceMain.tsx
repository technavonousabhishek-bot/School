import { useNavigate } from "react-router-dom";
// import from explicit .js file to avoid bundler/TS import resolution issues
import { classes as rawClasses } from "./data.ts";

interface ClassItem {
  id: number;
  name: string;
}

const classes: ClassItem[] = rawClasses as unknown as ClassItem[];

export default function AttendanceMain() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Attendance Management
      </h1>

      {/* Classes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            onClick={() =>
              navigate(`/attendance/${encodeURIComponent(cls.name)}`)
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                navigate(`/attendance/${encodeURIComponent(cls.name)}`);
            }}
            className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:bg-blue-600 hover:text-white duration-300 border border-gray-200 flex flex-col items-center justify-center"
          >
            <p className="text-lg font-medium">{cls.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
