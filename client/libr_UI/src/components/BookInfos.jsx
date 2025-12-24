import "./compStyles/bookinfos.css";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Label as LabelIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export default function BookInfos({ book, setCloseDialog, currUser }) {
  const [copies, setCopies] = useState([]);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [userBorrowedBooks, setUserBorrowedBooks] = useState([]);

  if (!book) return null;

  const fetchCopies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/books/${book.id}/copies`);
      if (!response.ok) {
        throw new Error("Failed to fetch copies");
      }
      const data = await response.json();
      setCopies(data);
      const availableCopy = data.find((copy) => copy.is_available === 1);
      if (availableCopy) {
        setSelectedCopy(availableCopy.copy_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBorrowedBooks = async () => {
    try {
      const response = await fetch(
        `/api/users/${currUser?.user?.user_id}/borrowed`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch borrowed books");
      }
      const data = await response.json();
      setUserBorrowedBooks(data.map((b) => b.copy_id));
    } catch (err) {
      console.log("Error fetching borrowed books:", err);
    }
  };

  useEffect(() => {
    fetchCopies();
    fetchUserBorrowedBooks();
  }, [book.id, currUser?.user?.user_id]);

  const selectedCopyData = copies.find((c) => c.copy_id === selectedCopy);
  const isBorrowed = selectedCopyData?.is_available === 0;
  const isUserBorrowedCopy = userBorrowedBooks.includes(selectedCopy);

  const handleBorrow = async () => {
    if (!selectedCopy) {
      setError("Please select a copy");
      return;
    }
    if (!currUser?.user?.is_subscribed) {
      setError("You need to be a Subscriber to borrow books");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const response = await fetch(`/api/books/copies/${selectedCopy}/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currUser?.user?.user_id,
          due_date: dueDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to borrow book");
      }

      setBorrowSuccess(true);
      setTimeout(() => {
        setCloseDialog(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedCopy) {
      setError("Please select a copy");
      return;
    }
    if (!currUser?.user?.is_subscribed) {
      setError("You need to be a Subscriber to request books");
      return;
    }
    if (isUserBorrowedCopy) {
      setError("You cannot request a book you already borrowed");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/books/copies/${selectedCopy}/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: currUser?.user?.user_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request book");
      }

      const data = await response.json();
      setRequestSuccess(true);
      setError(null);
      setTimeout(() => {
        setCloseDialog(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={() => setCloseDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>Book Details</Typography>
        <IconButton
          onClick={() => setCloseDialog(false)}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Book Image */}
          <Box
            component="img"
            src={book.poster}
            alt={book.title}
            sx={{
              width: "100%",
              borderRadius: 1,
              boxShadow: 2,
              maxHeight: 300,
              objectFit: "cover",
            }}
          />

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.3rem",
              lineHeight: 1.3,
              mt: 1,
            }}
          >
            {book.title}
          </Typography>

          {/* Author */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonIcon sx={{ color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {book.publisher}
            </Typography>
          </Box>

          {/* Theme */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LabelIcon sx={{ color: "text.secondary" }} />
            <Chip
              label={book.theme}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            />
          </Box>

          {/* Code */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MenuBookIcon sx={{ color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Code: <strong>{book.catalog_code}</strong>
            </Typography>
          </Box>

          {/* Available Copies Section */}
          <Paper sx={{ padding: 2, backgroundColor: "#f9f9f9" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Available Copies (
              {copies.filter((c) => c.is_available === 1).length}/
              {copies.length})
            </Typography>

            {loading && !copies.length ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : copies.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No copies available
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 2,
                }}
              >
                {copies.map((copy) => (
                  <Box
                    key={copy.copy_id}
                    onClick={() => setSelectedCopy(copy.copy_id)}
                    sx={{
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      opacity: 1,
                    }}
                  >
                    {/* Copy Poster */}
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        paddingBottom: "130%",
                        mb: 1,
                        borderRadius: 1,
                        overflow: "hidden",
                        border:
                          selectedCopy === copy.copy_id
                            ? "3px solid #5eb3f6"
                            : "2px solid #e0e0e0",
                        backgroundColor: "#f5f5f5",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          border: "3px solid #5eb3f6",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={book.poster}
                        alt={`Copy ${copy.copy_id}`}
                        sx={
                          copy.is_available === 1
                            ? {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }
                            : {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: "brightness(60%)",
                              }
                        }
                      />

                      {/* Selected Checkmark */}
                      {selectedCopy === copy.copy_id && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: "#5eb3f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          ✓
                        </Box>
                      )}

                      {/* Borrowed Badge */}
                      {copy.is_available === 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            padding: "4px 8px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            borderBottomLeftRadius: 4,
                          }}
                        >
                          BORROWED
                        </Box>
                      )}
                    </Box>

                    {/* Location and Publisher Info */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: "0.7rem" }} />
                        <Typography
                          sx={{ fontSize: 10 }}
                          variant="caption"
                          color="text.secondary"
                        >
                          {copy.publisher.length > 20
                            ? copy.publisher.substring(0, 20) + "..."
                            : copy.publisher}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                          mb: 0.1,
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: "0.7rem" }} />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 500, fontSize: 10 }}
                        >
                          {copy.location.length > 15
                            ? copy.location.substring(0, 15) + "..."
                            : copy.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {borrowSuccess && (
            <Alert severity="success">
              Book borrowed successfully! Due date: 15 days from now
            </Alert>
          )}

          {requestSuccess && (
            <Alert severity="success">
              Request submitted successfully! You'll be notified when the book
              is available.
            </Alert>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={isBorrowed ? handleRequest : handleBorrow}
              disabled={loading || !selectedCopy || isUserBorrowedCopy}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                py: 1.2,
                background: isBorrowed
                  ? "linear-gradient(135deg, #ab47bc 0%, #9c27b0 100%)"
                  : "linear-gradient(135deg, #5eb3f6 0%, #5399e8 100%)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                },
                "&:disabled": {
                  opacity: 0.6,
                },
              }}
            >
              {loading
                ? isBorrowed
                  ? "Requesting..."
                  : "Borrowing..."
                : isBorrowed
                ? "Request Book"
                : "Borrow Book"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                py: 1.2,
              }}
              onClick={() => {
                setCloseDialog(false);
              }}
            >
              Go back
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
