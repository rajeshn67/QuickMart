# Google Maps Setup Guide for QuickMart User App

## Overview
This guide will help you set up Google Maps in your QuickMart User app. The app currently has a fallback system in place, but for the best user experience, you should configure Google Maps properly.

## Prerequisites
- Google Cloud Console account
- Google Maps API key
- Expo development environment

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (optional, for address autocomplete)
   - Geocoding API (for reverse geocoding)
4. Go to Credentials → Create Credentials → API Key
5. Copy your API key

## Step 2: Configure app.json

Update your `app.json` file with your API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      }
    }
  }
}
```

## Step 3: Environment Variables (Alternative)

Create a `.env` file in your user directory:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Then update `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}"
        }
      }
    }
  }
}
```

## Step 4: Platform-Specific Setup

### Android
1. Ensure you have the latest `react-native-maps` version
2. The app.json configuration should handle most setup
3. If issues persist, check that Google Play Services are available on the device

### iOS
1. iOS uses Apple Maps by default (no API key needed)
2. If you want Google Maps on iOS, you'll need additional setup
3. The current implementation will fall back to Apple Maps on iOS

## Step 5: Testing

1. Run the app: `npm start`
2. Navigate to the checkout process
3. Try to select a delivery location
4. Check the console for any map-related errors

## Troubleshooting

### Map Not Showing
1. Check that your API key is correct
2. Verify the API is enabled in Google Cloud Console
3. Check device internet connection
4. Look for console errors

### Permission Issues
1. Ensure location permissions are granted
2. Check that the app has proper permissions in device settings

### API Quota Exceeded
1. Check your Google Cloud Console billing
2. Monitor API usage in the console
3. Set up billing alerts

## Fallback System

The app includes a fallback system that will show a simple interface when Google Maps is unavailable. This ensures users can still select delivery locations even if there are map issues.

## Current Status

- ✅ Map component implemented with error handling
- ✅ Fallback system in place
- ✅ Location permissions configured
- ✅ Cross-platform support (Android/iOS)
- ⚠️ Google Maps API key needs to be configured
- ⚠️ Testing required after API key setup

## Next Steps

1. Get your Google Maps API key
2. Update the app.json file
3. Test the map functionality
4. Monitor API usage and costs
5. Consider implementing address autocomplete for better UX

## Support

If you continue to have issues:
1. Check the Expo documentation for react-native-maps
2. Verify your Google Cloud Console setup
3. Test on different devices/emulators
4. Check the app console for specific error messages 