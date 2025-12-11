import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";

// Ensure IssuedBook includes both naming styles used by the UI:
type IssuedBook = {
  id: number;
  book?: { id?: number; title?: string } | number | string;
  book_title?: string;
  issued_user?: number | { id?: number; name?: string } | string;
  issued_to?: string;
  issueDate?: string;
  issue_date?: string;
  dueDate?: string;
  due_date?: string;
  is_returned?: boolean;
  isReturned?: boolean;
};

interface Book {
  id: number;
  title: string;
  author: string;
}

export default function IssuedBooks() {
  const navigate = useNavigate();

  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [books, setBooks] = useState<(Book & { totalCopies?: number; availableCopies?: number; available_copies?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([fetch(API_ENDPOINTS.school.issued), fetch(API_ENDPOINTS.school.books)])
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
    fetch(buildApiUrl(API_ENDPOINTS.school.return, `${id}/`), { method: "PUT" })
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
                    // derive student display
                    const student =
                      typeof record.issued_user === "object"
                        ? (record.issued_user as any).name ?? JSON.stringify(record.issued_user)
                        : record.issued_user ?? record.issued_to ?? "Unknown";

                    // derive book title (handle id, object, or fallback to book_title)
                    const bookTitle =
                      typeof record.book === "object"
                        ? (record.book as any).title ?? (record.book as any).id ?? record.book_title ?? "Unknown"
                        : typeof record.book === "number"
                          ? books.find((b) => b.id === record.book)?.title ?? record.book_title ?? "Unknown"
                          : // book could be missing or string
                          record.book_title ?? String(record.book ?? "Unknown");

                    const issueDate = record.issue_date ?? record.issueDate ?? "-";
                    const dueDate = record.due_date ?? record.dueDate ?? "-";
                    const returned = record.is_returned ?? record.isReturned ?? false;

                    return (
                      <tr key={record.id} className="hover:bg-gray-100 text-center transition">
                        <td className="p-2 border">{student}</td>
                        <td className="p-2 border">{bookTitle}</td>
                        <td className="p-2 border">{issueDate}</td>
                        <td className="p-2 border">{dueDate}</td>
                        <td className={`p-2 border font-medium ${returned ? "text-green-600" : "text-yellow-600"}`}>
                          {returned ? "Returned" : "Issued"}
                        </td>
                        <td className="p-2 border">
                          {!returned ? (
                            <button onClick={() => markReturned(record.id)} className="px-3 py-1 bg-green-600 text-white rounded">
                              Mark Returned
                            </button>
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
        <button onClick={() => navigate("/library")} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md">
          Back to Library
        </button>
      </div>
    </div>
  );
}
