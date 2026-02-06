import React, { useState, useEffect } from "react";
import "./UserManage.css";
import { FaSearch, FaPlus, FaTrash, FaBuilding, FaClock, FaPlay, FaPause, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { api } from "../services/api";

export default function UserManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userTasks, setUserTasks] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Optional static departments section
  const departments = [
    { name: "Administration", members: 0 },
    { name: "Operations", members: 0 },
    { name: "Development", members: 0 },
    { name: "Design", members: 0 },
    { name: "Marketing", members: 0 },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const rows = await api.getApprovedUsers();
      const mapped = (rows || []).map((r) => ({
        id: r.id,
        name: r.full_name,
        email: r.email,
        role: r.role || "user",
        department: r.department || "Operations",
        contact: r.contact_number || "—",
        activeTasks: 0,
      }));
      setUsers(mapped);
      
      // Fetch task stats for each user
      fetchTaskStatsForUsers(mapped);
    } catch (e) {
      console.error("Error loading users:", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTaskStatsForUsers = async (usersList) => {
    try {
      const tasksData = {};
      
      // Fetch tasks for each user
      for (const user of usersList) {
        try {
          const tasks = await api.getUserTasks(user.id);
          
          // Count tasks by status
          const pendingTasks = tasks.filter(task => 
            task.status === "Pending" || task.status === "pending"
          );
          
          const notStartedTasks = tasks.filter(task => 
            task.status === "Not Started" || task.status === "not_started"
          );
          
          const inProgressTasks = tasks.filter(task => 
            task.status === "In Progress" || task.status === "in_progress"
          );
          
          tasksData[user.id] = {
            pending: pendingTasks,
            notStarted: notStartedTasks,
            inProgress: inProgressTasks,
            totalActive: pendingTasks.length + notStartedTasks.length + inProgressTasks.length
          };
        } catch (error) {
          console.error(`Error fetching tasks for user ${user.id}:`, error);
          tasksData[user.id] = {
            pending: [],
            notStarted: [],
            inProgress: [],
            totalActive: 0
          };
        }
      }
      
      setUserTasks(tasksData);
      
      // Update users with active task counts
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          activeTasks: tasksData[user.id]?.totalActive || 0
        }))
      );
    } catch (error) {
      console.error("Error fetching task stats:", error);
    }
  };

  const toggleUserTasks = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Call API to delete user from database
      await api.deleteUser(userToDelete.id);
      
      // Remove user from local state
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Show success message (you could add a toast notification here)
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      // Show error message (you could add a toast notification here)
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const TaskStatusBadge = ({ status, count }) => {
    let bgColor, icon;
    
    switch(status) {
      case "pending":
        bgColor = "#f59e0b";
        icon = <FaClock />;
        break;
      case "notStarted":
        bgColor = "#ef4444";
        icon = <FaPause />;
        break;
      case "inProgress":
        bgColor = "#3b82f6";
        icon = <FaPlay />;
        break;
      default:
        bgColor = "#6b7280";
        icon = <FaCheck />;
    }
    
    return (
      <span 
        className="task-status-badge"
        style={{ backgroundColor: bgColor }}
      >
        {icon} {count}
      </span>
    );
  };

  const TaskList = ({ tasks, status }) => {
    if (!tasks || tasks.length === 0) {
      return <div className="no-tasks">No {status} tasks</div>;
    }
    
    return (
      <div className="task-list">
        {tasks.map((task, index) => (
          <div key={index} className="task-item">
            <div className="task-title">{task.title}</div>
            <div className="task-due-date">
              {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : "No due date"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Sidebar />
      <Navbar title="User Management" />
      <div className="user-management-container">
        {/* Header */}
        <div className="header">
          <div>
            <h2>User Management</h2>
            <p>Manage team members and their roles</p>
          </div>
          <button className="add-user-btn">
            <FaPlus /> Add User
          </button>
        </div>

        {/* Search & Filter */}
        <div className="filter-section">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select>
            <option>All Departments</option>
            {departments.map((dept, index) => (
              <option key={index}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Department Cards */}
        <div className="department-cards">
          {departments.map((dept, index) => (
            <div className="card" key={index}>
              <FaBuilding className="card-icon" />
              <div>
                <h4>{dept.name}</h4>
                <p>{dept.members} members</p>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="table-container">
          <h3>Team Members</h3>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Active Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="user-row">
                        <td>
                          <div className="user-info">
                            <div className="avatar">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <strong>{user.name}</strong>
                              <p>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`role-badge ${
                              user.role === "admin" ? "admin" : "user"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>{user.department || "—"}</td>
                        <td>{user.contact || "—"}</td>
                        <td>
                          <div className="active-tasks-container">
                            <div className="task-badges">
                              <TaskStatusBadge 
                                status="pending" 
                                count={userTasks[user.id]?.pending.length || 0} 
                              />
                              <TaskStatusBadge 
                                status="notStarted" 
                                count={userTasks[user.id]?.notStarted.length || 0} 
                              />
                              <TaskStatusBadge 
                                status="inProgress" 
                                count={userTasks[user.id]?.inProgress.length || 0} 
                              />
                            </div>
                            <button 
                              className="view-tasks-btn"
                              onClick={() => toggleUserTasks(user.id)}
                            >
                              {expandedUser === user.id ? (
                                <>
                                  <FaChevronUp /> Hide Details
                                </>
                              ) : (
                                <>
                                  <FaChevronDown /> View Tasks
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td>
                          <FaTrash 
                            className="action-icon delete" 
                            onClick={() => handleDeleteClick(user)}
                            title="Delete User"
                          />
                        </td>
                      </tr>
                      {expandedUser === user.id && (
                        <tr className="tasks-detail-row">
                          <td colSpan="6">
                            <div className="tasks-detail">
                              <div className="tasks-section">
                                <h4>Pending Tasks ({userTasks[user.id]?.pending.length || 0})</h4>
                                <TaskList 
                                  tasks={userTasks[user.id]?.pending} 
                                  status="pending" 
                                />
                              </div>
                              <div className="tasks-section">
                                <h4>Not Started Tasks ({userTasks[user.id]?.notStarted.length || 0})</h4>
                                <TaskList 
                                  tasks={userTasks[user.id]?.notStarted} 
                                  status="not started" 
                                />
                              </div>
                              <div className="tasks-section">
                                <h4>In Progress Tasks ({userTasks[user.id]?.inProgress.length || 0})</h4>
                                <TaskList 
                                  tasks={userTasks[user.id]?.inProgress} 
                                  status="in progress" 
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to remove {userToDelete?.name} from your company?</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={confirmDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}