"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { uploadAPI } from "../services/api"

export default function ImageUpload({ value, onChange, multiple = false }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      if (multiple) {
        const result = await uploadAPI.uploadImages(Array.from(files))
        const newImages = result.images.map((img) => img.url)
        onChange([...(value || []), ...newImages])
      } else {
        const result = await uploadAPI.uploadImage(files[0])
        onChange(result.url)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error uploading image(s)")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files)
  }

  const removeImage = (index) => {
    if (multiple) {
      const newImages = [...(value || [])]
      newImages.splice(index, 1)
      onChange(newImages)
    } else {
      onChange("")
    }
  }

  const images = multiple ? value || [] : value ? [value] : []

  return (
    <div>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragOver ? "#4CAF50" : "#d1d5db"}`,
          borderRadius: "8px",
          padding: "40px 20px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: dragOver ? "#f0f9ff" : "#fafafa",
          transition: "all 0.2s",
          marginBottom: "16px",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {uploading ? (
          <div>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #4CAF50",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "#666" }}>Uploading...</p>
          </div>
        ) : (
          <div>
            <Upload size={40} color="#666" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#666", marginBottom: "8px" }}>Click to upload or drag and drop</p>
            <p style={{ color: "#999", fontSize: "12px" }}>PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "12px",
          }}
        >
          {images.map((imageUrl, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}
            >
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
