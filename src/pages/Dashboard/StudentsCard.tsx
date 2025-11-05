import { FaUserGraduate } from "react-icons/fa";

interface StudentsCardProps {
  totalBoys?: number;
  totalGirls?: number;
}

export default function StudentsCard({
  totalBoys = 3178,
  totalGirls = 2731,
}: StudentsCardProps) {
  const total = totalBoys + totalGirls;
  const boysPercent = Math.round((totalBoys / total) * 100);
  const girlsPercent = Math.round((totalGirls / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 h-64 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaUserGraduate className="text-blue-500" /> Students
        </h3>
        <span className="text-sm text-gray-400">Current Year</span>
      </div>

      {/* Circular Percentage Stats */}
      <div className="flex justify-between items-center mt-4">
        {/* Boys */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-[8px] border-blue-200"></div>
            <div
              className="absolute inset-0 rounded-full border-[8px] border-blue-600"
              style={{
                clipPath: `inset(${100 - boysPercent}% 0 0 0)`,
                transform: "rotate(-90deg)",
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-blue-700 font-semibold text-lg">
              {boysPercent}%
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Boys</p>
            <p className="text-lg font-semibold text-gray-800">{totalBoys.toLocaleString()}</p>
          </div>
        </div>

        {/* Girls */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-[8px] border-pink-200"></div>
            <div
              className="absolute inset-0 rounded-full border-[8px] border-pink-500"
              style={{
                clipPath: `inset(${100 - girlsPercent}% 0 0 0)`,
                transform: "rotate(-90deg)",
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-pink-600 font-semibold text-lg">
              {girlsPercent}%
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Girls</p>
            <p className="text-lg font-semibold text-gray-800">{totalGirls.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500 text-center border-t pt-2">
        Total Students:{" "}
        <span className="font-semibold text-gray-800">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
