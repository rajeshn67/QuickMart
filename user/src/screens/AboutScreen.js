import { View, Text, StyleSheet, Image, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Rohitpng from "../../assets/rohit.jpg"
import Rajeshpng from "../../assets/rajeshphoto.jpg"

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>About QuickMart</Text>
        <Text style={styles.appDesc}>
          QuickMart is your go-to app for fast, reliable grocery delivery. Order from a wide range of products, track your orders, and enjoy seamless service—all from the comfort of your home.
        </Text>

        <Text style={styles.sectionTitle}>Founders</Text>
        <View style={styles.foundersRow}>
          <View style={styles.founderCard}>
            <Image style={styles.founderImage} source={Rohitpng} />
            <Text style={styles.founderName}>Rohit Ranveer</Text>
            <Text style={styles.founderRole}>Founder</Text>
            <Text style={styles.founderDesc}>Rohit is passionate about building tech that solves real-world problems. With a background in software engineering, he leads the QuickMart vision for smarter, faster grocery delivery.</Text>
          </View>
          <View style={styles.founderCard}>
            <Image style={styles.founderImage} source={Rajeshpng} />
            <Text style={styles.founderName}>Rajesh Narwade</Text>
            <Text style={styles.founderRole}>Co-Founder</Text>
            <Text style={styles.founderDesc}>Rajesh specializes in operations and customer experience. He ensures every QuickMart order is delivered with speed and care, making your shopping effortless.</Text>
          </View>
        </View>
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
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  appDesc: {
    fontSize: 15,
    color: "#444",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 16,
    textAlign: "center",
  },
  foundersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  founderCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
  },
  founderImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  founderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  founderRole: {
    fontSize: 13,
    color: "#4CAF50",
    marginBottom: 8,
  },
  founderDesc: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    lineHeight: 18,
  },
})
