import { useState, useEffect } from "react";
import { Button, Box, Stack, TextField, InputAdornment } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Search as SearchIcon, // Added Search Icon
} from "@mui/icons-material";
import "./compStyles/userlist.css";
import { useUsersData } from "../contexts/userDataContext";

export default function UsersList() {
  const { setCurrUser, currUser } = useUsersData();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogAction, setDialogAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailPanelUser, setDetailPanelUser] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // New state for search term
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- SEARCH & FILTER LOGIC ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- PAGINATION LOGIC (Uses filteredUsers) ---
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // --- EXISTING HANDLERS ---
  const handleUserClick = async (user) => {
    setDetailPanelUser(user);
    setDetailDialogOpen(true);
    await fetchUserBorrowedBooks(user.user_id);
    await fetchUserRequests(user.user_id);
  };

  const fetchUserBorrowedBooks = async (userId) => {
    try {
      setLoadingBooks(true);
      const response = await fetch(`/api/users/${userId}/borrowed`);
      if (!response.ok) throw new Error("Failed to fetch borrowed books");
      const data = await response.json();
      setBorrowedBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchUserRequests = async (userId) => {
    try {
      setLoadingRequests(true);
      const response = await fetch(`/api/users/${userId}/requests`);
      if (!response.ok) throw new Error("Failed to fetch user requests");
      const data = await response.json();
      setUserRequests(data);
    } catch (err) {
      console.log("Error fetching requests:", err.message);
      setUserRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleOpenDialog = (user, action) => {
    setSelectedUser(user);
    setDialogAction(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setDialogAction(null);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setDetailPanelUser(null);
    setBorrowedBooks([]);
    setUserRequests([]);
    setSuccessMessage(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    try {
      let endpoint = `/api/users/${selectedUser.user_id}`;
      let method = "PUT";
      let body = {};

      if (dialogAction === "toggleSubscribe") {
        body = { is_subscribed: selectedUser.is_subscribed ? 0 : 1 };
      } else if (dialogAction === "toggleAdmin") {
        body = { role: selectedUser.role === "admin" ? "user" : "admin" };
      } else if (dialogAction === "delete") {
        method = "DELETE";
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Failed to ${dialogAction} user`);

      if (dialogAction === "delete") {
        setUsers(users.filter((u) => u.user_id !== selectedUser.user_id));
        if (detailPanelUser?.user_id === selectedUser.user_id) {
          handleCloseDetailDialog();
        }
      } else {
        const updatedUsers = users.map((u) =>
          u.user_id === selectedUser.user_id ? { ...u, ...body } : u
        );
        setUsers(updatedUsers);
        if (detailPanelUser?.user_id === selectedUser.user_id) {
          setDetailPanelUser({ ...detailPanelUser, ...body });
        }
        if (currUser?.user?.user_id === selectedUser.user_id) {
          setCurrUser((prev) => ({
            ...prev,
            user: { ...prev.user, ...body },
          }));
        }
      }
    } catch (err) {
      setError(err.message);
    }
    handleCloseDialog();
  };

  const handleCancelUserRequest = async (requestId) => {
    try {
      setCancellingRequest(true);
      const response = await fetch(`/api/books/requests/${requestId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to cancel request");
      setUserRequests(
        userRequests.filter((req) => req.request_id !== requestId)
      );
      setSuccessMessage("Request cancelled successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingRequest(false);
    }
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1)
      startPage = Math.max(1, endPage - maxVisible + 1);
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading)
    return (
      <div className="users-loading">
        <p>Loading users...</p>
      </div>
    );

  return (
    <div className="users-container">
      <Box
        className="abf-header"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          pb: 3,
        }}
      >
        <h1 className="users-title">Users Management</h1>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search username..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ backgroundColor: "white", borderRadius: "4px", width: "300px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && <div className="users-error">{error}</div>}

      {filteredUsers.length === 0 ? (
        <div className="users-empty">
          {searchTerm
            ? `No users found matching "${searchTerm}"`
            : "No users found"}
        </div>
      ) : (
        <div className="users-list-wrapper">
          <ul className="users-list">
            {currentUsers.map((user) => (
              <li
                key={user.user_id}
                className="users-list-item"
                onClick={() => handleUserClick(user)}
              >
                <div className="user-info">
                  <div className="user-avatar">
                    {user.fname[0].toUpperCase()}
                  </div>
                  <div className="user-details">
                    <p className="user-name">
                      {user.fname} {user.lname}
                    </p>
                    <p className="user-email">
                      {user.email} - @{user.username}
                    </p>
                  </div>
                </div>

                <div className="user-actions">
                  {user.role === "admin" && (
                    <span className="badge badge-primary">Admin</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(user, "toggleSubscribe");
                    }}
                    className={
                      user.is_subscribed ? "btn btn-danger" : "btn btn-success"
                    }
                  >
                    {user.is_subscribed ? "Unsubscribe" : "Subscribe"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(user, "toggleAdmin");
                    }}
                    className={
                      user.role === "admin"
                        ? "btn btn-warning"
                        : "btn btn-primary"
                    }
                  >
                    {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(user, "delete");
                    }}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination Section */}
      {filteredUsers.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-stack">
            <Button
              variant="outlined"
              startIcon={<ChevronLeftIcon />}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn pagination-prev"
            >
              Previous
            </Button>

            <div className="pagination-numbers">
              {getPaginationNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`dots-${idx}`} className="pagination-dots">
                    {page}
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "contained" : "outlined"}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-number ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outlined"
              endIcon={<ChevronRightIcon />}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn pagination-next"
            >
              Next
            </Button>
          </div>
          <div className="pagination-info">
            Page {currentPage} of {totalPages} ({filteredUsers.length} results)
          </div>
        </div>
      )}

      {/* DETAIL DIALOG */}
      {detailDialogOpen && detailPanelUser && (
        <div
          className="detail-dialog-overlay"
          onClick={handleCloseDetailDialog}
        >
          <div
            className="detail-dialog-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-dialog-header">
              <h2>User Details</h2>
              <button
                className="detail-close-btn"
                onClick={handleCloseDetailDialog}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="detail-dialog-content">
              {successMessage && (
                <div className="detail-success-message">{successMessage}</div>
              )}

              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-info-grid">
                  <div className="detail-row">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">
                      {detailPanelUser.fname} {detailPanelUser.lname}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {detailPanelUser.email}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">
                      {detailPanelUser.username}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {detailPanelUser.phone}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-badge">{detailPanelUser.role}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Borrowed Books ({borrowedBooks.length})</h3>
                {loadingBooks ? (
                  <p>Loading...</p>
                ) : borrowedBooks.length === 0 ? (
                  <p>No borrowed books</p>
                ) : (
                  <div className="borrowed-books-list">
                    {borrowedBooks.map((book) => (
                      <div key={book.copy_id} className="borrowed-book-item">
                        <div className="book-info">
                          <p className="book-title">{book.title}</p>
                          <p className="book-detail">
                            Due: {new Date(book.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {openDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-header">
              <h3>Confirm Action</h3>
            </div>
            <div className="dialog-body">
              <p>
                Are you sure you want to{" "}
                {dialogAction === "delete" ? "delete" : "update"}{" "}
                {selectedUser?.fname}?
              </p>
            </div>
            <div className="dialog-actions">
              <button
                onClick={handleConfirmAction}
                className={
                  dialogAction === "delete"
                    ? "btn btn-danger"
                    : "btn btn-primary"
                }
              >
                Confirm
              </button>
              <button onClick={handleCloseDialog} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
