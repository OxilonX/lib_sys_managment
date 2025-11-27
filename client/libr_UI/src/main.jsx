import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { UsersProvider } from "./contexts/userDataContext";
import './styles/generalStyle.css'
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UsersProvider>
      <App />
    </UsersProvider>
  </StrictMode>
);
