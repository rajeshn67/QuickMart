"use client"

import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { chatAPI } from "../services/api"

export default function ChatSupport() {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  // Initialize socket once
  useEffect(() => {
    initializeSocket()
    loadChats()
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      console.log("Received new_message:", message)
      setMessages((prev) => {
        const exists = prev.some(m => m._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
      loadChats()
    }

    const handleNewUserMessage = (data) => {
      console.log("Received new_user_message:", data)
      loadChats()
    }

    const handleUserTyping = (data) => {
      if (data.userId !== "admin") {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.userId)
          } else {
            newSet.delete(data.userId)
          }
          return newSet
        })
      }
    }

    const handleError = (err) => {
      console.error("Socket error:", err)
    }

    socket.on("new_message", handleNewMessage)
    socket.on("new_user_message", handleNewUserMessage)
    socket.on("user_typing", handleUserTyping)
    socket.on("error", handleError)

    return () => {
      socket.off("new_message", handleNewMessage)
      socket.off("new_user_message", handleNewUserMessage)
      socket.off("user_typing", handleUserTyping)
      socket.off("error", handleError)
    }
  }, [socket])

  // Handle chat selection
  useEffect(() => {
    if (selectedChat && socket && socket.connected) {
      loadChatMessages()
      socket.emit("join_chat", selectedChat._id)
      console.log("Joined chat:", selectedChat._id)
    }
  }, [selectedChat, socket])

  // Auto scroll
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSocket = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        console.error("No admin token found")
        return
      }

      // Remove /api from the URL for socket connection
      let socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
      if (socketUrl.includes("/api")) {
        socketUrl = socketUrl.replace("/api", "")
      }
      console.log("Connecting to socket:", socketUrl)
      
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000
      })

      newSocket.on("connect", () => {
        console.log("✅ Admin socket connected:", newSocket.id)
        setIsConnected(true)
      })

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Admin socket disconnected:", reason)
        setIsConnected(false)
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message)
        setIsConnected(false)
      })

      socketRef.current = newSocket
      setSocket(newSocket)
    } catch (error) {
      console.error("Error initializing socket:", error)
    }
  }

  const loadChats = async () => {
    try {
      const response = await chatAPI.getAdminChats()
      setChats(response.chats || [])
    } catch (error) {
      console.error("Error loading chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async () => {
    if (!selectedChat) return

    try {
      const response = await chatAPI.getAdminChat(selectedChat._id)
      setMessages(response.messages || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat)
    
    // Assign chat to current admin if not assigned
    if (!chat.admin) {
      try {
        await chatAPI.assignChat(chat._id)
        chat.admin = { _id: "current_admin", fullName: "You" }
      } catch (error) {
        console.error("Error assigning chat:", error)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return
    if (!socket || !socket.connected) {
      console.error("Socket not connected")
      alert("Not connected to server. Please refresh the page.")
      return
    }

    const messageText = newMessage.trim()
    setNewMessage("")
    setSending(true)

    console.log("Sending message:", messageText, "to chat:", selectedChat._id)

    try {
      socket.emit("send_message", {
        chatId: selectedChat._id,
        message: messageText,
      })
      console.log("Message sent via socket")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (text) => {
    setNewMessage(text)
    if (socket && selectedChat) {
      socket.emit("typing", {
        chatId: selectedChat._id,
        isTyping: text.length > 0,
      })
    }
  }

  const updateChatStatus = async (chatId, status) => {
    try {
      await chatAPI.updateChatStatus(chatId, status)
      loadChats()
    } catch (error) {
      console.error("Error updating chat status:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle size={16} color="#f59e0b" />
      case "closed":
        return <CheckCircle size={16} color="#10b981" />
      case "pending":
        return <Clock size={16} color="#6b7280" />
      default:
        return <MessageCircle size={16} color="#6b7280" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <div>Loading chats...</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)" }}>
      {/* Chat List */}
      <div style={{ width: "350px", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Customer Support</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              backgroundColor: isConnected ? "#10b981" : "#ef4444" 
            }} />
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {chats.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
              No chats available
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  backgroundColor: selectedChat?._id === chat._id ? "#f0f9ff" : "transparent",
                }}
                onClick={() => handleChatSelect(chat)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>
                      {chat.user?.fullName || "Unknown User"}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>
                      {chat.user?.email}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {getStatusIcon(chat.status)}
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(chat.status)}`}>
                      {chat.status}
                    </span>
                  </div>
                </div>
                
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                  {chat.lastMessage || "No messages yet"}
                </p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {formatTime(chat.lastMessageAt)}
                  </span>
                  {chat.unreadCount?.admin > 0 && (
                    <span style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      fontSize: "12px",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      minWidth: "20px",
                      textAlign: "center"
                    }}>
                      {chat.unreadCount.admin}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                    {selectedChat.user?.fullName}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6b7280" }}>
                    {selectedChat.user?.email}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={selectedChat.status}
                    onChange={(e) => updateChatStatus(selectedChat._id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#6b7280", marginTop: "40px" }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: message.sender.role === "admin" ? "flex-end" : "flex-start",
                      marginBottom: "16px"
                    }}
                  >
                    <div style={{
                      maxWidth: "70%",
                      padding: "12px 16px",
                      borderRadius: "18px",
                      backgroundColor: message.sender.role === "admin" ? "#4CAF50" : "#f1f3f4",
                      color: message.sender.role === "admin" ? "white" : "#333"
                    }}>
                      <p style={{ margin: 0, fontSize: "14px" }}>{message.message}</p>
                      <p style={{ 
                        margin: "4px 0 0 0", 
                        fontSize: "12px", 
                        opacity: 0.7 
                      }}>
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#f1f3f4",
                    borderRadius: "18px",
                    fontSize: "14px",
                    color: "#6b7280",
                    fontStyle: "italic"
                  }}>
                    Customer is typing...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{ padding: "20px", borderTop: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "24px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: newMessage.trim() && !sending ? "#4CAF50" : "#d1d5db",
                    color: "white",
                    border: "none",
                    borderRadius: "24px",
                    cursor: newMessage.trim() && !sending ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "100%",
            color: "#6b7280"
          }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
