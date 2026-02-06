import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSync,
  FaEye,
  FaDownload,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileWord,
  FaFilter,
  FaCalendar,
  FaComment,
  FaExpand,
} from "react-icons/fa";
import "./TaskBoard.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { api } from "../services/api";

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    start_date: "",
    due_date: "",
    assignee_id: "",
  });

  // Filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const loadTasks = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getAllTasks();
      console.log("DEBUG getAllTasks response:", res);

      // Handle different response structures
      const tasksData = Array.isArray(res) ? res : res?.tasks || [];
      setTasks(tasksData);
      setError("");
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Function to get file icon based on file type
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FaFilePdf className="file-icon pdf" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
        return <FaFileImage className="file-icon image" />;
      case "mp4":
      case "mov":
      case "avi":
      case "wmv":
        return <FaFileVideo className="file-icon video" />;
      case "doc":
      case "docx":
        return <FaFileWord className="file-icon word" />;
      case "zip":
      case "rar":
      case "7z":
        return <FaFileArchive className="file-icon archive" />;
      default:
        return <FaFile className="file-icon" />;
    }
  };

  // Function to handle file download/view
  const handleFileAction = (attachmentUrl, action = "view") => {
    if (action === "view") {
      window.open(attachmentUrl, "_blank");
    } else {
      // Create download link
      const link = document.createElement("a");
      link.href = attachmentUrl;
      link.download = attachmentUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Open edit form with task data
  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      start_date: task.start_date || "",
      due_date: task.due_date || "",
      assignee_id: task.assignee_id || null,
    });
    setShowEditForm(true);
  };

  // Open detailed view
  const handleViewClick = (task) => {
    setSelectedTask(task);
    setShowDetailView(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit the edited task
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        id: editingTask.id,
        ...formData,
      };

      const response = await api.updateTask(updateData);

      if (response.success) {
        alert("Task updated successfully!");

        // Update local state instantly
        setTasks((prev) =>
          prev.map((task) =>
            task.id === editingTask.id ? { ...task, ...formData } : task
          )
        );

        setShowEditForm(false);
        setEditingTask(null);
      } else {
        alert(response.message || "Failed to update task");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message || "Failed to update task. Please try again.");
    }
  };

  const handleChatClick = (task) => {
    // For now, just alert task title
    alert(`Open chat for task: ${task.title}`);

    // Later, integrate your chat popup/modal or navigate to chat page
    // Example: navigate(`/task-chat/${task.id}`);
  };

  // Date range calculation functions
  const getDateRange = (range) => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case "this-week":
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        endDate.setDate(today.getDate() + (6 - today.getDay())); // End of week (Saturday)
        break;
      case "last-week":
        startDate.setDate(today.getDate() - today.getDay() - 7);
        endDate.setDate(today.getDate() - today.getDay() - 1);
        break;
      case "this-month":
        startDate.setDate(1); // First day of current month
        endDate.setMonth(today.getMonth() + 1, 0); // Last day of current month
        break;
      case "last-month":
        startDate.setMonth(today.getMonth() - 1, 1); // First day of last month
        endDate.setMonth(today.getMonth(), 0); // Last day of last month
        break;
      default:
        return { start: null, end: null };
    }

    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  };

  // Filter tasks based on search, date filter, and status filter
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch = task.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all" && task.due_date) {
      const { start, end } = getDateRange(dateFilter);
      if (start && end) {
        const dueDate = task.due_date.split("T")[0];
        matchesDate = dueDate >= start && dueDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Reset all filters
  const resetFilters = () => {
    setDateFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

  return (
    <>
      <Sidebar />
      <Navbar title="All Tasks" />
      <div className="task-board">
        {/* Search and Filter Controls */}
        <div className="task-filters">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <div className="refresh-controls">
              <button
                className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`}
                onClick={loadTasks}
                disabled={isRefreshing}
              >
                <FaSync className={isRefreshing ? "spinning" : ""} />
                {isRefreshing ? "Refreshing..." : "Refresh Tasks"}
              </button>
              <span className="last-updated">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Expanded Filter Options */}
          {showFilters && (
            <div className="expanded-filters">
              <div className="filter-group">
                <label>
                  <FaCalendar /> Due Date:
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="this-week">This Week</option>
                  <option value="last-week">Last Week</option>
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Not Started">Not Started</option>{" "}
                  {/* Value stays "To Do", label shows "Not Started" */}
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button className="reset-filters" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading tasks...</div>}

        {/* Active Filters Indicator */}
        {(dateFilter !== "all" || statusFilter !== "all" || search) && (
          <div className="active-filters">
            <span>Active Filters:</span>
            {dateFilter !== "all" && (
              <span className="filter-tag">
                Due: {dateFilter.replace("-", " ")}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="filter-tag">Status: {statusFilter}</span>
            )}
            {search && <span className="filter-tag">Search: "{search}"</span>}
          </div>
        )}

        {/* Task Cards */}
        <div className="task-grid">
          {filteredTasks.length > 0
            ? filteredTasks.map((task) => (
                <div key={task.id} className="task-card">
                  {/* View and Chat buttons top-right */}
                  <div className="task-card-actions">
                    <button
                      className="view-detail-btn"
                      title="View details"
                      onClick={() => handleViewClick(task)}
                    >
                      <FaExpand />
                    </button>
                    <button
                      className="chat-btn"
                      title="Open chat"
                      onClick={() => handleChatClick(task)}
                    >
                      <FaComment />
                    </button>
                  </div>

                  {/* Status heading at the top */}
                  <h2
                    className={`task-status-heading status-${task.status
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {task.status}
                  </h2>

                  {/* Title & Description */}
                  <h3>{task.title}</h3>
                  <p>{task.description || "No description provided"}</p>

                  {/* Tags Section */}
                  <div className="task-tags">
                    <span
                      className={`tag priority-${task.priority?.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                    <span className="tag task-id">ID: {task.id}</span>
                  </div>

                  {/* Attachments Section */}
                  {task.attachment_url && (
                    <div className="task-attachments">
                      <div className="attachments-header">
                        <strong>📎 Attachments:</strong>
                      </div>
                      <div className="attachment-item">
                        {getFileIcon(task.file_type)}
                        <span className="attachment-name">
                          {task.attachment_name}
                        </span>
                        <div className="attachment-actions">
                          <button
                            className="view-btn"
                            onClick={() =>
                              handleFileAction(task.attachment_url, "view")
                            }
                            title="View attachment"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="download-btn"
                            onClick={() =>
                              handleFileAction(task.attachment_url, "download")
                            }
                            title="Download attachment"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Details */}
                  <div className="task-footer">
                    <span>
                      <FaCalendarAlt /> Start:{" "}
                      {task.start_date
                        ? new Date(task.start_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <span>
                      <FaCalendarAlt /> End:{" "}
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <span>
                      <FaUser /> {task.assigneeName || "Unassigned"}
                    </span>
                  </div>

                  {/* Update/Delete buttons */}
                  <div className="task-actions">
                    <button
                      className="update-btn"
                      onClick={() => handleEditClick(task)}
                    >
                      <FaEdit /> Edit
                    </button>
                  </div>
                </div>
              ))
            : !loading && (
                <p className="no-tasks">
                  No tasks found matching your filters.
                </p>
              )}
        </div>

        {/* Edit Task Form Popup */}
        {showEditForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit Task</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowEditForm(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="task-form">
                <div className="form-group">
                  <label></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    placeholder="Task title..."
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Task description..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label></label>
                    <select
                      name="status"
                      placeholder="Status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label></label>
                    <select
                      name="priority"
                      value={formData.priority}
                      placeholder="Priority"
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Priority --</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label></label>
                    <input
                      type="date"
                      name="start_date"
                      placeholder="Start Date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label></label>
                    <input
                      type="date"
                      name="due_date"
                      placeholder="Due Date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowEditForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Detail View Popup */}
        {showDetailView && selectedTask && (
          <div className="modal-overlay detail-overlay">
            <div className="modal-content detail-content">
              <div className="modal-header">
                <h2>Task Details</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowDetailView(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="task-detail-container">
                <div className="detail-section">
                  <h3 className="detail-title">{selectedTask.title}</h3>
                  <div className="detail-status">
                    <span
                      className={`status-badge status-${selectedTask.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {selectedTask.status}
                    </span>
                    <span
                      className={`priority-badge priority-${selectedTask.priority?.toLowerCase()}`}
                    >
                      {selectedTask.priority} Priority
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Description</h4>
                  <p className="detail-description">
                    {selectedTask.description || "No description provided"}
                  </p>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Start Date:</label>
                    <span>
                      {selectedTask.start_date
                        ? new Date(selectedTask.start_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Due Date:</label>
                    <span>
                      {selectedTask.due_date
                        ? new Date(selectedTask.due_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Assigned To:</label>
                    <span>{selectedTask.assigneeName || "Unassigned"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Task ID:</label>
                    <span>{selectedTask.id}</span>
                  </div>
                </div>

                {selectedTask.attachment_url && (
                  <div className="detail-section">
                    <h4>Attachments</h4>
                    <div className="detail-attachment">
                      <div className="attachment-info">
                        {getFileIcon(selectedTask.file_type)}
                        <span className="attachment-name">
                          {selectedTask.attachment_name}
                        </span>
                      </div>
                      <div className="attachment-actions">
                        <button
                          className="view-btn"
                          onClick={() =>
                            handleFileAction(
                              selectedTask.attachment_url,
                              "view"
                            )
                          }
                        >
                          <FaEye /> View
                        </button>
                        <button
                          className="download-btn"
                          onClick={() =>
                            handleFileAction(
                              selectedTask.attachment_url,
                              "download"
                            )
                          }
                        >
                          <FaDownload /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setShowDetailView(false);
                      handleEditClick(selectedTask);
                    }}
                  >
                    <FaEdit /> Edit Task
                  </button>
                  <button
                    className="chat-btn"
                    onClick={() => handleChatClick(selectedTask)}
                  >
                    <FaComment /> Open Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
