"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import AsyncStorage from "@react-native-async-storage/async-storage"

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    initializeSocket()
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const initializeSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      if (!token) return

      const socketUrl = process.env.EXPO_PUBLIC_API_URL || "https://quickmart-keqz.onrender.com"
      
      const newSocket = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket"],
      })

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id)
        setIsConnected(true)
      })

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setIsConnected(false)
      })

      setSocket(newSocket)
    } catch (error) {
      console.error("Error initializing socket:", error)
    }
  }

  const joinChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit("join_chat", chatId)
    }
  }

  const sendMessage = (chatId, message) => {
    if (socket && isConnected) {
      socket.emit("send_message", { chatId, message })
    }
  }

  const sendTyping = (chatId, isTyping) => {
    if (socket && isConnected) {
      socket.emit("typing", { chatId, isTyping })
    }
  }

  const value = {
    socket,
    isConnected,
    joinChat,
    sendMessage,
    sendTyping,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
