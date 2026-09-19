import React, { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../utils/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("homelyhub_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check auth on load
  const checkUser = async () => {
    try {
      const res = await axiosInstance.get("/v1/rent/user/me");
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("homelyhub_user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      // If 401 or invalid session, don't wipe immediately if we have cached user, or clear gracefully
      console.log("Not logged in or session expired");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/v1/rent/user/login", { email, password });
      const loggedUser = res.data?.user;
      setUser(loggedUser);
      localStorage.setItem("homelyhub_user", JSON.stringify(loggedUser));
      toast.success("Logged in successfully!");
      return loggedUser;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Login failed";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/v1/rent/user/signup", userData);
      const newUser = res.data?.user;
      setUser(newUser);
      localStorage.setItem("homelyhub_user", JSON.stringify(newUser));
      toast.success("Account created successfully!");
      return newUser;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Signup failed";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.get("/v1/rent/user/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    setUser(null);
    localStorage.removeItem("homelyhub_user");
    toast.success("Logged out successfully");
  };

  const updateProfile = async (updatedFields) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch("/v1/rent/user/updateMe", updatedFields);
      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("homelyhub_user", JSON.stringify(updatedUser));
      }
      toast.success("Profile Updated Successfully!");
      return updatedUser;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Profile update failed";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async ({ passwordCurrent, password, passwordConfirm }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch("/v1/rent/user/updateMyPassword", {
        passwordCurrent,
        password,
        passwordConfirm,
      });
      const updatedUser = res.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("homelyhub_user", JSON.stringify(updatedUser));
      }
      toast.success("Password Updated Successfully!");
      return updatedUser;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Password update failed";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
        checkUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
