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
} from "react-icons/fa";
import "./Dashboard.css";

export default function UserDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    ongoing: 0,
  });

  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch tasks and stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const tasks = await api.getUserTasks(user.id);

        const ongoing = tasks.filter((t) => t.status !== "Completed").length;
        const inProgress = tasks.filter((t) => t.status === "In Progress")
          .length;
        const completed = tasks.filter((t) => t.status === "Completed").length;
        const overdue = tasks.filter(
          (t) => new Date(t.due_date) < new Date() && t.status !== "Completed"
        ).length;

        setStats({
          totalTasks: tasks.length,
          inProgress,
          completed,
          overdue,
          ongoing,
        });

        setInProgressTasks(tasks.filter((t) => t.status === "In Progress"));
      } catch (err) {
        console.error("Error fetching user tasks:", err);
      }
    };

    fetchStats();
  }, [user]);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user) return;

      try {
        const activities = await api.getUserActivities(user.id); // implement this API
        setRecentActivities(activities);
      } catch (err) {
        console.error("Error fetching recent activities:", err);
      }
    };

    fetchRecentActivities();
  }, [user]);

  return (
    <div className="dashboard">
      <Sidebar />
      <Navbar title="User Dashboard" />
      <main className="dashboard-content">
        <div className="dashboard">
          {/* Welcome Card */}
          <div className="welcome-card">
            <div>
              <h2>Welcome {user?.full_name}!</h2>
              <p>You have {stats.inProgress} tasks in progress</p>
            </div>
            <div className="calendar-icon">
              <FaCalendarAlt />
            </div>
          </div>

          {/* Stats Grid */}
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
              <FaChartLine className="stat-icon" />
            </div>
            <div className="stat-card red">
              <div>
                <h3>Overdue</h3>
                <p className="stat-number">{stats.overdue}</p>
              </div>
              <FaExclamationTriangle className="stat-icon" />
            </div>
          </div>

          {/* Bottom Section: Tasks + Activity */}
          <div className="bottom-section" style={{ display: "flex", gap: "20px" }}>
            {/* Recent Tasks Card */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <h3>Recent Tasks</h3>
              </div>

              {inProgressTasks.length === 0 ? (
                <p className="no-data">No in-progress tasks found.</p>
              ) : (
                <>
                  <ul className="task-list">
                    {(showAll ? inProgressTasks : inProgressTasks.slice(0, 3)).map(
                      (task) => (
                        <li key={task.id} className="task-item">
                          <div className="task-header">
                            <span className="task-title">
                              {task.title || "Untitled Task"}
                            </span>
                            <button
                              type="button"
                              className="see-more-btn"
                              onClick={() => {
                                if (expandedTasks.includes(task.id)) {
                                  setExpandedTasks(
                                    expandedTasks.filter((id) => id !== task.id)
                                  );
                                } else {
                                  setExpandedTasks([...expandedTasks, task.id]);
                                }
                              }}
                            >
                              {expandedTasks.includes(task.id) ? "Hide" : "See More"}
                            </button>
                          </div>
                          {expandedTasks.includes(task.id) && (
                            <div className="task-desc">
                              {task.description || "No additional details"}
                            </div>
                          )}
                        </li>
                      )
                    )}
                  </ul>

                  {inProgressTasks.length > 3 && (
                    <button
                      className="show-all-btn"
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll
                        ? "Show Less"
                        : `See All (${inProgressTasks.length})`}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Recent Activity Card */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <h3>Recent Activity (Last 24h)</h3>
              </div>

              {recentActivities.length === 0 ? (
                <p className="no-data">No recent activity in the last 24 hours.</p>
              ) : (
                <ul className="activity-list">
                  {recentActivities.map((activity) => (
                    <li
                      key={activity.id}
                      className={`activity-item ${activity.type || ""}`}
                    >
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-time">
                        {new Date(activity.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
