import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Normalize base URL: ensure it always ends with '/api'
const RAW_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"
const BASE_URL = RAW_BASE.endsWith("/api")
  ? RAW_BASE
  : `${RAW_BASE.replace(/\/$/, "")}/api`

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// Log the resolved base URL once for debugging
console.log("API base URL:", BASE_URL)

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error)
      throw new Error('Request timeout. Please check your internet connection.')
    }
    if (!error.response) {
      console.error('Network error:', error)
      throw new Error('Network error. Please check your internet connection.')
    }
    // Enhanced diagnostics for API errors
    const { status, data, config } = error.response
    const url = config?.baseURL ? `${config.baseURL}${config.url}` : config?.url
    const serverMsg = data?.message || data?.error || JSON.stringify(data)
    console.error(`API error ${status} at ${url}:`, serverMsg)
    throw error
  }
)

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  },
  register: async (fullName, email, password) => {
    const response = await api.post("/auth/register", { fullName, email, password })
    return response.data
  },
  getProfile: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
  updateProfile: async (data) => {
    const response = await api.put("/auth/profile", data)
    return response.data
  },
}

// Products API
export const productsAPI = {
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params })
    return response.data
  },
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
}

// Upload API
export const uploadAPI = {
  uploadImage: async (imageFile) => {
    const formData = new FormData()
    formData.append("image", imageFile)
    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
  uploadProfileImage: async (imageFile) => {
    const formData = new FormData()
    formData.append("image", imageFile)
    const response = await api.post("/upload/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
  deleteImage: async (publicId) => {
    const response = await api.delete(`/upload/image/${publicId}`)
    return response.data
  },
}

// Categories API
export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get("/categories")
    return response.data
  },
}

// Cart API
export const cartAPI = {
  getCart: async () => {
    const response = await api.get("/cart")
    return response.data
  },
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post("/cart/add", { productId, quantity })
    return response.data
  },
  updateCart: async (productId, quantity) => {
    const response = await api.put("/cart/update", { productId, quantity })
    return response.data
  },
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`)
    return response.data
  },
  clearCart: async () => {
    const response = await api.delete("/cart/clear")
    return response.data
  },
}

// Orders API
export const ordersAPI = {
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData)
    return response.data
  },
  getMyOrders: async () => {
    const response = await api.get("/orders/my-orders")
    return response.data
  },
  cancelOrder: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/cancel`)
    return response.data
  },
}

export default api
