import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Stack,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { QrCode as QrCodeIcon, Add as AddIcon } from "@mui/icons-material";
import { useBooksData } from "../contexts/booksDataContext";
import ChipInput from "./ChipInput";
import "./compStyles/addbook.css";
export default function AddBookForm() {
  const { submitNewBook, setBooks } = useBooksData();
  const { fetchBooks } = useOutletContext();

  const [bookInputVal, setBookInputVal] = useState({
    title: "",
    catCode: "",
    location: "",
    theme: "",
    poster: "",
    publisher: "",
    authors: [],
    keywords: [],
  });

  const [usedCodes, setUsedCodes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookInputVal((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateBookInput = (bookInfo) => {
    if (!bookInfo.title.trim()) return "Title is required";
    if (!bookInfo.location.trim()) return "Location is required";
    if (!bookInfo.poster.trim()) return "Poster URL is required";
    if (!bookInfo.theme) return "Theme is required";
    if (!bookInfo.publisher.trim()) return "Publisher is required";
    if (!bookInfo.authors || bookInfo.authors.length === 0)
      return "At least one author is required";
    return null;
  };

  const generateCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const getUniqueCode = () => {
    let code;
    do {
      code = generateCode();
    } while (usedCodes.has(code));
    setUsedCodes((prev) => new Set(prev).add(code));
    return code;
  };

  const handleGenerateCode = () => {
    const newCode = getUniqueCode();
    setBookInputVal((prev) => ({ ...prev, catCode: newCode }));
  };

  const resetForm = () => {
    const newCode = getUniqueCode();
    setBookInputVal({
      title: "",
      catCode: newCode,
      location: "",
      theme: "",
      poster: "",
      publisher: "",
      authors: [],
      keywords: [],
    });
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateBookInput(bookInputVal);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const result = await submitNewBook(bookInputVal);
      setUsedCodes((prev) => new Set(prev).add(bookInputVal.catCode));
      setBooks((prev) => [...prev, result]);
      setSuccess(true);
      resetForm();
      fetchBooks();

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorsChange = (authors) => {
    setBookInputVal((prev) => ({
      ...prev,
      authors: authors,
    }));
    setError(null);
  };

  const handleKeywordsChange = (keywords) => {
    setBookInputVal((prev) => ({
      ...prev,
      keywords: keywords,
    }));
  };

  return (
    <Box className="abf-container">
      {/* Header */}
      <Box className="abf-header" sx={{ pb: 3 }}>
        <h1 className="abf-header-title ">Add New Book</h1>
      </Box>

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(false)}
          className="abf-alert-success"
        >
          ✓ Book "{bookInputVal.title}" added successfully!
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          className="abf-alert-error"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="abf-form">
        <Stack spacing={4} className="abf-stack">
          {/* Basic Information Section */}
          <Paper className="abf-section abf-section-basic">
            <h2 className="abf-section-title">Basic Information</h2>

            <Stack spacing={2} className="abf-section-content">
              <TextField
                fullWidth
                name="title"
                value={bookInputVal.title}
                onChange={handleInputChange}
                label="Book Title"
                placeholder="Enter book title"
                variant="outlined"
                required
                className="abf-textfield"
              />

              <Box className="abf-grid-2">
                <FormControl fullWidth>
                  <InputLabel id="theme-label">Theme</InputLabel>
                  <Select
                    labelId="theme-label"
                    name="theme"
                    value={bookInputVal.theme}
                    onChange={handleInputChange}
                    label="Theme"
                    className="abf-select"
                  >
                    <MenuItem value="Action">Action</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="History">History</MenuItem>
                    <MenuItem value="Fiction">Fiction</MenuItem>
                    <MenuItem value="Romance">Romance</MenuItem>
                    <MenuItem value="Mystery">Mystery</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  name="publisher"
                  value={bookInputVal.publisher}
                  onChange={handleInputChange}
                  label="Publisher"
                  placeholder="Enter publisher name"
                  variant="outlined"
                  required
                  className="abf-textfield"
                />
              </Box>

              <TextField
                fullWidth
                name="location"
                value={bookInputVal.location}
                onChange={handleInputChange}
                label="Book Location"
                placeholder="e.g., Aisle A, Shelf 1"
                variant="outlined"
                required
                className="abf-textfield"
              />

              <TextField
                fullWidth
                name="poster"
                value={bookInputVal.poster}
                onChange={handleInputChange}
                label="Poster URL"
                placeholder="https://example.com/poster.jpg"
                variant="outlined"
                required
                type="url"
                className="abf-textfield"
              />
            </Stack>
          </Paper>

          {/* Authors & Keywords Section */}
          <Paper className="abf-section abf-section-authors">
            <h2 className="abf-section-title">Authors & Keywords</h2>

            <Stack spacing={2} className="abf-section-content">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  width: "100%",
                  alignItems: "start",
                }}
              >
                <Box>
                  <ChipInput
                    label="Authors"
                    value={bookInputVal.authors}
                    onChange={handleAuthorsChange}
                    fullWidth
                  />
                </Box>
                <Box>
                  <ChipInput
                    label="Keywords"
                    value={bookInputVal.keywords}
                    onChange={handleKeywordsChange}
                    fullWidth
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Catalog Code Section */}
          <Paper className="abf-section abf-section-code">
            <h6 className="abf-section-title abf-code-title">Catalog Code</h6>

            <Stack spacing={2} className="abf-section-content">
              <p className="abf-code-description">
                Auto-generated unique identifier for this book
              </p>

              <div className="abf-code-input-group">
                <TextField
                  fullWidth
                  disabled
                  value={bookInputVal.catCode}
                  variant="outlined"
                  className="abf-code-input"
                  inputProps={{
                    className: "abf-code-input-text",
                  }}
                />
                <Button
                  onClick={handleGenerateCode}
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  className="abf-generate-btn"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: "600",
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    boxShadow: " 0 4px 12px rgba(25, 118, 210, 0.3)",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    transition: " all 0.3s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  Generate
                </Button>
              </div>
            </Stack>
          </Paper>

          {/* Submit Button */}
          <Box className="abf-actions">
            <Button
              type="reset"
              variant="outlined"
              onClick={() => {
                setError(null);
                resetForm();
              }}
              className="abf-reset-btn"
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              className="abf-submit-btn"
            >
              {loading ? "Adding Book..." : "Add Book"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
}
