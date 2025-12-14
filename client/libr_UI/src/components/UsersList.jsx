import { useState, useEffect } from "react";
import "./compStyles/userlist.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogAction, setDialogAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState();

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

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      let endpoint = `/api/users/${selectedUser.user_id}`;
      let method = "PUT";
      let body = {};

      if (dialogAction === "subscribe") {
        body = { is_subscribed: 1 };
      } else if (dialogAction === "makeAdmin") {
        body = { role: "admin" };
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
      } else {
        setUsers(
          users.map((u) =>
            u.user_id === selectedUser.user_id ? { ...u, ...body } : u
          )
        );
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

  // Pagination logic
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
      <h2 className="users-title">Users Management</h2>

      {error && <div className="users-error">{error}</div>}

      {users.length === 0 ? (
        <div className="users-empty">No users found</div>
      ) : (
        <div className="users-list-wrapper">
          <ul className="users-list">
            {currentUsers.map((user) => (
              <li key={user.user_id} className="users-list-item">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.fname[0].toUpperCase()}
                  </div>
                  <div className="user-details">
                    <p className="user-name">
                      {user.fname} {user.lname}
                    </p>
                    <p className="user-email">
                      {user.email} • {user.username}
                    </p>
                  </div>
                </div>

                <div className="user-actions">
                  {user.is_subscribed ? (
                    <span className="badge badge-success">Subscribed</span>
                  ) : (
                    <span className="badge badge-default">Not Subscribed</span>
                  )}

                  {user.role === "admin" && (
                    <span className="badge badge-primary">Admin</span>
                  )}

                  {!user.is_subscribed && (
                    <button
                      onClick={() => handleOpenDialog(user, "subscribe")}
                      className="btn btn-success"
                    >
                      Subscribe
                    </button>
                  )}

                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleOpenDialog(user, "makeAdmin")}
                      className="btn btn-primary"
                    >
                      Make Admin
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDialog(user, "delete")}
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

      {/* Pagination */}
      {users.length > 0 && (
        <div className="pagination-container">
          <button
            className="pagination-btn pagination-prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="pagination-numbers">
            {getPaginationNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="pagination-dots">
                  {page}
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className="pagination-btn pagination-next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>

          <div className="pagination-info">
            Page {currentPage} of {totalPages} ({users.length} total)
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
                {dialogAction === "subscribe" &&
                  `Make ${selectedUser?.fname} a subscriber?`}
                {dialogAction === "makeAdmin" &&
                  `Make ${selectedUser?.fname} an admin?`}
                {dialogAction === "delete" &&
                  `Delete ${selectedUser?.fname}? This action cannot be undone.`}
              </p>
            </div>
            <div className="dialog-actions">
              <button onClick={handleCloseDialog} className="btn btn-secondary">
                Cancel
              </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
