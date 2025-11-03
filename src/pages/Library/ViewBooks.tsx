import { useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
};

export default function ViewBooks() {
  const [books] = useState<Book[]>([
    {
      id: 1,
      title: "Mathematics for Class 10",
      author: "R.D. Sharma",
      category: "Mathematics",
      totalCopies: 10,
      availableCopies: 6,
    },
    {
      id: 2,
      title: "Science Wonders",
      author: "H.C. Verma",
      category: "Science",
      totalCopies: 8,
      availableCopies: 3,
    },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-blue-700">Library Books</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-2">{book.title}</h2>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Author:</strong> {book.author}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Category:</strong> {book.category}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Total Copies:</strong> {book.totalCopies}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Available:</strong> {book.availableCopies}
            </p>

            <div className="flex justify-between">
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View Details
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Issue Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
