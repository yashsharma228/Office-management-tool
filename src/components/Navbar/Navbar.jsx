import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { FaBell } from "react-icons/fa";
import Notify from "../../pages/Notify";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function Navbar({ title = "Dashboard" }) {
  const [showRequests, setShowRequests] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

useEffect(() => {
  if (user?.role === "admin") {
    // Remove auto-calling
    fetchPendingUsers(); // Only fetch once on page load
  }
}, [user]);

  const fetchPendingUsers = async () => {
    try {
      const users = await api.getPendingUsers();
      setPendingUsers(users);
      setNotificationCount(users.length);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  const handleApprove = async (userId) => {
    if (window.confirm('Are you sure you want to approve this user?')) {
      setLoading(true);
      try {
        await api.approveUser(userId);
        alert(`✅ User approved successfully!`);
        fetchPendingUsers(); // Refresh the list
      } catch (error) {
        alert('Error approving user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user? This action cannot be undone and will delete the user account.')) {
      setLoading(true);
      try {
        await api.rejectUser(userId);
        alert(`❌ User rejected and removed!`);
        fetchPendingUsers(); // Refresh the list
      } catch (error) {
        alert('Error rejecting user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

const handleNotificationClick = async () => {
  if (user?.role === "admin") {
    // Fetch fresh data only when admin opens notifications
    await fetchPendingUsers();
    setShowRequests(!showRequests);
  } else {
    alert("You don't have any pending notifications.");
  }
};

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="brand-name">{title}</span>
        <span className="user-greeting">
          Hello, {user?.full_name || "User"}! 👋
        </span>
      </div>

      <div className="navbar-right">
        {/* Search Bar */}
        <div className="navbar-search">
          <input type="text" placeholder="Search..." />
        </div>

        {/* Notification Icon - Show for both Admin and User */}
        <div
          className="navbar-icon"
          title={user?.role === "admin" ? "Admin Notifications" : "Notifications"}
          onClick={handleNotificationClick}
        >
          <FaBell />
          {user?.role === "admin" && notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </div>

        {/* Pending Requests Window - Only for Admin */}
        {showRequests && user?.role === "admin" && (
          <Notify
            pendingUsers={pendingUsers}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </nav>
  );
}