import React from "react";
import "./Notify.css";

const Notify = ({ pendingUsers, onApprove, onReject }) => {
  return (
    <div className="notifications-window">
      <div className="notifications-header">
        <h3>Pending User Approvals</h3>
        <span className="notification-count">{pendingUsers.length} pending</span>
      </div>
      
      <div className="notifications-content">
        {pendingUsers.length > 0 ? (
          pendingUsers.map((user) => (
            <div key={user.id} className="notification-item">
              <div className="user-info">
                <div className="user-avatar">
                  <span>{user.full_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-details">
                  <h4>{user.full_name}</h4>
                  <p className="user-email">{user.email}</p>
                  <p className="user-username">@{user.username}</p>
                  <p className="registration-date">
                    Registered: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="notification-actions">
                <button 
                  className="btn-approve" 
                  onClick={() => onApprove(user.id)}
                  title="Approve user"
                >
                  ✅ Approve
                </button>
                <button 
                  className="btn-reject" 
                  onClick={() => onReject(user.id)}
                  title="Reject and delete user"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <div className="empty-icon">🎉</div>
            <p>No pending approvals</p>
            <small>All users have been processed</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notify;