//style import
import "./styles/layout.css";
//React hooks imports
import { useState } from "react";
//userContext imports
import { useUsersData } from "./contexts/userDataContext";
//react router imports
import { useNavigate, Outlet } from "react-router-dom";
//PrimeReact Imports
import { Menubar } from "primereact/menubar";
import { InputText } from "primereact/inputtext";
import { Avatar } from "primereact/avatar";

//App logo Import
import logo from "./assets/icons/librix-logo.png";
export default function Layout() {
  const { currUser } = useUsersData();
  const navigate = useNavigate();
  const [items, _] = useState([
    {
      label: "Explore",
      icon: "pi pi-compass",
      className: "menu-item",
      command: () => navigate("/explore"),
    },
    ...(currUser.user.role === "admin" || currUser.user.role === "user" || true
      ? [
          {
            label: "Dashboard",
            icon: "pi pi-chart-bar",
            className: "menu-item",
            command: () => navigate("/explore/dashboard"),
          },
        ]
      : []),
    {
      label: "Trending",
      icon: "pi pi-star",
      className: "menu-item",

      command: () => navigate("/explore/trending"),
    },
    {
      label: "My books",
      icon: "pi pi-book",
      className: "menu-item",
      command: () => navigate("/explore/mybooks"),
    },
  ]);

  const start = (
    <img
      alt="logo"
      src={logo}
      height="75"
      width={"75"}
      className="mr-4 mt-1"
    ></img>
  );
  const end = (
    <div className="flex align-items-center gap-2">
      <InputText
        placeholder="Search"
        type="text"
        className="w-8rem sm:w-auto"
      />
      <Avatar
        label={currUser?.user.username?.charAt(0).toUpperCase() || "U"}
        shape="circle"
        className="user-icon p-button-primary p-4"
        onClick={() => {
          if (!currUser.success) {
            navigate("/login");
          } else {
            navigate("/profile");
          }
        }}
      />
    </div>
  );
  return (
    <>
      <header className="card">
        <Menubar
          className="header-menu"
          model={items}
          start={start}
          end={end}
        />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
