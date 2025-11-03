import { useState, useEffect } from "react";
import { FaBook, FaPlusCircle, FaListAlt, FaSearch, FaSort } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
};

const mockBooks: Book[] = [
  { id: 1, title: "Mathematics for Class 10", author: "R.D. Sharma", category: "Maths", totalCopies: 20, availableCopies: 14 },
  { id: 2, title: "Science Concepts", author: "H.C. Verma", category: "Science", totalCopies: 15, availableCopies: 8 },
  { id: 3, title: "History of India", author: "Bipin Chandra", category: "Social Studies", totalCopies: 10, availableCopies: 10 },
];

export default function LibraryDashboard() {
  const navigate = useNavigate();

  // Load & persist books
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem("books");
    return saved ? JSON.parse(saved) : mockBooks;
  });

  // Auto-sync when other pages (issue/return) modify localStorage
  useEffect(() => {
    const handleStorage = () => {
      const updated = localStorage.getItem("books");
      if (updated) setBooks(JSON.parse(updated));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  // Search
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Book | "">("");

  // Sorting handler
  const sortBooks = (field: keyof Book) => {
    if (sortField === field) {
      setBooks([...books].reverse()); // toggle order
    } else {
      const sorted = [...books].sort((a, b) =>
        a[field].toString().localeCompare(b[field].toString())
      );
      setBooks(sorted);
      setSortField(field);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase())
  );

  // Summary
  const totalBooks = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailable = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const totalIssued = totalBooks - totalAvailable;

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

      {/* Books Table */}
      <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
        {filteredBooks.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100 text-gray-700">
                <th className="p-3 border cursor-pointer">Book Title</th>
                <th className="p-3 border cursor-pointer">Author</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border text-center">Total Copies</th>
                <th className="p-3 border text-center">Available</th>
                <th className="p-3 border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border">{book.title}</td>
                  <td className="p-3 border">{book.author}</td>
                  <td className="p-3 border">{book.category}</td>
                  <td className="p-3 border text-center">{book.totalCopies}</td>
                  <td className="p-3 border text-center">{book.availableCopies}</td>
                  <td className="p-3 border text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-sm font-medium ${
                        book.availableCopies > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {book.availableCopies > 0 ? "Available" : "Out of Stock"}
                    </span>
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
