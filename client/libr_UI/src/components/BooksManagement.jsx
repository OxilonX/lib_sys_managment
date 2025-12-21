import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
//css imports
import "../components/compStyles/booksmanagement.css";
export default function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [expandedBook, setExpandedBook] = useState(null);
  const [bookCopies, setBookCopies] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newCopy, setNewCopy] = useState({ location: "", publisher: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Fetch all books
  useEffect(() => {
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
    fetchBooks();
  }, []);

  // Fetch copies for a book
  const fetchCopies = async (bookId) => {
    try {
      const response = await fetch(`/api/books/${bookId}/copies`);
      const data = await response.json();
      setBookCopies((prev) => ({
        ...prev,
        [bookId]: data,
      }));
    } catch (err) {
      setError("Failed to fetch copies");
    }
  };

  const handleAccordionChange = (bookId) => {
    if (expandedBook === bookId) {
      setExpandedBook(null);
    } else {
      setExpandedBook(bookId);
      if (!bookCopies[bookId]) {
        fetchCopies(bookId);
      }
    }
  };

  const handleOpenDialog = (book) => {
    setSelectedBook(book);
    setNewCopy({ location: "", publisher: "" });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBook(null);
    setNewCopy({ location: "", publisher: "" });
  };

  const handleAddCopy = async () => {
    if (!newCopy.location.trim()) {
      setError("Location is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const copyData = {
        location: newCopy.location,
        publisher: newCopy.publisher || selectedBook.publisher,
      };

      const response = await fetch(`/api/books/${selectedBook.id}/copies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyData),
      });

      if (!response.ok) throw new Error("Failed to add copy");

      // Refresh copies
      await fetchCopies(selectedBook.id);
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCopy = async (copyId, bookId) => {
    if (!window.confirm("Are you sure you want to delete this copy?")) return;

    try {
      const response = await fetch(`/api/books/copies/${copyId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete copy");

      await fetchCopies(bookId);
    } catch (err) {
      setError(err.message);
    }
  };

  const paginatedBooks = books.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading && books.length === 0) {
    return (
      <Box className="bm-loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="bm-container">
      <h1 className="bm-title">Books Management</h1>

      {error && (
        <Alert severity="error" className="bm-error">
          {error}
        </Alert>
      )}

      {/* Books Accordion List */}
      <Box className="bm-accordion-list">
        {paginatedBooks.map((book) => (
          <Accordion
            key={book.id}
            expanded={expandedBook === book.id}
            onChange={() => handleAccordionChange(book.id)}
            className="bm-accordion"
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box className="bm-summary-content">
                <Box className="bm-book-info">
                  <Typography variant="body1" className="bm-book-title">
                    {book.title}
                  </Typography>
                  <Typography variant="caption" className="bm-book-meta">
                    {book.catalog_code}
                  </Typography>
                </Box>
                <div>
                  <AddCircleIcon
                    className="add-icon-button"
                    sx={{ width: 25, height: 25 }}
                    color="primary"
                    onClick={() => handleOpenDialog(book)}
                  />
                </div>
              </Box>
            </AccordionSummary>

            <AccordionDetails className="bm-details">
              {!bookCopies[book.id] ? (
                <CircularProgress size={24} />
              ) : bookCopies[book.id].length === 0 ? (
                <Typography className="bm-no-copies">
                  No copies available
                </Typography>
              ) : (
                <TableContainer
                  component={Paper}
                  className="bm-table-container"
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow className="bm-table-header">
                        <TableCell className="bm-table-cell-header">
                          Location
                        </TableCell>
                        <TableCell className="bm-table-cell-header">
                          Publisher
                        </TableCell>
                        <TableCell className="bm-table-cell-header">
                          Status
                        </TableCell>
                        <TableCell
                          align="right"
                          className="bm-table-cell-header"
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookCopies[book.id].map((copy) => (
                        <TableRow key={copy.copy_id} className="bm-table-row">
                          <TableCell className="bm-table-cell">
                            {copy.location}
                          </TableCell>
                          <TableCell className="bm-table-cell">
                            {copy.publisher}
                          </TableCell>
                          <TableCell className="bm-table-cell">
                            <Typography
                              variant="caption"
                              className={`bm-status-badge ${
                                copy.is_available === 1
                                  ? "bm-available"
                                  : "bm-borrowed"
                              }`}
                            >
                              {copy.is_available === 1
                                ? "Available"
                                : "Borrowed"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" className="bm-table-cell">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteCopy(copy.copy_id, book.id)
                              }
                              className="bm-delete-btn"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Pagination */}
      <Box className="bm-pagination">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Add Copy Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="bm-dialog"
        // Styling the Dialog and Backdrop
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            padding: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#1a1a1a",
            borderBottom: "1px solid #eee",
            pb: 2,
          }}
        >
          Add a Copy of {selectedBook?.title}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3} sx={{ mt: 3 }}>
            <TextField
              label="Location"
              fullWidth
              value={newCopy.location}
              onChange={(e) =>
                setNewCopy({ ...newCopy, location: e.target.value })
              }
              placeholder="e.g., Aisle A, Shelf 1"
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#fcfcfc" },
                },
              }}
            />
            <TextField
              label="Publisher"
              fullWidth
              value={newCopy.publisher}
              onChange={(e) =>
                setNewCopy({ ...newCopy, publisher: e.target.value })
              }
              placeholder="Leave empty for default publisher"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#fcfcfc" },
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 24px",
            borderTop: "1px solid #eee",
            gap: 1,
            // Responsive layout: Stack buttons on mobile
            flexDirection: { xs: "column-reverse", sm: "row" },
            "& > button": {
              width: { xs: "100%", sm: "auto" },
              ml: { xs: 0, sm: 1 },
            },
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              padding: "10px 20px",
              fontSize: "0.9rem",
              textTransform: "capitalize",
              fontWeight: 600,
              color: "#666",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCopy}
            variant="contained"
            disabled={loading}
            sx={{
              padding: "10px 20px",
              fontSize: "0.9rem",
              textTransform: "capitalize",
              fontWeight: 600,
              backgroundColor: "#3f51b5",
              borderRadius: "6px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#303aa8",
                boxShadow: "0 4px 12px rgba(63, 81, 181, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#fff",
              },
            }}
          >
            {loading ? "Adding..." : "Add Copy"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
