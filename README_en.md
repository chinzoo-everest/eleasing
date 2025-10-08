# CAR zeel - Loan Management App

CAR zeel is a comprehensive loan management mobile application built with React Native Expo. This app provides services for managing various types of loans including car loans, deposit loans, and phone loans.

## 🚀 Features

- **Loan Management**: View active loans and make payments
- **Loan Applications**: Car loans, deposit loans, phone loans
- **Document Management**: Loan contracts and document handling
- **Liveness Detection**: Face recognition and verification
- **User Interface**: Styled with NativeWind v4
- **Animations**: Powered by Moti animation library
- **Push Notifications**: Firebase messaging integration
- **Maps Integration**: Google Maps for branch locations

## 🛠 Technologies

- **React Native**: 0.79.5
- **Expo SDK**: 53
- **NativeWind**: v4.1.23 (Tailwind CSS)
- **TypeScript**: 5.8.3
- **Expo Router**: File-based routing
- **Moti**: Animation library
- **Firebase**: Authentication, Messaging, Crashlytics
- **React Hook Form**: Form management
- **Axios**: API requests

## 📋 Prerequisites

- **Node.js**: 18.0.0 or higher
- **Yarn**: 1.22.22 or higher
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Development**: Xcode 15+ (macOS only)
- **Android Development**: Android Studio (Java 17+)

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd mandal
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Start the development server

```bash
yarn start
```

### 4. Run the app

#### On iOS:

```bash
yarn ios
```

#### On Android:

```bash
yarn android
```

#### On Web:

```bash
yarn web
```

## 🏗 Development

### Project Structure

```
mandal/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   ├── auth/              # Authentication pages
│   ├── loan/              # Loan pages
│   ├── carLoan/           # Car loan pages
│   ├── depositLoan/       # Deposit loan pages
│   ├── phoneLoan/         # Phone loan pages
│   └── settings/          # Settings pages
├── components/            # Reusable components
├── shared/               # Shared files
│   ├── api/              # API client
│   ├── context/          # React Context
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, icons
└── config/               # Configuration files
```

### Code Patterns

#### Using NativeWind

```tsx
import {View, Text} from 'react-native';
import {clsx} from 'clsx';

export function MyComponent() {
  return (
    <View className="bg-bgPrimary flex-1 p-4">
      <Text className="text-lg font-bold text-white">Title</Text>
    </View>
  );
}
```

#### Moti Animations

```tsx
import {MotiView} from 'moti';

<MotiView
  from={{opacity: 0, scale: 0.8}}
  animate={{opacity: 1, scale: 1}}
  className="bg-Primary rounded-lg p-4"
/>;
```

### Color Scheme

- `bgPrimary`: #0B0B13 (Primary background)
- `bgLight`: #222630 (Light background)
- `Primary`: #9C4FDD (Primary color)
- `Secondary`: #00C7EB (Secondary color)
- `Tertiary`: #FFDA7E (Tertiary color)
- `Fourth`: #FF594F (Fourth color)

## 📱 Build and Deployment

### Using EAS Build

#### Preview builds:

```bash
# iOS
yarn deploy:preview:ios

# Android
yarn deploy:preview:android
```

#### Production builds:

```bash
# iOS
yarn deploy:production:ios

# Android
yarn deploy:production:android
```

### Submit to App Store/Play Store:

```bash
yarn submit
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# Linting
yarn lint

# Code formatting
yarn format
```

## 🔧 Configuration

### Firebase Configuration

- `GoogleService-Info.plist` (iOS)
- `google-services.json` (Android)

### Google Maps API Key

- iOS: Configured in `app.json`
- Android: Configured in `app.json`

## 📦 App Permissions

- **Camera**: Take photos, face recognition
- **Microphone**: Record videos
- **Location Access**: Show branch locations
- **Push Notifications**: Send notifications
- **Biometric Access**: Face ID/Touch ID

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is a private project.

## 📞 Contact

- **Developer**: Everest Solution
- **Email**: [contact@everestsolution.mn]
- **Website**: [https://everestsolution.mn]

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - React Native development platform
- [NativeWind](https://nativewind.dev) - Tailwind CSS for React Native
- [Moti](https://moti.fyi) - Animation library
- [React Hook Form](https://react-hook-form.com) - Form management

## 🔧 Development Scripts

### Available Scripts

```bash
# Start development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android

# Run on Web
yarn web

# Prebuild for native development
yarn prebuild

# Build for iOS
yarn prebuild:ios

# Build for Android
yarn prebuild:android

# Reset project (moves starter code to app-example)
yarn reset-project

# Testing
yarn test

# Linting
yarn lint

# Code formatting
yarn format
```

### Deployment Scripts

```bash
# Preview builds
yarn deploy:preview:ios
yarn deploy:preview:android

# Production builds
yarn deploy:production:ios
yarn deploy:production:android

# Submit to stores
yarn submit

# Register device for development
yarn register:device
```

## 🚀 Quick Start Guide

1. **Install dependencies**: `yarn install`
2. **Start development server**: `yarn start`
3. **Run on device/simulator**: `yarn ios` or `yarn android`
4. **Make changes**: Edit files in the `app/` directory
5. **Test changes**: Use Expo Go app or development build

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+
- **Web**: Modern browsers

## 🔒 Security Features

- Biometric authentication
- Secure API communication
- Encrypted data storage
- Liveness detection for identity verification

## 📊 Performance Optimization

- Lazy loading of components
- Image optimization with expo-image
- Efficient list rendering with FlatList
- Memory management with proper cleanup

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `yarn start --clear`
2. **iOS build issues**: Clean build folder in Xcode
3. **Android build issues**: Clean project in Android Studio
4. **Dependency issues**: Delete node_modules and reinstall

### Getting Help

- Check Expo documentation: https://docs.expo.dev
- Join Expo Discord: https://chat.expo.dev
- Report issues in the project repository
