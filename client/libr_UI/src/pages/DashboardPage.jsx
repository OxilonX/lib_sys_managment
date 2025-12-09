import "../styles/dashboardpg.css";
//Prime React imports
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { useState } from "react";
//MUI imports
import Container from "@mui/material/Container";
export default function DashboardPage() {
  //data table in prime react u need it for users list
  const [bookInputVal, setBookInputVal] = useState({
    title: "",
    catCode: "",
    location: "",
    theme: "",
    poster: "",
    authors: [],
    publishers: [],
  });
  //generate unique cat code
  const [usedCodes, setUsedCodes] = useState(new Set());
  function generateCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function getUniqueCode() {
    let code;
    do {
      code = generateCode();
    } while (usedCodes.has(code));

    setUsedCodes((prev) => new Set(prev).add(code));
    return code;
  }
  return (
    <section className="dasboard-page">
      <Container>
        <h1 style={{ padding: "50px 0 24px", margin: "0" }}>
          Add A New Book :
        </h1>
        <div
          className="flex justify-content-start gap-2 "
          style={{ flexDirection: "column" }}
        >
          <FloatLabel>
            <InputText
              className="book-inp-item "
              id="book-title"
              value={bookInputVal.title}
            />
            <label htmlFor="book-title">Book Title</label>
          </FloatLabel>
          <FloatLabel>
            <InputText
              className="book-inp-item"
              id="book-location"
              value={bookInputVal.location}
            />
            <label htmlFor="book-location">location</label>
          </FloatLabel>
          <div id="theme-pick"></div>
        </div>
      </Container>
    </section>
  );
}
