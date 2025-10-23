const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const http = require("http")
const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const orderRoutes = require("./routes/orders")
const categoryRoutes = require("./routes/categories")
const uploadRoutes = require("./routes/upload")
const cartRoutes = require("./routes/cart")
const chatRoutes = require("./routes/chat")

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: "*",   // 👈 allow all origins
  })
);
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production"
//         ? ["https://your-admin-domain.com", "https://your-app-domain.com"]
//         : ["http://localhost:5173", "http://localhost:3001", "http://192.168.1.100:19006"],
//     credentials: true,
//   }),
// )

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/chat", chatRoutes)

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully")
    require("./utils/seedAdmin")()
  })
  .catch((err) => console.error("MongoDB connection error:", err))

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "QuickMart Backend API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      categories: "/api/categories",
      upload: "/api/upload",
      cart: "/api/cart",
      chat: "/api/chat",
    },
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  })
})

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const User = require("./models/User")
    const user = await User.findById(decoded.userId).select("-password")
    
    if (!user) {
      return next(new Error("User not found"))
    }

    socket.userId = user._id.toString()
    socket.userRole = user.role
    next()
  } catch (error) {
    next(new Error("Authentication error"))
  }
})

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`)

  // Join user to their personal room
  socket.join(`user_${socket.userId}`)

  // If admin, join admin room
  if (socket.userRole === "admin") {
    socket.join("admin_room")
  }

  // Handle joining chat room
  socket.on("join_chat", (chatId) => {
    socket.join(`chat_${chatId}`)
    console.log(`User ${socket.userId} joined chat ${chatId}`)
  })

  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      const { chatId, message } = data
      const Message = require("./models/Message")
      const Chat = require("./models/Chat")

      // Create message
      const newMessage = new Message({
        chat: chatId,
        sender: socket.userId,
        message: message,
      })

      await newMessage.save()

      // Update chat
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message,
        lastMessageAt: new Date(),
        $inc: {
          [`unreadCount.${socket.userRole === "admin" ? "user" : "admin"}`]: 1,
        },
      })

      // Populate sender info
      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "fullName role")

      // Emit to chat room
      io.to(`chat_${chatId}`).emit("new_message", populatedMessage)

      // Notify admin if user sent message
      if (socket.userRole === "user") {
        io.to("admin_room").emit("new_user_message", {
          chatId,
          message: populatedMessage,
        })
      }

      // Notify user if admin sent message
      if (socket.userRole === "admin") {
        const chat = await Chat.findById(chatId).populate("user")
        if (chat.user) {
          io.to(`user_${chat.user._id}`).emit("new_admin_message", {
            chatId,
            message: populatedMessage,
          })
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      socket.emit("error", { message: "Failed to send message" })
    }
  })

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(`chat_${data.chatId}`).emit("user_typing", {
      userId: socket.userId,
      isTyping: data.isTyping,
    })
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})
