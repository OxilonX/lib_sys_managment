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
  Grid,
  Card,
  Paper,
} from "@mui/material";
import {
  History as HistoryIcon,
  LocationOn as LocationIcon,
  Business as PublisherIcon,
  Event as DateIcon,
} from "@mui/icons-material";
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
          `/api/users/${currUser.user.user_id}/borrowed`
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

  const handleReturnBook = async (copyId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/copies/${copyId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to return book");
      setBorrowedBooks((prev) =>
        prev.filter((book) => book.copy_id !== copyId)
      );
      setOpenDialog(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && borrowedBooks.length === 0) {
    return (
      <Box className="mb-loading-container">
        <CircularProgress />
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Loading your library...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="mybooks-page" sx={{ padding: 0 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <HistoryIcon color="" sx={{ fontSize: 38, mt: 0.5 }} />
        <h1 className="mb-title">My Borrowed Books</h1>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {borrowedBooks.length === 0 ? (
        <Paper variant="outlined" className="mb-empty-state">
          <Typography variant="h6">Your library is empty</Typography>
          <Typography color="text.secondary">
            Go to Explore to find your next read!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} alignItems={"stretch"}>
          {borrowedBooks.map((book) => {
            const status = getDueStatus(book.due_date);
            return (
              <Grid item xs={12} sm={6} md={4} key={book.copy_id}>
                <Card
                  className="mb-book-card"
                  onClick={() => {
                    setSelectedBook(book);
                    setOpenDialog(true);
                  }}
                >
                  <CardMedia
                    component="img"
                    image={book.poster}
                    alt={book.title}
                    className="mb-card-media"
                  />
                  <Box className="mb-card-content">
                    <h6 className="mb-title-truncate">{book.title}</h6>
                    <p className="mb-location">
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {book.location}
                    </p>
                    <Chip
                      label={status.text}
                      color={status.color}
                      variant={status.variant}
                      size="small"
                      sx={{ justifySelf: "end", marginTop: "auto" }}
                    />
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modern Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        {selectedBook && (
          <>
            <DialogTitle sx={{ fontWeight: "bold" }}>
              Return Confirmation
            </DialogTitle>
            <DialogContent dividers>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                <Box sx={{ width: { xs: "100%", sm: 140 } }}>
                  <img
                    src={selectedBook.poster}
                    alt={selectedBook.title}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {selectedBook.title}
                  </Typography>
                  <Stack spacing={1}>
                    <DetailRow
                      icon={<PublisherIcon />}
                      label="Publisher"
                      value={selectedBook.publisher}
                    />
                    <DetailRow
                      icon={<LocationIcon />}
                      label="Location"
                      value={selectedBook.location}
                    />
                    <DetailRow
                      icon={<DateIcon />}
                      label="Due Date"
                      value={new Date(
                        selectedBook.due_date
                      ).toLocaleDateString()}
                    />
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <Box sx={{ p: 2, display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => handleReturnBook(selectedBook.copy_id)}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Confirm Return"}
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </Container>
  );
}

// Helper component for Dialog rows
function DetailRow({ icon, label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
      <Typography variant="body2">
        <strong>{label}:</strong> {value}
      </Typography>
    </Box>
  );
}
