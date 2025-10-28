import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SettingsHidePassIcon from "@assets/images/settings_hidepass.svg";
import SettingsShowPassIcon from "@assets/images/settings_showpass.svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@utils/cn";

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  focusColor?: string;
  mode?: string;
  errorString?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  onChangeText?: (arg: string) => void;
  className?: string;
  autocapitalz?: boolean;
  isNumber?: boolean;
  delimiter?: string;
};

const SettingsInput = forwardRef(
  (
    {
      label,
      value,
      placeholder,
      placeholderTextColor,
      mode,
      backgroundColor,
      borderColor,
      focusColor,
      errorString,
      maxLength,
      keyboard,
      readonly,
      onChangeText,
      className,
      autocapitalz,
      isNumber = false,
      delimiter = ",",
      ...props
    }: Props,
    ref: any
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [isShowPassIcon, setIsShowPassIcon] = useState(false);
    const isFocused = useSharedValue(0);
    const [textValue, setTextValue] = useState(value || "");

    // Added effect to update internal state when prop value changes
    useEffect(() => {
      if (value !== undefined) {
        setTextValue(value);
      }
    }, [value]);

    // Format number with delimiter - memoized to avoid recalculating unnecessarily
    const formatNumber = useCallback(
      (text: string): string => {
        if (!isNumber) return text;

        // Remove non-numeric characters except minus sign at beginning
        const cleanedText = text.replace(/[^0-9-]/g, "");

        // Handle negative numbers
        const isNegative = cleanedText.startsWith("-");
        const numericPart = isNegative ? cleanedText.substring(1) : cleanedText;

        // Add thousand separators - more efficient algorithm
        let result = "";
        const len = numericPart.length;

        for (let i = 0; i < len; i++) {
          if (i > 0 && (len - i) % 3 === 0) {
            result += delimiter;
          }
          result += numericPart.charAt(i);
        }

        return (isNegative ? "-" : "") + result;
      },
      [isNumber, delimiter]
    );

    // Remove formatting to get raw value - memoized to avoid recalculating
    const getUnformattedValue = useCallback(
      (text: string): string => {
        if (!isNumber) return text;
        // Use string replace instead of RegExp for better performance
        return text.split(delimiter).join("");
      },
      [isNumber, delimiter]
    );

    // Calculate formatted value only when needed using useMemo
    const formattedValue = useMemo(() => {
      if (isNumber && textValue) {
        return formatNumber(textValue);
      }
      return textValue;
    }, [textValue, isNumber, formatNumber]);

    const borderAnimatedStyle = useAnimatedStyle(() => {
      return {
        borderWidth: withTiming(isFocused.value ? 2 : 1, { duration: 200 }),
        borderColor: withTiming(
          isFocused.value ? focusColor || "#2A45C4" : "#6972B266",
          {
            duration: 200,
          }
        ),
      };
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        textInputRef.current?.focus();
      },
    }));

    // Memoize the onChangeText handler to avoid recreating it on every render
    const handleChangeText = useCallback(
      (text: string) => {
        // Always allow deleting characters, regardless of maxLength
        // Only apply maxLength when adding characters
        const isAddingText = text.length > (textValue?.length || 0);

        if (
          isAddingText &&
          maxLength !== undefined &&
          text.length > maxLength
        ) {
          // Skip processing if trying to add text beyond maxLength
          return;
        }

        if (isNumber) {
          // Remove formatting first
          const unformattedValue = getUnformattedValue(text);

          // Remove leading zeros except when the value is just "0"
          let processedValue = unformattedValue;
          if (processedValue.length > 1 && processedValue.startsWith("0")) {
            processedValue = processedValue.replace(/^0+/, "");
          }

          setTextValue(processedValue);
          onChangeText?.(processedValue);
        } else {
          setTextValue(text);
          onChangeText?.(text);
        }
      },
      [isNumber, getUnformattedValue, onChangeText, textValue, maxLength]
    );

    // Memoize the onBlur handler to avoid recreating it on every render
    const handleBlur = useCallback(() => {
      let formattedText = textValue;
      if (!isNumber) {
        formattedText = formattedText
          .replace(/(^-\s+|\s+$)/g, "")
          .replace(/^-+|-+$/g, "");
      } else {
        formattedText = formatNumber(formattedText);
      }
      setTextValue(formattedText);
      onChangeText?.(formattedText);
      isFocused.value = 0;
    }, [textValue, isNumber, formatNumber, onChangeText, isFocused]);

    return (
      <View className={cn(className)} {...props}>
        <TouchableOpacity
          className="flex-col items-start"
          onPress={() => {
            textInputRef.current?.focus();
          }}
        >
          <Text className={cn("mb-1.5 text-sm text-[#1B3C69]")}>{label}</Text>
          <Animated.View
            style={[
              borderAnimatedStyle,
              {
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: backgroundColor || "#fff",
                marginBottom: -25,
                borderRadius: 8,
                padding: 1,
              },
            ]}
          >
            <TextInput
              ref={textInputRef}
              value={isNumber ? formattedValue : textValue}
              onChangeText={handleChangeText}
              onBlur={handleBlur}
              placeholder={placeholder}
              selectionColor={focusColor || "#001165"}
              placeholderTextColor={placeholderTextColor}
              maxLength={undefined} // Remove maxLength from TextInput
              autoCapitalize={autocapitalz ? "characters" : "sentences"}
              keyboardType={isNumber ? "numeric" : keyboard}
              editable={!readonly}
              secureTextEntry={mode === "password" ? !isShowPassIcon : false}
              placeholderClassName="text-lg leading-6"
              className="h-[40px] w-full flex-1 text-lg leading-6"
              onFocus={() => (isFocused.value = 1)}
              style={{ color: "#000", marginLeft: 8, marginBottom: 6 }}
            />
            {mode === "password" && (
              <TouchableOpacity
                onPress={() => setIsShowPassIcon(!isShowPassIcon)}
                className="mr-3 rounded-full p-2"
              >
                {isShowPassIcon ? (
                  <SettingsShowPassIcon />
                ) : (
                  <SettingsHidePassIcon />
                )}
              </TouchableOpacity>
            )}
          </Animated.View>
        </TouchableOpacity>
        <Text className="mt-8 text-right text-xs text-red-500">
          {errorString}
        </Text>
      </View>
    );
  }
);

SettingsInput.displayName = "SettingsInput";

export default SettingsInput;
