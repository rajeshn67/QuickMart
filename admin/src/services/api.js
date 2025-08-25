import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken")
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
  getProfile: async () => {
    const response = await api.get("/auth/me")
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
  createProduct: async (productData) => {
    const response = await api.post("/products", productData)
    return response.data
  },
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
}

// Categories API
export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get("/categories")
    return response.data
  },
  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData)
    return response.data
  },
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}

// Orders API
export const ordersAPI = {
  getOrders: async (params = {}) => {
    const response = await api.get("/orders", { params })
    return response.data
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status })
    return response.data
  },
}

// Upload API for Cloudinary image handling
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append("image", file)

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
  uploadImages: async (files) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("images", file)
    })

    const response = await api.post("/upload/images", formData, {
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

export default api
