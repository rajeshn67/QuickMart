"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, ActivityIndicator, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../context/AuthContext"
import { productsAPI, categoriesAPI } from "../services/api"
import ProductCard from "../components/ProductCard"
import CategoryCard from "../components/CategoryCard"
import * as Location from 'expo-location'

export default function HomeScreen({ navigation }) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationName, setLocationName] = useState('Select Location')

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return "Good Morning"
    } else if (hour < 17) {
      return "Good Afternoon"
    } else {
      return "Good Evening"
    }
  }

  useEffect(() => {
    loadData()
    getCurrentLocation()
  }, [])

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Permission to access location was denied')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
      
      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      })
      
      if (address.length > 0) {
        const { city, region, country } = address[0]
        setLocationName(`${city || ''}${city && region ? ', ' : ''}${region || ''}`.trim() || 'Current Location')
      }
    } catch (error) {
      console.error('Error getting location:', error)
      setError('Unable to get current location')
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriesData, productsData] = await Promise.all([
        categoriesAPI.getCategories(),
        productsAPI.getProducts({ limit: 10 }),
      ])
      setCategories(categoriesData || [])
      setFeaturedProducts(productsData?.products || [])
    } catch (error) {
      console.error("Error loading data:", error)
      setError(error.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("Search", { query: searchQuery.trim() })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getTimeBasedGreeting()}</Text>
            <Text style={styles.userName}>{user?.fullName || "User"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => navigation.navigate('LocationPicker', {
              onLocationSelect: (selectedLocation) => {
                if (selectedLocation) {
                  setLocation(selectedLocation)
                  setLocationName(selectedLocation.name || 'Selected Location')
                }
              }
            })}
          >
            <Ionicons name="location-outline" size={20} color="#4CAF50" />
            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {locationName}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {loading && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Categories */}
        {!error && !loading && categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories.slice(0, 6)} // Show only first 6 categories in home
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <CategoryCard
                  category={item}
                  onPress={() => navigation.navigate("CategoryProducts", { category: item })}
                />
              )}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Featured Products */}
        {!error && !loading && featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productsGrid}>
              {featuredProducts.map((item) => (
                <View key={item._id} style={styles.productItem}>
                  <ProductCard 
                    product={item} 
                    onPress={() => navigation.navigate("ProductDetail", { product: item })}
                    style={styles.productCard}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* First Delivery Free Banner */}
        {!error && !loading && (
          <View style={styles.bannerContainer}>
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>First Delivery Free</Text>
              <Text style={styles.bannerSubtitle}>Enjoy free delivery on your first order. Limited time offer!</Text>
              <TouchableOpacity
                style={styles.bannerButton}
                onPress={() => navigation.navigate("Search")}
              >
                <Text style={styles.bannerButtonText}>Start Shopping</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#4CAF50",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  productItem: {
    width: '31%',
    marginBottom: 12,
  },
  productCard: {
    width: '100%',
    margin: 0,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  banner: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#666",
  },
})
