"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Linking } from "react-native"
import MapView, { Marker } from "react-native-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

export default function LocationPickerScreen({ navigation, route }) {
  const { onLocationSelect } = route.params || {}
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied", 
          "Location permission is required to select delivery address. Please enable location access in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() }
          ]
        )
        return
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      })
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }

      setRegion(newRegion)
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      // Get address from coordinates
      try {
        const addressResult = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })

        if (addressResult.length > 0) {
          const addr = addressResult[0]
          setAddress(`${addr.street || ""} ${addr.city || ""} ${addr.region || ""} ${addr.postalCode || ""}`.trim())
        }
      } catch (addressError) {
        console.error("Error getting address:", addressError)
        // Continue without address, user can enter manually
      }
    } catch (error) {
      console.error("Error getting location:", error)
      if (error.code === 'UNAVAILABLE') {
        Alert.alert("Location Unavailable", "Unable to get your current location. Please select a location on the map manually.")
      } else {
        Alert.alert("Error", "Failed to get current location. Please select a location on the map manually.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate
    setSelectedLocation(coordinate)

    try {
      const addressResult = await Location.reverseGeocodeAsync(coordinate)
      if (addressResult.length > 0) {
        const addr = addressResult[0]
        setAddress(`${addr.street || ""} ${addr.city || ""} ${addr.region || ""} ${addr.postalCode || ""}`.trim())
      }
    } catch (error) {
      console.error("Error getting address:", error)
    }
  }

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location on the map")
      return
    }

    const locationData = {
      coordinates: selectedLocation,
      address: address,
      street: address.split(" ")[0] || "",
      city: address.split(" ")[1] || "",
      state: address.split(" ")[2] || "",
      zipCode: address.split(" ")[3] || "",
    }

    if (onLocationSelect) {
      onLocationSelect(locationData)
    }

    navigation.goBack()
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Getting your location...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Location</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} title="Delivery Location" />}
      </MapView>

      {/* Address Input */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Delivery Address</Text>
        <TextInput
          style={styles.addressInput}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter or edit address"
          multiline
        />
      </View>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  map: {
    flex: 1,
  },
  addressContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
