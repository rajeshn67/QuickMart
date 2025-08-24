"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart, FolderOpen, TrendingUp } from "lucide-react"
import { productsAPI, ordersAPI, categoriesAPI } from "../services/api"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [productsData, ordersData, categoriesData] = await Promise.all([
        productsAPI.getProducts({ limit: 1 }),
        ordersAPI.getOrders({ limit: 5 }),
        categoriesAPI.getCategories(),
      ])

      setStats({
        totalProducts: productsData.total || 0,
        totalOrders: ordersData.total || 0,
        totalCategories: categoriesData.length || 0,
        pendingOrders: ordersData.orders?.filter((order) => order.status === "pending").length || 0,
      })

      setRecentOrders(ordersData.orders || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "#4CAF50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "#2196F3",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: FolderOpen,
      color: "#FF9800",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: "#F44336",
    },
  ]

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>Dashboard Overview</h1>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={24} color={stat.color} />
              </div>
              <div>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>{stat.value}</p>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Recent Orders</h2>

        {recentOrders.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: "monospace" }}>{order._id.slice(-8)}</td>
                    <td>{order.user?.fullName}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>No recent orders found</p>
        )}
      </div>
    </div>
  )
}
