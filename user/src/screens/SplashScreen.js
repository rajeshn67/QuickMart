import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import cartImg from "../../assets/icon.png"
export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={cartImg} style={styles.logo} />
        <Text style={styles.appName}>QuickMart</Text>
        <Text style={styles.tagline}>Fast & Fresh Delivery</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoContainer: {
    alignItems: 'center',
  },
    logo: {
    width: 250,
    height: 250,
    marginBottom: 2,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
