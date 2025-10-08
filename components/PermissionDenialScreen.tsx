import {useRouter} from 'expo-router';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import SvgIcon from './SvgIcon';

interface PermissionDenialScreenProps {
  title?: string;
  message?: string;
  buttonText?: string;
}

const PermissionDenialScreen: React.FC<PermissionDenialScreenProps> = ({
  title = 'Зөвшөөрөл шаардлагатай',
  message = 'Нүүрний танин баталгаажуулалт хийхийн тулд камер болон микрофоны хандалт шаардлагатай. Та зөвшөөрөл өгөхгүй бол энэ үйлчилгээг ашиглах боломжгүй.',
  buttonText = 'Буцах',
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 items-center justify-center bg-bgPrimary p-6">
      <View className="mb-8 items-center justify-center">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-bgLight">
          <SvgIcon name="warning" width={40} height={40} />
        </View>

        <Text className="mb-4 text-center text-xl font-bold text-white">
          {title}
        </Text>

        <Text className="text-center text-base leading-6 text-gray-300">
          {message}
        </Text>
      </View>

      <TouchableOpacity
        className="min-w-[200px] rounded-lg bg-Primary px-8 py-4"
        onPress={handleBack}
        activeOpacity={0.8}>
        <Text className="text-center text-lg font-semibold text-white">
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PermissionDenialScreen;
