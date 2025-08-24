"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { categoriesAPI } from "../services/api"
import ImageUpload from "./ImageUpload"

export default function CategoryModal({ category, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
      })
    }
  }, [category])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (category) {
        await categoriesAPI.updateCategory(category._id, formData)
      } else {
        await categoriesAPI.createCategory(formData)
      }

      onClose()
    } catch (error) {
      setError(error.response?.data?.message || "Error saving category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{category ? "Edit Category" : "Add New Category"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category Image</label>
            <ImageUpload value={formData.image} onChange={handleImageUpload} />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              Active Category
            </label>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : category ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
