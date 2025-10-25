import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useCart } from "../context/CartContext"

export default function ProductCard({ product, onPress }) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  const handleImageError = () => {
    // Could set a default image here
    console.log("Image failed to load for product:", product.name)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: product.image }} 
        style={styles.image} 
        onError={handleImageError}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
  },
  content: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
    minHeight: 32,
  },
  unit: {
    fontSize: 10,
    color: "#666",
    marginBottom: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  originalPrice: {
    fontSize: 10,
    color: "#666",
    textDecorationLine: "line-through",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
})
