import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import { useUsersData } from "../contexts/userDataContext";
import "../styles/explorePage.css";
import BookInfos from "../components/BookInfos";

export default function ExplorePage() {
  const { currUser, setCurrUser } = useUsersData();
  const [isOpenBookDialog, setIsOperBookDialog] = useState(false);
  const [currBook, setCurrBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books from backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/books");
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <section id="explore-page">
        <Container maxWidth="lg">
          <h1 className="explore-heading">Explore Our Catalogue</h1>
          <p>Loading books...</p>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section id="explore-page">
        <Container maxWidth="lg">
          <h1 className="explore-heading">Explore Our Catalogue</h1>
          <p style={{ color: "red" }}>Error: {error}</p>
        </Container>
      </section>
    );
  }

  return (
    <section id="explore-page">
      <Container maxWidth="lg">
        <h1 className="explore-heading">Explore Our Catalogue</h1>
        <div className="books-container">
          <div className="books-grid">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => {
                  setCurrBook(book);
                  setIsOperBookDialog(true);
                }}
                className="book-card"
              >
                <div className="book-image-wrapper">
                  <img
                    src={book.poster}
                    alt={book.title}
                    className="book-image"
                  />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.publisher}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {isOpenBookDialog && currBook && (
          <div id="book-info-dialog">
            <BookInfos
              book={currBook}
              setCloseDialog={setIsOperBookDialog}
              currUser={currUser}
            />
          </div>
        )}
      </Container>
    </section>
  );
}
