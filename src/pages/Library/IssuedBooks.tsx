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
}

interface Student {
  id: number;
  name: string;
  className: string;
}

export default function IssuedBooks() {
  const navigate = useNavigate();

  // 🔹 Mock data for students & books (used as fallback)
  const mockBooks: Book[] = [
    { id: 1, title: "Mathematics Grade 10", author: "R.S. Aggarwal" },
    { id: 2, title: "Science Explorer", author: "H.C. Verma" },
    { id: 3, title: "History of India", author: "Bipin Chandra" },
  ];

  const mockStudents: Student[] = [
    { id: 1, name: "Aarav Mehta", className: "10A" },
    { id: 2, name: "Priya Sharma", className: "9B" },
    { id: 3, name: "Rohan Patel", className: "8A" },
  ];

  // 🔹 Load books and issued books from localStorage safely
  const [books, setBooks] = useState<(Book & { totalCopies?: number; availableCopies?: number })[]>(() => {
    const stored = localStorage.getItem("books");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return mockBooks.map((b) => ({ ...b, totalCopies: 1, availableCopies: 1 }));
      }
    }
    // seed books with one copy each
    return mockBooks.map((b) => ({ ...b, totalCopies: 1, availableCopies: 1 }));
  });

  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>(() => {
    const saved = localStorage.getItem("issuedBooks");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Normalize loaded records: ensure numeric ids and normalized status
      return (
        parsed.map((item: any) => ({
          id: Number(item.id) || Date.now(),
          studentId: Number(item.studentId),
          bookId: Number(item.bookId),
          issueDate: String(item.issueDate || ""),
          dueDate: String(item.dueDate || ""),
          status: item.status === "Returned" ? "Returned" : "Issued",
        })) as IssuedBook[]
      );
    }
    // If nothing in localStorage, return some sample issued-book records so the
    // page isn't empty on first load.
    return [
      {
        id: 1,
        studentId: 1,
        bookId: 1,
        issueDate: "2025-10-01",
        dueDate: "2025-10-15",
        status: "Issued",
      },
      {
        id: 2,
        studentId: 2,
        bookId: 2,
        issueDate: "2025-09-20",
        dueDate: "2025-10-04",
        status: "Returned",
      },
    ];
  });

  // 🔹 Update localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("issuedBooks", JSON.stringify(issuedBooks));
  }, [issuedBooks]);

  // keep books persisted when they change
  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  // Listen for storage events so this page updates when other pages (IssueBook) write
  useEffect(() => {
    const onStorage = () => {
      const sBooks = localStorage.getItem("books");
      const sIssued = localStorage.getItem("issuedBooks");
      if (sBooks) {
        try {
          setBooks(JSON.parse(sBooks));
        } catch {}
      }
      if (sIssued) {
        try {
          const parsed = JSON.parse(sIssued);
          setIssuedBooks(
            parsed.map((item: any) => ({
              id: Number(item.id) || Date.now(),
              studentId: Number(item.studentId),
              bookId: Number(item.bookId),
              issueDate: String(item.issueDate || ""),
              dueDate: String(item.dueDate || ""),
              status: item.status === "Returned" ? "Returned" : "Issued",
            }))
          );
        } catch {}
      }
    };

    window.addEventListener("storage", onStorage);
    // some pages dispatch a plain 'storage' event manually to force update
    window.addEventListener("storage", onStorage as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("storage", onStorage as any);
    };
  }, []);

    // Derived counts: total books and available books (books not currently issued)
    const totalBooks = books.length;
    const availableBooks = books.filter((b: any) => {
      if (typeof b.availableCopies === "number") return b.availableCopies > 0;
      return !issuedBooks.some((rec) => rec.bookId === b.id && rec.status === "Issued");
    });

  // Issue-book form state
  const [issueStudentId, setIssueStudentId] = useState<number | "">(mockStudents[0]?.id ?? "");
  const [issueBookId, setIssueBookId] = useState<number | "">(availableBooks[0]?.id ?? "");
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState<string>(
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().split("T")[0];
    })()
  );

  const issueBook = () => {
    if (issueStudentId === "" || issueBookId === "") return;

    // ensure selected book is actually available
    const alreadyIssued = issuedBooks.some((r) => r.bookId === issueBookId && r.status === "Issued");
    if (alreadyIssued) {
      alert("Selected book is not available.");
      return;
    }

    const newRecord: IssuedBook = {
      id: Date.now(),
      studentId: Number(issueStudentId),
      bookId: Number(issueBookId),
      issueDate,
      dueDate,
      status: "Issued",
    };

    setIssuedBooks((s) => [newRecord, ...s]);

    // decrement availableCopies for the issued book (if present in books)
    setBooks((prev) =>
      prev.map((b) =>
        b.id === Number(issueBookId)
          ? { ...b, availableCopies: Math.max(0, (b.availableCopies ?? 1) - 1) }
          : b
      )
    );

    // reset selected book to next available
    const remaining = books.filter((b: any) => (b.availableCopies ?? 1) > 0 && b.id !== Number(issueBookId));
    setIssueBookId(remaining[0]?.id ?? "");

    // notify other pages
    window.dispatchEvent(new Event("storage"));
  };

  const markReturned = (id: number) => {
    setIssuedBooks((s) => s.map((r) => (r.id === id ? { ...r, status: "Returned" } : r)));
    // increase availableCopies for the returned book
    const rec = issuedBooks.find((r) => r.id === id);
    if (rec) {
      setBooks((prev) =>
        prev.map((b) => (b.id === rec.bookId ? { ...b, availableCopies: (b.availableCopies ?? 0) + 1 } : b))
      );
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-blue-600">
        📘 Issued Books
      </h1>

      {/* Summary and Issue Book form */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-6 items-center">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Books</div>
            <div className="text-lg font-semibold">{totalBooks}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Available</div>
            <div className="text-lg font-semibold">{availableBooks.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow w-full md:w-auto">
          <div className="text-sm text-gray-500 mb-2">Issue a Book</div>
          <div className="flex gap-2 flex-col sm:flex-row items-start">
            <select value={issueStudentId} onChange={(e) => setIssueStudentId(e.target.value === "" ? "" : Number(e.target.value))} className="p-2 border rounded">
              {mockStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.className}</option>
              ))}
            </select>

            <select value={issueBookId} onChange={(e) => setIssueBookId(e.target.value === "" ? "" : Number(e.target.value))} className="p-2 border rounded">
              <option value="">-- Select Book --</option>
              {availableBooks.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>

            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="p-2 border rounded" />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-2 border rounded" />

            <button onClick={issueBook} disabled={issueBookId === "" || issueStudentId === ""} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Issue</button>
          </div>
        </div>
      </div>

      {issuedBooks.length === 0 ? (
        <p className="text-gray-600 text-lg">No books have been issued yet.</p>
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
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.map((record) => {
                const student = mockStudents.find((s) => s.id === record.studentId);
                const book = (books as any[]).find((b) => b.id === record.bookId) || mockBooks.find((b) => b.id === record.bookId);

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-100 text-center transition"
                  >
                    <td className="p-2 border">{student?.name}</td>
                    <td className="p-2 border">{student?.className}</td>
                    <td className="p-2 border">{book?.title}</td>
                    <td className="p-2 border">{record.issueDate}</td>
                    <td className="p-2 border">{record.dueDate}</td>
                    <td
                      className={`p-2 border font-medium ${
                        record.status === "Issued"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {record.status}
                    </td>
                    <td className="p-2 border">
                      {record.status === "Issued" ? (
                        <button onClick={() => markReturned(record.id)} className="px-3 py-1 bg-green-600 text-white rounded">Mark Returned</button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
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
