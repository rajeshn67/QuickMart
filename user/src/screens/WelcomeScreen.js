import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import cartImg from "../../assets/icon.png"

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={cartImg} style={styles.logo} />
      
        <Text style={styles.subtitle}>Fresh groceries delivered to your door</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 27,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
})
