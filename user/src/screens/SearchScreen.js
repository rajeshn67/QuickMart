"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { productsAPI, categoriesAPI } from "../services/api"
import ProductCard from "../components/ProductCard"

export default function SearchScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")

  useFocusEffect(
    React.useCallback(() => {
      const query = route.params?.query
      if (query && query !== searchQuery) {
        setSearchQuery(query)
      }
    }, [route.params?.query])
  )

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (searchQuery || selectedCategory) {
      searchProducts()
    } else {
      setProducts([])
    }
  }, [searchQuery, selectedCategory])

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories()
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
      // Don't show error for categories, just log it
    }
  }

  const searchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (selectedCategory) params.category = selectedCategory

      const data = await productsAPI.getProducts(params)
      setProducts(data?.products || [])
    } catch (error) {
      console.error("Error searching products:", error)
      setProducts([])
      // Show error message to user
      Alert.alert("Error", error.message || "Failed to search products")
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? "" : categoryId)
  }

  const renderProduct = ({ item }) => (
    <View style={styles.productContainer}>
      <ProductCard product={item} onPress={() => navigation.navigate("ProductDetail", { product: item })} />
    </View>
  )

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryChip, selectedCategory === item._id && styles.categoryChipSelected]}
      onPress={() => handleCategorySelect(item._id)}
    >
      <Text style={[styles.categoryChipText, selectedCategory === item._id && styles.categoryChipTextSelected]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : products.length > 0 ? (
          <>
            <Text style={styles.resultsCount}>{products.length} products found</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item._id}
              renderItem={renderProduct}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : searchQuery || selectedCategory ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Search for products</Text>
            <Text style={styles.emptySubtitle}>Find your favorite groceries</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
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
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: "#4CAF50",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#666",
  },
  categoryChipTextSelected: {
    color: "#fff",
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  productsList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  productContainer: {
    width: "48%",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
})
