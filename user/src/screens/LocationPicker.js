import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const LocationPicker = ({ route }) => {
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchingAddress, setFetchingAddress] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to select delivery address.');
        setLoading(false);
        return;
      }

      // Use faster location settings
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 10000, // Use cached location if less than 10 seconds old
        timeout: 5000, // Timeout after 5 seconds
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
      
      // Get address in background
      setFetchingAddress(true);
      Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }).then(addressResult => {
        if (addressResult.length > 0) {
          const addr = addressResult[0];
          // Format address as: street, city, state postalCode
          const formattedAddress = [
            addr.street || addr.name,
            addr.city,
            addr.region,
            addr.postalCode
          ].filter(Boolean).join(', ');
          setAddress(formattedAddress || 'Address unavailable');
        }
        setFetchingAddress(false);
      }).catch(err => {
        console.error('Error reverse geocoding:', err);
        setAddress('Address unavailable');
        setFetchingAddress(false);
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get current location. Please select manually on the map.');
      setLoading(false);
    }
  };

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedLocation(coordinate);
    setFetchingAddress(true);

    try {
      const addressResult = await Location.reverseGeocodeAsync(coordinate);
      if (addressResult.length > 0) {
        const addr = addressResult[0];
        // Format address as: street, city, state postalCode
        const formattedAddress = [
          addr.street || addr.name,
          addr.city,
          addr.region,
          addr.postalCode
        ].filter(Boolean).join(', ');
        setAddress(formattedAddress || 'Address unavailable');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setAddress('Address unavailable');
    } finally {
      setFetchingAddress(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    if (!address || address === 'Address unavailable') {
      Alert.alert('Error', 'Please wait for the address to load or enter it manually');
      return;
    }

    // Parse address into components
    // Expected format: "street, city, state, postalCode"
    const addressParts = address.split(',').map(part => part.trim());
    
    const locationData = {
      coordinates: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      },
      address: address,
      street: addressParts[0] || 'N/A',
      city: addressParts[1] || 'N/A',
      state: addressParts[2] || 'N/A',
      zipCode: addressParts[3] || '000000',
    };

    // Check if callback exists (for other screens)
    if (route.params?.onLocationSelect) {
      route.params.onLocationSelect(locationData);
      navigation.goBack();
    } else {
      // Navigate back to Checkout with locationData
      navigation.navigate('Checkout', { locationData });
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Location</Text>
        <TouchableOpacity onPress={handleUseCurrentLocation} style={styles.locationButton}>
          <Ionicons name="navigate" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Delivery Location"
            pinColor="#4CAF50"
          />
        )}
      </MapView>

      {/* Address Card */}
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <Ionicons name="location" size={24} color="#4CAF50" />
          <Text style={styles.addressTitle}>Delivery Address</Text>
        </View>
        
        {fetchingAddress ? (
          <View style={styles.fetchingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.fetchingText}>Getting address...</Text>
          </View>
        ) : (
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Tap on map to select location"
            placeholderTextColor="#999"
            multiline
          />
        )}

        <TouchableOpacity
          style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
          onPress={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
    color: '#333',
  },
  locationButton: {
    padding: 4,
  },
  map: {
    flex: 1,
  },
  addressCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  fetchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  fetchingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationPicker;
