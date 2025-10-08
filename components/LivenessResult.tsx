import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

interface LivenessResultProps {
  isSuccess: boolean;
  isRetry?: boolean;
  message?: string;
  onBack?: () => void;
}

const LivenessResult: React.FC<LivenessResultProps> = ({
  isSuccess,
  isRetry,
  message,
  onBack,
}) => {
  const getDefaultMessage = () => {
    if (isSuccess) {
      return 'Нүүрний танин баталгаажуулалт амжилттай дууслаа';
    }
    return 'Нүүрний танин баталгаажуулалт амжилтгүй болсон';
  };

  return (
    <View className="flex-1 items-center justify-center bg-bgPrimary p-6">
      <View className="mb-8 items-center justify-center">
        <Text
          className={`mb-4 text-center text-xl font-bold ${
            isSuccess ? 'text-Secondary' : 'text-Fourth'
          }`}>
          {isSuccess ? 'Амжилттай' : 'Амжилтгүй'}
        </Text>

        <Text className="mb-6 text-center text-base leading-6 text-gray-300">
          {message || getDefaultMessage()}
        </Text>

        {!isSuccess && isRetry && (
          <Text className="mb-6 text-center text-sm leading-5 text-gray-400">
            Дахин оролдоно уу эсвэл манай лавлах дугаар луу холбогдоно уу
          </Text>
        )}
      </View>

      <View className="w-full space-y-4">
        <TouchableOpacity
          className={`rounded-lg border border-gray-600 bg-bgLight py-4`}
          onPress={onBack}
          activeOpacity={0.8}>
          <Text className={`text-center text-lg font-semibold text-white`}>
            Буцах
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LivenessResult;
