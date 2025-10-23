const express = require("express")
const Chat = require("../models/Chat")
const Message = require("../models/Message")
const User = require("../models/User")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get user's chat
router.get("/", auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id })
      .populate("user", "fullName email")
      .populate("admin", "fullName email")
      .sort({ lastMessageAt: -1 })

    if (!chat) {
      return res.json({ chat: null })
    }

    // Get recent messages
    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "fullName role")
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({
      chat,
      messages: messages.reverse(),
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create or get user chat
router.post("/", auth, async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id })

    if (!chat) {
      chat = new Chat({
        user: req.user._id,
        status: "open",
      })
      await chat.save()
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate("user", "fullName email")
      .populate("admin", "fullName email")

    res.json({
      message: "Chat created successfully",
      chat: populatedChat,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all chats for admin
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}

    if (status) {
      query.status = status
    }

    const chats = await Chat.find(query)
      .populate("user", "fullName email")
      .populate("admin", "fullName email")
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Chat.countDocuments(query)

    res.json({
      chats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get specific chat for admin
router.get("/admin/:chatId", adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("user", "fullName email")
      .populate("admin", "fullName email")

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    // Get all messages for this chat
    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "fullName role")
      .sort({ createdAt: 1 })

    res.json({
      chat,
      messages,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Assign chat to admin
router.put("/admin/:chatId/assign", adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { admin: req.user._id },
      { new: true }
    )
      .populate("user", "fullName email")
      .populate("admin", "fullName email")

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    res.json({
      message: "Chat assigned successfully",
      chat,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update chat status
router.put("/admin/:chatId/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body

    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { status },
      { new: true }
    )
      .populate("user", "fullName email")
      .populate("admin", "fullName email")

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    res.json({
      message: "Chat status updated successfully",
      chat,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get chat messages
router.get("/:chatId/messages", auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query

    const chat = await Chat.findById(req.params.chatId)
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }

    // Check if user has access to this chat
    if (req.user.role === "user" && chat.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (req.user.role === "admin" && chat.admin && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "fullName role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    res.json({
      messages: messages.reverse(),
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
