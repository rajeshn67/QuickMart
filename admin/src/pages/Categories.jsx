"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { categoriesAPI } from "../services/api"
import CategoryModal from "../components/CategoryModal"

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoriesAPI.deleteCategory(categoryId)
        loadCategories()
      } catch (error) {
        console.error("Error deleting category:", error)
        alert("Error deleting category")
      }
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingCategory(null)
    loadCategories()
  }

  if (loading) {
    return <div>Loading categories...</div>
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Categories</h1>
        <button className="btn btn-primary" onClick={handleAddCategory}>
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {categories.map((category) => (
          <div key={category._id} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{category.name}</h3>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>{category.description}</p>
                <span className={`status-badge ${category.isActive ? "status-confirmed" : "status-cancelled"}`}>
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEditCategory(category)}
                  style={{ padding: "8px" }}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteCategory(category._id)}
                  style={{ padding: "8px" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#6b7280" }}>No categories found. Add your first category to get started.</p>
        </div>
      )}

      {/* Category Modal */}
      {showModal && <CategoryModal category={editingCategory} onClose={handleModalClose} />}
    </div>
  )
}
