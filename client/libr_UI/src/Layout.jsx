import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  Avatar,
  Menu,
  MenuItem,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  InputAdornment,
} from "@mui/material";
import {
  Explore as ExploreIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useUsersData } from "./contexts/userDataContext";
import { useBooksData } from "./contexts/booksDataContext";
import logo from "./assets/icons/librix-logo.png";
import "./styles/layout.css";

export default function Layout() {
  const { currUser } = useUsersData();
  const { searchQuery, setSearchQuery } = useBooksData();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isExplorePage = location.pathname.includes("/explore");
  const isDashboardPage = location.pathname.includes("/dashboard");

  const menuItems = [
    { label: "Explore", icon: <ExploreIcon />, path: "/explore" },
    ...(currUser?.user?.role === "admin"
      ? [
          {
            label: "Dashboard",
            icon: <DashboardIcon />,
            path: "/dashboard/booksmanagments",
          },
        ]
      : []),
    ...(currUser?.user?.role === "user"
      ? [{ label: "My Books", icon: <BookIcon />, path: "/explore/mybooks" }]
      : []),
  ];

  // REMOVED: Users Management Tab
  const dashboardTabs = [
    { label: "Books Management", path: "/dashboard/booksmanagments" },
    { label: "Add New Book", path: "/dashboard/addbook" },
  ];

  const getActiveTab = () => {
    const index = dashboardTabs.findIndex(
      (tab) => location.pathname === tab.path
    );
    return index === -1 ? 0 : index;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0} className="layout-appbar">
        <Toolbar className="layout-toolbar">
          {/* LEFT: Logo */}
          <Box className="layout-left-section">
            <img
              src={logo}
              alt="Librix"
              className="layout-logo"
              onClick={() => navigate("/explore")}
            />
          </Box>

          {/* CENTER: Navigation (Desktop) */}
          {!isMobile && (
            <Box className="layout-center-section">
              {isDashboardPage ? (
                <Tabs
                  value={getActiveTab()}
                  onChange={(e, v) => navigate(dashboardTabs[v].path)}
                  className="layout-tabs"
                  centered
                >
                  {dashboardTabs.map((tab) => (
                    <Tab key={tab.path} label={tab.label} />
                  ))}
                </Tabs>
              ) : (
                <Box className="layout-nav-links">
                  {menuItems.map((item) => (
                    <Button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className={`nav-btn ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                      startIcon={item.icon}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* RIGHT: Search & Profile */}
          <Box className="layout-right-section">
            {!isMobile && isExplorePage && (
              <TextField
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="layout-search-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="layout-avatar"
            >
              {currUser?.user?.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/login");
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Box sx={{ color: "error.main" }}>Logout</Box>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {(isDashboardPage ? dashboardTabs : menuItems).map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <main className="layout-content">
        <Outlet />
      </main>
    </Box>
  );
}
