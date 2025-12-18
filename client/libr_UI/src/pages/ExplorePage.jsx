import { useEffect, useState } from "react";

import Container from "@mui/material/Container";
import { useUsersData } from "../contexts/userDataContext";
import "../styles/explorePage.css";

export default function ExplorePage() {
  const { currUser, setCurrUser } = useUsersData();
  const booksUI = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      theme: "FICTION",
      code: "GTSBY001",
      posterUrl:
        "https://m.media-amazon.com/images/P/0743273567.01._SXTZM_.jpg",
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
        "https://m.media-amazon.com/images/P/0062316095.01._SXTZM_.jpg",
      location: "Aisle C, Shelf 4",
      isAvailable: true,
    },
  ];
  return (
    <section id="explore-page">
      <Container maxWidth="lg">
        <h1 className="explore-heading">Explore Our Catalogue</h1>
        <div className="books-container">
          <div className="books-grid">
            {booksUI.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-image-wrapper">
                  <img
                    src={book.posterUrl}
                    alt={book.title}
                    className="book-image"
                  />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
