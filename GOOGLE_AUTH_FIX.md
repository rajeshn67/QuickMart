# Fix Google Authentication "Error 400: invalid_request"

## Quick Fix Steps

### Step 1: Set Up Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click on project dropdown at the top
   - Create a new project called "QuickMart" or select existing

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select **External** user type
   - Fill in required fields:
     - App name: `QuickMart`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip scopes (click "Save and Continue")
   - Add test users: Add your email (rajeshnarwade67@gmail.com)
   - Click "Save and Continue"

### Step 2: Create OAuth 2.0 Client IDs

#### A. Web Client ID (Most Important for Expo)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select **Web application**
4. Name: `QuickMart Web Client`
5. **Authorized redirect URIs** - Add these:
   ```
   https://auth.expo.io/@rajeshn67/quickmart-user
   ```
   
   To get your exact redirect URI, run this command:
   ```bash
   cd user
   npx expo start
   ```
   Look for output like: `Expo redirect URI: https://auth.expo.io/@YOUR_USERNAME/quickmart-user`

6. Click "Create"
7. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

#### B. Android Client ID (Optional for now)

1. Click "Create Credentials" > "OAuth client ID"
2. Select **Android**
3. Name: `QuickMart Android`
4. Package name: `com.rajeshn67.quickmartuser`
5. For SHA-1, use Expo's debug certificate:
   ```
   90:DD:B3:36:8F:3F:F4:F4:58:84:97:59:49:C6:8D:84:D3:2B:F0:C1
   ```
   (This is Expo's default debug SHA-1)
6. Click "Create"
7. **Copy the Client ID**

#### C. iOS Client ID (Optional for now)

1. Click "Create Credentials" > "OAuth client ID"
2. Select **iOS**
3. Name: `QuickMart iOS`
4. Bundle ID: `com.rajeshn67.quickmartuser`
5. Click "Create"
6. **Copy the Client ID**

### Step 3: Create/Update .env File

1. Create `user/.env` file (if it doesn't exist)
2. Add your credentials:

```env
# Backend API URL
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api

# Google Authentication
# IMPORTANT: Use the WEB Client ID for all three initially
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

**Important**: For Expo development, you can use the **Web Client ID** for all three platforms initially.

### Step 4: Restart Your App

1. Stop the Expo server (Ctrl+C)
2. Clear cache and restart:
   ```bash
   cd user
   npx expo start -c
   ```
3. Reload your app
4. Try Google Sign-In again

## Common Mistakes to Avoid

❌ **Don't use Android/iOS Client IDs in Expo development** - Use Web Client ID
❌ **Don't forget to add test users** in OAuth consent screen
❌ **Don't forget the redirect URI** - Must match exactly
❌ **Don't leave .env variables empty** - Must have actual values

## Verification Checklist

- [ ] OAuth consent screen configured with test users added
- [ ] Web OAuth Client ID created
- [ ] Redirect URI added: `https://auth.expo.io/@rajeshn67/quickmart-user`
- [ ] `.env` file created with Web Client ID
- [ ] App restarted with cache cleared
- [ ] Test user email matches your Google account

## Testing

1. Open your app
2. Go to Login screen
3. Click "Continue with Google"
4. You should see Google account selection
5. Select your account (must be in test users list)
6. Grant permissions
7. You should be logged in

## Still Having Issues?

### Check Console Logs

Run the app and check the terminal for errors:
```bash
npx expo start
```

Look for messages like:
- "Google auth response: ..."
- "Google user data: ..."
- Any error messages

### Verify Redirect URI

The redirect URI must be EXACTLY:
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG
```

Where:
- `YOUR_EXPO_USERNAME` = Your Expo account username
- `YOUR_APP_SLUG` = From `app.json` → `expo.slug` (currently: `quickmart-user`)

### Enable Google+ API (If Not Already)

1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

## Example .env File

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

All three can be the same Web Client ID for Expo development!
