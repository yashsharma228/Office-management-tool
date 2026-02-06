import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  return user.role === "admin" ? <AdminDashboard /> : <UserDashboard />;
}
