const express = require("express")
const Order = require("../models/Order")
const Product = require("../models/Product")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const { items } = req.body

    // Validate that items are provided
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" })
    }

    // Check stock availability and validate products
    const productIds = items.map(item => item.product)
    const products = await Product.find({ _id: { $in: productIds } })
    
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products not found" })
    }

    // Check stock availability for each item
    const stockIssues = []
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product)
      if (product.stock < item.quantity) {
        stockIssues.push({
          product: product.name,
          requested: item.quantity,
          available: product.stock
        })
      }
    }

    if (stockIssues.length > 0) {
      return res.status(400).json({ 
        message: "Insufficient stock for some items", 
        stockIssues 
      })
    }

    // Create the order
    const orderData = {
      ...req.body,
      user: req.user._id,
    }

    const order = new Order(orderData)
    await order.save()

    // Reduce stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      )
    }

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

    // Restore stock for each product in the order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      )
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
    const orderId = req.params.id

    // Get the current order to check previous status
    const currentOrder = await Order.findById(orderId)
    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" })
    }

    // If changing to cancelled, restore stock
    if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
      for (const item of currentOrder.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        )
      }
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
      .populate("user", "fullName email phone")
      .populate("items.product", "name image price unit")

    res.json({
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
