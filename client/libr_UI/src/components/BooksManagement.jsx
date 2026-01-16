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
  InputAdornment,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import "../components/compStyles/booksmanagement.css";

export default function BooksManagement() {
  const { books, loading, fetchBooks } = useOutletContext();

  // --- States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBook, setExpandedBook] = useState(null);
  const [bookCopies, setBookCopies] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newCopy, setNewCopy] = useState({ location: "", publisher: "" });
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [msg, setMsg] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.catalog_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // --- Handlers ---
  const fetchCopies = async (bookId) => {
    try {
      setLoadingCopies(true);
      const response = await fetch(
        `http://127.0.0.1:5000/api/books/${bookId}/copies`
      );
      const data = await response.json();
      setBookCopies((prev) => ({ ...prev, [bookId]: data }));
    } catch (err) {
      setError(`Failed to load copies, Error:${err}`);
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleAccordionChange = (bookId) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
    if (expandedBook !== bookId && !bookCopies[bookId]) {
      fetchCopies(bookId);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/books/${bookToDelete.id}/delete`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setMsg("Book deleted successfully.");
        fetchBooks();
      }
    } catch (err) {
      setError(`Server connection failed, Error:${err}`);
    } finally {
      setOpenDeleteDialog(false);
      setBookToDelete(null);
    }
  };

  const handleAddCopy = async () => {
    if (!newCopy.location.trim()) return setError("Location is required");
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/books/${selectedBook.id}/copies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: newCopy.location,
            publisher: newCopy.publisher || selectedBook.publisher,
          }),
        }
      );
      if (response.ok) {
        fetchCopies(selectedBook.id);
        setOpenDialog(false);
        setNewCopy({ location: "", publisher: "" });
      }
    } catch (err) {
      setError(`Failed to add copy, Error:${err}`);
    }
  };

  const handleDeleteCopy = async (copyId, bookId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/books/copies/${copyId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchCopies(bookId);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete copy.");
      }
    } catch (err) {
      setError(`Error connecting to server, Error:${err}`);
    }
  };
  if (loading && books.length === 0)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box className="bm-container">
      <Box className="abf-header" sx={{ mb: 4, pb: 3 }}>
        <h1 className="abf-title">Books Management</h1>
      </Box>

      {/* SEARCH BAR */}
      <TextField
        fullWidth
        placeholder="Search books..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
        }}
        sx={{ mb: 3, backgroundColor: "white" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <IconButton onClick={() => setSearchTerm("")} size="small">
              <ClearIcon />
            </IconButton>
          ),
        }}
      />

      {msg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg(null)}>
          {msg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {paginatedBooks.map((book) => (
        <Accordion
          key={book.id}
          expanded={expandedBook === book.id}
          onChange={() => handleAccordionChange(book.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
                pr: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>
                  {book.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {book.catalog_code} • {book.theme}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddCircleIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBook(book);
                    setOpenDialog(true);
                  }}
                >
                  Add Copy
                </Button>
                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBookToDelete(book);
                    setOpenDeleteDialog(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {loadingCopies ? (
              <CircularProgress size={20} />
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Publisher</TableCell>
                      <TableCell>Condition</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookCopies[book.id]?.map((copy) => (
                      <TableRow key={copy.copy_id}>
                        <TableCell>{copy.location}</TableCell>
                        <TableCell>{copy.publisher}</TableCell>
                        {/* CONDITION COLUMN */}
                        <TableCell sx={{ minWidth: 150 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                flexGrow: 1,
                                height: 8,
                                bgcolor: "#eee",
                                borderRadius: 4,
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${copy.state || 0}%`,
                                  height: "100%",
                                  bgcolor:
                                    copy.state > 70
                                      ? "#4caf50"
                                      : copy.state > 30
                                      ? "#ff9800"
                                      : "#f44336",
                                  transition: "width 0.4s ease-in-out",
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold", minWidth: 30 }}
                            >
                              {copy.state}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={copy.is_available ? "Available" : "Borrowed"}
                            color={copy.is_available ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteCopy(copy.copy_id, book.id)
                            }
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

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, v) => setPage(v)}
          color="primary"
        />
      </Box>

      {/* DELETE BOOK DIALOG */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete "{bookToDelete?.title}"?</DialogTitle>
        <DialogContent>
          <Typography>
            This action cannot be undone. All copies and history will be
            removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete Book
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD COPY DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Copy</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ minWidth: 300, mt: 1 }}>
            <TextField
              label="Location"
              fullWidth
              value={newCopy.location}
              onChange={(e) =>
                setNewCopy({ ...newCopy, location: e.target.value })
              }
            />
            <TextField
              label="Publisher"
              fullWidth
              value={newCopy.publisher}
              onChange={(e) =>
                setNewCopy({ ...newCopy, publisher: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCopy} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
