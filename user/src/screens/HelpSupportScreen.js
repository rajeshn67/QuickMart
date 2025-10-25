"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"
import { chatAPI } from "../services/api"

export default function HelpSupportScreen({ navigation }) {
  const { user } = useAuth()
  const { socket, isConnected, joinChat, sendMessage, sendTyping } = useSocket()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [adminTyping, setAdminTyping] = useState(false)
  const flatListRef = useRef(null)

  useEffect(() => {
    loadChat()
    setupSocketListeners()
  }, [])

  useEffect(() => {
    if (chat && socket) {
      joinChat(chat._id)
    }
  }, [chat, socket])

  const loadChat = async () => {
    try {
      setLoading(true)
      const response = await chatAPI.getChat()
      
      if (response.chat) {
        setChat(response.chat)
        setMessages(response.messages || [])
      } else {
        // Create new chat if none exists
        const createResponse = await chatAPI.createChat()
        setChat(createResponse.chat)
        setMessages([])
      }
    } catch (error) {
      console.error("Error loading chat:", error)
      Alert.alert("Error", "Failed to load chat. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const setupSocketListeners = () => {
    if (!socket) return

    // Listen for new messages in real-time
    socket.on("new_message", (message) => {
      // Avoid duplicates - check if message already exists
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
      scrollToBottom()
    })

    // Listen for admin messages (backup listener)
    socket.on("new_admin_message", (data) => {
      if (data.chatId === chat?._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === data.message._id)
          if (exists) return prev
          return [...prev, data.message]
        })
        scrollToBottom()
      }
    })

    socket.on("user_typing", (data) => {
      if (data.userId !== user?._id) {
        setAdminTyping(data.isTyping)
      }
    })

    socket.on("error", (error) => {
      Alert.alert("Error", error.message)
    })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chat || sending) return
    if (!socket || !isConnected) {
      Alert.alert("Error", "Not connected to server. Please check your connection.")
      return
    }

    const messageText = newMessage.trim()
    setNewMessage("")
    setSending(true)

    console.log("Sending message:", messageText, "to chat:", chat._id)

    try {
      sendMessage(chat._id, messageText)
      sendTyping(chat._id, false)
      console.log("Message sent via socket")
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (text) => {
    setNewMessage(text)
    if (text.length > 0 && !isTyping) {
      setIsTyping(true)
      sendTyping(chat?._id, true)
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false)
      sendTyping(chat?._id, false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender._id === user?._id
    const isAdmin = item.sender.role === "admin"
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.adminMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.adminBubble
        ]}>
          {!isUser && (
            <Text style={styles.senderName}>
              {isAdmin ? "Admin" : item.sender.fullName}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.adminMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.adminMessageTime
          ]}>
            {new Date(item.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    )
  }

  const renderTypingIndicator = () => {
    if (!adminTyping) return null
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>Admin is typing...</Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            {isConnected ? "Connected" : "Connecting..."}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            isConnected ? styles.connectedDot : styles.disconnectedDot
          ]} />
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={handleTyping}
              placeholder="Type your message..."
              multiline
              maxLength={500}
              editable={!sending && isConnected}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending || !isConnected}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!newMessage.trim() || sending || !isConnected) ? "#ccc" : "#4CAF50"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  statusIndicator: {
    padding: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectedDot: {
    backgroundColor: "#4CAF50",
  },
  disconnectedDot: {
    backgroundColor: "#ef4444",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#ECE5DD",
  },
  messagesList: {
    flex: 1,
    backgroundColor: "#ECE5DD",
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 8,
    width: "100%",
    flexDirection: "row",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  adminMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },
  adminBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: "#000",
  },
  adminMessageText: {
    color: "#000",
  },
  messageTime: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  userMessageTime: {
    color: "#667781",
  },
  adminMessageTime: {
    color: "#667781",
  },
  senderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
  },
  typingContainer: {
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: "#f1f3f4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  typingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
})
