import React, { useState, useEffect } from 'react';
import './Reports.css';
import { 
  FaCheckSquare, 
  FaArrowUp, 
  FaClock, 
  FaExclamationTriangle, 
  FaChevronRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList
} from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { api } from '../services/api';

export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.getAllTasks();
        const allTasks = Array.isArray(res) ? res : res.tasks || [];
        setTasks(allTasks);

        // Calculate stats
        const totalTasks = allTasks.length;
        const completed = allTasks.filter(t => t.status === "Completed").length;
        const inProgress = allTasks.filter(t => t.status === "In Progress").length;
        const overdue = allTasks.filter(
          t => new Date(t.due_date) < new Date() && t.status !== "Completed"
        ).length;

        setStats({
          totalTasks,
          completed,
          inProgress,
          overdue
        });
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  return (
    <>
      <Sidebar/>
      <Navbar title="Reports" />
      <div className="reports-container">
        <div className="reports-header">
          <div>
            <h2>Reports & Analytics</h2>
            <p>Track performance and generate insights</p>
          </div>
          <div className="reports-actions">
            <select>
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
            <button className="btn pdf">PDF</button>
            <button className="btn excel">Excel</button>
            <button className="btn csv">CSV</button>
          </div>
        </div>

        <div className="stats-cards">
          <div className="card blue">
            <h3>{stats.totalTasks}</h3>
            <p>Total Tasks</p>
            <FaClipboardList className="icon" />
          </div>
          <div className="card green">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
           
            <FaCheckCircle className="icon" />
          </div>
          <div className="card yellow">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
            <FaClock className="icon" />
          </div>
          <div className="card red">
            <h3>{stats.overdue}</h3>
            <p>Overdue</p>
            <FaExclamationTriangle className="icon" />
          </div>
        </div>

        <div className="reports-body">
          <div className="charts-section">
            <div className="department-performance">
              <h4>Department Performance</h4>
              <div className="bar">
                <span>Administration</span>
                <progress value="7" max="13"></progress>
                <span>7/13 completed</span>
              </div>
              <div className="bar">
                <span>Operations</span>
                <progress value="19" max="14"></progress>
                <span>19/14 completed</span>
              </div>
              <div className="bar">
                <span>Development</span>
                <progress value="6" max="25"></progress>
                <span>6/25 completed</span>
              </div>
              <div className="bar">
                <span>Design</span>
                <progress value="17" max="19"></progress>
                <span>17/19 completed</span>
              </div>
              <div className="bar">
                <span>Marketing</span>
                <progress value="9" max="16"></progress>
                <span>9/16 completed</span>
              </div>
            </div>

            <div className="task-priority">
              <h4>Task Priority Distribution</h4>
              <div className="priority high">
                <span>High Priority</span>
                <progress value="2" max="5"></progress>
                <span>2 tasks</span>
              </div>
              <div className="priority medium">
                <span>Medium Priority</span>
                <progress value="1" max="5"></progress>
                <span>1 tasks</span>
              </div>
              <div className="priority low">
                <span>Low Priority</span>
                <progress value="0" max="5"></progress>
                <span>0 tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}