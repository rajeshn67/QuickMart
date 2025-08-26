const express = require("express")
const Order = require("../models/Order")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      user: req.user._id,
    }

    const order = new Order(orderData)
    await order.save()

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "fullName email phone")
      .populate("items.product", "name image price unit")

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image price unit")
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all orders (Admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const query = {}

    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate("user", "fullName email phone")
      .populate("items.product", "name image price unit")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Order.countDocuments(query)

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Cancel user's own order
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" })
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" })
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: 'cancelled' }, 
      { new: true }
    )
      .populate("user", "fullName email phone")
      .populate("items.product", "name image price unit")

    res.json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update order status (Admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("user", "fullName email phone")
      .populate("items.product", "name image price unit")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
