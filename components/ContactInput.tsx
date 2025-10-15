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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@utils/cn";
import SvgIcon from "@components/SvgIcon";

type Props = {
  label: string; // shown UNDER the value (small, grey)
  value?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  backgroundColor?: string;
  borderColor?: string; // divider color when not focused
  focusColor?: string; // divider + caret color on focus
  errorString?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  onChangeText?: (arg: string) => void;
  className?: string;
  autocapitalz?: boolean;
  isNumber?: boolean;
  delimiter?: string;
  onEndIconPress?: () => void; // optional action for the right icon
  rightIconName?: string; // SvgIcon name (default "edit_link")
};

const ContactInput = forwardRef(
  (
    {
      label,
      value,
      placeholder,
      placeholderTextColor = "#A2B0C6",
      backgroundColor = "#FFFFFF",
      borderColor = "#E3E9F3",
      focusColor = "#2E53F1",
      errorString,
      maxLength,
      keyboard,
      readonly,
      onChangeText,
      className,
      autocapitalz,
      isNumber = false,
      delimiter = ",",
      onEndIconPress,
      rightIconName = "edit_link",
      ...props
    }: Props,
    ref: any
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const isFocused = useSharedValue(0);
    const [textValue, setTextValue] = useState(value || "");

    useEffect(() => {
      if (value !== undefined) setTextValue(value);
    }, [value]);

    const formatNumber = useCallback(
      (text: string): string => {
        if (!isNumber) return text;
        const cleanedText = text.replace(/[^0-9-]/g, "");
        const isNegative = cleanedText.startsWith("-");
        const numericPart = isNegative ? cleanedText.substring(1) : cleanedText;

        let result = "";
        const len = numericPart.length;
        for (let i = 0; i < len; i++) {
          if (i > 0 && (len - i) % 3 === 0) result += delimiter;
          result += numericPart.charAt(i);
        }
        return (isNegative ? "-" : "") + result;
      },
      [isNumber, delimiter]
    );

    const getUnformattedValue = useCallback(
      (text: string): string => {
        if (!isNumber) return text;
        return text.split(delimiter).join("");
      },
      [isNumber, delimiter]
    );

    const formattedValue = useMemo(() => {
      if (isNumber && textValue) return formatNumber(textValue);
      return textValue;
    }, [textValue, isNumber, formatNumber]);

    useImperativeHandle(ref, () => ({
      focus: () => textInputRef.current?.focus(),
    }));

    const handleChangeText = useCallback(
      (text: string) => {
        const isAddingText = text.length > (textValue?.length || 0);
        if (isAddingText && maxLength !== undefined && text.length > maxLength)
          return;

        if (isNumber) {
          const unformattedValue = getUnformattedValue(text);
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
    }, [textValue, isNumber, formatNumber, onChangeText]);

    const dividerStyle = useAnimatedStyle(() => ({
      backgroundColor: withTiming(isFocused.value ? focusColor : borderColor, {
        duration: 160,
      }),
      height: 1,
      width: "100%",
    }));

    return (
      <View className={cn(className)} {...props}>
        {/* Row: value + edit icon */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={0.9}
            onPress={() => textInputRef.current?.focus()}
          >
            <TextInput
              ref={textInputRef}
              value={isNumber ? formattedValue : textValue}
              onChangeText={handleChangeText}
              onBlur={handleBlur}
              onFocus={() => (isFocused.value = 1)}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              selectionColor={focusColor}
              maxLength={undefined}
              autoCapitalize={autocapitalz ? "characters" : "sentences"}
              keyboardType={isNumber ? "numeric" : keyboard}
              editable={!readonly}
              style={{
                color: "#001165",
                fontSize: 18,
                fontWeight: "400",
                paddingTop: 4,
              }}
            />
            {/* small caption under the value (label) */}
            <Text className="mt-1 text-[#768AA4] text-xs ">{label}</Text>
          </TouchableOpacity>

          {/* right icon */}
          <TouchableOpacity
            className="self-center"
            onPress={() => {
              if (onEndIconPress) onEndIconPress();
              textInputRef.current?.focus();
            }}
            activeOpacity={0.8}
          >
            <SvgIcon name={rightIconName} width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <Animated.View style={[{ marginTop: 8 }, dividerStyle]} />

        {/* Error */}
        {errorString ? (
          <Text className="mt-1.5 text-right text-xs text-red-500">
            {errorString}
          </Text>
        ) : null}
      </View>
    );
  }
);

ContactInput.displayName = "ContactInput";

export default ContactInput;
