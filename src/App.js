import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Expenses from "./pages/Expenses/Expenses";
import Dashboard from "./pages/Dashboard";
import CreateTask from "./pages/CreateTask";
import TaskBoard from "./pages/TaskBoard";
import Mytask from "./pages/Mytask";
import Calender from "./pages/Calender";
import UserManage from "./pages/UserManage";
import Assign from "./pages/Assign";
import Reports from "./pages/Reports";
import Attendence from "./pages/Attendence";
import Notifications from "./pages/Notifications";
import Documents from "./pages/Documents";
import ComplainBox from "./pages/ComplainBox";

import Notebook from "./pages/Notebook";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/create-task"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/taskBoard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TaskBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-manage"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assign"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Assign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notebook"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Notebook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Both Admin and User Routes */}
      <Route
        path="/calender"
        element={
          <ProtectedRoute>
            <Calender />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendence"
        element={
          <ProtectedRoute>
            <Attendence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mytask"
        element={
          <ProtectedRoute>
            <Mytask />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complainBox"
        element={
          <ProtectedRoute>
            <ComplainBox />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
