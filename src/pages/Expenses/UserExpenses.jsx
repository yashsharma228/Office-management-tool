import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import "./UserExpenses.css";

export default function UserExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    description: "",
    receipt: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    duration: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });

  // ✅ Added statistics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    done: 0,
  });

  const API_BASE_URL =
    "http://localhost/Office-management-tool/backend/api/expenses/expenses.php";

  // Fetch user's expenses
  const fetchUserExpenses = async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}?user_id=${user.id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setExpenses(data.data);
        setFilteredExpenses(data.data);
        
        // ✅ Calculate statistics for user's expenses
        const total = data.data.reduce(
          (sum, exp) => sum + parseFloat(exp.amount),
          0
        );
        const pending = data.data
          .filter((exp) => exp.status === "Pending")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const approved = data.data
          .filter((exp) => exp.status === "Approved")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const rejected = data.data
          .filter((exp) => exp.status === "Rejected")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const done = data.data
          .filter((exp) => exp.status === "Done")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        setStats({ total, pending, approved, rejected, done });
      } else if (Array.isArray(data)) {
        setExpenses(data);
        setFilteredExpenses(data);
        
        // ✅ Calculate statistics for array data format
        const total = data.reduce(
          (sum, exp) => sum + parseFloat(exp.amount),
          0
        );
        const pending = data
          .filter((exp) => exp.status === "Pending")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const approved = data
          .filter((exp) => exp.status === "Approved")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const rejected = data
          .filter((exp) => exp.status === "Rejected")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const done = data
          .filter((exp) => exp.status === "Done")
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        setStats({ total, pending, approved, rejected, done });
      } else {
        console.error("Unexpected response format:", data);
        setExpenses([]);
        setFilteredExpenses([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, done: 0 });
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
      setFilteredExpenses([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0, done: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserExpenses();
  }, [user]);

  // Apply filters whenever filters or expenses change
  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...expenses];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Duration filter
    if (filters.duration !== "all") {
      switch (filters.duration) {
        case "today":
          filtered = filtered.filter(
            (exp) => new Date(exp.date).toDateString() === today.toDateString()
          );
          break;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          filtered = filtered.filter((exp) => {
            const expDate = new Date(exp.date);
            return expDate >= weekStart && expDate <= today;
          });
          break;
        case "month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter((exp) => {
            const expDate = new Date(exp.date);
            return expDate >= monthStart && expDate <= today;
          });
          break;
        case "year":
          const yearStart = new Date(today.getFullYear(), 0, 1);
          filtered = filtered.filter((exp) => {
            const expDate = new Date(exp.date);
            return expDate >= yearStart && expDate <= today;
          });
          break;
        default:
          break;
      }
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= start && expDate <= end;
      });
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (exp) => exp.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredExpenses(filtered);
  };

  const clearFilters = () => {
    setFilters({
      duration: "all",
      status: "all",
      startDate: "",
      endDate: "",
    });
    setFilteredExpenses(expenses);
  };

  const handleChange = (e) => {
    if (e.target.name === "receipt") {
      const file = e.target.files[0];
      setFormData({ ...formData, receipt: file });
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("User not authenticated");
      return;
    }

    const submitData = new FormData();
    submitData.append("user_id", user.id);
    submitData.append("category", "General");
    submitData.append("amount", parseFloat(formData.amount));
    submitData.append("date", formData.date);
    submitData.append("description", formData.description);
    if (formData.receipt) submitData.append("receipt", formData.receipt);

    try {
      setUploading(true);
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: submitData,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        fetchUserExpenses();
        setFormData({ amount: "", date: "", description: "", receipt: null });
        setPreviewUrl(null);
        setShowForm(false);
        alert("Expense added successfully!");
      } else {
        alert(result.message || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const viewReceipt = (receiptPath) => {
    if (receiptPath) {
      window.open(
        `http://localhost/Office-management-tool/backend/uploads/${receiptPath}`,
        "_blank"
      );
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#10b981"; // Green
      case "rejected":
        return "#ef4444"; // Red
      case "done":
        return "#3b82f6"; // Blue for Done/Paid
      default:
        return "#f59e0b"; // Orange for Pending
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar title="My Expenses" />
      <div className="user-expenses-container">
        <div className="main-content">
          <div className="user-expenses-content">
            {/* ✅ Added Statistics Cards for User */}
            <div className="expenses-summary">
              <div className="summary-card">
                <h3>Total Expenses</h3>
                <p className="summary-amount">{formatCurrency(stats.total)}</p>
              </div>
              <div className="summary-card">
                <h3>Pending</h3>
                <p className="summary-amount">{formatCurrency(stats.pending)}</p>
              </div>
              <div className="summary-card">
                <h3>Approved</h3>
                <p className="summary-amount">
                  {formatCurrency(stats.approved)}
                </p>
              </div>
              <div className="summary-card">
                <h3>Rejected</h3>
                <p className="summary-amount">{formatCurrency(stats.rejected)}</p>
              </div>
              <div className="summary-card">
                <h3>Paid/Done</h3>
                <p className="summary-amount">{formatCurrency(stats.done)}</p>
              </div>
            </div>

            {/* Header */}
            <div className="header-section">
              <button
                className="toggle-form-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "+ Add New Expense"}
              </button>
            </div>

            {/* Expense Form */}
            <div
              className={`expense-form-container ${
                showForm ? "expense-form-visible" : ""
              }`}
            >
              <form
                onSubmit={handleSubmit}
                className="expense-form"
                encType="multipart/form-data"
              >
                <h3 className="form-title">Add New Expense</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      className="form-input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Receipt (Optional)</label>
                    <div className="file-upload-container">
                      <label htmlFor="receipt" className="file-upload-label">
                        <span className="file-icon">📎</span>
                        {formData.receipt
                          ? formData.receipt.name
                          : "Choose file"}
                      </label>
                      <input
                        type="file"
                        id="receipt"
                        name="receipt"
                        onChange={handleChange}
                        className="file-input"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </div>
                  </div>
                </div>

                {previewUrl && (
                  <div className="receipt-preview">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-preview-btn"
                      onClick={() => {
                        setFormData({ ...formData, receipt: null });
                        setPreviewUrl(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <button type="submit" className="submit-button" disabled={uploading}>
                  {uploading ? "Processing..." : "Add Expense"}
                </button>
              </form>
            </div>

            {/* ✅ Toggle Filters */}
            {expenses.length > 0 && (
              <div className="filter-wrapper">
                {!showFilters ? (
                  <button
                    className="toggle-filters-btn"
                    onClick={() => setShowFilters(true)}
                  >
                    🔍 Show Filters
                  </button>
                ) : (
                  <div className={`filter-panel ${showFilters ? "show" : ""}`}>

                    <div className="filter-header">
                      <h3 className="filter-title">Filter Expenses</h3>
                      <button
                        className="hide-filters-btn"
                        onClick={() => setShowFilters(false)}
                      >
                        ✖ Hide
                      </button>
                    </div>

                    <div className="filter-grid">
                      <div className="filter-group">
                        <label>Time Duration</label>
                        <select
                          name="duration"
                          value={filters.duration}
                          onChange={handleFilterChange}
                          className="filter-select"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                          <option value="year">This Year</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          className="filter-select"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="done">Paid/Done</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={filters.startDate}
                          onChange={handleFilterChange}
                          className="filter-input"
                        />
                      </div>

                      <div className="filter-group">
                        <label>End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={filters.endDate}
                          onChange={handleFilterChange}
                          className="filter-input"
                        />
                      </div>
                    </div>

                    <div className="filter-actions">
                      <button onClick={clearFilters} className="clear-filters-btn">
                        🧹 Clear Filters
                      </button>
                      <span className="filter-results">
                        Showing {filteredExpenses.length} of {expenses.length} expenses
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expenses List */}
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your expenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>
                  {expenses.length === 0
                    ? "No expenses yet"
                    : "No matching expenses"}
                </h3>
                <p>
                  {expenses.length === 0
                    ? "Add your first expense to get started"
                    : "Try adjusting your filters to see more results"}
                </p>
                {expenses.length === 0 && (
                  <button className="primary-button" onClick={() => setShowForm(true)}>
                    Add Your First Expense
                  </button>
                )}
                {expenses.length > 0 && (
                  <button className="primary-button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="expenses-section">
                <h3 className="section-title">Your Expense History</h3>
                <div className="expenses-grid">
                  {filteredExpenses.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="expense-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="expense-header">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(exp.status) }}
                        >
                          {exp.status || "Pending"}
                        </span>
                      </div>

                      <div className="expense-amount">
                        {formatCurrency(exp.amount)}
                      </div>

                      {exp.description && (
                        <p className="expense-description">{exp.description}</p>
                      )}

                      <div className="expense-details">
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          {exp.date
                            ? new Date(exp.date).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">⏰</span>
                          Added:{" "}
                          {exp.created_at
                            ? new Date(exp.created_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                        {exp.status === "Done" && (
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            Paid: {new Date().toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {exp.receipt && (
                        <button
                          onClick={() => viewReceipt(exp.receipt)}
                          className="view-receipt-btn"
                        >
                          <span className="btn-icon">📎</span>
                          View Receipt
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}