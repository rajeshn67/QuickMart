# QuickMart User Mobile App

React Native mobile application for QuickMart grocery ordering system built with Expo.

## Features

- User authentication (signup/signin)
- Browse products by categories
- Search functionality
- Shopping cart management
- Google Maps location selection
- Cash on delivery orders
- Order history and tracking
- User profile management

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Install Expo CLI globally:
\`\`\`bash
npm install -g @expo/cli
\`\`\`

3. Update API base URL in `src/services/api.js`:
\`\`\`javascript
const API_BASE_URL = 'http://your-backend-url:5000/api';
\`\`\`

4. Start the development server:
\`\`\`bash
npx expo start
\`\`\`

5. Use Expo Go app on your phone to scan the QR code, or run on simulator:
\`\`\`bash
# For iOS simulator
npx expo start --ios

# For Android emulator
npx expo start --android
\`\`\`

## Configuration

### Google Maps API
Add your Google Maps API key to `app.json`:
\`\`\`json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
\`\`\`

## Building for Production

\`\`\`bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
\`\`\`

Requires Expo account for building.
