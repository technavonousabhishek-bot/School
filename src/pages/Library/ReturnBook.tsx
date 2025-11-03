import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface IssuedBook {
  id: number;
  studentId: number;
  bookId: number;
  issueDate: string;
  dueDate: string;
  status: "Issued" | "Returned";
}

interface Book {
  id: number;
  title: string;
  author: string;
  available: number;
}

interface Student {
  id: number;
  name: string;
  className: string;
}

export default function ReturnBook() {
  const navigate = useNavigate();

  // 🔹 Mock data
  const mockBooks: Book[] = [
    { id: 1, title: "Mathematics Grade 10", author: "R.S. Aggarwal", available: 3 },
    { id: 2, title: "Science Explorer", author: "H.C. Verma", available: 2 },
    { id: 3, title: "History of India", author: "Bipin Chandra", available: 4 },
  ];

  const mockStudents: Student[] = [
    { id: 1, name: "Aarav Mehta", className: "10A" },
    { id: 2, name: "Priya Sharma", className: "9B" },
    { id: 3, name: "Rohan Patel", className: "8A" },
  ];

  // 🔹 Load issued books safely
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>(() => {
    const saved = localStorage.getItem("issuedBooks");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure type safety: convert string status to valid literal
      return parsed.map((record: any) => ({
        ...record,
        status: record.status === "Returned" ? "Returned" : "Issued",
      })) as IssuedBook[];
    }
    return [];
  });

  // 🔹 Handle returning a book
  const handleReturn = (id: number) => {
    const updated: IssuedBook[] = issuedBooks.map((record) =>
      record.id === id ? { ...record, status: "Returned" } : record
    );

    setIssuedBooks(updated);
    localStorage.setItem("issuedBooks", JSON.stringify(updated));
    alert("✅ Book marked as returned successfully!");
  };

  // 🔹 Filter only issued ones
  const issuedList = issuedBooks.filter((b) => b.status === "Issued");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-blue-600">📗 Return Book</h1>

      {issuedList.length === 0 ? (
        <p className="text-gray-600 text-lg">No books currently issued.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Book Title</th>
                <th className="p-2 border">Issue Date</th>
                <th className="p-2 border">Due Date</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {issuedList.map((record) => {
                const student = mockStudents.find((s) => s.id === record.studentId);
                const book = mockBooks.find((b) => b.id === record.bookId);

                return (
                  <tr key={record.id} className="hover:bg-gray-100 text-center">
                    <td className="p-2 border">{student?.name}</td>
                    <td className="p-2 border">{student?.className}</td>
                    <td className="p-2 border">{book?.title}</td>
                    <td className="p-2 border">{record.issueDate}</td>
                    <td className="p-2 border">{record.dueDate}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleReturn(record.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md"
                      >
                        Mark Returned
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate("/library")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          Back to Library
        </button>
      </div>
    </div>
  );
}
