import Container from "@mui/material/Container";
import "../styles/dashboardpg.css";
//Components imports
import AddBookForm from "../components/AddBookForm";
import BooksManagement from "../components/BooksManagement";
import { useState } from "react";
export default function DashboardPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/books");
      const data = await response.json();
      setBooks(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err) {
      setError("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="dashboard-page">
      <Container maxWidth="lg">
        <div className="dashboard-section-grid">
          <AddBookForm loadBooks={fetchBooks} />
          <div id="books-list">
            <BooksManagement
              loadBooks={fetchBooks}
              books={books}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
