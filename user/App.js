"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthProvider, useAuth } from "./src/context/AuthContext"
import { CartProvider } from "./src/context/CartContext"
import AuthStack from "./src/navigation/AuthStack"
import MainStack from "./src/navigation/MainStack"
import LoadingScreen from "./src/screens/LoadingScreen"

const Stack = createStackNavigator()

function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    checkAuthState()
  }, [])

  useEffect(() => {
    console.log("User state changed:", user)
  }, [user])

  const checkAuthState = async () => {
    try {
      // Just wait a bit to let AuthContext load the user
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  console.log("Rendering AppContent, user:", user, "showing:", user ? "Main" : "Auth")

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
