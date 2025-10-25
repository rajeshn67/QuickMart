"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthProvider, useAuth } from "./src/context/AuthContext"
import { CartProvider } from "./src/context/CartContext"
import { SocketProvider } from "./src/context/SocketContext"
import AuthStack from "./src/navigation/AuthStack"
import MainStack from "./src/navigation/MainStack"
import LoadingScreen from "./src/screens/LoadingScreen"
import SplashScreen from "./src/screens/SplashScreen"

const Stack = createStackNavigator()

function AppContent() {
  const { user, isInitialized } = useAuth()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    console.log("User state changed:", user)
  }, [user])

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (!isInitialized) {
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
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  )
}
