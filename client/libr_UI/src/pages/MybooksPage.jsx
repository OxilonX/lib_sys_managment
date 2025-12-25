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
  Tab,
  Tabs,
} from "@mui/material";
import {
  History as HistoryIcon,
  LocationOn as LocationIcon,
  Business as PublisherIcon,
  Event as DateIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useUsersData } from "../contexts/userDataContext";
import "../styles/mybookspg.css";

export default function MyBooks() {
  const { currUser } = useUsersData();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [returning, setReturning] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dialogType, setDialogType] = useState("return"); // 'return' or 'cancel'

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

  const fetchUserRequests = async () => {
    if (!currUser?.user?.user_id) return;
    try {
      const response = await fetch(
        `/api/users/${currUser.user.user_id}/requests`
      );
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      setRequestedBooks(data);
    } catch (err) {
      console.log("Error fetching requests:", err.message);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
    fetchUserRequests();
  }, [currUser?.user?.user_id]);

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
      setReturning(true);
      setError(null);
      const response = await fetch(`/api/books/copies/${copyId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to return book");

      setSuccess(
        `Book returned successfully${
          data.next_user ? "! The next person in queue has been notified." : "."
        }`
      );

      // Refresh both borrowed and requested books
      await fetchBorrowedBooks();
      await fetchUserRequests();

      setTimeout(() => {
        setOpenDialog(false);
        setSelectedBook(null);
        setSuccess(null);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setReturning(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      setCancelling(true);
      setError(null);
      const response = await fetch(`/api/books/requests/${requestId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to cancel request");

      setSuccess("Request cancelled successfully");

      // Refresh requested books
      await fetchUserRequests();

      setTimeout(() => {
        setOpenDialog(false);
        setSelectedBook(null);
        setSuccess(null);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading && borrowedBooks.length === 0 && requestedBooks.length === 0) {
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
        <HistoryIcon sx={{ fontSize: 38, mt: 0.5 }} />
        <h1 className="mb-title">My Library</h1>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Tabs for Borrowed and Requests */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Tab
            label={`Borrowed Books (${borrowedBooks.length})`}
            sx={{ textTransform: "capitalize", fontWeight: 600 }}
          />
          <Tab
            label={`Requested Books (${requestedBooks.length})`}
            sx={{ textTransform: "capitalize", fontWeight: 600 }}
          />
        </Tabs>
      </Paper>

      {/* Borrowed Books Tab */}
      {tabValue === 0 && (
        <>
          {borrowedBooks.length === 0 ? (
            <Paper variant="outlined" className="mb-empty-state">
              <Typography variant="h6">No borrowed books</Typography>
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
                        setDialogType("return");
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
        </>
      )}

      {/* Requested Books Tab */}
      {tabValue === 1 && (
        <>
          {requestedBooks.length === 0 ? (
            <Paper variant="outlined" className="mb-empty-state">
              <Typography variant="h6">No requested books</Typography>
              <Typography color="text.secondary">
                Request books that are currently borrowed
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3} alignItems={"stretch"}>
              {requestedBooks.map((book) => {
                // Calculate max estimated wait time (position * 15 days)
                const maxWaitDays = book.position * 15;

                return (
                  <Grid item xs={12} sm={6} md={4} key={book.request_id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={book.poster}
                        alt={book.title}
                        sx={{
                          height: 250,
                          objectFit: "cover",
                          filter: "brightness(70%)",
                        }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: "#333",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {book.title}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 0.5 }}
                          >
                            <strong>Location:</strong> {book.location}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Requested:</strong>{" "}
                            {new Date(book.requested_date).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            background: "#e3f2fd",
                            mt: "auto",
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "#1565c0",
                              mb: 0.5,
                            }}
                          >
                            Position: #{book.position}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Est. wait: {maxWaitDays} days (max)
                          </Typography>
                        </Box>

                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<CloseIcon />}
                          color="error"
                          onClick={() => {
                            setSelectedBook(book);
                            setDialogType("cancel");
                            setOpenDialog(true);
                          }}
                        >
                          Cancel Request
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Dialog for Return or Cancel */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        {selectedBook && (
          <>
            <DialogTitle sx={{ fontWeight: "bold" }}>
              {dialogType === "return"
                ? "Return Confirmation"
                : "Cancel Request Confirmation"}
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
                      value={
                        selectedBook.publisher ||
                        selectedBook.publisher_name ||
                        "Unknown"
                      }
                    />
                    <DetailRow
                      icon={<LocationIcon />}
                      label="Location"
                      value={selectedBook.location}
                    />
                    {dialogType === "return" && (
                      <DetailRow
                        icon={<DateIcon />}
                        label="Due Date"
                        value={new Date(
                          selectedBook.due_date
                        ).toLocaleDateString()}
                      />
                    )}
                    {dialogType === "cancel" && (
                      <DetailRow
                        icon={<CloseIcon />}
                        label="Queue Position"
                        value={`#${selectedBook.position}`}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
              {dialogType === "cancel" && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Are you sure you want to cancel this request? You can request
                  this book again later.
                </Alert>
              )}
            </DialogContent>
            <Box sx={{ p: 2, display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenDialog(false)}
                disabled={returning || cancelling}
              >
                Close
              </Button>
              <Button
                fullWidth
                variant="contained"
                color={dialogType === "return" ? "primary" : "error"}
                onClick={() => {
                  if (dialogType === "return") {
                    handleReturnBook(selectedBook.copy_id);
                  } else {
                    handleCancelRequest(selectedBook.request_id);
                  }
                }}
                disabled={returning || cancelling}
                sx={
                  dialogType === "return"
                    ? {
                        background:
                          "linear-gradient(135deg, #81c784 0%, #66bb6a 100%)",
                      }
                    : {}
                }
              >
                {returning || cancelling ? (
                  <CircularProgress size={24} />
                ) : dialogType === "return" ? (
                  "Confirm Return"
                ) : (
                  "Confirm Cancellation"
                )}
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </Container>
  );
}

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
