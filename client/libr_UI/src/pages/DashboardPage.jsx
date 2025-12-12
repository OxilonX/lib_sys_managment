import React, { useState, useMemo } from "react";
// Prime React imports

// MUI Components imports
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
//MUI icons Imports
import QrCodeIcon from "@mui/icons-material/QrCode";
import AddIcon from "@mui/icons-material/Add";
import "../styles/dashboardpg.css";
import { useBooksData } from "../contexts/booksDataContext";
export default function DashboardPage() {
  const { submitNewBook, books, setBooks } = useBooksData();

  // Single State Hook for All Inputs
  const [bookInputVal, setBookInputVal] = useState({
    title: "",
    catCode: "",
    shelf: "",
    theme: "",
    poster: "",
    authors: { authors: [] },
    publishers: { publishers: [] },
  });

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setBookInputVal((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //validate all book infos before sending it
  function validateBookInput(bookInfo) {
    if (!bookInfo.title.trim()) return false;
    if (!bookInfo.shelf.trim()) return false;
    if (!bookInfo.poster) return false;
    if (!bookInfo.theme) return false;

    if (!bookInfo.authors || bookInfo.authors.length === 0) return false;
    if (!bookInfo.publishers || bookInfo.publishers.length === 0) return false;

    return true;
  }
  //Code Generation Logic
  const [usedCodes, setUsedCodes] = useState(new Set());

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
    setBookInputVal((prevData) => ({ ...prevData, catCode: newCode }));
  };

  const resetForm = () => {
    const newCode = getUniqueCode();
    setBookInputVal({
      title: "",
      catCode: newCode,
      shelf: "",
      theme: "",
      poster: "",
      authors: { authors: [] },
      publishers: { publishers: [] },
    });
  };
  const handleSubmit = async (e) => {
    if (!validateBookInput(bookInputVal)) {
      console.log(
        "Please fill in all required fields (Title, shelf, theme ,Authors, Publishers, Poster)."
      );
      return;
    }

    try {
      const result = await submitNewBook(bookInputVal);
      setUsedCodes((prev) => new Set(prev).add(bookInputVal.catCode));
      alert(`Book "${bookInputVal.title}" added successfully!`);
      setBooks((prev) => [...prev, result]);
      resetForm();
    } catch (error) {
      console.error("add book request Submission Error:", error);
      alert(`Failed to add book: ${error.message}`);
    }
  };
  return (
    <section className="dashboard-page">
      <Container maxWidth="lg">
        <div className="dashboard-section-grid">
          <form onSubmit={handleSubmit} className="book-form">
            <h1 className="form-heading">Add A New Book </h1>
            <div className="form-grid">
              {/*book Title*/}
              <TextField
                name="title"
                value={bookInputVal.title}
                onChange={(e) => handleInputChange(e)}
                label="Book Title"
                variant="outlined"
              />
              {/*book selectedTheme*/}
              <FormControl fullWidth>
                <InputLabel id="selectedTheme-select-label">Theme</InputLabel>
                <Select
                  labelId="selectedTheme-select-label"
                  id="selectedTheme-select"
                  value={bookInputVal.theme}
                  label="selectedTheme"
                  onChange={(e) =>
                    setBookInputVal((prev) => ({
                      ...prev,
                      theme: e.target.value.toString(),
                    }))
                  }
                >
                  <MenuItem value={"Action"}>Action</MenuItem>
                  <MenuItem value={"Science"}>Science</MenuItem>
                  <MenuItem value={"History"}>History</MenuItem>
                </Select>
              </FormControl>
              {/*book shelf*/}
              <TextField
                onChange={(e) => handleInputChange(e)}
                value={bookInputVal.shelf}
                label="Book shelf"
                variant="outlined"
                name="shelf"
              />
              {/*Book PosterUrl */}
              <TextField
                onChange={(e) => handleInputChange(e)}
                value={bookInputVal.poster}
                label="Poster URL"
                variant="outlined"
                name="poster"
              />
              {/*Cat code generator*/}
              <div className="inp-catgenerator">
                <TextField
                  sx={{ width: "100%" }}
                  variant="outlined"
                  disabled={true}
                  value={bookInputVal.catCode}
                />
                <Button
                  onClick={handleGenerateCode}
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    bgcolor: "#9e9e9e",
                    boxShadow: "none",
                  }}
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                >
                  generate
                </Button>
              </div>
              {/*Submit the book btn*/}
              <Button
                onClick={handleSubmit}
                sx={{ fontSize: "1rem" }}
                variant="contained"
                startIcon={<AddIcon />}
              >
                Add Book
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
