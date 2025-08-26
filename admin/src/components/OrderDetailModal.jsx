"use client"

import { useState } from "react"
import { X, MapPin, Phone, User, Package, Clock } from "lucide-react"

export default function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await onStatusUpdate(order._id, newStatus)
      onClose()
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "confirmed":
        return "#3b82f6"
      case "preparing":
        return "#8b5cf6"
      case "out_for_delivery":
        return "#06b6d4"
      case "delivered":
        return "#10b981"
      case "cancelled":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return "confirmed"
      case "confirmed":
        return "preparing"
      case "preparing":
        return "out_for_delivery"
      case "out_for_delivery":
        return "delivered"
      default:
        return null
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  const nextStatus = getNextStatus(order.status)

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Order Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Order Info */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Order ID</p>
                <p style={{ fontFamily: "monospace", fontWeight: "600" }}>{order._id}</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Order Date</p>
                <p style={{ fontWeight: "500" }}>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Current Status</p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: `${getStatusColor(order.status)}20`,
                  color: getStatusColor(order.status),
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <Clock size={14} />
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <User size={16} />
              Customer Information
            </h3>
            <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
              <p style={{ fontWeight: "500", marginBottom: "4px" }}>{order.user?.fullName}</p>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>{order.user?.email}</p>
              {order.user?.phone && (
                <p style={{ fontSize: "14px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Phone size={12} />
                  {order.user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MapPin size={16} />
              Delivery Address
            </h3>
            <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
              <p style={{ marginBottom: "4px" }}>{order.deliveryAddress?.street}</p>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Package size={16} />
              Order Items
            </h3>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: index < order.items.length - 1 ? "1px solid #f3f4f6" : "none",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "500", marginBottom: "2px" }}>{item.product?.name}</p>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>
                      Quantity: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p style={{ fontWeight: "600" }}>₹{(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  fontWeight: "600",
                }}
              >
                <span>Total Amount</span>
                <span style={{ fontSize: "18px", color: "#4CAF50" }}>₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Payment Method</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "500" }}>💰 Cash on Delivery</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <button className="btn btn-danger" onClick={() => handleStatusUpdate("cancelled")} disabled={updating}>
              Cancel Order
            </button>
          )}
          {nextStatus && (
            <button className="btn btn-primary" onClick={() => handleStatusUpdate(nextStatus)} disabled={updating}>
              {updating ? "Updating..." : `Mark as ${getStatusLabel(nextStatus)}`}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
