"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { ordersAPI } from "../services/api"

export default function CheckoutScreen({ navigation }) {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [deliveryAddress, setDeliveryAddress] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [loading, setLoading] = useState(false)

  const deliveryFee = 2.99
  const total = getCartTotal() + deliveryFee

  useEffect(() => {
    // Load user's saved address if available
    if (user?.address) {
      setDeliveryAddress({
        address: `${user.address.street} ${user.address.city} ${user.address.state} ${user.address.zipCode}`,
        coordinates: user.address.coordinates,
        street: user.address.street,
        city: user.address.city,
        state: user.address.state,
        zipCode: user.address.zipCode,
      })
    }
    if (user?.phone) {
      setPhoneNumber(user.phone)
    }
  }, [user])

  const handleLocationSelect = (locationData) => {
    setDeliveryAddress(locationData)
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      Alert.alert("Error", "Please select a delivery address")
      return
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number")
      return
    }

    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty")
      return
    }

    setLoading(true)

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: total,
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zipCode: deliveryAddress.zipCode,
          coordinates: {
            latitude: deliveryAddress.coordinates.latitude,
            longitude: deliveryAddress.coordinates.longitude,
          },
        },
        paymentMethod: "cash_on_delivery",
        specialInstructions,
      }

      await ordersAPI.createOrder(orderData)
      clearCart()

      Alert.alert("Order Placed Successfully!", "Your order has been placed and will be delivered soon.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ])
    } catch (error) {
      console.error("Error placing order:", error)
      Alert.alert("Error", "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            style={styles.addressCard}
            onPress={() =>
              navigation.navigate("LocationPicker", {
                onLocationSelect: handleLocationSelect,
              })
            }
          >
            <View style={styles.addressContent}>
              <Ionicons name="location-outline" size={24} color="#4CAF50" />
              <View style={styles.addressText}>
                {deliveryAddress ? (
                  <>
                    <Text style={styles.addressTitle}>Delivery to:</Text>
                    <Text style={styles.addressDetails}>{deliveryAddress.address}</Text>
                  </>
                ) : (
                  <Text style={styles.selectAddressText}>Select delivery address</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.product._id} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.product.name} x {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.orderItem}>
            <Text style={styles.itemName}>Delivery Fee</Text>
            <Text style={styles.itemPrice}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.orderItem, styles.totalRow]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalPrice}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder="Any special delivery instructions..."
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderText}>
            {loading ? "Placing Order..." : `Place Order - $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addressText: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 16,
    color: "#333",
  },
  selectAddressText: {
    fontSize: 16,
    color: "#4CAF50",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  placeOrderButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
