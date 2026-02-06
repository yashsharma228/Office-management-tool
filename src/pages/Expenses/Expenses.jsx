import React from "react";
import { useAuth } from "../../context/AuthContext"; 
import AdminExpenses from "./AdminExpenses";
import UserExpenses from "./UserExpenses";

export default function Expenses() {
  const { user } = useAuth();

  if (!user) {
    return <h2>Please login to view expenses</h2>;
  }

  return (
    <div>
      {user.role === "admin" ? <AdminExpenses /> : <UserExpenses />}
    </div>
  );
}
