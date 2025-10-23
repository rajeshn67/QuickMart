"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/api"

export default function AddressManagementScreen({ navigation }) {
  const { user, updateProfile } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  })

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = () => {
    // For now, we'll use the single address from user profile
    // In a full implementation, you might have multiple addresses
    if (user?.address) {
      setAddresses([{
        id: "default",
        label: "Default Address",
        ...user.address,
        isDefault: true
      }])
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSaveAddress = async () => {
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const addressData = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        coordinates: formData.coordinates
      }

      await authAPI.updateAddress(addressData)
      
      Alert.alert("Success", "Address saved successfully", [
        { text: "OK", onPress: () => {
          setShowAddForm(false)
          setEditingAddress(null)
          resetForm()
          loadAddresses()
        }}
      ])
    } catch (error) {
      console.error("Error saving address:", error)
      Alert.alert("Error", "Failed to save address. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setFormData({
      label: address.label || "Default Address",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      coordinates: address.coordinates || { latitude: 0, longitude: 0 }
    })
    setShowAddForm(true)
  }

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await authAPI.updateAddress(null)
              loadAddresses()
              Alert.alert("Success", "Address deleted successfully")
            } catch (error) {
              Alert.alert("Error", "Failed to delete address")
            }
          }
        }
      ]
    )
  }

  const resetForm = () => {
    setFormData({
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    })
  }

  const handleSelectLocation = () => {
    navigation.navigate("LocationPicker", {
      onLocationSelect: (locationData) => {
        setFormData(prev => ({
          ...prev,
          street: locationData.street || prev.street,
          city: locationData.city || prev.city,
          state: locationData.state || prev.state,
          zipCode: locationData.zipCode || prev.zipCode,
          coordinates: locationData.coordinates || prev.coordinates
        }))
      }
    })
  }

  const renderAddressCard = (address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Text style={styles.addressLabel}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
          >
            <Ionicons name="pencil" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address.id)}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>
        {address.street}
      </Text>
      <Text style={styles.addressText}>
        {address.city}, {address.state} {address.zipCode}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm()
            setEditingAddress(null)
            setShowAddForm(true)
          }}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {!showAddForm ? (
          <>
            {/* Address List */}
            {addresses.length > 0 ? (
              <View style={styles.addressesList}>
                {addresses.map(renderAddressCard)}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={80} color="#ccc" />
                <Text style={styles.emptyTitle}>No addresses saved</Text>
                <Text style={styles.emptySubtitle}>Add your first delivery address</Text>
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={() => {
                    resetForm()
                    setShowAddForm(true)
                  }}
                >
                  <Text style={styles.addFirstButtonText}>Add Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* Add/Edit Address Form */
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address Label</Text>
              <TextInput
                style={styles.input}
                value={formData.label}
                onChangeText={(value) => handleInputChange('label', value)}
                placeholder="e.g., Home, Office, etc."
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.street}
                onChangeText={(value) => handleInputChange('street', value)}
                placeholder="Enter street address"
                multiline
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="State"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(value) => handleInputChange('zipCode', value)}
                placeholder="Enter ZIP code"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.locationButton} onPress={handleSelectLocation}>
              <Ionicons name="location" size={20} color="#4CAF50" />
              <Text style={styles.locationButtonText}>Select on Map</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddForm(false)
                  setEditingAddress(null)
                  resetForm()
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSaveAddress}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  addressesList: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  addressActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  addFirstButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
    marginBottom: 24,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4CAF50",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
