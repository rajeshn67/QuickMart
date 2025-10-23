import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import HomeScreen from "../screens/HomeScreen"
import SearchScreen from "../screens/SearchScreen"
import CartScreen from "../screens/CartScreen"
import ProfileScreen from "../screens/ProfileScreen"
import ProductDetailScreen from "../screens/ProductDetailScreen"
import CategoryProductsScreen from "../screens/CategoryProductsScreen"
import CheckoutScreen from "../screens/CheckoutScreen"
import OrderHistoryScreen from "../screens/OrderHistoryScreen"
import LocationPickerScreen from "../screens/LocationPicker"
import EditProfileScreen from "../screens/EditProfileScreen"
import OrderDetailScreen from "../screens/OrderDetailScreen"
import AddressManagementScreen from "../screens/AddressManagementScreen"
import HelpSupportScreen from "../screens/HelpSupportScreen"
import CategoriesScreen from "../screens/CategoriesScreen"
import AllProductsScreen from "../screens/AllProductsScreen"
import { useCart } from "../context/CartContext"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ 
          title: "Product Details",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
        }} 
      />
      <Stack.Screen 
        name="CategoryProducts" 
        component={CategoryProductsScreen} 
        options={{ 
          title: "Products",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
        }} 
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{ 
          title: "All Categories",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
        }} 
      />
      <Stack.Screen 
        name="AllProducts" 
        component={AllProductsScreen} 
        options={{ 
          title: "All Products",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
        }} 
      />
      <Stack.Screen 
        name="LocationPicker" 
        component={LocationPickerScreen} 
        options={{ 
          title: "Select Location",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
        }} 
      />
    </Stack.Navigator>
  )
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartMain" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen} 
        options={{ 
          title: "Order History",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#333",
        }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddressManagement" 
        component={AddressManagementScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  )
}

export default function MainStack() {
  const { getCartItemsCount } = useCart()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline"
          } else if (route.name === "Cart") {
            iconName = focused ? "cart" : "cart-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ title: "Home" }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: "Search" }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          title: "Cart",
          tabBarBadge: getCartItemsCount() > 0 ? getCartItemsCount() : null,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  )
}
