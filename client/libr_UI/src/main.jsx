import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
//Constexts imports
import { UsersProvider } from "./contexts/userDataContext";
import { BooksProvider } from "./contexts/booksDataContext.jsx";

//Prime REACT Library imports
import "primereact/resources/themes/bootstrap4-light-blue/theme.css"; // theme
import "primereact/resources/primereact.min.css"; // core css
import "primeicons/primeicons.css"; // icons
import "primeflex/primeflex.css";
import "../public/themes/custom/theme.css";
//Styles import
import "./styles/generalStyle.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BooksProvider>
      <UsersProvider>
        <App />
      </UsersProvider>
    </BooksProvider>
  </StrictMode>
);
