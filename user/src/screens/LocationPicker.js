import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const locations = [
  { id: 'current', name: 'Use Current Location', icon: 'navigate-circle' },
  { id: 'home', name: 'Home', icon: 'home', address: '123 Main St, City' },
  { id: 'work', name: 'Work', icon: 'briefcase', address: '456 Business Ave, City' },
  { id: 'other', name: 'Add New Address', icon: 'add-circle' },
];

const LocationPicker = ({ route }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (address.length > 0) {
        const { city, region, name, street } = address[0];
        const locationName = `${street || name || ''}${(street || name) && city ? ', ' : ''}${city || ''}`.trim();
        setCurrentLocation({
          ...location,
          name: locationName || 'Current Location',
          address: [street, city, region].filter(Boolean).join(', ')
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get current location');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location) => {
    if (location.id === 'current') {
      if (currentLocation) {
        route.params?.onLocationSelect?.(currentLocation);
        navigation.goBack();
      } else {
        getCurrentLocation().then(() => {
          if (currentLocation) {
            route.params?.onLocationSelect?.(currentLocation);
            navigation.goBack();
          }
        });
      }
    } else if (location.id === 'other') {
      // Navigate to address search screen
      navigation.navigate('SearchAddress', {
        onSelect: (selectedAddress) => {
          route.params?.onLocationSelect?.({
            name: selectedAddress.name,
            address: selectedAddress.address,
            coords: selectedAddress.coords
          });
          navigation.goBack();
        }
      });
    } else {
      // For saved locations
      route.params?.onLocationSelect?.({
        name: location.name,
        address: location.address,
        coords: location.coords
      });
      navigation.goBack();
    }
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item)}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
        color={item.id === 'current' ? '#4CAF50' : '#666'} 
        style={styles.locationIcon}
      />
      <View style={styles.locationTextContainer}>
        <Text style={[
          styles.locationName, 
          item.id === 'current' && styles.currentLocation
        ]}>
          {item.name}
        </Text>
        {item.address && (
          <Text style={styles.locationAddress} numberOfLines={1}>
            {item.address}
          </Text>
        )}
      </View>
      {item.id === 'current' && loading && (
        <ActivityIndicator size="small" color="#4CAF50" style={styles.loading} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for area, street name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  listContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  currentLocation: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  loading: {
    marginLeft: 8,
  },
});

export default LocationPicker;
