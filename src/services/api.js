// // services/api.js

// // const API_BASE_URL = "https://todo.geoplanetsolution.com/backend/api";
// // const API_BASE_URL = "http://localhost/backend/api";
// const API_BASE_URL = "http://localhost/app/backend/api";


// // ================== Helper ==================
// const getToken = () => localStorage.getItem("token") || "";

// const fetchWithAuth = async (url, options = {}) => {
//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//   };
//   const token = localStorage.getItem("token");
//   if (token) headers["Authorization"] = `Bearer ${token}`;

//   const res = await fetch(url, { ...options, headers });
//   const text = await res.text();

//   try {
//     return JSON.parse(text); // ✅ safe parse
//   } catch (e) {
//     console.error("Invalid JSON from server:", text);
//     throw e;
//   }
// };

// // ================== API ==================
// export const api = {
//   // ---------- AUTH ----------
//   login: async (credentials) => {
//     const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(credentials),
//     });
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     return response.json();
//   },

//   register: async (userData) => {
//     const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(userData),
//     });
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     return response.json();
//   },

//   // ---------- USERS ----------
//   getPendingUsers: async () => {
//     const response = await fetch(`${API_BASE_URL}/users/getUsers.php`);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     return response.json();
//   },

//   approveUser: async (userId) => {
//     return fetchWithAuth(`${API_BASE_URL}/users/approveUser.php`, {
//       method: "POST",
//       body: JSON.stringify({ user_id: userId }),
//     });
//   },

//   rejectUser: async (userId) => {
//     return fetchWithAuth(`${API_BASE_URL}/users/rejectUser.php`, {
//       method: "POST",
//       body: JSON.stringify({ user_id: userId }),
//     });
//   },

//   getApprovedUsers: async () => {
//     const response = await fetch(`${API_BASE_URL}/users/getApprovedUsers.php`);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     return response.json();
//   },

//   getUsers: async () => {
//     const res = await fetch(`${API_BASE_URL}/users/getUsers.php`);
//     if (!res.ok) throw new Error("HTTP error! status: " + res.status);
//     return res.json();
//   },

//   deleteUser: async (userId) => {
//     const response = await fetch(
//       `http://localhost/Office/app/backend/api/users/deleteUser.php?id=${userId}`,
//       {
//         method: "GET", // or "POST" if you handle POST in PHP
//       }
//     );

//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);

//     return data;
//   },


//   // ---------- TASKS ----------
//   createTask: async (taskData) => {
//     // ✅ Use FormData (because backend supports file upload)
//     const formData = new FormData();
//     Object.entries(taskData).forEach(([key, value]) => {
//       formData.append(key, value);
//     });

//     const res = await fetch(`${API_BASE_URL}/tasks.php?action=create`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${getToken()}`, // no "Content-Type", browser sets it
//       },
//       body: formData,
//     });

//     if (!res.ok) throw new Error("Failed to create task");
//     return await res.json();
//   },

//   getAllTasks: async () => {
//     const res = await fetch(`${API_BASE_URL}/tasks.php?action=getAll`, {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     });
//     if (!res.ok) throw new Error("Failed to fetch all tasks");
//     return await res.json();
//   },

//   getTaskStats: async () => {
//     return fetchWithAuth(`${API_BASE_URL}/tasks.php?action=getStats`);
//   },

//   getUserTasks: async (userId = null) => {
//     const url = userId
//       ? `${API_BASE_URL}/tasks.php?action=getUserTasks&userId=${userId}`
//       : `${API_BASE_URL}/tasks.php?action=getUserTasks`;

//     const res = await fetch(url, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${getToken()}`,
//       },
//     });

//     if (!res.ok) throw new Error("Failed to fetch tasks");
//     return await res.json();
//   },

//   updateTask: async (taskData) => {
//     const res = await fetch(`${API_BASE_URL}/tasks.php?action=update`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${getToken()}`,
//       },
//       body: JSON.stringify(taskData),
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Failed to update task");
//     return data;
//   },

//   updateTaskStatus: async (taskId, newStatus) => {
//     const res = await fetch(`${API_BASE_URL}/tasks.php?action=updateStatus`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${getToken()}`,
//       },
//       body: JSON.stringify({ taskId, status: newStatus }),
//     });

//     if (!res.ok) throw new Error("Failed to update task status");
//     return await res.json();
//   },



//   // ---------- NOTES ----------
//   getUserNotes: async (userId) => {
//     return fetchWithAuth(`${API_BASE_URL}/notes.php?action=get&userId=${userId}`);
//   },

//   addUserNote: async (userId, title, content) => {
//     return fetchWithAuth(`${API_BASE_URL}/notes.php?action=add`, {
//       method: "POST",
//       body: JSON.stringify({ userId, title, content }),
//     });
//   },

