import React from 'react';
import {KeyboardTypeOptions, Text, View} from 'react-native';
import CurrencyInput from 'react-native-currency-input';

type Props = {
  value?: number | null;
  placeholder?: string;
  errorString?: string;
  placeHolderColor?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  onChangeText?: (arg: string) => void;
  onChangeValue?: (arg: number) => void;
  onEndEditing?: () => void;
  prefix?: string;
  suffix?: string;
  delimiter?: string;
  separator?: string;
  precision?: number;
  minValue?: number;
  maxValue?: number;
};

const NumberInput = ({
  value = 0,
  placeholder = '...',
  errorString,
  keyboard = 'default',
  maxLength,
  readonly = false,
  placeHolderColor = '#6b7280',
  onChangeText,
  onChangeValue,
  onEndEditing,
  prefix = '',
  suffix = '',
  delimiter = ',',
  separator = '.',
  precision = 2,
  minValue,
  maxValue,
}: Props) => {
  return (
    <View className="">
      <View className="bg-red-399 h-[52]">
        <View className="h-full rounded-[12px] bg-bgPrimary" />
        <View className="absolute bottom-0 left-0 w-full -translate-x-2" />
        <View className="absolute flex h-full w-full flex-1 flex-row items-center space-x-[10] px-2">
          <CurrencyInput
            value={value}
            placeholder={placeholder}
            keyboardType={keyboard}
            onChangeText={onChangeText}
            onChangeValue={onChangeValue}
            onEndEditing={onEndEditing}
            maxLength={maxLength}
            readOnly={readonly}
            placeholderTextColor={placeHolderColor}
            className="font-PlayBold h-full flex-1 px-3 text-sm text-[#fff]"
            prefix={prefix}
            suffix={suffix}
            delimiter={delimiter}
            separator={separator}
            precision={precision}
            minValue={minValue}
            maxValue={maxValue}
          />
        </View>
      </View>

      <Text className="mr-[20] text-right text-sm text-red-500">
        {errorString}
      </Text>
    </View>
  );
};

export default NumberInput;
