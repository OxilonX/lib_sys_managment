import { createContext, useContext, useState, useEffect } from "react";
const API_BASE = "http://localhost:5000/api/";
const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [currUser, setCurrUser] = useState({ success: false, user: {} });

  async function addUser(userData) {
    setUserLoading(true);
    try {
      const res = await fetch(`${API_BASE}users`, {
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
      setUserLoading(false);
    }
  }

  async function fetchUsers() {
    setUserLoading(true);
    try {
      const res = await fetch(`${API_BASE}users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUserLoading(false);
    }
  }
  useEffect(() => {
    fetchUsers();
  }, []);
  async function loginUser(userData) {
    setUserLoading(true);
    try {
      const res = await fetch(`${API_BASE}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setCurrUser({ success: false });
        return data;
      }
      setCurrUser({ success: true, user: data.user });
      return data;
    } finally {
      setUserLoading(false);
    }
  }
  const userValue = {
    users,
    userLoading,
    currUser,
    fetchUsers,
    addUser,
    loginUser,
    setCurrUser,
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
