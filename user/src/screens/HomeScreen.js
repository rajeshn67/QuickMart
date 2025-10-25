"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, ActivityIndicator, Dimensions, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../context/AuthContext"
import { productsAPI, categoriesAPI } from "../services/api"
import ProductCard from "../components/ProductCard"
import CategoryCard from "../components/CategoryCard"

export default function HomeScreen({ navigation }) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
  }, [])

  const getInitials = (name) => {
    if (!name) return 'U'
    const names = name.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
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
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getTimeBasedGreeting()}</Text>
            <Text style={styles.userName}>{user?.fullName || "User"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitials}>
                  {getInitials(user?.fullName)}
                </Text>
              </View>
            )}
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  profilePlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    paddingHorizontal: 16,
    gap: 8,
  },
  productItem: {
    width: '31.5%',
    marginBottom: 8,
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
