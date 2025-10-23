"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { AppState } from "react-native"
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
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    loadUser()
    
    // Set up periodic token refresh (every 6 hours)
    const refreshInterval = setInterval(async () => {
      if (user) {
        console.log("Performing background token refresh...")
        await refreshToken()
      }
    }, 6 * 60 * 60 * 1000) // 6 hours

    // Set up app state change listener to refresh token when app becomes active
    const handleAppStateChange = async () => {
      if (user) {
        console.log("App became active, refreshing token...")
        await refreshToken()
      }
    }

    // Listen for app state changes
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      clearInterval(refreshInterval)
      subscription?.remove()
    }
  }, [user])

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const tokenDataStr = await AsyncStorage.getItem("userTokenData")
      
      console.log("Token found in storage:", !!token)
      
      if (token && tokenDataStr) {
        try {
          const tokenData = JSON.parse(tokenDataStr)
          
          // Check if token is expired
          if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
            console.log("Token has expired, removing from storage")
            await AsyncStorage.removeItem("userToken")
            await AsyncStorage.removeItem("userTokenData")
            setUser(null)
            return
          }
          
          // Try to validate the token
          const userData = await authAPI.getProfile()
          console.log("User data loaded:", userData)
          setUser(userData.user)
        } catch (error) {
          console.error("Error loading user profile:", error)
          // Only remove token if it's a clear authentication error
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log("Token expired or invalid, removing token")
            await AsyncStorage.removeItem("userToken")
            await AsyncStorage.removeItem("userTokenData")
            setUser(null)
          } else {
            // For network errors or other issues, keep the token and try again later
            console.log("Network or other error, keeping token for retry")
          }
        }
      }
    } catch (error) {
      console.error("Error in loadUser:", error)
    } finally {
      setIsInitialized(true)
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
      
      // Store token with expiration info
      const tokenData = {
        token: response.token,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        user: response.user
      }
      
      await AsyncStorage.setItem("userToken", response.token)
      await AsyncStorage.setItem("userTokenData", JSON.stringify(tokenData))
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
      
      // Store token with expiration info
      const tokenData = {
        token: response.token,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        user: response.user
      }
      
      await AsyncStorage.setItem("userToken", response.token)
      await AsyncStorage.setItem("userTokenData", JSON.stringify(tokenData))
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
      // Clear all authentication data
      await AsyncStorage.removeItem("userToken")
      await AsyncStorage.removeItem("userTokenData")
      setUser(null)
      console.log("User logged out successfully")
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

  const refreshToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      if (token) {
        // First try to validate the token
        const validation = await authAPI.validateToken()
        if (validation.valid) {
          // Token is still valid, get full profile
          const userData = await authAPI.getProfile()
          setUser(userData.user)
          return true
        }
      }
      return false
    } catch (error) {
      console.error("Error refreshing token:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Token is invalid, logging out user")
        await AsyncStorage.removeItem("userToken")
        setUser(null)
      }
      return false
    }
  }

  const value = {
    user,
    loading,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
