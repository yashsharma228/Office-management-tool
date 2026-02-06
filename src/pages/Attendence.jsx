import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { api } from "../services/api";
import "./Attendence.css";

const Attendance = () => {
  const officeTime = "10:00 AM";
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all approved users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await api.getApprovedUsers(); // ✅ fixed

        const initialAttendance = users.map((user) => ({
          id: user.id,
          name: user.full_name,
          role: user.role,
          checkIn: "—",
          checkOut: "—",
          duration: "—",
          status: "Absent",
        }));

        setAttendanceData(initialAttendance);
      } catch (err) {
        console.error("Error fetching approved users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Handle Check-In
  const handleCheckIn = (id) => {
    const updatedData = attendanceData.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          checkIn: currentTime.toLocaleTimeString(),
          status: "Present",
        };
      }
      return user;
    });
    setAttendanceData(updatedData);
  };

  // Handle Check-Out
  const handleCheckOut = (id) => {
    const updatedData = attendanceData.map((user) => {
      if (user.id === id && user.checkIn !== "—") {
        const checkInParts = user.checkIn.split(/:| /);
        let hours = parseInt(checkInParts[0], 10);
        const minutes = parseInt(checkInParts[1], 10);
        const seconds = parseInt(checkInParts[2], 10);
        const period = checkInParts[3];

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        const checkInDate = new Date();
        checkInDate.setHours(hours, minutes, seconds, 0);

        const durationMs = currentTime - checkInDate;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        return {
          ...user,
          checkOut: currentTime.toLocaleTimeString(),
          duration: `${durationHours}h ${durationMinutes}m`,
          status: "Checked-Out",
        };
      }
      return user;
    });

    setAttendanceData(updatedData);
  };

  return (
    <>
      <Sidebar />
      <Navbar title="Office Attendance" />
      <div className="attendance-container">
        <h2 className="attendance-title">📊 Office Attendance Dashboard</h2>
        <p className="office-time">🕒 Office Start Time: {officeTime}</p>
        <p className="live-time">⏰ Current Time: {currentTime.toLocaleTimeString()}</p>

        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Role</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((user) => (
                <tr key={user.id} className="fade-in">
                  <td>{user.name}</td>
                  <td>
                    <span className={`role-badge ${user.role?.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.checkIn}</td>
                  <td>{user.checkOut}</td>
                  <td>{user.duration}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.status === "Present"
                          ? "present"
                          : user.status === "Checked-Out"
                          ? "checked-out"
                          : "absent"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="checkin-btn"
                      disabled={user.status !== "Absent"}
                      onClick={() => handleCheckIn(user.id)}
                    >
                      {user.status !== "Absent" ? "✔ Checked-In" : "Mark Present"}
                    </button>
                    <button
                      className="checkout-btn"
                      disabled={user.status !== "Present"}
                      onClick={() => handleCheckOut(user.id)}
                    >
                      {user.status === "Checked-Out" ? "✔ Checked-Out" : "Mark Check-Out"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Attendance;