//   updateUserNote: async (noteId, title, content) => {
//     return fetchWithAuth(`${API_BASE_URL}/notes.php?action=update`, {
//       method: "PUT",
//       body: JSON.stringify({ id: noteId, title, content }),
//     });
//   },

//   deleteUserNote: async (noteId) => {
//     return fetchWithAuth(`${API_BASE_URL}/notes.php?action=delete`, {
//       method: "DELETE",
//       body: JSON.stringify({ id: noteId }),
//     });
//   },

// };





// services/api.js

// const API_BASE_URL = "https://todo.geoplanetsolution.com/backend/api";
// const API_BASE_URL = "http://localhost/backend/api";
// const API_BASE_URL = "http://localhost/app/backend/api";
const API_BASE_URL = "http://localhost/Office-management-tool/backend/api";

// ================== Helper ==================
const getToken = () => localStorage.getItem("token") || "";

const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Invalid JSON from server:", text);
    throw e;
  }
};

// ================== API ==================
export const api = {
  // ---------- AUTH ----------
// In your api service file
login: async (loginData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    // First check if response is OK
    if (!response.ok) {
      // Try to parse error response as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, create a generic error
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      
      // Use backend error message if available
      const error = new Error(errorData.message || "Login failed");
      error.data = errorData;
      throw error;
    }

    // If response is OK, parse and return data
    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw the error with proper context
    if (error.name === 'TypeError') {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
},

register: async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    // First check if response is OK
    if (!response.ok) {
      // Try to parse error response as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, create a generic error
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }
      
      // Use backend error message if available
      const error = new Error(errorData.message || "Registration failed");
      error.data = errorData;
      throw error;
    }

    // If response is OK, parse and return data
    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw the error with proper context
    if (error.name === 'TypeError') {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
},

  // ---------- USERS ----------
  getPendingUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/getUsers.php`); // ✅ fixed path
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  approveUser: async (userId) => {
    return fetchWithAuth(`${API_BASE_URL}/users/approveUser.php`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  },

  rejectUser: async (userId) => {
    return fetchWithAuth(`${API_BASE_URL}/users/rejectUser.php`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  },

  getApprovedUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/getApprovedUsers.php`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users/getUsers.php`); // ✅ fixed path
    if (!res.ok) throw new Error("HTTP error! status: " + res.status);
    return res.json();
  },

  deleteUser: async (userId) => {
    const response = await fetch(
      `${API_BASE_URL}/users/deleteUser.php?id=${userId}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    if (!data.success) throw new Error(data.message);

    return data;
  },

  // ---------- TASKS ----------
  createTask: async (taskData) => {
    // ✅ If already FormData (from frontend), just send it
    const isFormData = taskData instanceof FormData;
    let body = taskData;

    if (!isFormData) {
      // convert JSON -> FormData
      body = new FormData();
      Object.entries(taskData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          body.append(key, JSON.stringify(value));
        } else {
          body.append(key, value);
        }
      });
    }

    const res = await fetch(`${API_BASE_URL}/tasks/tasks.php?action=create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body,
    });

    if (!res.ok) throw new Error("Failed to create task");
    return await res.json();
  },

  getAllTasks: async () => {
    const res = await fetch(`${API_BASE_URL}/tasks/tasks.php?action=getAll`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Failed to fetch all tasks");
    return await res.json();
  },

  getTaskStats: async () => {
    return fetchWithAuth(`${API_BASE_URL}/tasks/tasks.php?action=getStats`);
  },

  getUserTasks: async (userId = null) => {
    const url = userId
      ? `${API_BASE_URL}/tasks/tasks.php?action=getUserTasks&userId=${userId}`
      : `${API_BASE_URL}/tasks/tasks.php?action=getUserTasks`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch tasks");
    return await res.json();
  },

  updateTask: async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks/tasks.php?action=update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update task");
    return data;
  },

  updateTaskStatus: async (taskId, newStatus) => {
    const res = await fetch(`${API_BASE_URL}/tasks/tasks.php?action=updateStatus`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ taskId, status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update task status");
    return await res.json();
  },

  // ---------- NOTES ----------
  getUserNotes: async (userId) => {
    return fetchWithAuth(`${API_BASE_URL}/notes.php?action=get&userId=${userId}`);
  },

  addUserNote: async (userId, title, content) => {
    return fetchWithAuth(`${API_BASE_URL}/notes.php?action=add`, {
      method: "POST",
      body: JSON.stringify({ userId, title, content }),
    });
  },

  updateUserNote: async (noteId, title, content) => {
    return fetchWithAuth(`${API_BASE_URL}/notes.php?action=update`, {
      method: "PUT",
      body: JSON.stringify({ id: noteId, title, content }),
    });
  },

  deleteUserNote: async (noteId) => {
    return fetchWithAuth(`${API_BASE_URL}/notes.php?action=delete`, {
      method: "DELETE",
      body: JSON.stringify({ id: noteId }),
    });
  }

};
