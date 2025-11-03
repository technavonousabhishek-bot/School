import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

interface Student {
  id: number;
  name: string;
  className: string;
}

interface IssuedBook {
  id: number;
  studentId: number;
  bookId: number;
  issueDate: string;
  dueDate: string;
  status: "Issued" | "Returned";
}

export default function IssueBook() {
  const navigate = useNavigate();

  // Mock student data (can later come from backend)
  const mockStudents: Student[] = [
    { id: 1, name: "Aarav Mehta", className: "10A" },
    { id: 2, name: "Priya Sharma", className: "9B" },
    { id: 3, name: "Rohan Patel", className: "8A" },
  ];

  const [students] = useState<Student[]>(mockStudents);
  const [books, setBooks] = useState<Book[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);

  const [selectedBookId, setSelectedBookId] = useState<number | "">("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");

  // Load data from localStorage
  useEffect(() => {
    const storedBooks = localStorage.getItem("books");
    const storedIssued = localStorage.getItem("issuedBooks");
    if (storedBooks) setBooks(JSON.parse(storedBooks));
    if (storedIssued) setIssuedBooks(JSON.parse(storedIssued));
  }, []);

  // Issue book handler
  const handleIssue = () => {
    if (!selectedBookId || !selectedStudentId || !dueDate) {
      alert("⚠️ Please fill all fields before issuing a book!");
      return;
    }

    const selectedBook = books.find((b) => b.id === selectedBookId);
    if (!selectedBook) {
      alert("Book not found!");
      return;
    }

    if (selectedBook.availableCopies <= 0) {
      alert("❌ This book is not available right now!");
      return;
    }

    // Check if student already has same book issued and not returned
    const alreadyIssued = issuedBooks.find(
      (ib) =>
        ib.studentId === selectedStudentId &&
        ib.bookId === selectedBookId &&
        ib.status === "Issued"
    );

    if (alreadyIssued) {
      alert("⚠️ This student already has this book issued!");
      return;
    }

    const newIssue: IssuedBook = {
      id: Date.now(),
      studentId: Number(selectedStudentId),
      bookId: Number(selectedBookId),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate,
      status: "Issued",
    };

    // Update localStorage
    const updatedIssuedBooks = [...issuedBooks, newIssue];
    const updatedBooks = books.map((b) =>
      b.id === selectedBookId
        ? { ...b, availableCopies: b.availableCopies - 1 }
        : b
    );

    setIssuedBooks(updatedIssuedBooks);
    setBooks(updatedBooks);

    localStorage.setItem("issuedBooks", JSON.stringify(updatedIssuedBooks));
    localStorage.setItem("books", JSON.stringify(updatedBooks));

    // Sync update across tabs/pages
    window.dispatchEvent(new Event("storage"));

    alert("✅ Book issued successfully!");
    navigate("/library");
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">📘 Issue Book</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto space-y-5">
        {/* Student Selector */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Select Student:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            className="border rounded-md w-full p-2 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose Student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.className})
              </option>
            ))}
          </select>
        </div>

        {/* Book Selector */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Select Book:
          </label>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(Number(e.target.value))}
            className="border rounded-md w-full p-2 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose Book --</option>
            {books.length > 0 ? (
              books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.availableCopies} available)
                </option>
              ))
            ) : (
              <option disabled>No books available</option>
            )}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Due Date:
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border rounded-md w-full p-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => navigate("/library")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleIssue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Issue Book
          </button>
        </div>
      </div>
    </main>
  );
}
