import { createContext, useContext, useState } from "react";
const API_BASE = "http://localhost:5000/api/books";
const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);

  async function submitNewBook(bookData) {
    const formData = new FormData();

    formData.append("title", bookData.title);
    formData.append("catCode", bookData.catCode);
    formData.append("location", bookData.location);
    formData.append("theme", bookData.theme);
    formData.append("poster", JSON.stringify(bookData.poster));

    formData.append("authors", JSON.stringify(bookData.authors));
    formData.append("publishers", JSON.stringify(bookData.publishers));
    const response = await fetch("/api/books", {
      method: "POST",
      body: formData,
    });
    console.log(formData);
    const result = await response.json();
    console.log(result);
    setBooks((prev) => [...prev, result]);
    if (!response.ok) {
      const errorMessage =
        result.error || result.message || "Unknown API Error";
      throw new Error(errorMessage);
    }

    return result;
  }
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
