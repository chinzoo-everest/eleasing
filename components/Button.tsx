import {cn} from '@utils/cn';
import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  text?: string;
  textColor?: string;
  fillColor?: string;
  buttonHeight?: number;
  isSecondary?: boolean;
  isTextBold?: boolean;
  className?: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  textSize?: number;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const Button = ({
  text,
  buttonHeight,
  textColor = '#ffffff',
  fillColor = '#9C4FDD',
  isSecondary = false,
  isTextBold = false,
  onPress,
  textSize = 16,
  className,
  disabled = false,
  isLoading = false,
  style,
  ...props
}: Props) => {
  return (
    <TouchableOpacity
      className={cn(
        'rounded-full',
        isSecondary ? 'bg-[#C485F033]' : 'bg-[#C485F1]',
        disabled && 'opacity-50',
        className,
      )}
      style={{
        height: buttonHeight || 55,
        backgroundColor: fillColor || undefined,
        ...((style as object) || {}),
      }}
      onPress={onPress}
      disabled={disabled || isLoading}
      {...props}>
      <View className="flex-1">
        {!isLoading && (
          <View className="absolute h-full w-full items-center justify-center">
            {isTextBold ? (
              <Text
                className="text-sm"
                style={{
                  color: textColor,
                  fontSize: textSize,
                }}>
                {text}
              </Text>
            ) : (
              <Text
                className="text-sm"
                style={{
                  color: textColor,
                  fontSize: textSize,
                }}>
                {text}
              </Text>
            )}
          </View>
        )}
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={textColor}
            className="absolute flex h-full w-full items-center justify-center"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Button;
