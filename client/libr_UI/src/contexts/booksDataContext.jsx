import { createContext, useContext, useState } from "react";
const API_BASE = "http://localhost:5000/api/books";
const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);

  const submitNewBook = async (bookData) => {
    const response = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookData),
    });
    const result = await response.json();
    if (!response.ok) {
      const errorMessage =
        result.error || result.message || "Unknown API Error";
      throw new Error(errorMessage);
    }
    console.log(result);
    setBooks((prev) => [...prev, result]);
    return result;
  };
  const bookValue = {
    books,
    setBooks,
    submitNewBook,
  };
  return (
    <BooksContext.Provider value={bookValue}>{children}</BooksContext.Provider>
  );
}

export function useBooksData() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooksData must be used within a BooksProvider");
  return ctx;
}
