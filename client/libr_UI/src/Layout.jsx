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
  Select,
  FormControl,
  InputLabel,
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
  const { currUser, logoutUser } = useUsersData();
  const { searchQuery, setSearchQuery } = useBooksData();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [filterType, setFilterType] = useState("all");
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

          {!isMobile && (
            <Box className="layout-center-section">
              <Box className="layout-nav-links">
                {menuItems.map((item) => {
                  const isExact = location.pathname === item.path;

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

          {/* Search anwddasdasdws Profile */}
          <Box className="layout-right-section">
            {!isMobile && isExplorePage && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "24px",
                  padding: "2px 8px",
                  gap: 0,
                  transition: "all 0.3s ease",
                  border: "1px solid transparent",
                  "&:focus-within": {
                    backgroundColor: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #5eb3f6",
                  },
                }}
              >
                {/* Search Category Dropdown */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    variant="standard" // Use standard to remove the box outline
                    disableUnderline
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#64748b",
                      px: 1,
                    }}
                  >
                    <MenuItem value="all">All Fields</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="publisher">Publisher</MenuItem>
                    <MenuItem value="keywords">Keywords</MenuItem>
                    <MenuItem value="catCode">Catalog Code</MenuItem>
                  </Select>
                </FormControl>

                {/* Vertical Divider Line */}
                <Box
                  sx={{
                    width: "1px",
                    height: "20px",
                    bgcolor: "#cbd5e1",
                    mx: 1,
                  }}
                />

                {/* Search Text Field */}
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          fontSize="small"
                          sx={{ color: "#64748b" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: { xs: "150px", sm: "200px" },
                    "& .MuiInputBase-input": {
                      fontSize: "0.9rem",
                      py: 1,
                    },
                  }}
                />
              </Box>
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
                logoutUser();
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
        <Outlet context={{ filterType }} />
      </main>
    </Box>
  );
}
