import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

//Styles import
import "./styles/generalStyle.css";

//Constexts imports
import { UsersProvider } from "./contexts/userDataContext";
import { BooksProvider } from "./contexts/booksDataContext.jsx";

import "./themes/custom/theme.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BooksProvider>
      <UsersProvider>
        <App />
      </UsersProvider>
    </BooksProvider>
  </StrictMode>
);
