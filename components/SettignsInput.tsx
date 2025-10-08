import React from 'react';
import {KeyboardTypeOptions, Text, TextInput, View} from 'react-native';
import SvgIcon from './SvgIcon';

type Props = {
  title?: string;
  value?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  errorString?: string;
  placeholder?: string;
  className?: string;
  onChangeText?: (arg: string) => void;
};

const SettignsInput = ({
  title,
  value,
  maxLength,
  keyboard = 'default',
  readonly,
  errorString,
  placeholder,
  onChangeText,
  className,
  ...props
}: Props) => {
  return (
    <View className={`space-y-[5px] ${className}`} {...props}>
      <Text className="ml-[10px] text-[16px] text-[#082223] opacity-70">
        {title}
      </Text>
      <View className="h-[50px] flex-row items-center rounded-[15px] border-b border-[#E5DFF6] bg-transparent px-[10px]">
        <TextInput
          className="font-PlayBold flex-1 text-[18px] text-[#082223]"
          value={value}
          placeholder={placeholder}
          keyboardType={keyboard}
          maxLength={maxLength}
          readOnly={readonly}
          onChangeText={onChangeText}
        />
        <SvgIcon name="contact_edit" />
      </View>
      <Text className="mr-[20] text-right text-xs text-red-500">
        {errorString}
      </Text>
    </View>
  );
};

export default SettignsInput;
