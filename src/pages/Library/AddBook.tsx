import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  // backend uses `quantity` and `available_copies`; keep old keys for compatibility
  totalCopies?: number;
  availableCopies?: number;
  quantity?: number;
  available_copies?: number;
};

export default function AddBook() {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    category: "",
    totalCopies: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.category || !newBook.totalCopies) {
      alert("Please fill all fields");
      return;
    }
    // Prepare payload for backend
    const payload = {
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      isbn: String(Date.now()), // simple unique isbn placeholder
      quantity: parseInt(newBook.totalCopies, 10),
      available_copies: parseInt(newBook.totalCopies, 10),
    };

    fetch(API_ENDPOINTS.school.books, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((created) => {
        setBooks((s) => [created, ...s]);
        setNewBook({ title: "", author: "", category: "", totalCopies: "" });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to add book: " + err.message);
      });
  };

  useEffect(() => {
    // load books from backend
    fetch(API_ENDPOINTS.school.books)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setBooks(data))
      .catch((err) => console.warn("Could not load books:", err));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-blue-700">Add New Book</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 max-w-md border"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Book Title
          </label>
          <input
            type="text"
            name="title"
            value={newBook.title}
            onChange={handleChange}
            className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300 outline-none"
            placeholder="Enter book title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author
          </label>
          <input
            type="text"
            name="author"
            value={newBook.author}
            onChange={handleChange}
            className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300 outline-none"
            placeholder="Enter author name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={newBook.category}
            onChange={handleChange}
            className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300 outline-none"
            placeholder="Enter category"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Copies
          </label>
          <input
            type="number"
            name="totalCopies"
            value={newBook.totalCopies}
            onChange={handleChange}
            className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300 outline-none"
            placeholder="Enter total copies"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Add Book
        </button>
      </form>

      {/* Book List Preview */}
      {books.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Added Books</h2>
          <ul className="space-y-2">
            {books.map((book) => (
              <li
                key={book.id}
                className="p-3 border rounded-lg bg-white shadow-sm flex justify-between"
              >
                <span>
                  {book.title} — {book.author}
                </span>
                <span className="text-gray-500">
                  {book.availableCopies ?? book.available_copies ?? 0}/{book.totalCopies ?? book.quantity ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
