import React, { useState } from "react";
import "./Calender.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

const companyData = {
  "2025-08-15": [{ title: "Meeting with Client", priority: "high" }],
  "2025-08-18": [{ title: "Team Review", priority: "medium" }],
  "2025-08-22": [{ title: "Product Launch", priority: "low" }],
};

export default function Calender() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const formatDate = (day) => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
  };

  return (
    <>
      <Sidebar />
      <Navbar title="Company Calendar" />
      <div className="calendar-wrapper">
        <h1>Calendar View</h1>
        <span className="subtitle">Task Schedules and Deadlines</span>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={prevMonth}>&lt;</button>
            <h2>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={nextMonth}>&gt;</button>
          </div>

          <div className="calendar-legend">
            <span className="legend high">High Priority</span>
            <span className="legend medium">Medium Priority</span>
            <span className="legend low">Low Priority</span>
          </div>

          <div className="calendar-grid">
            {days.map((day, idx) => (
              <div key={idx} className="calendar-day-name">{day}</div>
            ))}

            {Array(firstDayOfMonth).fill(null).map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-empty"></div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const dateKey = formatDate(i + 1);
              const dayEvents = companyData[dateKey] || [];

              const isToday =
                currentDate.getFullYear() === new Date().getFullYear() &&
                currentDate.getMonth() === new Date().getMonth() &&
                i + 1 === new Date().getDate();

              return (
                <div 
                  key={i} 
                  className={`calendar-day ${isToday ? "today" : ""}`}
                >
                  <span className={`day-number ${isToday ? "today-number" : ""}`}>{i + 1}</span>
                  {dayEvents.map((event, idx) => (
                    <div key={idx} className={`event ${event.priority}`}>
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
