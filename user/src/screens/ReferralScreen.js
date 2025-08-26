"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Clipboard } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import SlideLoader from "../components/SlideLoader"

export default function ReferralScreen({ navigation }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  // Generate referral code based on user ID
  const referralCode = user?.id ? `QM${user.id.slice(-6).toUpperCase()}` : "QMXXXXXX"
  const referralLink = `https://quickmart.app/ref/${referralCode}`

  const handleCopyCode = async () => {
    setLoading(true)
    try {
      await Clipboard.setStringAsync(referralCode)
      Alert.alert("Copied!", "Referral code copied to clipboard")
    } catch (error) {
      Alert.alert("Error", "Failed to copy referral code")
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const handleCopyLink = async () => {
    setLoading(true)
    try {
      await Clipboard.setStringAsync(referralLink)
      Alert.alert("Copied!", "Referral link copied to clipboard")
    } catch (error) {
      Alert.alert("Error", "Failed to copy referral link")
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const handleShare = async () => {
    setLoading(true)
    try {
      await Share.share({
        message: `Join QuickMart using my referral code ${referralCode} and get ₹50 off on your first order! Download now: ${referralLink}`,
        title: "Join QuickMart - Get ₹50 Off!",
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share referral")
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const referralBenefits = [
    {
      icon: "gift-outline",
      title: "₹50 for You",
      description: "Get ₹50 credit when your friend places their first order"
    },
    {
      icon: "person-add-outline",
      title: "₹50 for Friend",
      description: "Your friend gets ₹50 off on their first order"
    },
    {
      icon: "infinite-outline",
      title: "Unlimited Referrals",
      description: "Refer as many friends as you want and earn more"
    },
    {
      icon: "flash-outline",
      title: "Instant Credits",
      description: "Credits are added instantly when conditions are met"
    }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <SlideLoader visible={loading} text="Processing..." />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={40} color="#4CAF50" />
          </View>
          <Text style={styles.heroTitle}>Invite Friends & Earn Together!</Text>
          <Text style={styles.heroSubtitle}>
            Share QuickMart with friends and both of you get ₹50 credits
          </Text>
        </View>

        {/* Referral Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Referral Link Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Link</Text>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={1}>
              {referralLink}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#fff" />
            <Text style={styles.shareButtonText}>Share with Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {referralBenefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon} size={24} color="#4CAF50" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Terms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              • Credits are valid for 90 days from the date of earning{'\n'}
              • Minimum order value of ₹200 required to use referral credits{'\n'}
              • Credits cannot be transferred or converted to cash{'\n'}
              • QuickMart reserves the right to modify terms at any time
            </Text>
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#f8fffe",
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e8f5e8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 8,
    borderBottomColor: "#f9fafb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  codeBox: {
    flex: 1,
    backgroundColor: "#f8fffe",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  codeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    letterSpacing: 2,
  },
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8f5e8",
    justifyContent: "center",
    alignItems: "center",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f5e8",
    justifyContent: "center",
    alignItems: "center",
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  termsContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
})
