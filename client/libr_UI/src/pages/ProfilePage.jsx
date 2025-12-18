import "../styles/profilepg.css";
import { useUsersData } from "../contexts/userDataContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { currUser } = useUsersData();
  const navigate = useNavigate();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  useEffect(() => {
    console.log(currUser);
  }, []);

  const handleLogout = () => {
    setOpenLogoutDialog(true);
  };

  const confirmLogout = () => {
    setOpenLogoutDialog(false);
    navigate("/login");
  };

  return (
    <section id="profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <img
            src="https://i.pravatar.cc/150?img=1"
            alt="Profile"
            className="profile-avatar"
          />
          <h1 className="profile-name">
            {currUser?.user?.fname} {currUser?.user?.lname}
          </h1>
          <p className="profile-join-date">
            {currUser?.user?.join_datetime || "Member since January 15, 2024"}
          </p>
        </div>

        <div className="profile-divider"></div>

        {/* Bio Section */}
        <div className="profile-bio-section">
          <h3 className="profile-bio-title">Bio</h3>
          <p className="profile-bio-text">
            Software developer passionate about building great applications
          </p>
        </div>

        {/* Information Grid */}
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <p className="profile-info-label">Email</p>
            <p className="profile-info-value">{currUser?.user?.email}</p>
          </div>
          <div className="profile-info-item">
            <p className="profile-info-label">Phone</p>
            <p className="profile-info-value">
              +1 (555) {currUser?.user?.phone}
            </p>
          </div>
        </div>

        <div className="profile-divider"></div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button
            className="profile-btn profile-btn-secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {openLogoutDialog && (
        <div
          className="profile-dialog-overlay"
          onClick={() => setOpenLogoutDialog(false)}
        >
          <div className="profile-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="profile-dialog-title">Confirm Logout</h2>
            <p className="profile-dialog-message">
              Are you sure you want to logout?
            </p>
            <div className="profile-dialog-actions">
              <button
                className="profile-dialog-btn profile-dialog-btn-cancel"
                onClick={() => setOpenLogoutDialog(false)}
              >
                Cancel
              </button>
              <button
                className="profile-dialog-btn profile-dialog-btn-danger"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
