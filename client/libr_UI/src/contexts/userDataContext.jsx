import { createContext, useContext, useState, useEffect } from "react";

const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [userLoading, setLoading] = useState(false);

  async function addUser(userData) {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add user");
      }
      setUsers((prev) => [...prev, userData]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchUsers();
  }, []);

  const userValue = {
    users,
    userLoading,
    fetchUsers,
    addUser,
  };

  return (
    <UsersContext.Provider value={userValue}>{children}</UsersContext.Provider>
  );
}

export function useUsersData() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsersData must be used within a UsersProvider");
  return ctx;
}
