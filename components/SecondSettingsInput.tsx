import React, {useRef, useState} from 'react';
import {
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SettingsHidePassIcon from '@assets/images/settings_hidepass.svg';
import SettingsShowPassIcon from '@assets/images/settings_showpass.svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {cn} from '@utils/cn';

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  mode?: string;
  errorString?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  onChangeText?: (arg: string) => void;
  className?: string;
};

const SettingsInput = ({
  label,
  value,
  placeholder,
  mode,
  errorString,
  maxLength,
  keyboard,
  readonly,
  onChangeText,
  className,
  ...props
}: Props) => {
  const textInputRef = useRef<TextInput>(null);
  const [isShowPassIcon, setIsShowPassIcon] = useState(false);
  const isFocused = useSharedValue(0);
  const [textValue, setTextValue] = useState(value || '');

  const borderAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(isFocused.value ? 2 : 1, {duration: 200}),
      borderColor: withTiming(isFocused.value ? '#9C4FDD' : '#B4B4B6', {
        duration: 200,
      }),
      borderRadius: 10,
      paddingVertical: 4,
      backgroundColor: '#0B0B13',
    };
  });

  return (
    <View className={cn(className)} {...props}>
      <TouchableOpacity
        className="flex-col items-start"
        onPress={() => {
          textInputRef.current?.focus();
        }}>
        <Animated.View
          style={[
            borderAnimatedStyle,
            {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0B0B13',
            },
          ]}>
          <View className="w-full flex-col">
            <Text className="ml-2 text-sm font-medium text-[#B4B4B6]">
              {label}
            </Text>
            <TextInput
              ref={textInputRef}
              value={textValue || value}
              onChangeText={text => {
                setTextValue(text);
                onChangeText?.(text);
              }}
              onBlur={() => {
                let formattedText = textValue;
                formattedText = formattedText
                  .replace(/(^-\s+|\s+$)/g, '')
                  .replace(/^-+|-+$/g, '');
                setTextValue(formattedText);
                onChangeText?.(formattedText);
                isFocused.value = 0;
              }}
              placeholder={placeholder}
              maxLength={maxLength}
              keyboardType={keyboard}
              editable={!readonly}
              secureTextEntry={mode === 'password' ? !isShowPassIcon : false}
              className="w-full flex-1 text-xl"
              onFocus={() => (isFocused.value = 1)}
              style={{color: '#fff', marginLeft: 8}}
            />
            {mode === 'password' && (
              <TouchableOpacity
                onPress={() => setIsShowPassIcon(!isShowPassIcon)}
                className="mr-3 rounded-full p-2">
                {isShowPassIcon ? (
                  <SettingsShowPassIcon />
                ) : (
                  <SettingsHidePassIcon />
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
      <Text className="mb-4 text-right text-xs text-red-500">
        {errorString}
      </Text>
    </View>
  );
};

export default SettingsInput;
