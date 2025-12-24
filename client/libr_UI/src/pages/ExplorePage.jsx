import { useState, useEffect } from "react";
import {
  Chip,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useUsersData } from "../contexts/userDataContext";
import { useBooksData } from "../contexts/booksDataContext";
import BookInfos from "../components/BookInfos";
import PersonIcon from "@mui/icons-material/Person";
import ExploreIcon from "@mui/icons-material/Explore";
import "../styles/explorePage.css";

export default function ExplorePage() {
  const { currUser } = useUsersData();
  const { searchQuery } = useBooksData();
  const [isOpenBookDialog, setIsOperBookDialog] = useState(false);
  const [currBook, setCurrBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. CLEAR MANUAL MAPPING (No more random math)
  const getThemeColor = (theme) => {
    const lowerTheme = theme?.toLowerCase() || "";

    const themeMap = {
      mystery: "#FF5252", // Red
      fantasy: "#9C27B0", // Purple
      history: "#FF9800", // Orange
      science: "#4CAF50", // Green
      romance: "#E91E63", // Pink
      thriller: "#000000", // Black
      biography: "#795548", // Brown
      programming: "#448AFF", // Blue
    };

    return themeMap[lowerTheme] || "#1976d2";
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/books");
        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );

  return (
    <section id="explore-page">
      <Container maxWidth="lg" sx={{ pb: 4, pt: 0, mt: 0 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",

            gap: 2,
          }}
        >
          <ExploreIcon sx={{ fontSize: 38, mt: 0.5 }} />
          <h1 className="ep-title" fontWeight="bold">
            Explore our Catalogue
          </h1>
        </Box>

        <div className="books-grid">
          {books
            .filter((book) => {
              const query = searchQuery.toLowerCase();
              return (
                book.title.toLowerCase().includes(query) ||
                (book.publisher &&
                  book.publisher.toLowerCase().includes(query)) ||
                (book.theme && book.theme.toLowerCase().includes(query))
              );
            })
            .map((book) => {
              const themeColor = getThemeColor(book.theme);

              return (
                <div
                  key={book.id}
                  className="book-card"
                  onClick={() => {
                    setCurrBook(book);
                    setIsOperBookDialog(true);
                  }}
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: 0.2,
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 11, opacity: 0.6 }} />
                      <p
                        style={{
                          opacity: 0.8,
                          fontSize: "0.65rem",
                          padding: "0",
                          margin: "0",
                        }}
                      >
                        {book.publisher}
                      </p>
                    </Box>
                    <Chip
                      label={book.theme || "General"}
                      size="small"
                      sx={{
                        marginTop: "auto",
                        width: "fit-content",
                        mb: 1,
                        fontSize: "0.65rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        backgroundColor: `${themeColor}15`,
                        color: themeColor,
                        "& .MuiChip-label": {
                          color: "inherit",
                          px: 1,
                        },
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {isOpenBookDialog && currBook && (
          <BookInfos
            book={currBook}
            setCloseDialog={setIsOperBookDialog}
            currUser={currUser}
          />
        )}
      </Container>
    </section>
  );
}
