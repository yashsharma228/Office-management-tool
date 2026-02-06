import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  FaClipboardList,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronRight,
  FaSync
} from "react-icons/fa";
import "./Dashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    ongoing: 0,
  });

  const fetchTasks = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getAllTasks();
      const allTasks = Array.isArray(res) ? res : res.tasks || [];
      setTasks(allTasks);

      // ✅ calculate stats correctly
      const totalTasks = allTasks.length;
      const inProgress = allTasks.filter(t => t.status === "In Progress").length;
      const completed = allTasks.filter(t => t.status === "Completed").length;
      const ongoing = allTasks.filter(t => t.status !== "Completed").length;
      const overdue = allTasks.filter(
        t => new Date(t.due_date || t.dueDate) < new Date() && t.status !== "Completed"
      ).length;

      setStats({
        totalTasks,
        inProgress,
        completed,
        overdue,
        ongoing,
      });

    } catch (err) {
      console.error("Error fetching admin tasks:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const displayedTasks = showAll ? tasks : tasks.slice(0, 3);

  // Function to format date properly
  const formatTaskDate = (task) => {
    // Try different possible date fields
    const dateValue = task.due_date || task.dueDate || task.end_date || task.endDate || task.date;
    
    if (!dateValue) return "No date";
    
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "No date";
    
    // Format as MM/DD/YYYY
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar title="Admin Dashboard" />

      <main className="dashboard-content">
        <div className="welcome-card">
          <div>
            <h2>Welcome Admin, {user?.full_name}!</h2>
            <p>You have {stats.inProgress} tasks in progress</p>
          </div>
          <div className="calendar-icon">
            <FaCalendarAlt />
          </div>
        </div>

        {/* Refresh Button */}
        <div className="refresh-section">
          <button 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={fetchTasks}
            disabled={isRefreshing}
          >
            <FaSync className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <span className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <div>
              <h3>Total Tasks</h3>
              <p className="stat-number">{stats.totalTasks}</p>
            </div>
            <FaClipboardList className="stat-icon" />
          </div>

          <div className="stat-card yellow">
            <div>
              <h3>In Progress</h3>
              <p className="stat-number">{stats.inProgress}</p>
            </div>
            <FaClock className="stat-icon" />
          </div>

          <div className="stat-card green">
            <div>
              <h3>Completed</h3>
              <p className="stat-number">{stats.completed}</p>
            </div>
            <FaCheckCircle className="stat-icon" />
          </div>

          <div className="stat-card red">
            <div>
              <h3>Overdue</h3>
              <p className="stat-number">{stats.overdue}</p>
            </div>
            <FaExclamationTriangle className="stat-icon" />
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="recent-tasks-section">
          <div className="recent-tasks-card">
            <div className="recent-tasks-header">
              <h3>Recent Tasks</h3>
              
            </div>
            
            {tasks.length === 0 ? (
              <p className="no-tasks">No tasks found.</p>
            ) : (
              <>
                <ul className="tasks-list">
                  {displayedTasks
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(task => (
                      <li key={task.id} className="task-item">
                        <div className="task-content">
                          <h4 className="task-title">{task.title || "Untitled Task"}</h4>
                          <div className="task-details">
                            <span className="task-status">{task.status}</span>
                            <span className="task-assignee">Assigned to {task.assigneeName || "N/A"}</span>
                          </div>
                        </div>
                        <div className="task-date">
                          {formatTaskDate(task)}
                        </div>
                      </li>
                    ))}
                </ul>

                {tasks.length > 3 && (
                  <button
                    className="show-all-btn"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Show Less" : `See All (${tasks.length})`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}