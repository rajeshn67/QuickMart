"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (token) {
        const userData = await authAPI.getProfile()
        if (userData.user.role === "admin") {
          setUser(userData.user)
        } else {
          localStorage.removeItem("adminToken")
        }
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
      localStorage.removeItem("adminToken")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      if (response.user.role !== "admin") {
        throw new Error("Access denied. Admin only.")
      }
      localStorage.setItem("adminToken", response.token)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("adminToken")
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
