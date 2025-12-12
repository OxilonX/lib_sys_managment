import React, { useMemo } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Container from "@mui/material/Container";
import { useUsersData } from "../contexts/userDataContext";
import "../styles/explorePage.css";

// --- DUMMY DATA ---
const famousBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    theme: "FICTION",
    code: "GTSBY001",
    posterUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlTLy83B1autfRatTNAEMS1G33vyIojqgUZf_x-NHmJo4eKpt2vmuFQe-3AyVD0UhJfwrN2VQbBmEUlUc_YC2soSsvChHxetQoM2lIqWSd&s=10",
    location: "Aisle A, Shelf 1",
    isAvailable: true,
  },
  {
    id: 2,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    theme: "HISTORY",
    code: "SPNSR002",
    posterUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTegjx-kkY7BXB5tjrpGFccEd2dUbQFBCr3z7dpOzrUwPHJAQ7r-wXgktpKNOCuW2exFEhXFicSSO1O5nZ3ysUY4nEj3js3tGGyUy8_GDo-SA&s=10",
    location: "Aisle C, Shelf 4",
    isAvailable: true,
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    theme: "FICTION",
    code: "TKMBD003",
    posterUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa46V0uks4vTewj6PitrB2Hi1iu_nhj8nmQynGIuwwCh4SUDkaWgjoKZMWgFjw5q7hZc05H0aEgwwGxrrj_crkvLUbAGpEtrLHJFu-6lM1kg&s=10",
    location: "Aisle A, Shelf 2",
    isAvailable: false,
  },
  {
    id: 4,
    title: "Cosmos",
    author: "Carl Sagan",
    theme: "SCIENCE",
    code: "CMSGS004",
    posterUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxZ__ZSieh18BUKZGckfaZAVaS3pcFBfFy-vhI7l1zBqKzUwRHtzL8udTuzUw6ux0RsdjT9lPtXcbFAyJoiRpD8mg3J9cxg3qqRwCjmEtu8Q&s=10",
    location: "Aisle E, Shelf 7",
    isAvailable: true,
  },
];
export default function ExplorePage() {
  const { currUser, setCurrUser } = useUsersData();

  const header = (book) => (
    <img alt={book.title} src={book.poster} className="book-card-poster" />
  );

  const footer = (book) => (
    <div className="card-footer">
      <div
        className={`book-status ${
          book.isAvailable ? "available" : "unavailable"
        }`}
      >
        {book.isAvailable ? "Available" : "Unavailable"}
      </div>
      <Button
        label="View Details"
        icon="pi pi-eye"
        className="p-button-sm"
        disabled={!book.isAvailable && currUser.role !== "admin"}
      />
    </div>
  );

  return (
    <section id="explore-page">
      <Container maxWidth="lg">
        <h1 className="explore-heading">
          Explore Our Catalogue
          {currUser && currUser.role === "admin"
            ? ` (Admin View)`
            : ` (${famousBooks.length} Total Books)`}
        </h1>

        <div className="books-grid">
          {famousBooks.map((book) => (
            <Card
              key={book.id}
              title={book.title}
              subTitle={book.author}
              header={header(book)}
              footer={footer(book)}
              className="book-card p-shadow-3"
            >
              <div className="book-details">
                <p>
                  <strong>Theme:</strong> {book.theme}
                </p>
                <p>
                  <strong>Code:</strong> {book.code}
                </p>
                <p>
                  <strong>Location:</strong> {book.location}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
