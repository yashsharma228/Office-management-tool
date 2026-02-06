import React, { useEffect, useState } from "react";
import "./Mytask.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  FaEye,
  FaDownload,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFileArchive,
  FaFileVideo,
  FaComment,
  FaExpand,
  FaTimes,
  FaEdit,
  FaPaperPlane,
  FaUser,
  FaCalendarAlt
} from "react-icons/fa";

export default function Mytask() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      try {
        const res = await api.getUserTasks(user.id);
        const tasksData = Array.isArray(res) ? res : [];
        setTasks(tasksData);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [user]);

  // Function to get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="file-icon" />;
    
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FaFilePdf className="file-icon pdf" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return <FaFileImage className="file-icon image" />;
      case "mp4":
      case "mov":
      case "avi":
      case "wmv":
      case "mkv":
        return <FaFileVideo className="file-icon video" />;
      case "doc":
      case "docx":
        return <FaFileWord className="file-icon word" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="file-icon excel" />;
      case "zip":
      case "rar":
      case "7z":
        return <FaFileArchive className="file-icon archive" />;
      default:
        return <FaFile className="file-icon" />;
    }
  };

  // Function to handle file actions
  const handleFileAction = (attachmentUrl, action = "view", fileName = "") => {
    if (!attachmentUrl) return;
    
    if (action === "view") {
      window.open(attachmentUrl, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = attachmentUrl;
      link.download = fileName || attachmentUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Update the selected task if it's the one being modified
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update task status");
    }
  };

  // Open detailed view
  const handleViewClick = (task) => {
    setSelectedTask(task);
    setShowDetailView(true);
    setShowChat(false);
  };

  // Open chat for a task
  const handleChatClick = async (task) => {
    setSelectedTask(task);
    setShowChat(true);
    setShowDetailView(false);
    
    // Load chat messages (mock data for now - replace with actual API call)
    try {
      // This would be replaced with: const messages = await api.getTaskChat(task.id);
      const mockMessages = [
        { id: 1, sender: "John Doe", message: "Any updates on this task?", timestamp: "2023-05-15 10:30" },
        { id: 2, sender: "You", message: "Working on it. Should be done by tomorrow.", timestamp: "2023-05-15 11:15" },
        { id: 3, sender: "John Doe", message: "Great! Let me know if you need any help.", timestamp: "2023-05-15 11:20" }
      ];
      setChatMessages(mockMessages);
    } catch (err) {
      console.error("Error loading chat messages:", err);
    }
  };

  // Send a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // This would be replaced with: await api.sendChatMessage(selectedTask.id, newMessage);
    const newMsg = {
      id: chatMessages.length + 1,
      sender: "You",
      message: newMessage,
      timestamp: new Date().toLocaleString()
    };
    
    setChatMessages([...chatMessages, newMsg]);
    setNewMessage("");
  };

  return (
    <>
      <Sidebar />
      <Navbar title="My Tasks" />
      <div className="mytask-container">
        <h2 className="mytask-heading">📋 My Tasks</h2>

        {/* 🔍 Search & Filter */}
        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="priority-dropdown"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-dropdown"
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <p className="loading-text">⏳ Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty-text">⚡ No tasks found.</p>
        ) : (
          <div className="task-grid">
            {filteredTasks.map((task) => (
              <div className="task-card" key={task.id}>
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
                
                {/* Status badge */}
                <div
                  className={`task-status-badge status-${task.status
                    ?.toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {task.status}
                </div>

                <h3 className="task-title">{task.title}</h3>
                <p className="task-desc">{task.description || "No description provided"}</p>

                {/* Tags Section */}
                <div className="task-tags">
                  <span
                    className={`tag priority-${task.priority?.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>
                  <span className="tag task-id">ID: {task.id}</span>
                </div>

                {/* 📂 Attachments Section */}
                {task.attachment && (
                  <div className="attachments">
                    <strong>📎 Attachments:</strong>
                    <div className="attachment-item">
                      {getFileIcon(task.file_type)}
                      <span className="attachment-name">
                        {task.attachment_name || task.attachment}
                      </span>
                      <div className="attachment-actions">
                        <button
                          className="view-btn"
                          onClick={() => 
                            handleFileAction(
                              task.attachment_url, 
                              "view", 
                              task.attachment_name || task.attachment
                            )
                          }
                          title="View attachment"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="download-btn"
                          onClick={() => 
                            handleFileAction(
                              task.attachment_url, 
                              "download", 
                              task.attachment_name || task.attachment
                            )
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

                {/* ✅ Status Buttons */}
                <div className="status-buttons">
                  {["Not Started", "In Progress", "Completed"].map((status) => (
                    <button
                      key={status}
                      className={`status-btn ${
                        task.status === status ? "active" : ""
                      }`}
                      onClick={() => handleStatusUpdate(task.id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Detail View Modal */}
        {showDetailView && selectedTask && (
          <div className="modal-overlay">
            <div className="modal-content">
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
                    <span className={`status-badge status-${selectedTask.status?.toLowerCase().replace(" ", "-")}`}>
                      {selectedTask.status}
                    </span>
                    <span className={`priority-badge priority-${selectedTask.priority?.toLowerCase()}`}>
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

                {selectedTask.attachment && (
                  <div className="detail-section">
                    <h4>Attachments</h4>
                    <div className="detail-attachment">
                      <div className="attachment-info">
                        {getFileIcon(selectedTask.file_type)}
                        <span className="attachment-name">
                          {selectedTask.attachment_name || selectedTask.attachment}
                        </span>
                      </div>
                      <div className="attachment-actions">
                        <button
                          className="view-btn"
                          onClick={() => handleFileAction(selectedTask.attachment_url, "view")}
                        >
                          <FaEye /> View
                        </button>
                        <button
                          className="download-btn"
                          onClick={() => handleFileAction(selectedTask.attachment_url, "download")}
                        >
                          <FaDownload /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-actions">
                  <button
                    className="chat-btn"
                    onClick={() => {
                      setShowDetailView(false);
                      handleChatClick(selectedTask);
                    }}
                  >
                    <FaComment /> Open Chat
                  </button>
                  <div className="status-buttons">
                    {["Not Started", "In Progress", "Completed"].map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${
                          selectedTask.status === status ? "active" : ""
                        }`}
                        onClick={() => {
                          handleStatusUpdate(selectedTask.id, status);
                          setSelectedTask({...selectedTask, status});
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChat && selectedTask && (
          <div className="modal-overlay">
            <div className="modal-content chat-modal">
              <div className="modal-header">
                <h2>Chat - {selectedTask.title}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowChat(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className={`message ${msg.sender === "You" ? "own-message" : ""}`}>
                        <div className="message-sender">{msg.sender}</div>
                        <div className="message-content">{msg.message}</div>
                        <div className="message-time">{msg.timestamp}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">No messages yet. Start the conversation!</div>
                  )}
                </div>

                <div className="chat-input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="chat-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <FaPaperPlane />
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