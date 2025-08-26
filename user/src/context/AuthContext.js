"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      console.log("Token found in storage:", !!token)
      if (token) {
        try {
          const userData = await authAPI.getProfile()
          console.log("User data loaded:", userData)
          setUser(userData.user)
        } catch (error) {
          console.error("Error loading user profile:", error)
          // Only remove token if it's an authentication error
          if (error.response?.status === 401) {
            await AsyncStorage.removeItem("userToken")
            console.log("Token removed due to 401 error")
          }
        }
      }
    } catch (error) {
      console.error("Error in loadUser:", error)
    }
  }

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" }
    }

    setLoading(true)
    try {
      console.log("Attempting login with:", email)
      const response = await authAPI.login(email, password)
      console.log("Login response:", response)
      
      if (!response.token || !response.user) {
        return { success: false, error: "Invalid response from server" }
      }
      
      await AsyncStorage.setItem("userToken", response.token)
      setUser(response.user)
      console.log("User set in context:", response.user)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      let errorMessage = "Login failed"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (fullName, email, password) => {
    if (!fullName || !email || !password) {
      return { success: false, error: "All fields are required" }
    }

    if (fullName.trim().length < 2) {
      return { success: false, error: "Full name must be at least 2 characters" }
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    setLoading(true)
    try {
      const response = await authAPI.register(fullName, email, password)
      
      if (!response.token || !response.user) {
        return { success: false, error: "Invalid response from server" }
      }
      
      await AsyncStorage.setItem("userToken", response.token)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      let errorMessage = "Registration failed"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear all user-related data from AsyncStorage
      await AsyncStorage.clear()
      setUser(null)
      console.log("User logged out successfully - all data cleared")
    } catch (error) {
      console.error("Error logging out:", error)
      // Even if there's an error, clear the user state
      setUser(null)
    }
  }

  const updateProfile = async (profileData) => {
    setLoading(true)
    try {
      console.log("AuthContext - Updating profile with data:", profileData)
      const response = await authAPI.updateProfile(profileData)
      console.log("AuthContext - Update response:", response)
      setUser(response.user)
      console.log("AuthContext - User updated in context:", response.user)
      return { success: true }
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
