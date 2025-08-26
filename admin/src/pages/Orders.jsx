"use client"

import { useState, useEffect } from "react"
import { Eye, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"
import { ordersAPI } from "../services/api"
import OrderDetailModal from "../components/OrderDetailModal"

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [selectedStatus])

  const loadOrders = async () => {
    try {
      const params = {}
      if (selectedStatus) params.status = selectedStatus

      const data = await ordersAPI.getOrders(params)
      setOrders(data.orders)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Error updating order status")
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />
      case "confirmed":
        return <Package size={16} />
      case "preparing":
        return <Package size={16} />
      case "out_for_delivery":
        return <Truck size={16} />
      case "delivered":
        return <CheckCircle size={16} />
      case "cancelled":
        return <XCircle size={16} />
      default:
        return <Clock size={16} />
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

  const statusOptions = [
    { value: "", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  if (loading) {
    return <div>Loading orders...</div>
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
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Orders Management</h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {statusOptions.slice(1).map((status) => {
          const count = orders.filter((order) => order.status === status.value).length
          return (
            <div key={status.value} className="card" style={{ textAlign: "center", padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ color: getStatusColor(status.value) }}>{getStatusIcon(status.value)}</div>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{count}</span>
              </div>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>{status.label}</p>
            </div>
          )
        })}
      </div>

      {/* Orders Table */}
      <div className="card">
        {orders.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{order._id.slice(-8)}</td>
                    <td>
                      <div>
                        <p style={{ fontWeight: "500", marginBottom: "2px" }}>{order.user?.fullName}</p>
                        <p style={{ fontSize: "12px", color: "#6b7280" }}>{order.user?.email}</p>
                      </div>
                    </td>
                    <td>{order.items?.length || 0} items</td>
                    <td style={{ fontWeight: "600" }}>₹{order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <select
                        className="form-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          minWidth: "120px",
                          color: getStatusColor(order.status),
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <span className="status-badge status-pending">Cash on Delivery</span>
                    </td>
                    <td style={{ fontSize: "12px" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleViewOrder(order)}
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>No orders found</p>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false)
            setSelectedOrder(null)
            loadOrders()
          }}
          onStatusUpdate={handleStatusChange}
        />
      )}
    </div>
  )
}
