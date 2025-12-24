import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
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
  Chip,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  LibraryBooks as BooksIcon,
} from "@mui/icons-material";
import "../components/compStyles/booksmanagement.css";

export default function BooksManagement() {
  const { books, loading, fetchBooks } = useOutletContext();
  const [expandedBook, setExpandedBook] = useState(null);
  const [bookCopies, setBookCopies] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newCopy, setNewCopy] = useState({ location: "", publisher: "" });
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBooks();
  }, []);

  const totalPages = Math.ceil(books.length / itemsPerPage);

  const fetchCopies = async (bookId) => {
    try {
      setLoadingCopies(true);
      const response = await fetch(`/api/books/${bookId}/copies`);
      const data = await response.json();
      setBookCopies((prev) => ({
        ...prev,
        [bookId]: data,
      }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCopies(false);
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
      setLoadingCopies(true);
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

      await fetchCopies(selectedBook.id);
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCopies(false);
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
      {/* Header */}
      <Box className="abf-header">
        <h1 className="abf-title">Books Management</h1>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          className="bm-alert-error"
        >
          {error}
        </Alert>
      )}

      {books.length === 0 ? (
        <Alert severity="info" className="bm-alert-info">
          Your library is empty. Start by adding some books!
        </Alert>
      ) : (
        <>
          <Box className="bm-books-list-wrapper">
            <Typography variant="body2" className="bm-books-count">
              Total Books: <strong>{books.length}</strong>
            </Typography>

            <Box className="bm-books-list">
              {paginatedBooks.map((book) => (
                <Accordion
                  key={book.id}
                  expanded={expandedBook === book.id}
                  onChange={() => handleAccordionChange(book.id)}
                  className={`bm-accordion ${
                    expandedBook === book.id ? "bm-accordion-expanded" : ""
                  }`}
                >
                  <AccordionSummary
                    component="div"
                    expandIcon={<ExpandMoreIcon />}
                    className="bm-accordion-summary"
                  >
                    <Box className="bm-summary-content">
                      <Box className="bm-summary-info">
                        <Typography variant="body1" className="bm-book-title">
                          {book.title}
                        </Typography>
                        <Box className="bm-book-chips">
                          <Chip
                            label={`Code: ${book.catalog_code}`}
                            size="small"
                            variant="outlined"
                            className="bm-chip"
                          />
                          <Chip
                            label={book.theme}
                            size="small"
                            className="bm-chip-theme"
                          />
                          <Chip
                            label={`${book.total_copies || 0} copies`}
                            size="small"
                            className="bm-chip-copies"
                          />
                        </Box>
                      </Box>

                      <Button
                        startIcon={<AddCircleIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(book);
                        }}
                        className="bm-add-copy-btn"
                      >
                        Add Copy
                      </Button>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails className="bm-accordion-details">
                    {loadingCopies ? (
                      <Box className="bm-loading-container">
                        <CircularProgress size={32} />
                      </Box>
                    ) : bookCopies[book.id]?.length === 0 ? (
                      <Typography className="bm-no-copies">
                        No copies available. Click "Add Copy" to add one.
                      </Typography>
                    ) : (
                      <TableContainer className="bm-table-container">
                        <Table size="small">
                          <TableHead>
                            <TableRow className="bm-table-header">
                              <TableCell className="bm-table-header-cell">
                                Location
                              </TableCell>
                              <TableCell className="bm-table-header-cell">
                                Publisher
                              </TableCell>
                              <TableCell className="bm-table-header-cell">
                                Status
                              </TableCell>
                              <TableCell
                                align="right"
                                className="bm-table-header-cell"
                              >
                                Action
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bookCopies[book.id]?.map((copy) => (
                              <TableRow
                                key={copy.copy_id}
                                className="bm-table-row"
                              >
                                <TableCell className="bm-table-cell">
                                  {copy.location}
                                </TableCell>
                                <TableCell className="bm-table-cell">
                                  {copy.publisher}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      copy.is_available === 1
                                        ? "Available"
                                        : "Borrowed"
                                    }
                                    size="small"
                                    color={
                                      copy.is_available === 1
                                        ? "success"
                                        : "secondary"
                                    }
                                    variant="filled"
                                  />
                                </TableCell>
                                <TableCell
                                  align="right"
                                  className="bm-table-cell"
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteCopy(copy.copy_id, book.id)
                                    }
                                    className="bm-delete-btn"
                                  >
                                    <DeleteIcon
                                      fontSize="small"
                                      color="error"
                                    />
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
          </Box>

          {totalPages > 1 && (
            <Box className="bm-pagination-container">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="medium"
              />
            </Box>
          )}
        </>
      )}

      {/* Add Copy Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            className: "bm-dialog-backdrop",
          },
        }}
        PaperProps={{
          className: "bm-dialog-paper",
        }}
      >
        <DialogTitle className="bm-dialog-title">
          Add a Copy of "{selectedBook?.title}"
        </DialogTitle>

        <DialogContent className="bm-dialog-content">
          <Stack spacing={3} className="bm-dialog-stack">
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
              className="bm-dialog-input"
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
              className="bm-dialog-input"
            />
          </Stack>
        </DialogContent>

        <DialogActions className="bm-dialog-actions">
          <Button onClick={handleCloseDialog} className="bm-dialog-cancel-btn">
            Cancel
          </Button>
          <Button
            onClick={handleAddCopy}
            variant="contained"
            disabled={loadingCopies}
            className="bm-dialog-submit-btn"
          >
            {loadingCopies ? "Adding..." : "Add Copy"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
