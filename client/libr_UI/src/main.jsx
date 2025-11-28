import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { UsersProvider } from "./contexts/userDataContext";
//styles import
import "./styles/generalStyle.css";
//Prime REACT imports
import "primereact/resources/themes/saga-orange/theme.css"; // theme
import "primereact/resources/primereact.min.css"; // core css
import "primeicons/primeicons.css"; // icons
import "primeflex/primeflex.css";
import "../public/themes/custom/theme.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UsersProvider>
      <App />
    </UsersProvider>
  </StrictMode>
);
