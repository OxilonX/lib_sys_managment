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
import { useOutletContext } from "react-router-dom";
export default function ExplorePage() {
  const { filterType } = useOutletContext();
  const { currUser } = useUsersData();

  const { searchQuery } = useBooksData();
  const [isOpenBookDialog, setIsOperBookDialog] = useState(false);
  const [currBook, setCurrBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("All");

  const getThemeColor = (theme) => {
    const lowerTheme = theme?.toLowerCase() || "";
    const themeMap = {
      mystery: "#FF5252",
      fantasy: "#9C27B0",
      history: "#FF9800",
      science: "#4CAF50",
      romance: "#E91E63",
      thriller: "#000000",
      biography: "#795548",
      programming: "#448AFF",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <ExploreIcon sx={{ fontSize: 38, mt: 0.5 }} />
          <h1 className="ep-title">Explore our Catalogue</h1>
        </Box>

        {/* Theme Selection filter chip */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
            mb: 4,
          }}
        >
          {["All", ...new Set(books.map((b) => b.theme).filter(Boolean))].map(
            (theme) => {
              const isSelected = selectedTheme === theme;
              const themeColor = getThemeColor(theme);

              return (
                <Chip
                  key={theme}
                  label={theme}
                  clickable
                  onClick={() => setSelectedTheme(theme)}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    transition: "all 0.2s ease",
                    backgroundColor: isSelected ? themeColor : "transparent",
                    color: isSelected ? "#fff" : themeColor,
                    border: `2px solid ${themeColor}`,
                    "&:hover": {
                      backgroundColor: isSelected
                        ? themeColor
                        : `${themeColor}15`,
                      transform: "translateY(-2px)",
                    },
                    "& .MuiChip-label": {
                      px: 2,
                    },
                  }}
                />
              );
            }
          )}
        </Box>
        {/* Books Grid */}

        {books.length > 0 ? (
          <div className="books-grid">
            {books
              .filter((book) => {
                const matchesChip =
                  selectedTheme === "All" || book.theme === selectedTheme;

                const query = searchQuery.toLowerCase();

                if (!query) return matchesChip;

                const matchesSearch = {
                  title: book.title?.toLowerCase().includes(query),
                  publisher: book.publisher?.toLowerCase().includes(query),
                  keywords: book.keywords?.toLowerCase().includes(query),
                  catCode: book.catalog_code?.toLowerCase().includes(query),
                };

                const isSearchMatch =
                  filterType === "all"
                    ? Object.values(matchesSearch).some(Boolean)
                    : matchesSearch[filterType];

                return matchesChip && isSearchMatch;
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
                          mt: 0.2,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 11, opacity: 0.6 }} />
                        <p className="book-author">{book.publisher}</p>
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
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* Styled Empty State */
          <div className="empty-state-container">
            <div className="empty-state-icon">📚</div>
            <h2 className="empty-state-title">No Books Found</h2>
            <p className="empty-state-text">
              We couldn't find any books matching your current search or the
              library is currently empty.
            </p>
          </div>
        )}

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
