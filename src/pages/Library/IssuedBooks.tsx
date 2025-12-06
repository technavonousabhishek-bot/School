import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../api/notices";

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

  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [books, setBooks] = useState<(Book & { totalCopies?: number; availableCopies?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([fetch(API_BASE + "issued/"), fetch(API_BASE + "books/")])
      .then(async ([r1, r2]) => {
        if (!r1.ok) throw new Error(await r1.text());
        if (!r2.ok) throw new Error(await r2.text());
        const issued = await r1.json();
        const bks = await r2.json();
        setIssuedBooks(issued);
        setBooks(bks);
      })
      .catch((err) => console.warn("Could not load issued/books:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markReturned = (id: number) => {
    fetch(API_BASE + `return/${id}/`, { method: "PUT" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => load())
      .catch((err) => alert("Failed to mark returned: " + err.message));
  };

  // Derived counts
  const totalBooks = books.length;
  const availableBooks = books.filter((b: any) => (b.available_copies ?? b.availableCopies ?? 0) > 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-blue-600">📘 Issued Books</h1>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
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
              <div className="text-sm text-gray-400">Use Issue Book page to perform issuance.</div>
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
                    <th className="p-2 border">Book Title</th>
                    <th className="p-2 border">Issue Date</th>
                    <th className="p-2 border">Due Date</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBooks.map((record) => {
                    const book = books.find((b) => b.id === record.book) || { title: record.book_title } as any;
                    return (
                      <tr key={record.id} className="hover:bg-gray-100 text-center transition">
                        <td className="p-2 border">{record.issued_user ?? record.issued_to}</td>
                        <td className="p-2 border">{book.title}</td>
                        <td className="p-2 border">{record.issue_date}</td>
                        <td className="p-2 border">{record.due_date}</td>
                        <td className={`p-2 border font-medium ${record.is_returned ? 'text-green-600' : 'text-yellow-600'}`}>{record.is_returned ? 'Returned' : 'Issued'}</td>
                        <td className="p-2 border">
                          {!record.is_returned ? (
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
        </>
      )}

      <div className="mt-6">
        <button onClick={() => navigate("/library")} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md">Back to Library</button>
      </div>
    </div>
  );
}
