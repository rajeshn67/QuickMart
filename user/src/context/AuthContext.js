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
      if (token) {
        const userData = await authAPI.getProfile()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("Error loading user:", error)
      await AsyncStorage.removeItem("userToken")
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await authAPI.login(email, password)
      await AsyncStorage.setItem("userToken", response.token)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Login failed" }
    } finally {
      setLoading(false)
    }
  }

  const register = async (fullName, email, password) => {
    setLoading(true)
    try {
      const response = await authAPI.register(fullName, email, password)
      await AsyncStorage.setItem("userToken", response.token)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Registration failed" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken")
      setUser(null)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
