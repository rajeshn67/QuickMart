const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "closed", "pending"],
      default: "open",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      user: {
        type: Number,
        default: 0,
      },
      admin: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
chatSchema.index({ user: 1, status: 1 })
chatSchema.index({ admin: 1, status: 1 })
chatSchema.index({ lastMessageAt: -1 })

module.exports = mongoose.model("Chat", chatSchema)
