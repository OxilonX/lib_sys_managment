import Container from "@mui/material/Container";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Card, Grid, Paper, Tabs, Tab, Box, Typography } from "@mui/material";
import {
  LocalLibrary as BooksIcon,
  People as UsersIcon,
  Favorite as SubscribersIcon,
  Check as AvailableIcon,
  Schedule as BorrowedIcon,
  SpaceDashboard as SpaceDashboardIcon,
} from "@mui/icons-material";
import "../styles/dashboardpg.css";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="stat-card">
    <Box className="stat-card-content">
      <Box
        className="stat-card-icon"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        }}
      >
        <Icon className="stat-icon" />
      </Box>
      <Box className="stat-card-info">
        <Typography className="stat-label">{title}</Typography>
        <Typography className="stat-value">{value}</Typography>
      </Box>
    </Box>
  </Card>
);

export default function DashboardPage() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const location = useLocation();

  // Fetch all data
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/books");
      const data = await response.json();
      setBooks(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch {
      // Error handled silently or can be set to state
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (location.pathname.includes("addbook")) {
      setTabValue(0);
    } else if (location.pathname.includes("booksmanagments")) {
      setTabValue(1);
    } else if (location.pathname.includes("userslist")) {
      setTabValue(2);
    }
  }, [location.pathname]);
  // Calculate statistics
  const stats = {
    totalBooks: books.length,
    totalUsers: users.length,
    subscribers: users.filter((u) => u.is_subscribed).length,
    availableBooks: books.reduce(
      (sum, book) => sum + (book.available_copies || 0),
      0
    ),
    borrowedBooks: books.reduce(
      (sum, book) =>
        sum + ((book.total_copies || 0) - (book.available_copies || 0)),
      0
    ),
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const colors = [
    "#1976d2", // blue
    "#388e3c", // green
    "#d32f2f", // red
    "#f57c00", // orange
    "#7b1fa2", // purple
  ];

  return (
    <section className="dashboard-page">
      <Container
        maxWidth="lg"
        sx={{ mt: 0, pt: 0 }}
        className="dashboard-container"
      >
        {/* Header */}
        <Box className="dashboard-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <SpaceDashboardIcon sx={{ fontSize: 38, mt: 0.5 }} />
            <h1 className="dashboard-title">Dashboard</h1>
          </div>

          {/* Statistics Grid */}
          <Grid container spacing={3} className="dashboard-stats-grid">
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Books"
                value={stats.totalBooks}
                icon={BooksIcon}
                color={colors[0]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={UsersIcon}
                color={colors[1]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Subscribers"
                value={stats.subscribers}
                icon={SubscribersIcon}
                color={colors[2]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Available Books"
                value={stats.availableBooks}
                icon={AvailableIcon}
                color={colors[3]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Borrowed Books"
                value={stats.borrowedBooks}
                icon={BorrowedIcon}
                color={colors[4]}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Navigation Tabs */}
        <Paper className="dashboard-tabs-paper">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className="dashboard-tabs"
          >
            <Tab label="Add New Book" component={Link} to="addbook" />
            <Tab
              label="Books Management"
              component={Link}
              to="booksmanagments"
            />
            <Tab label="Users Management" component={Link} to="userslist" />
          </Tabs>
        </Paper>

        {/* Display Area */}
        <div id="display-area" className="dashboard-display-area">
          <Outlet
            context={{
              books,
              loading,
              fetchBooks,
              setBooks,
              users,
              fetchUsers,
            }}
          />
        </div>
      </Container>
    </section>
  );
}
