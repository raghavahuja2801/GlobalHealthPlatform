// This file contains the AuthContext and AuthProvider components which are used to manage the user authentication state.
// This is basically used so that the user can login and register and the user details are stored in the context and can be accessed from any component.


import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state to block rendering during initialization

  // Function to fetch user details
  const fetchUser = async (token) => {
    try {
      const response = await axios.get("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data); // Set user details from the response
    } catch (err) {
      console.error("Failed to fetch user:", err.response?.data || err.message);
      logout(); // Clear user state if fetching user fails
    }
  };

  // Initialize user on app load
  const initializeUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await fetchUser(token); // Fetch user details if token exists
    }
    setLoading(false); // Finish initialization
  };
  // when ever you go to the website the user will be checked if the user is logged in or not
  useEffect(() => {
    initializeUser(); // Only run on mount
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token } = response.data; // Extract the token from the response
      localStorage.setItem("token", token); // Save the token to localStorage
      await fetchUser(token); // Fetch user details
      return user;
    } catch (err) {
      console.log("Login failed:", err.response?.data || err.message);
    }
  };

  // Register function
  const register = async ({ name, email, password, role }) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        {
          name,
          email,
          password,
          role,
        }
      );
      login(email, password);
      console.log("signed in");
    } catch (err) {
      console.log("Registration failed:", err.response?.data || err.message);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null); // Clear user state
    localStorage.removeItem("token"); // Remove token from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}{" "}
      {/* Block rendering until initialization is complete */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
