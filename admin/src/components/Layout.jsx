"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, MessageCircle, LogOut, Menu, X } from "lucide-react"

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Categories", href: "/categories", icon: FolderOpen },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Chat Support", href: "/chat", icon: MessageCircle },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "250px" : "0",
          backgroundColor: "#1f2937",
          transition: "width 0.3s",
          overflow: "hidden",
          position: "fixed",
          height: "100vh",
          zIndex: 1000,
        }}
      >
        <div style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <h2 style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>QuickMart Admin</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>

          <nav>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    color: isActive ? "#4CAF50" : "#d1d5db",
                    backgroundColor: isActive ? "rgba(76, 175, 80, 0.1)" : "transparent",
                    borderRadius: "6px",
                    textDecoration: "none",
                    marginBottom: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#374151",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p style={{ color: "white", fontSize: "14px", marginBottom: "4px" }}>Welcome back</p>
            <p style={{ color: "#9ca3af", fontSize: "12px" }}>{user?.fullName}</p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s",
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <Menu size={20} />
          </button>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#111827" }}>Admin Dashboard</h1>
        </header>

        {/* Page Content */}
        <main style={{ padding: "24px" }}>{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
