import { useState, useEffect } from "react";
import { Button, Box, Stack } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
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
  const [loadingBooks, setLoadingBooks] = useState(false);

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

  const handleUserClick = async (user) => {
    setDetailPanelUser(user);
    setDetailDialogOpen(true);
    await fetchUserBorrowedBooks(user.user_id);
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
        const updatedUserFields = { ...body };
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
            user: {
              ...prev.user,
              ...updatedUserFields,
            },
          }));
        }
      }
    } catch (err) {
      setError(err.message);
    }

    handleCloseDialog();
  };

  if (loading) {
    return (
      <div className="users-loading">
        <p>Loading users...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="users-container">
      <Box className="abf-header">
        <h1 className="users-title">Users Management</h1>
      </Box>

      {error && <div className="users-error">{error}</div>}

      {users.length === 0 ? (
        <div className="users-empty">No users found</div>
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
                      {user.email} - {user.username}
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

      {/* Pagination with MUI */}
      {users.length > 0 && (
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
            Page {currentPage} of {totalPages} ({users.length} total)
          </div>
        </div>
      )}

      {/* Detail Dialog */}
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
              {/* Personal Information Section */}
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
                    <span className="detail-label">Age:</span>
                    <span className="detail-value">{detailPanelUser.age}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {detailPanelUser.phone}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">
                      {detailPanelUser.address}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">State:</span>
                    <span className="detail-value">
                      {detailPanelUser.state}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value detail-badge">
                      {detailPanelUser.role}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Subscribed:</span>
                    <span className="detail-value">
                      {detailPanelUser.is_subscribed ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Borrowed Books Section */}
              <div className="detail-section">
                <h3>Borrowed Books ({borrowedBooks.length})</h3>
                {loadingBooks ? (
                  <p className="detail-loading">Loading books...</p>
                ) : borrowedBooks.length === 0 ? (
                  <p className="detail-empty">No borrowed books</p>
                ) : (
                  <div className="borrowed-books-list">
                    {borrowedBooks.map((book) => (
                      <div key={book.copy_id} className="borrowed-book-item">
                        <div className="book-cover">
                          {book.poster ? (
                            <img src={book.poster} alt={book.title} />
                          ) : (
                            <div className="book-cover-placeholder">
                              {book.title[0]}
                            </div>
                          )}
                        </div>
                        <div className="book-info">
                          <p className="book-title">{book.title}</p>
                          <p className="book-detail">
                            <strong>Theme:</strong> {book.theme}
                          </p>
                          <p className="book-detail">
                            <strong>Publisher:</strong> {book.publisher}
                          </p>
                          <p className="book-detail">
                            <strong>Location:</strong> {book.location}
                          </p>
                          <p className="book-detail">
                            <strong>Borrowed:</strong>{" "}
                            {new Date(book.borrowed_date).toLocaleDateString()}
                          </p>
                          <p className="book-detail">
                            <strong>Due:</strong>{" "}
                            {new Date(book.due_date).toLocaleDateString()}
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

      {/* Confirmation Dialog */}
      {openDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-header">
              <h3>Confirm Action</h3>
            </div>
            <div className="dialog-body">
              <p>
                {dialogAction === "toggleSubscribe" &&
                  `${
                    selectedUser?.is_subscribed ? "Unsubscribe" : "Subscribe"
                  } ${selectedUser?.fname}?`}
                {dialogAction === "toggleAdmin" &&
                  `${
                    selectedUser?.role === "admin"
                      ? "Remove admin from"
                      : "Make admin"
                  } ${selectedUser?.fname}?`}
                {dialogAction === "delete" &&
                  `Delete ${selectedUser?.fname}? This action cannot be undone.`}
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
