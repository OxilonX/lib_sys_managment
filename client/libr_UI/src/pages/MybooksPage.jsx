import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/material";
import { useUsersData } from "../contexts/userDataContext";
import "../styles/mybookspg.css";
export default function MyBooks() {
  const { currUser } = useUsersData();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      if (!currUser?.user?.user_id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/users/${currUser.user.user_id}/borrowed-books`
        );
        if (!response.ok) throw new Error("Failed to fetch borrowed books");

        const data = await response.json();
        setBorrowedBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, [currUser]);

  const getDueStatus = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0)
      return { text: "Overdue", color: "error", variant: "filled" };
    if (daysLeft <= 3)
      return {
        text: `${daysLeft} days left`,
        color: "warning",
        variant: "filled",
      };
    return {
      text: `${daysLeft} days left`,
      color: "success",
      variant: "outlined",
    };
  };

  const handleOpenDialog = (book) => {
    setSelectedBook(book);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <Box className="mb-loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <section id="mybooks-page">
      <Container maxWidth="lg" className="mb-container">
        <h1 className="mb-title">My Borrowed Books</h1>

        {error && (
          <Alert severity="error" className="mb-error">
            {error}
          </Alert>
        )}

        {borrowedBooks.length === 0 ? (
          <Alert severity="info" className="mb-no-books">
            You haven't borrowed any books yet
          </Alert>
        ) : (
          <Box className="mb-grid">
            {borrowedBooks.map((book) => {
              const dueStatus = getDueStatus(book.due_date);
              return (
                <Box
                  key={book.copy_id}
                  className="mb-book-card"
                  onClick={() => handleOpenDialog(book)}
                >
                  <Box className="mb-poster-wrapper">
                    <CardMedia
                      component="img"
                      image={book.poster}
                      alt={book.title}
                      className="mb-poster"
                    />
                  </Box>
                  <Box className="mb-book-info">
                    <Typography className="mb-book-title">
                      {book.title}
                    </Typography>
                    <Chip
                      label={dueStatus.text}
                      color={dueStatus.color}
                      variant={dueStatus.variant}
                      size="small"
                      className="mb-status-chip"
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Book Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          className="mb-dialog"
        >
          <DialogTitle className="mb-dialog-title">Book Details</DialogTitle>
          <DialogContent className="mb-dialog-content">
            {selectedBook && (
              <Stack spacing={2}>
                <Box className="mb-dialog-poster-wrapper">
                  <CardMedia
                    component="img"
                    image={selectedBook.poster}
                    alt={selectedBook.title}
                    className="mb-dialog-poster"
                  />
                </Box>

                <Box className="mb-dialog-grid">
                  <Box className="mb-dialog-item">
                    <Typography className="mb-dialog-label">Title</Typography>
                    <Typography className="mb-dialog-value">
                      {selectedBook.title}
                    </Typography>
                  </Box>

                  <Box className="mb-dialog-item">
                    <Typography className="mb-dialog-label">
                      Publisher
                    </Typography>
                    <Typography className="mb-dialog-value">
                      {selectedBook.publisher}
                    </Typography>
                  </Box>

                  <Box className="mb-dialog-item">
                    <Typography className="mb-dialog-label">Theme</Typography>
                    <Chip
                      label={selectedBook.theme}
                      size="small"
                      variant="outlined"
                      className="mb-chip-theme"
                      sx={{ width: "40%" }}
                    />
                  </Box>

                  <Box className="mb-dialog-item">
                    <Typography className="mb-dialog-label">
                      Location
                    </Typography>
                    <Typography className="mb-dialog-value">
                      {selectedBook.location}
                    </Typography>
                  </Box>
                </Box>
                <Box className="mb-dialog-grid">
                  <Box>
                    <Typography className="mb-dialog-label">
                      Borrowed Date
                    </Typography>
                    <Typography className="mb-dialog-value">
                      {new Date(
                        selectedBook.borrowed_date
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography className="mb-dialog-label">
                      Due Date
                    </Typography>
                    <Typography className="mb-dialog-value">
                      {new Date(selectedBook.due_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography className="mb-dialog-label">Status</Typography>
                  <Chip
                    label={getDueStatus(selectedBook.due_date).text}
                    color={getDueStatus(selectedBook.due_date).color}
                    variant={getDueStatus(selectedBook.due_date).variant}
                    size="small"
                    className="mb-status-chip"
                  />
                </Box>
                <Button variant="contained">Return</Button>
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </section>
  );
}
