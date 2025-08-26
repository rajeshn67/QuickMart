const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Product = require("../models/Product")
const { auth } = require("../middleware/auth")

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image category'
    })
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ cart: user.cart })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add item to cart
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    // Verify product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    )

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      user.cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      user.cart.push({ product: productId, quantity })
    }

    await user.save()

    // Populate the cart before sending response
    await user.populate({
      path: 'cart.product',
      select: 'name price image category'
    })

    res.json({ 
      message: "Item added to cart", 
      cart: user.cart 
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update item quantity in cart
router.put("/update", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body

    if (!productId || quantity < 0) {
      return res.status(400).json({ message: "Valid product ID and quantity are required" })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    )

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" })
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      user.cart.splice(itemIndex, 1)
    } else {
      // Update quantity
      user.cart[itemIndex].quantity = quantity
    }

    await user.save()

    // Populate the cart before sending response
    await user.populate({
      path: 'cart.product',
      select: 'name price image category'
    })

    res.json({ 
      message: "Cart updated", 
      cart: user.cart 
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Remove item from cart
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    )

    await user.save()

    // Populate the cart before sending response
    await user.populate({
      path: 'cart.product',
      select: 'name price image category'
    })

    res.json({ 
      message: "Item removed from cart", 
      cart: user.cart 
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Clear entire cart
router.delete("/clear", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.cart = []
    await user.save()

    res.json({ 
      message: "Cart cleared", 
      cart: [] 
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
