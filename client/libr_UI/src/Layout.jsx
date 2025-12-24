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
  InputAdornment,
} from "@mui/material";
import {
  Explore as ExploreIcon,
  Dashboard as DashboardIcon,
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
    { label: "My Books", icon: <BookIcon />, path: "/explore/mybooks" },
  ];

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

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
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/explore")}
            />
          </Box>

          {/* CENTER: Navigation (Desktop) */}
          {!isMobile && (
            <Box className="layout-center-section">
              <Box className="layout-nav-links">
                {menuItems.map((item) => {
                  // LOGIC FIX:
                  // 1. Exact match for specific routes (Explore vs My Books)
                  const isExact = location.pathname === item.path;
                  // 2. Parent match for Dashboard (so it stays active on sub-pages)
                  const isDashboardActive =
                    item.label === "Dashboard" &&
                    location.pathname.startsWith("/dashboard");

                  const isActive = isExact || isDashboardActive;

                  return (
                    <Button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      startIcon={item.icon}
                      className={`nav-btn ${isActive ? "active" : ""}`}
                      sx={
                        isActive
                          ? {
                              borderBottom: "2px solid",
                              borderRadius: 0,
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            }
                          : {}
                      }
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
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
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 1, color: "inherit" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Avatar
              onClick={handleProfileMenuOpen}
              className="layout-avatar"
              sx={{ cursor: "pointer", bgcolor: theme.palette.secondary.main }}
            >
              {currUser?.user?.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
                handleProfileMenuClose();
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
                handleProfileMenuClose();
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

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.label === "Dashboard" &&
                  location.pathname.startsWith("/dashboard"));
              return (
                <ListItem
                  button
                  key={item.label}
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <main className="layout-content">
        <Outlet />
      </main>
    </Box>
  );
}
