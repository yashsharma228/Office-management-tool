import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import "./AdminExpenses.css";

const API_BASE_URL = "http://localhost/Office-management-tool/backend/api";

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    user_id: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    done: 0, // ✅ Added done counter
  });
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Fetch Users for dropdown
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/approveUser.php`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ✅ Fetch All Expenses with user data joined
  const fetchExpenses = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.user_id !== "all") params.append("user_id", filters.user_id);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.startDate) params.append("start_date", filters.startDate);
      if (filters.endDate) params.append("end_date", filters.endDate);

      const url = `${API_BASE_URL}/expenses/admin_expenses.php?${params.toString()}`;
      console.log("Fetching from:", url);

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setExpenses(data.data);

        // Calculate statistics - UPDATED with done status
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
      } else {
        setExpenses([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, done: 0 });
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0, done: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ user_id: "all", status: "all", startDate: "", endDate: "" });
  };

  // ✅ Update expense status (Approved/Rejected/Done)
  const updateExpenseStatus = async (expenseId, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/expenses/update_status.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expense_id: expenseId,
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`Expense marked as ${newStatus.toLowerCase()} successfully!`);
        fetchExpenses(); // Refresh the list
      } else {
        alert("Failed to update expense status");
      }
    } catch (error) {
      console.error("Error updating expense status:", error);
      alert("Error updating expense status");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#10b981"; // Green
      case "rejected":
        return "#ef4444"; // Red
      case "done":
        return "#3b82f6"; // Blue for Done
      default:
        return "#f59e0b"; // Orange for Pending
    }
  };

  return (
    <div>
      <Sidebar />
      <Navbar title="Office Expenses" />

      <div className="user-expenses-container">
        <div className="main-content">
          <div className="user-expenses-content">
            {/* ✅ Statistics Cards - UPDATED with Done */}
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

            {/* ✅ Toggle Filters Button */}
            <div className="filter-toggle">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="toggle-filters-btn"
              >
                {showFilters ? "🔽 Hide Filters" : "🔍 Show Filters"}
              </button>
            </div>

            {/* ✅ Filters Section - UPDATED with Done option */}
            {showFilters && (
              <div className={`filter-panel ${showFilters ? "show" : ""}`}>

                <h3 className="filter-title">Filter Expenses</h3>

                <div className="filter-grid">
                  <div className="filter-group">
                    <label>User</label>
                    <select
                      name="user_id"
                      value={filters.user_id}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="all">All Users</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </option>
                      ))}
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
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Done">Paid/Done</option>
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
                  <button
                    onClick={() => setShowFilters(false)}
                    className="hide-filters-btn"
                  >
                    ❌ Hide Filters
                  </button>
                  <span className="filter-results">
                    Showing {expenses.length} expenses
                  </span>
                </div>
              </div>
            )}

            {/* ✅ Expenses List */}
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No expenses found</h3>
                <p>
                  Try adjusting your filters or check if there are any expenses
                  in the system.
                </p>
              </div>
            ) : (
              <div className="expenses-section">
                <h3 className="section-title">All User Expenses</h3>
                <div className="expenses-grid">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="expense-card">
                      <div className="expense-header">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(exp.status) }}
                        >
                          {exp.status}
                        </span>
                        <span className="expense-user">
                          👤 {exp.full_name || "Unknown User"}
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
                          <span className="detail-icon">📧</span>
                          {exp.email || "No email"}
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">⏰</span>
                          Added:{" "}
                          {new Date(exp.created_at).toLocaleDateString()}
                        </div>
                        {exp.status === "Done" && (
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            Paid: {new Date().toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {exp.receipt && (
                        <a
                          href={`http://localhost/Office-management-tool/backend/uploads/${exp.receipt}`}
                          target="_blank"
                          rel="noreferrer"
                          className="view-receipt-btn"
                        >
                          📎 View Receipt
                        </a>
                      )}

                      {/* Admin Actions - UPDATED with Done button */}
                      <div className="admin-actions">
                        <button
                          onClick={() => updateExpenseStatus(exp.id, "Approved")}
                          className="approve-btn"
                          disabled={exp.status === "Approved" || exp.status === "Done"}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updateExpenseStatus(exp.id, "Rejected")}
                          className="reject-btn"
                          disabled={exp.status === "Rejected" || exp.status === "Done"}
                        >
                          ❌ Reject
                        </button>
                        <button
                          onClick={() => updateExpenseStatus(exp.id, "Done")}
                          className="done-btn"
                          disabled={exp.status === "Done"}
                        >
                          💰 Mark as Paid
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}