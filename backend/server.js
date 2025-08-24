const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const orderRoutes = require("./routes/orders")
const categoryRoutes = require("./routes/categories")
const uploadRoutes = require("./routes/upload")

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
// app.use(
//   cors({
//     origin: "*",   // 👈 allow all origins
//   })
// );
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-admin-domain.com", "https://your-app-domain.com"]
        : ["http://localhost:5173", "http://localhost:3001", "http://192.168.1.100:19006"],
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/upload", uploadRoutes)

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

const PORT = process.env.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})
