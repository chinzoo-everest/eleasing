import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@utils/cn";
import SvgIcon from "./SvgIcon";

type Props = {
  label?: string;
  value?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  focusColor?: string;
  maxLength?: number;
  keyboard?: "default" | "email-address";
  readonly?: boolean;
  onChangeText?: (text: string) => void;
  errorString?: string;
  className?: string;
};

const ChangeEmailInput = forwardRef(
  (
    {
      label = "Имэйл хаяг",
      value,
      placeholder = "example@email.com",
      placeholderTextColor = "#C0C0C0",
      focusColor = "#264EDC",
      maxLength = 100,
      keyboard = "email-address",
      readonly = false,
      onChangeText,
      errorString,
      className,
      ...props
    }: Props,
    ref: any
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [textValue, setTextValue] = useState(value || "");
    const isFocused = useSharedValue(0);

    useEffect(() => {
      setTextValue(value || "");
    }, [value]);

    const handleChangeText = useCallback(
      (text: string) => {
        const cleaned = text.trim().toLowerCase().slice(0, maxLength);
        setTextValue(cleaned);
        onChangeText?.(cleaned);
      },
      [onChangeText, maxLength]
    );

    useImperativeHandle(ref, () => ({
      focus: () => textInputRef.current?.focus(),
    }));

    const underlineStyle = useAnimatedStyle(() => ({
      backgroundColor: withTiming(isFocused.value ? focusColor : "#E2E2E2", {
        duration: 200,
      }),
      height: 1,
      width: "100%",
    }));

    return (
      <View className={cn("w-full mb-5", className)} {...props}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => textInputRef.current?.focus()}
        >
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center">
              <SvgIcon name="email" width={20} height={20} />
              <Text className="ml-2 text-[#768AA4] text-sm">{label}</Text>
            </View>
            <TextInput
              ref={textInputRef}
              value={textValue}
              onChangeText={handleChangeText}
              onFocus={() => (isFocused.value = 1)}
              onBlur={() => (isFocused.value = 0)}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              keyboardType={keyboard}
              editable={!readonly}
              autoCapitalize="none"
              style={{
                textAlign: "right",
                fontSize: 18,
                color: "#1B3C69",
                minWidth: 150,
              }}
            />
          </View>

          {/* Underline */}
          <Animated.View style={underlineStyle} />

          {/* Error Text */}
          {errorString ? (
            <Text className="mt-2 text-xs text-red-500 text-right">
              {errorString}
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  }
);

ChangeEmailInput.displayName = "ChangeEmailInput";
export default ChangeEmailInput;
