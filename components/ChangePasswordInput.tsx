import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@utils/cn";
import SettingsHidePassIcon from "@assets/images/settings_hidepass2.svg";
import SettingsShowPassIcon from "@assets/images/settings_showpass2.svg";
import SvgIcon from "./SvgIcon";

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  focusColor?: string;
  mode?: string;
  errorString?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  onChangeText?: (arg: string) => void;
  className?: string;
};

const SettingsInput = forwardRef(
  (
    {
      label,
      value,
      placeholder,
      placeholderTextColor = "#9CA3AF",
      focusColor = "#264EDC",
      mode,
      errorString,
      maxLength,
      keyboard = "default",
      readonly = false,
      onChangeText,
      className,
      ...props
    }: Props,
    ref: any
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [isShowPassIcon, setIsShowPassIcon] = useState(false);
    const [textValue, setTextValue] = useState(value || "");
    const isFocused = useSharedValue(0);

    // keep input value synced with parent
    useEffect(() => {
      if (value !== undefined) {
        setTextValue(value);
      }
    }, [value]);

    const borderAnimatedStyle = useAnimatedStyle(() => ({
      backgroundColor: withTiming(isFocused.value ? "#264EDC" : "#E2E2E2", {
        duration: 200,
      }),
      height: 1,
      width: "100%",
    }));

    useImperativeHandle(ref, () => ({
      focus: () => textInputRef.current?.focus(),
    }));

    const handleChangeText = useCallback(
      (text: string) => {
        if (maxLength && text.length > maxLength) return;
        setTextValue(text);
        onChangeText?.(text);
      },
      [onChangeText, maxLength]
    );

    return (
      <View className={cn("w-full mb-5", className)} {...props}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => textInputRef.current?.focus()}
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center space-x-2">
              <SvgIcon name={"changepass"} width={20} height={20} />
              <Text className="text-[#768AA4] text-sm ml-2">{label}</Text>
            </View>

            <View className="flex-row items-center">
              <TextInput
                ref={textInputRef}
                value={textValue}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                secureTextEntry={mode === "password" ? !isShowPassIcon : false}
                selectionColor={focusColor}
                keyboardType={keyboard}
                editable={!readonly}
                onFocus={() => (isFocused.value = 1)}
                onBlur={() => (isFocused.value = 0)}
                style={{
                  textAlign: "right",
                  fontSize: 16,
                  color: "#1B3C69",
                  minWidth: 130,
                  paddingBottom: 8,
                }}
              />

              {mode === "password" && (
                <TouchableOpacity
                  onPress={() => setIsShowPassIcon(!isShowPassIcon)}
                  className="ml-2"
                >
                  {isShowPassIcon ? (
                    <View className="ml-2">
                      <SettingsShowPassIcon width={18} height={18} />
                    </View>
                  ) : (
                    <View className="ml-2">
                      <SettingsHidePassIcon width={18} height={18} />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Underline animation */}
          <Animated.View style={borderAnimatedStyle} />
        </TouchableOpacity>

        {/* Error text */}
        {errorString ? (
          <Text className="mt-2 text-right text-xs text-red-500">
            {errorString}
          </Text>
        ) : null}
      </View>
    );
  }
);

SettingsInput.displayName = "SettingsInput";
export default SettingsInput;
