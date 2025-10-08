import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import SvgIcon from '@components/SvgIcon';

interface RadioButtonProps {
  label: string;
  value: string;
  iconName: string;
  onPress: () => void;
}

const RadioButton = ({label, iconName, onPress}: RadioButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full flex-row items-center justify-between rounded-md bg-bgLight px-5 py-6">
      <View className="flex-row">
        <View className="mr-4">
          <SvgIcon name={iconName} width={21} height={21} />
        </View>
        <Text className="font-PlayRegular text-base font-medium text-white">
          {label}
        </Text>
      </View>
      <SvgIcon name={'onbrdarrow'} />
    </TouchableOpacity>
  );
};

export default RadioButton;
