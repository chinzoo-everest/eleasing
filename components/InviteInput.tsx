import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@utils/cn";
import SvgIcon from "@components/SvgIcon";

type Props = {
  label?: string;
  value?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  focusColor?: string;
  maxLength?: number;
  keyboard?: "default" | "number-pad" | "phone-pad";
  readonly?: boolean;
  onChangeText?: (text: string) => void;
  className?: string;
};

const InviteInput = forwardRef(
  (
    {
      label = "Утасны дугаар",
      value,
      placeholder,
      placeholderTextColor = "#C0C0C0",
      focusColor = "#264EDC",
      maxLength = 8,
      keyboard = "number-pad",
      readonly = false,
      onChangeText,
      className,
      ...props
    }: Props,
    ref: any
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [textValue, setTextValue] = useState(value || "");
    const isFocused = useSharedValue(0);

    // Sync external value
    useEffect(() => {
      setTextValue(value || "");
    }, [value]);

    /** ✅ Format numbers visually (e.g., 99056436 → 9905 6436) */
    const formatNumber = useCallback((num: string) => {
      const cleaned = num.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return cleaned.slice(0, 4) + " " + cleaned.slice(4);
    }, []);

    const formattedValue = useMemo(
      () => formatNumber(textValue),
      [textValue, formatNumber]
    );

    useImperativeHandle(ref, () => ({
      focus: () => textInputRef.current?.focus(),
    }));

    /** ✅ Animated underline style */
    const underlineStyle = useAnimatedStyle(() => ({
      backgroundColor: withTiming(isFocused.value ? focusColor : "#E2E2E2", {
        duration: 200,
      }),
      height: 1,
      width: "100%",
    }));

    /** ✅ Change handler with numeric-only and maxLength control */
    const handleChangeText = useCallback(
      (text: string) => {
        const numeric = text.replace(/\D/g, "").slice(0, maxLength);
        setTextValue(numeric);
        onChangeText?.(numeric);
      },
      [onChangeText, maxLength]
    );

    return (
      <View className={cn("w-full mb-5", className)} {...props}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => textInputRef.current?.focus()}
        >
          <View className="flex-row items-center justify-between mb-1.5">
            {/* Left side: icon + label */}
            <View className="flex-row items-center">
              <SvgIcon name="phone2" width={20} height={20} />
              <Text className="ml-2 text-[#768AA4] text-sm">{label}</Text>
            </View>

            {/* Right side: text input */}
            <TextInput
              ref={textInputRef}
              value={formattedValue}
              onChangeText={handleChangeText}
              onFocus={() => (isFocused.value = 1)}
              onBlur={() => (isFocused.value = 0)}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              keyboardType={keyboard}
              editable={!readonly}
              maxLength={maxLength}
              style={{
                textAlign: "right",
                paddingBottom: 8,
                fontSize: 18,
                color: "#1B3C69",
                minWidth: 120,
              }}
            />
          </View>

          {/* ✅ Animated underline */}
          <Animated.View style={underlineStyle} />
        </TouchableOpacity>
      </View>
    );
  }
);

InviteInput.displayName = "InviteInput";
export default InviteInput;
