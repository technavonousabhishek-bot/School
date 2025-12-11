import { useState, useEffect } from "react";
import { FaBook, FaPlusCircle, FaListAlt, FaSearch, FaSort } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";

type Book = {
  id: number;
  title: string;
  author: string;
  category?: string;
  // backend uses `quantity` and `available_copies`
  quantity?: number;
  available_copies?: number;
  // backward compat
  totalCopies?: number;
  availableCopies?: number;
};

export default function LibraryDashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Book | "">("");

  // Sorting handler
  const sortBooks = (field: keyof Book) => {
    if (sortField === field) {
      setBooks([...books].reverse()); // toggle order
    } else {
      const sorted = [...books].sort((a, b) =>
        String(a[field] ?? "").toString().localeCompare(String(b[field] ?? "").toString())
      );
      setBooks(sorted);
      setSortField(field);
    }
  };

  const filteredBooks = books.filter((book) => {
    const q = search.toLowerCase();
    return (
      String(book.title ?? "").toLowerCase().includes(q) ||
      String(book.author ?? "").toLowerCase().includes(q) ||
      String(book.category ?? "").toLowerCase().includes(q)
    );
  });

  // Summary
  const totalBooks = books.reduce((acc, b) => acc + (b.quantity ?? b.totalCopies ?? 0), 0);
  const totalAvailable = books.reduce((acc, b) => acc + (b.available_copies ?? b.availableCopies ?? 0), 0);
  const totalIssued = totalBooks - totalAvailable;

  // Add Book form state
  const [newBook, setNewBook] = useState({ title: "", author: "", category: "", quantity: "" });

  // Fetch books
  const fetchBooks = () => {
    setLoading(true);
    setError(null);
    fetch(API_ENDPOINTS.school.books)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setBooks(data))
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <main className="p-6 bg-gray-50 min-h-screen transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaBook className="text-blue-600" /> Library Dashboard
        </h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/library/issue")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaPlusCircle /> Issue Book
          </button>
          <button
            onClick={() => navigate("/library/return")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaListAlt /> Return Book
          </button>
          <button
            onClick={() => navigate("/library/issued")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaListAlt /> View Issued Books
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">Total Books</p>
          <h2 className="text-2xl font-bold text-blue-700">{totalBooks}</h2>
        </div>
        <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">Available</p>
          <h2 className="text-2xl font-bold text-green-700">{totalAvailable}</h2>
        </div>
        <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">Issued</p>
          <h2 className="text-2xl font-bold text-yellow-700">{totalIssued}</h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center mb-4 gap-3">
        <div className="flex items-center bg-white shadow-sm rounded-md px-3 py-2 w-full sm:w-96">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full"
          />
        </div>

        <button
          onClick={() => sortBooks("title")}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          <FaSort /> Sort by Title
        </button>

        <button
          onClick={() => sortBooks("author")}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          <FaSort /> Sort by Author
        </button>
      </div>

      {/* Add Book Form */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Add New Book</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <input value={newBook.title} onChange={(e) => setNewBook((s) => ({ ...s, title: e.target.value }))} placeholder="Title" className="p-2 border rounded" />
          <input value={newBook.author} onChange={(e) => setNewBook((s) => ({ ...s, author: e.target.value }))} placeholder="Author" className="p-2 border rounded" />
          <input value={newBook.category} onChange={(e) => setNewBook((s) => ({ ...s, category: e.target.value }))} placeholder="Category" className="p-2 border rounded" />
          <input value={newBook.quantity} onChange={(e) => setNewBook((s) => ({ ...s, quantity: e.target.value }))} placeholder="Quantity" type="number" className="p-2 border rounded" />
        </div>
        <div className="mt-3">
          <button onClick={async () => {
            if (!newBook.title || !newBook.author || !newBook.quantity) {
              alert('Please fill title, author and quantity');
              return;
            }
            const payload = {
              title: newBook.title,
              author: newBook.author,
              category: newBook.category,
              isbn: String(Date.now()),
              quantity: Number(newBook.quantity),
              available_copies: Number(newBook.quantity),
            };
            try {
              const res = await fetch(API_ENDPOINTS.school.books, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              if (!res.ok) throw new Error(await res.text());
              await res.json();
              setNewBook({ title: '', author: '', category: '', quantity: '' });
              fetchBooks();
            } catch (err: any) {
              alert('Failed to add book: ' + (err.message || String(err)));
            }
          }} className="px-4 py-2 bg-blue-600 text-white rounded">Add Book</button>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : filteredBooks.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100 text-gray-700">
                <th className="p-3 border cursor-pointer">Book Title</th>
                <th className="p-3 border cursor-pointer">Author</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border text-center">Total Copies</th>
                <th className="p-3 border text-center">Available</th>
                <th className="p-3 border text-center">Status</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border">{book.title}</td>
                  <td className="p-3 border">{book.author}</td>
                  <td className="p-3 border">{book.category}</td>
                  <td className="p-3 border text-center">{book.quantity ?? book.totalCopies ?? 0}</td>
                  <td className="p-3 border text-center">{book.available_copies ?? book.availableCopies ?? 0}</td>
                  <td className="p-3 border text-center">
                    <span className={`px-2 py-1 rounded-md text-sm font-medium ${(book.available_copies ?? book.availableCopies ?? 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {(book.available_copies ?? book.availableCopies ?? 0) > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => navigate(`/library/issue`)} className="px-3 py-1 bg-green-600 text-white rounded">Issue</button>
                      <button onClick={async () => {
                        if (!confirm('Delete this book?')) return;
                        try {
                          const res = await fetch(buildApiUrl(API_ENDPOINTS.school.books, `${book.id}/`), { method: 'DELETE' });
                          if (res.status === 204) {
                            fetchBooks();
                          } else {
                            throw new Error(await res.text());
                          }
                        } catch (err: any) {
                          alert('Failed to delete: ' + (err.message || String(err)));
                        }
                      }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <FaBook className="mx-auto text-4xl text-gray-400 mb-3" />
            <p>No books found matching your search.</p>
          </div>
        )}
      </div>
    </main>
  );
}
