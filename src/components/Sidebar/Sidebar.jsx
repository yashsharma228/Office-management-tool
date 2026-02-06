import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import logog from "../../assests/logog.png";
import {
  FaTachometerAlt,
  FaMoneyBillWave,
  FaTasks,
  FaUsers,
  FaChartBar,
  FaClipboardList,
  FaCalendarAlt,
  FaBook,
  FaUserClock,
  FaFileAlt,
  FaBell,
  FaFolderOpen,
  FaCommentDots,
} from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <img src={logog} alt="Company Logo" className="logo-img" />
          <h2 className="sidebar-title">
            GeoPlanet Solution <br />
            Pvt. Ltd.
          </h2>
        </div>

        {/* Menu Heading */}
        <h3 className="menu-heading">MENU</h3>

        {/* Navigation */}
        <ul className="sidebar-menu">
          {/* Common for ALL users */}
          <li>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "active" : ""}
            >
              <FaTachometerAlt className="menu-icon" /> Dashboard
            </Link>
          </li>

          {/* Admin Menu */}
          {user?.role === "admin" && (
            <>
              <li>
                <Link
                  to="/expenses"
                  className={location.pathname === "/expenses" ? "active" : ""}
                >
                  <FaMoneyBillWave className="menu-icon" /> Office Expenses
                </Link>
              </li>
              <li>
                <Link
                  to="/create-task"
                  className={
                    location.pathname === "/create-task" ? "active" : ""
                  }
                >
                  <FaTasks className="menu-icon" /> Create Task
                </Link>
              </li>
              <li>
                <Link
                  to="/taskBoard"
                  className={location.pathname === "/taskBoard" ? "active" : ""}
                >
                  <FaClipboardList className="menu-icon" /> Task Board
                </Link>
              </li>
              <li>
                <Link
                  to="/user-manage"
                  className={
                    location.pathname === "/user-manage" ? "active" : ""
                  }
                >
                  <FaUsers className="menu-icon" /> User Management
                </Link>
              </li>
              <li>
                <Link
                  to="/reports"
                  className={location.pathname === "/reports" ? "active" : ""}
                >
                  <FaChartBar className="menu-icon" /> Reports
                </Link>
              </li>
            </>
          )}

          {/* User Menu */}
          {user?.role === "user" && (
            <>
              <li>
                <Link
                  to="/expenses"
                  className={location.pathname === "/expenses" ? "active" : ""}
                >
                  <FaMoneyBillWave className="menu-icon" /> Office Expenses
                </Link>
              </li>
              <li>
                <Link
                  to="/mytask"
                  className={location.pathname === "/mytask" ? "active" : ""}
                >
                  <FaTasks className="menu-icon" /> My Task
                </Link>
              </li>
              <li>
                <Link
                  to="/assign"
                  className={location.pathname === "/assign" ? "active" : ""}
                >
                  <FaFileAlt className="menu-icon" /> Application
                </Link>
              </li>
              <li>
                <Link
                  to="/notebook"
                  className={location.pathname === "/notebook" ? "active" : ""}
                >
                  <FaBook className="menu-icon" /> Notebook
                </Link>
              </li>
              <li>
                <Link
                  to="/attendence"
                  className={
                    location.pathname === "/attendence" ? "active" : ""
                  }
                >
                  <FaUserClock className="menu-icon" /> Attendance
                </Link>
              </li>
            </>
          )}

          {/* Common for ALL users (Admin + User) */}
          <li>
            <Link
              to="/calender"
              className={location.pathname === "/calender" ? "active" : ""}
            >
              <FaCalendarAlt className="menu-icon" /> Calendar
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className={location.pathname === "/notifications" ? "active" : ""}
            >
              <FaBell className="menu-icon" /> Notifications
            </Link>
          </li>
          <li>
            <Link
              to="/documents"
              className={location.pathname === "/documents" ? "active" : ""}
            >
              <FaFolderOpen className="menu-icon" /> Documents
            </Link>
          </li>
          <li>
            <Link
              to="/complainBox"
              className={location.pathname === "/complainBox" ? "active" : ""}
            >
              <FaCommentDots className="menu-icon" /> Complain Box
            </Link>
          </li>
        </ul>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="user-info user-info-button"
            onClick={() => setShowProfileModal(true)}
            aria-label="Open user info"
          >
            <img src="/default-user.png" alt="User" className="user-avatar" />
            <div>
              <p className="user-name">{user?.full_name || "User"}</p>
              <p className="user-role">{(user?.role || "user").toUpperCase()}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="profile-modal-backdrop"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <h3 id="profile-modal-title">👤 Profile</h3>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setShowProfileModal(false)}
              >
                ×
              </button>
            </div>

            <div className="profile-modal-body">
              <div className="profile-row">
                <span className="profile-label">Full Name:</span>
                <span className="profile-value">{user?.full_name || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Role:</span>
                <span className="profile-value">{user?.role || "user"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{user?.email || "—"}</span>
              </div>
            </div>

            <div className="profile-modal-footer">
              <button
                type="button"
                className="logout-btn"
                onClick={() => {
                  setShowProfileModal(false);
                  handleLogout();
                }}
              >
                🚪 Sign Out
              </button>
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
