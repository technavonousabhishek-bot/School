import { useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
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

    const book: Book = {
      id: Date.now(),
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      totalCopies: parseInt(newBook.totalCopies),
      availableCopies: parseInt(newBook.totalCopies),
    };

    setBooks([...books, book]);
    setNewBook({ title: "", author: "", category: "", totalCopies: "" });
  };

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
                  {book.availableCopies}/{book.totalCopies}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
