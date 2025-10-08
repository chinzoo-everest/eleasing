# CAR zeel - Зээлийн удирдлагын апп

CAR zeel нь React Native Expo дээр суурилсан зээлийн удирдлагын мобайл апп юм. Энэ апп нь автомашины зээл, хадгаламжийн зээл, утасны зээл зэрэг төрөл бүрийн зээлийн үйлчилгээг удирдах боломжийг олгодог.

## 🚀 Онцлогууд

- **Зээлийн удирдлага**: Идэвхтэй зээлүүдийг харах, төлбөр хийх
- **Зээл авах**: Автомашины зээл, хадгаламжийн зээл, утасны зээл
- **Баримт бичиг**: Зээлийн гэрээ, баримт бичгийн удирдлага
- **Нүүрний танин баталгаажуулалт**: Liveness detection
- **Хэрэглэгчийн интерфейс**: NativeWind v4 ашиглан загварчилсан
- **Анимэйшн**: Moti анимэйшн сан ашигласан
- **Push notification**: Firebase messaging
- **Газрын зураг**: Google Maps интеграци

## 🛠 Технологиуд

- **React Native**: 0.79.5
- **Expo SDK**: 53
- **NativeWind**: v4.1.23 (Tailwind CSS)
- **TypeScript**: 5.8.3
- **Expo Router**: File-based routing
- **Moti**: Анимэйшн сан
- **Firebase**: Authentication, Messaging, Crashlytics
- **React Hook Form**: Форм удирдлага
- **Axios**: API хүсэлтүүд

## 📋 Шаардлага

- **Node.js**: 18.0.0 эсвэл түүнээс дээш
- **Yarn**: 1.22.22 эсвэл түүнээс дээш
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Development**: Xcode 15+ (macOS дээр)
- **Android Development**: Android Studio (Java 17+)

## 🚀 Суулгах болон ажиллуулах

### 1. Төслийг клоно хийх

```bash
git clone <repository-url>
cd mandal
```

### 2. Хамаарал бүхий сангуудыг суулгах

```bash
yarn install
```

### 3. Хөгжүүлэлтийн серверийг эхлүүлэх

```bash
yarn start
```

### 4. Аппыг ажиллуулах

#### iOS дээр:

```bash
yarn ios
```

#### Android дээр:

```bash
yarn android
```

#### Web дээр:

```bash
yarn web
```

## 🏗 Хөгжүүлэлт

### Төслийн бүтэц

```
mandal/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   ├── auth/              # Нэвтрэх хуудаснууд
│   ├── loan/              # Зээлийн хуудаснууд
│   ├── carLoan/           # Автомашины зээл
│   ├── depositLoan/       # Хадгаламжийн зээл
│   ├── phoneLoan/         # Утасны зээл
│   └── settings/          # Тохиргооны хуудаснууд
├── components/            # Дахин ашиглах компонентууд
├── shared/               # Хамтарсан файлууд
│   ├── api/              # API клиент
│   ├── context/          # React Context
│   ├── services/         # API үйлчилгээнүүд
│   ├── types/            # TypeScript төрлүүд
│   └── utils/            # Туслах функцууд
├── assets/               # Зураг, фонт, icon-ууд
└── config/               # Тохиргооны файлууд
```

### Кодын загвар

#### NativeWind ашиглах

```tsx
import {View, Text} from 'react-native';
import {clsx} from 'clsx';

export function MyComponent() {
  return (
    <View className="bg-bgPrimary flex-1 p-4">
      <Text className="text-lg font-bold text-white">Гарчиг</Text>
    </View>
  );
}
```

#### Moti анимэйшн

```tsx
import {MotiView} from 'moti';

<MotiView
  from={{opacity: 0, scale: 0.8}}
  animate={{opacity: 1, scale: 1}}
  className="bg-Primary rounded-lg p-4"
/>;
```

### Өнгөний схем

- `bgPrimary`: #0B0B13 (Үндсэн дэвсгэр)
- `bgLight`: #222630 (Хөнгөн дэвсгэр)
- `Primary`: #9C4FDD (Үндсэн өнгө)
- `Secondary`: #00C7EB (Хоёрдогч өнгө)
- `Tertiary`: #FFDA7E (Гуравдагч өнгө)
- `Fourth`: #FF594F (Дөрөвдөгч өнгө)

## 📱 Барилт болон тараах

### EAS Build ашиглах

#### Preview барилт:

```bash
# iOS
yarn deploy:preview:ios

# Android
yarn deploy:preview:android
```

#### Production барилт:

```bash
# iOS
yarn deploy:production:ios

# Android
yarn deploy:production:android
```

### App Store/Play Store руу илгээх:

```bash
yarn submit
```

## 🧪 Тест хийх

```bash
# Unit тестүүд
yarn test

# Linting
yarn lint

# Кодын форматыг засах
yarn format
```

## 🔧 Тохиргоо

### Firebase тохиргоо

- `GoogleService-Info.plist` (iOS)
- `google-services.json` (Android)

### Google Maps API Key

- iOS: `app.json` дотор тохируулсан
- Android: `app.json` дотор тохируулсан

## 📦 Хэрэглээний эрхүүд

- **Камера**: Зураг авах, нүүрний танин баталгаажуулалт
- **Микрофон**: Видео бичлэг хийх
- **Газрын зургийн хандалт**: Салбар байршлыг харуулах
- **Push notification**: Мэдэгдэл илгээх
- **Биометрийн хандалт**: Face ID/Touch ID

## 🤝 Хувь нэмэр оруулах

1. Fork хийх
2. Feature branch үүсгэх (`git checkout -b feature/amazing-feature`)
3. Commit хийх (`git commit -m 'Add amazing feature'`)
4. Push хийх (`git push origin feature/amazing-feature`)
5. Pull Request үүсгэх

## 📄 Лиценз

Энэ төсөл нь private төсөл юм.

## 📞 Холбоо барих

- **Хөгжүүлэгч**: Everest Solution
- **Email**: [contact@everestsolution.mn]
- **Вебсайт**: [https://everestsolution.mn]

## 🙏 Талархал

- [Expo](https://expo.dev) - React Native хөгжүүлэлтийн платформ
- [NativeWind](https://nativewind.dev) - Tailwind CSS React Native дээр
- [Moti](https://moti.fyi) - Анимэйшн сан
- [React Hook Form](https://react-hook-form.com) - Форм удирдлага
