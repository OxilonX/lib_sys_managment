import React, { useState, useMemo, useEffect } from "react";
// Prime React imports
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Chips } from "primereact/chips";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
// MUI imports (used for Container)
import Container from "@mui/material/Container";
import "../styles/dashboardpg.css";

export default function DashboardPage() {
  const themes = useMemo(
    () => [
      { label: "Fiction", value: "FICTION" },
      { label: "Science", value: "SCIENCE" },
      { label: "History", value: "HISTORY" },
      { label: "Biography", value: "BIOGRAPHY" },
    ],
    []
  );

  // Single State Hook for All Inputs
  const [bookInputVal, setBookInputVal] = useState({
    title: "",
    catCode: "",
    location: "",
    theme: null,
    poster: "",
    authors: [],
    publishers: [],
  });

  const handleInputChange = (e) => {
    const name = e.target.name || e.target.id;
    const value = e.target.value;

    setBookInputVal((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateBookInput(bookInputVal)) return;
    setBookInputVal({
      title: "",
      catCode: "",
      location: "",
      theme: null,
      poster: null,
      authors: [],
      publishers: [],
    });
    console.log("Book Data Submitted:", bookInputVal);
  };
  //validate all book infos before sending it
  function validateBookInput(bookInfo) {
    if (!bookInfo.title.trim()) return false;
    if (!bookInfo.location.trim()) return false;
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
  const onFileSelect = (e) => {
    if (e.files && e.files.length > 0) {
      setBookInputVal((prevData) => ({
        ...prevData,
        poster: e.files[0],
      }));
    }
  };

  const onFileRemove = () => {
    setBookInputVal((prevData) => ({
      ...prevData,
      poster: null,
    }));
  };
  return (
    <section className="dashboard-page">
      <Container maxWidth="md">
        <h1 className="form-heading">Add A New Book </h1>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-grid">
            <div className="form-items-container">
              <div className="form-item">
                <FloatLabel>
                  <InputText
                    id="title"
                    className="book-inp-item p-inputtext-lg p-d-block"
                    value={bookInputVal.title}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="title">Book Title</label>
                </FloatLabel>
              </div>{" "}
              {/* Input 2: Theme/Category (Dropdown) */}
              <div className="form-item">
                <FloatLabel>
                  <Dropdown
                    id="theme"
                    name="theme"
                    value={bookInputVal.theme}
                    options={themes}
                    onChange={handleInputChange}
                    placeholder="Select a Theme"
                    className="p-inputtext-lg p-d-block"
                  />
                  <label htmlFor="theme">Book Theme</label>
                </FloatLabel>
              </div>
            </div>

            {/* Input 2: Location */}
            <div className="form-item">
              <FloatLabel>
                <InputText
                  id="location"
                  className="book-inp-item p-inputtext-lg p-d-block"
                  value={bookInputVal.location}
                  onChange={handleInputChange}
                />
                <label htmlFor="location">Location (Shelf, Aisle, etc.)</label>
              </FloatLabel>
            </div>
            {/* Input 3 & Button: Catalogue Code */}
            <div className="code-input-group">
              <div className="code-input-field">
                <FloatLabel>
                  <InputText
                    id="catCode"
                    className="book-inp-item p-inputtext-lg p-d-block"
                    value={bookInputVal.catCode}
                    onChange={handleInputChange}
                    disabled={true}
                  />
                  <label htmlFor="catCode">Catalogue Code</label>
                </FloatLabel>
              </div>
              <div className="code-generate-button">
                <Button
                  label="Generate"
                  icon="pi pi-qrcode"
                  type="button"
                  className="p-button-secondary p-d-block"
                  onClick={handleGenerateCode}
                />
              </div>
            </div>
            {/* Input 5: Poster/Image (Drag & Drop FileUpload) */}
            <div className="form-item poster-upload-item">
              <label htmlFor="poster-upload" className="chips-label">
                Book Poster (Drag & Drop)
              </label>
              <FileUpload
                id="poster-upload"
                name="poster"
                mode="basic"
                auto={false}
                customUpload={true}
                chooseLabel={
                  bookInputVal.poster
                    ? bookInputVal.poster.name
                    : "Choose Image"
                }
                onSelect={onFileSelect}
                onClear={onFileRemove}
                onRemove={onFileRemove}
                accept="image/*"
                maxFileSize={1000000}
                className="p-d-block"
              />
              <small className="p-error">
                {!bookInputVal.poster && "Please select a poster image."}
              </small>
            </div>
            {/* Input 6: Authors (Using Chips) */}
            <div className="form-item">
              <label htmlFor="authors" className="chips-label">
                Authors (Type name and press Enter)
              </label>
              <Chips
                id="authors"
                value={bookInputVal.authors}
                onChange={handleInputChange}
                className="author-chips p-d-block "
                separator=","
              />
            </div>
            {/* Input 7: Publishers (Using Chips) */}
            <div className="form-item">
              <label htmlFor="publishers" className="chips-label">
                Publishers (Type name and press Enter)
              </label>
              <Chips
                id="publishers"
                value={bookInputVal.publishers}
                onChange={handleInputChange}
                className="publisher-chips p-d-block"
              />
            </div>
            {/* Submit Button */}
            <div className="submit-item">
              <Button
                label="Submit New Book"
                icon="pi pi-plus"
                type="submit"
                className="p-button-success p-button-lg p-d-block"
              />
            </div>
          </div>
        </form>
      </Container>
    </section>
  );
}
