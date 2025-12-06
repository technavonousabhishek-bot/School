import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../api/notices";

type Book = {
  id: number;
  title: string;
  author: string;
  category?: string;
  quantity?: number;
  available_copies?: number;
  // backwards compatibility
  totalCopies?: number;
  availableCopies?: number;
};

export default function ViewBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_BASE + "books/")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setBooks(data))
      .catch((err) => console.warn("Could not load books:", err));
  }, []);

  const deleteBook = (id: number) => {
    if (!confirm("Delete this book? This action cannot be undone.")) return;
    fetch(API_BASE + `books/${id}/`, { method: "DELETE" })
      .then(async (res) => {
        if (res.status === 204) {
          setBooks((s) => s.filter((b) => b.id !== id));
        } else {
          const txt = await res.text();
          throw new Error(txt || `Status ${res.status}`);
        }
      })
      .catch((err) => alert("Failed to delete book: " + err.message));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-blue-700">Library Books</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/library/add')} className="px-4 py-2 bg-blue-600 text-white rounded">Add Book</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{book.title}</h2>
            <p className="text-sm text-gray-600 mb-1"><strong>Author:</strong> {book.author}</p>
            {book.category && <p className="text-sm text-gray-600 mb-1"><strong>Category:</strong> {book.category}</p>}
            <p className="text-sm text-gray-600 mb-1"><strong>Total Copies:</strong> {book.quantity ?? book.totalCopies ?? 0}</p>
            <p className="text-sm text-gray-600 mb-3"><strong>Available:</strong> {book.available_copies ?? book.availableCopies ?? 0}</p>

            <div className="flex justify-between">
              <button onClick={() => navigate(`/library/issue`)} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">Issue Book</button>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/library/edit/${book.id}`)} className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Edit</button>
                <button onClick={() => deleteBook(book.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
