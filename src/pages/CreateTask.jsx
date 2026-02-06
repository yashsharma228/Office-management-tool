// import React, { useState, useEffect, useRef } from "react";
// import "./CreateTask.css";
// import Sidebar from "../components/Sidebar/Sidebar";
// import { useAuth } from "../context/AuthContext";
// import Navbar from "../components/Navbar/Navbar";
// import { api } from "../services/api";

// export default function CreateTask() {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     assignee: "",
//     priority: "Medium",
//     dueDate: "",
//     status: "Not Started",
//     tags: "",
//     attachment: null,
//     teamMembers: [],
//   });

//   const [assignees, setAssignees] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [usersError, setUsersError] = useState("");
//   const { user } = useAuth();

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const load = async () => {
//       setLoadingUsers(true);
//       setUsersError("");
//       try {
//         const rows = await api.getApprovedUsers();
//         setAssignees(Array.isArray(rows) ? rows : []);
//       } catch (e) {
//         setUsersError("Failed to load users");
//       } finally {
//         setLoadingUsers(false);
//       }
//     };
//     load();
//   }, []);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleTeamChange = (e) => {
//     const { value, checked } = e.target;
//     const id = String(value);
//     setFormData((prev) => {
//       if (checked) {
//         if (prev.teamMembers.includes(id)) return prev;
//         return { ...prev, teamMembers: [...prev.teamMembers, id] };
//       }
//       return {
//         ...prev,
//         teamMembers: prev.teamMembers.filter((v) => v !== id),
//       };
//     });
//   };

//   // Prevent leader from also being a member
//   useEffect(() => {
//     if (!formData.assignee) return;
//     setFormData((prev) => ({
//       ...prev,
//       teamMembers: prev.teamMembers.filter(
//         (id) => id !== String(formData.assignee)
//       ),
//     }));
//   }, [formData.assignee]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         ...formData,
//         assignee_id: formData.assignee,
//         created_by: user.id,
//         team: formData.teamMembers,
//       };

//       await api.createTask(payload);
//       alert("✅ Task Created Successfully!");

//       setFormData({
//         title: "",
//         description: "",
//         assignee: "",
//         priority: "Medium",
//         dueDate: "",
//         status: "Not Started",
//         tags: "",
//         attachment: null,
//         teamMembers: [],
//       });
//       setIsDropdownOpen(false);
//     } catch (err) {
//       console.error("❌ Task creation failed:", err);
//       alert("❌ Failed to create task");
//     }
//   };

//   return (
//     <>
//       <Sidebar />
//       <Navbar title="Create New Task" />
//       <div className="task-form-container">
//         <h2 className="form-title">Create New Task</h2>
//         <p className="subtitle">Assign a new task to your team members</p>

//         <form onSubmit={handleSubmit} className="task-form">
//           <div className="form-group">
//             <label>Task Title *</label>
//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Description</label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Assign To (Team Leader) *</label>
//               <select
//                 name="assignee"
//                 value={formData.assignee}
//                 onChange={handleChange}
//                 required
//                 disabled={loadingUsers || !!usersError}
//               >
//                 <option value="">
//                   {loadingUsers
//                     ? "Loading users..."
//                     : usersError || "Select Team Leader"}
//                 </option>
//                 {assignees.map((u) => (
//                   <option key={u.id} value={u.id}>
//                     {u.full_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Priority</label>
//               <select
//                 name="priority"
//                 value={formData.priority}
//                 onChange={handleChange}
//               >
//                 <option value="Low">Low Priority</option>
//                 <option value="Medium">Medium Priority</option>
//                 <option value="High">High Priority</option>
//               </select>
//             </div>
//           </div>

//           {/* Team Members + Due Date side by side */}
//           <div className="form-row">
//             <div className="form-group">
//               <label>Team Members</label>
//               <div
//                 className={`dropdown ${isDropdownOpen ? "show" : ""}`}
//                 ref={dropdownRef}
//               >
//                 <button
//                   type="button"
//                   className="dropbtn"
//                   onClick={() => setIsDropdownOpen((prev) => !prev)}
//                 >
//                   {formData.teamMembers.length > 0
//                     ? `${formData.teamMembers.length} selected`
//                     : "Select Members"}
//                 </button>

//                 {isDropdownOpen && (
//                   <div className="dropdown-content">
//                     {assignees
//                       .filter(
//                         (u) => String(u.id) !== String(formData.assignee)
//                       )
//                       .map((u) => (
//                         <label key={u.id} className="dropdown-item">
//                           <input
//                             type="checkbox"
//                             value={u.id}
//                             checked={formData.teamMembers.includes(
//                               String(u.id)
//                             )}
//                             onChange={handleTeamChange}
//                           />
//                           {u.full_name}
//                         </label>
//                       ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Due Date *</label>
//               <input
//                 type="date"
//                 name="dueDate"
//                 value={formData.dueDate}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>

//           {/* File Upload Modern */}
//           <div className="form-group">
//             <label>Attachment (optional)</label>
//             <div className="file-upload">
//               <input
//                 type="file"
//                 name="attachment"
//                 id="fileUpload"
//                 onChange={handleChange}
//               />
//               <label htmlFor="fileUpload">
//                 <strong>Drag & drop</strong> your file here <br /> or{" "}
//                 <span className="browse-link">browse from computer</span>
//               </label>
//             </div>
//           </div>

//           <button type="submit" className="submit-btn">
//             Create Task
//           </button>
//         </form>
//       </div>
//     </>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import "./CreateTask.css";
import Sidebar from "../components/Sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import { api } from "../services/api";

export default function CreateTask() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "Medium",
      startDate: "",   // <-- add this

    dueDate: "",
    status: "Not Started",
    tags: "",
    attachment: null,
    teamMembers: [],
  });

  const [assignees, setAssignees] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const { user } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load users
  useEffect(() => {
    const load = async () => {
      setLoadingUsers(true);
      setUsersError("");
      try {
        const rows = await api.getApprovedUsers();
        setAssignees(Array.isArray(rows) ? rows : []);
      } catch (e) {
        setUsersError("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleTeamChange = (e) => {
    const { value, checked } = e.target;
    const id = String(value);
    setFormData((prev) => {
      if (checked) {
        if (prev.teamMembers.includes(id)) return prev;
        return { ...prev, teamMembers: [...prev.teamMembers, id] };
      }
      return {
        ...prev,
        teamMembers: prev.teamMembers.filter((v) => v !== id),
      };
    });
  };

  // Prevent leader from also being a member
  useEffect(() => {
    if (!formData.assignee) return;
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(
        (id) => id !== String(formData.assignee)
      ),
    }));
  }, [formData.assignee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assignee_id: formData.assignee,
        created_by: user.id,
        team: formData.teamMembers,
      };

      await api.createTask(payload);
      alert("✅ Task Created Successfully!");

      setFormData({
        title: "",
        description: "",
        assignee: "",
        priority: "Medium",
        dueDate: "",
        status: "Not Started",
        tags: "",
        attachment: null,
        teamMembers: [],
      });
      setIsDropdownOpen(false);
    } catch (err) {
      console.error("❌ Task creation failed:", err);
      alert("❌ Failed to create task");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar title="Create New Task" />
      <div className="task-form-container">
        <h2 className="form-title">Create New Task</h2>
        <p className="subtitle">Assign a new task to your team members</p>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Assign To (Team Leader) *</label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                required
                disabled={loadingUsers || !!usersError}
              >
                <option value="">
                  {loadingUsers
                    ? "Loading users..."
                    : usersError || "Select Team Leader"}
                </option>
                {assignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          {/* Team Members + Due Date */}
          <div className="form-row">
            <div className="form-group">
              <label>Team Members</label>
              <div
                className={`dropdown ${isDropdownOpen ? "show" : ""}`}
                ref={dropdownRef}
              >
                <button
                  type="button"
                  className="dropbtn"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {formData.teamMembers.length > 0
                    ? `${formData.teamMembers.length} selected`
                    : "Select Members"}
                </button>

                {isDropdownOpen && (
                  <div className="dropdown-content">
                    {assignees
                      .filter(
                        (u) => String(u.id) !== String(formData.assignee)
                      )
                      .map((u) => (
                        <label key={u.id} className="dropdown-item">
                          <input
                            type="checkbox"
                            value={u.id}
                            checked={formData.teamMembers.includes(
                              String(u.id)
                            )}
                            onChange={handleTeamChange}
                          />
                          {u.full_name}
                        </label>
                      ))}
                  </div>
                )}
              </div>
            </div>

<div className="form-group">
  <label>Start Date *</label>
  <input
    type="date"
    name="startDate"
    value={formData.startDate || ""}
    onChange={handleChange}
    required
  />
</div>

            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* File Upload Modern */}
          <div className="form-group">
            <label>Attachment (optional)</label>
            <div className="file-upload">
              <input
                type="file"
                name="attachment"
                id="fileUpload"
                onChange={handleChange}
              />
              <label htmlFor="fileUpload">
                <strong>Drag & drop</strong> your file here <br />
                or{" "}
                <span className="browse-link">browse from computer</span>
              </label>
              {formData.attachment && (
                <span className="file-name">{formData.attachment.name}</span>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Create Task
          </button>
        </form>
      </div>
    </>
  );
}
