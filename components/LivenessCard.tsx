import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import SvgIcon from './SvgIcon';

interface LivenessCardProps {
  onPress: () => void;
  disabled?: boolean;
}

const LivenessCard: React.FC<LivenessCardProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      className={`mt-5 rounded-2xl ${
        disabled ? 'opacity-50' : 'active:opacity-80'
      }`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <View className="rounded-2xl bg-bgLight px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full">
              <SvgIcon name="faceid" width={24} height={24} />
            </View>
            <View>
              <Text className="text-lg font-bold text-white">
                Танин баталгаажуулалт
              </Text>
              <Text className="text-sm text-gray-400">Нүүр таних систем</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LivenessCard;
