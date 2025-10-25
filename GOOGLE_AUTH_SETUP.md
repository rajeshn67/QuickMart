# Google Authentication Setup Guide for QuickMart

This guide will help you set up Google Sign-In authentication for the QuickMart mobile app.

## Prerequisites

- Google Cloud Console account
- Expo account (for development)
- QuickMart app installed and configured

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** for your project:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

### For Android

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Android" as the application type
4. Enter your package name (e.g., `com.quickmart.user`)
5. Get your SHA-1 certificate fingerprint:
   ```bash
   # For development (using Expo)
   cd user
   npx expo credentials:manager
   # Select "Android" > "Keystore" > "Download"
   # Then get SHA-1 from the keystore
   
   # Or use keytool (if you have the keystore)
   keytool -list -v -keystore your-keystore.jks -alias your-alias
   ```
6. Copy the **Client ID** (Android Client ID)

### For iOS

1. Click "Create Credentials" > "OAuth client ID"
2. Select "iOS" as the application type
3. Enter your bundle identifier (e.g., `com.quickmart.user`)
4. Copy the **Client ID** (iOS Client ID)

### For Web (Required for Expo)

1. Click "Create Credentials" > "OAuth client ID"
2. Select "Web application" as the application type
3. Add authorized redirect URIs:
   - For Expo: `https://auth.expo.io/@your-username/your-app-slug`
   - Get your redirect URI by running: `npx expo start` and checking the console
4. Copy the **Client ID** (Web Client ID)

## Step 3: Configure Environment Variables

### Frontend (Mobile App)

1. Open or create `user/.env` file
2. Add the following environment variables:

```env
# Existing variables
EXPO_PUBLIC_API_URL=your_backend_url
EXPO_PUBLIC_APP_NAME=QuickMart
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud

# Google Authentication
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

3. Update `user/.env.example` with the new variables (without actual values)

### Backend (Optional - if you need server-side verification)

The current implementation doesn't require backend Google credentials, but if you want to add server-side token verification:

1. Open `backend/.env`
2. Add:
```env
GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

## Step 4: Configure app.json (Expo)

1. Open `user/app.json`
2. Add the following configuration:

```json
{
  "expo": {
    "name": "QuickMart",
    "slug": "quickmart-user",
    "scheme": "quickmart",
    "android": {
      "package": "com.quickmart.user",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.quickmart.user",
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## Step 5: Test Google Sign-In

### Development Testing

1. Start the Expo development server:
   ```bash
   cd user
   npx expo start
   ```

2. Open the app on your device or emulator

3. Navigate to the Login screen

4. Click "Continue with Google"

5. Sign in with your Google account

### What Happens:

1. User clicks "Continue with Google"
2. Google OAuth screen opens in a browser
3. User selects their Google account
4. App receives Google user data (ID, email, name, profile picture)
5. Backend creates or links the user account
6. User is logged in automatically

## Step 6: Production Build

### For Android

1. Build the APK/AAB:
   ```bash
   cd user
   eas build --platform android
   ```

2. Make sure to use the production keystore SHA-1 in Google Cloud Console

### For iOS

1. Build the IPA:
   ```bash
   cd user
   eas build --platform ios
   ```

2. Ensure the bundle identifier matches the one in Google Cloud Console

## Troubleshooting

### Common Issues

1. **"Sign-in failed" error**
   - Verify all Client IDs are correct in `.env`
   - Check that Google+ API is enabled
   - Ensure redirect URIs are properly configured

2. **"Invalid client" error**
   - Double-check the Client IDs match your Google Cloud project
   - Verify the package name/bundle identifier matches

3. **"Network error"**
   - Check backend is running and accessible
   - Verify API_URL is correct in `.env`

4. **User created but can't login**
   - Check backend logs for errors
   - Verify JWT_SECRET is set in backend `.env`

### Debug Mode

Enable debug logging in `AuthContext.js` to see detailed authentication flow:

```javascript
console.log("Google auth response:", response)
console.log("Google user data:", googleUser)
console.log("Backend response:", response)
```

## Security Best Practices

1. **Never commit `.env` files** - Keep them in `.gitignore`
2. **Use different credentials** for development and production
3. **Restrict API keys** in Google Cloud Console to specific apps
4. **Enable 2FA** on your Google Cloud account
5. **Regularly rotate secrets** and update credentials

## Features

✅ One-click Google Sign-In
✅ Automatic account creation
✅ Account linking (if user exists with same email)
✅ Profile picture from Google
✅ Secure JWT token generation
✅ Works on Android, iOS, and Web

## Support

For issues or questions:
- Check the [Expo Auth Session docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- Review [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
- Check QuickMart GitHub issues

---

**Note**: This implementation requires users to have a Google account. Users without Google accounts can still use the traditional email/password registration.
