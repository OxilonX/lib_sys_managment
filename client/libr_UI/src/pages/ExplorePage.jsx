import { useState, useEffect } from "react";
import {
  Chip,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

  const [filterType, setFilterType] = useState("all");

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
        {/* Header and Filter Controls */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ExploreIcon sx={{ fontSize: 38, mt: 0.5 }} />
            <h1 className="ep-title">Explore our Catalogue</h1>
          </Box>

          {/* New Search Category Filter */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="search-filter-label">Search By</InputLabel>
            <Select
              labelId="search-filter-label"
              value={filterType}
              label="Search By"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Fields</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="theme">Theme</MenuItem>
              <MenuItem value="publisher">Publisher</MenuItem>
              <MenuItem value="keywords">Keywords</MenuItem>
              <MenuItem value="catCode">Catalog Code</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Books Grid */}
        <div className="books-grid">
          {books
            .filter((book) => {
              const query = searchQuery.toLowerCase();
              if (!query) return true;

              const matches = {
                title: book.title?.toLowerCase().includes(query),
                publisher: book.publisher?.toLowerCase().includes(query),
                theme: book.theme?.toLowerCase().includes(query),
                keywords: book.keywords?.toLowerCase().includes(query),
                catCode: book.catalog_code?.toLowerCase().includes(query),
              };

              if (filterType === "all") {
                return Object.values(matches).some(Boolean);
              }
              return matches[filterType];
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
