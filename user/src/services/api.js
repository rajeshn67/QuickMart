import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

// Categories API
export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get("/categories")
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
}

export default api
