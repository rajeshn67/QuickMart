"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem("cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      // Reset cart if there's an error loading
      setCartItems([])
    }
  }

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(items))
    } catch (error) {
      console.error("Error saving cart:", error)
      // Could show a toast or alert here
    }
  }

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) {
      console.error("Invalid product data:", product)
      return
    }

    if (quantity <= 0) {
      console.error("Invalid quantity:", quantity)
      return
    }

    const existingItem = cartItems.find((item) => item.product._id === product._id)

    let updatedCart
    if (existingItem) {
      updatedCart = cartItems.map((item) =>
        item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item,
      )
    } else {
      updatedCart = [...cartItems, { product, quantity }]
    }

    setCartItems(updatedCart)
    saveCart(updatedCart)
  }

  const removeFromCart = (productId) => {
    if (!productId) {
      console.error("Invalid product ID:", productId)
      return
    }

    const updatedCart = cartItems.filter((item) => item.product._id !== productId)
    setCartItems(updatedCart)
    saveCart(updatedCart)
  }

  const updateQuantity = (productId, quantity) => {
    if (!productId) {
      console.error("Invalid product ID:", productId)
      return
    }

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const updatedCart = cartItems.map((item) => (item.product._id === productId ? { ...item, quantity } : item))
    setCartItems(updatedCart)
    saveCart(updatedCart)
  }

  const clearCart = () => {
    setCartItems([])
    saveCart([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
