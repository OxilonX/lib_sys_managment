import { useState } from "react";

import Container from "@mui/material/Container";
import { useUsersData } from "../contexts/userDataContext";
import "../styles/explorePage.css";
//components imports
import BookInfos from "../components/BookInfos";
export default function ExplorePage() {
  const { currUser, setCurrUser } = useUsersData();
  const [isOpenBookDialog, setIsOperBookDialog] = useState(false);
  const [currBook, setCurrBook] = useState(null);
  const booksUI = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      theme: "FICTION",
      code: "GTSBY001",
      posterUrl:
        "data:image/jpeg;base64,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",
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
              <div
                key={book.id}
                onClick={() => {
                  setCurrBook(book);
                  setIsOperBookDialog(true);
                }}
                className="book-card"
              >
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
        {isOpenBookDialog && (
          <div id="book-info-dialog">
            <BookInfos book={currBook} setCloseDialog={setIsOperBookDialog} />
          </div>
        )}
      </Container>
    </section>
  );
}
