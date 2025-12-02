import { createContext, useContext, useState } from "react";
const API_BASE = "http://localhost:5000/api/books";
const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const bookValue = {
    books,
    setBooks,
  };

  return (
    <BooksContext.Provider value={bookValue}>{children}</BooksContext.Provider>
  );
}

export function useBooksData() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useBooksData must be used within a BooksProvider");
  return ctx;
}
