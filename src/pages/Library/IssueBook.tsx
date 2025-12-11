import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, buildApiUrl, SCHOOL_API_BASE } from "../../config/api";

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  // accept backend naming
  totalCopies?: number;
  availableCopies?: number;
  quantity?: number;
  available_copies?: number;
}

interface Student {
  id: number;
  name: string;
  className?: string;
  class?: string;
  section?: string;
}

interface IssuedBook {
  id: number;
  book: number;
  book_title?: string;
  issued_to: number;
  issued_user?: string;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  is_returned?: boolean;
}

export default function IssueBook() {
  const navigate = useNavigate();

  // Mock student data (can later come from backend)
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<{ id: number; class_name: string; section?: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [books, setBooks] = useState<Book[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);

  const [selectedBookId, setSelectedBookId] = useState<number | "">("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");

  // Load data from backend
  useEffect(() => {
    // fetch issued books
    const fetchIssued = async () => {
      try {
        const r = await fetch(API_ENDPOINTS.school.issued);
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();
        setIssuedBooks(data);
      } catch (err) {
        console.warn('Could not load issued books:', err);
      }
    };

    const fetchBooks = async () => {
      try {
        const r = await fetch(API_ENDPOINTS.school.books);
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();
        setBooks(data);
      } catch (err) {
        console.warn('Could not load books:', err);
      }
    };

    const fetchClasses = async () => {
      try {
        const r = await fetch(API_ENDPOINTS.school.classes);
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();
        setClasses(data);
      } catch (err) {
        console.warn('Could not load classes:', err);
      }
    };

    fetchIssued();
    fetchBooks();
    fetchClasses();
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

    const avail = (selectedBook.availableCopies ?? selectedBook.available_copies ?? 0);
    if (avail <= 0) {
      alert("❌ This book is not available right now!");
      return;
    }

    // Check if student already has same book issued and not returned (backend records)
    const alreadyIssued = issuedBooks.find(
      (ib) => ib.issued_to === Number(selectedStudentId) && ib.book === Number(selectedBookId) && !ib.is_returned
    );

    if (alreadyIssued) {
      alert("⚠️ This student already has this book issued!");
      return;
    }

    // call backend to issue
    const payload = {
      book: Number(selectedBookId),
      issued_to: Number(selectedStudentId),
      issue_date: new Date().toISOString().split("T")[0],
      due_date: dueDate,
    };

    fetch(API_ENDPOINTS.school.issue, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(async () => {
        // refresh issued list and books from backend to keep consistent
        try {
          const issuedRes = await fetch(API_ENDPOINTS.school.issued);
          if (issuedRes.ok) setIssuedBooks(await issuedRes.json());
        } catch (e) {
          console.warn('Could not refresh issued list:', e);
        }
        try {
          const booksRes = await fetch(API_ENDPOINTS.school.books);
          if (booksRes.ok) setBooks(await booksRes.json());
        } catch (e) {
          console.warn('Could not refresh books list:', e);
        }

        alert('✅ Book issued successfully!');
        navigate('/library');
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to issue book: " + err.message);
      });
  };

  // When class selection changes, fetch students for that class
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    fetch(buildApiUrl(SCHOOL_API_BASE, 'class', selectedClassId, 'students/'))
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setStudents(data))
      .catch((err) => console.warn("Could not load students:", err));
  }, [selectedClassId]);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">📘 Issue Book</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto space-y-5">
        {/* Class Selector */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">Select Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : "")}
            className="border rounded-md w-full p-2 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name} {c.section ? `- ${c.section}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Student Selector */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">Select Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            className="border rounded-md w-full p-2 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose Student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.class ?? student.className ?? student.section ?? ""})
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
                  {book.title} ({(book.availableCopies ?? book.available_copies ?? 0)} available)
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
