import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";

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

export default function ReturnBook() {
  const navigate = useNavigate();
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(API_ENDPOINTS.school.issued)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setIssuedBooks(data))
      .catch((err) => console.warn("Could not load issued books:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleReturn = (id: number) => {
    fetch(buildApiUrl(API_ENDPOINTS.school.return, `${id}/`), { method: "PUT" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        alert("✅ Book returned successfully");
        load();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to return book: " + err.message);
      });
  };

  const issuedList = issuedBooks.filter((b) => !b.is_returned);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-blue-600">📗 Return Book</h1>

      {loading ? (
        <p>Loading…</p>
      ) : issuedList.length === 0 ? (
        <p className="text-gray-600 text-lg">No books currently issued.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Book Title</th>
                <th className="p-2 border">Issue Date</th>
                <th className="p-2 border">Due Date</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {issuedList.map((record) => (
                <tr key={record.id} className="hover:bg-gray-100 text-center">
                  <td className="p-2 border">{record.issued_user ?? record.issued_to}</td>
                  <td className="p-2 border">{record.book_title ?? record.book}</td>
                  <td className="p-2 border">{record.issue_date}</td>
                  <td className="p-2 border">{record.due_date}</td>
                  <td className="p-2 border">
                    <button onClick={() => handleReturn(record.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md">Mark Returned</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => navigate("/library")} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md">Back to Library</button>
      </div>
    </div>
  );
}
