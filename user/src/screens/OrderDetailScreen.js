"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { ordersAPI } from "../services/api"

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params
  const [currentOrder, setCurrentOrder] = useState(order)
  const [loading, setLoading] = useState(false)
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800'
      case 'confirmed': return '#2196F3'
      case 'preparing': return '#9C27B0'
      case 'out_for_delivery': return '#FF5722'
      case 'delivered': return '#4CAF50'
      case 'cancelled': return '#F44336'
      default: return '#666'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline'
      case 'confirmed': return 'checkmark-circle-outline'
      case 'preparing': return 'restaurant-outline'
      case 'out_for_delivery': return 'car-outline'
      case 'delivered': return 'checkmark-done-outline'
      case 'cancelled': return 'close-circle-outline'
      default: return 'help-circle-outline'
    }
  }

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: confirmCancelOrder }
      ]
    )
  }

  const confirmCancelOrder = async () => {
    setLoading(true)
    try {
      console.log("Attempting to cancel order:", currentOrder._id)
      console.log("API URL will be:", `/orders/${currentOrder._id}/cancel`)
      await ordersAPI.cancelOrder(currentOrder._id)
      setCurrentOrder(prev => ({ ...prev, status: 'cancelled' }))
      Alert.alert("Success", "Order cancelled successfully")
    } catch (error) {
      console.error("Cancel order error:", error)
      console.error("Error details:", error.response?.data || error.message)
      Alert.alert("Error", `Failed to cancel order: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = () => {
    // Navigate to cart with items from this order
    Alert.alert("Reorder", "Reorder functionality will be implemented soon")
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor(currentOrder.status)}20` }]}>
              <Ionicons name={getStatusIcon(currentOrder.status)} size={24} color={getStatusColor(currentOrder.status)} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusText}>{formatStatus(currentOrder.status)}</Text>
              <Text style={styles.orderDate}>Ordered on {formatDate(currentOrder.createdAt)}</Text>
            </View>
          </View>
          <Text style={styles.orderId}>Order ID: #{currentOrder._id.slice(-8)}</Text>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items?.length || 0})</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image 
                source={{ uri: item.product?.image || 'https://via.placeholder.com/60' }} 
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
                <Text style={styles.itemDetails}>
                  Quantity: {item.quantity} × ₹{item.price}
                </Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.quantity * item.price).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Ionicons name="location-outline" size={20} color="#4CAF50" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Total</Text>
              <Text style={styles.summaryValue}>₹{order.totalAmount?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount?.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Ionicons name="card-outline" size={20} color="#4CAF50" />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentOrder.status === 'delivered' && (
          <TouchableOpacity style={styles.reorderButton} onPress={handleReorder}>
            <Text style={styles.reorderButtonText}>Reorder Items</Text>
          </TouchableOpacity>
        )}
        {(currentOrder.status === 'pending' || currentOrder.status === 'confirmed') && (
          <TouchableOpacity 
            style={[styles.cancelButton, loading && styles.disabledButton]} 
            onPress={handleCancelOrder}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>
              {loading ? "Cancelling..." : "Cancel Order"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  orderId: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    padding: 16,
    paddingBottom: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: "#666",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  summaryCard: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  paymentText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  reorderButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F44336",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
})
