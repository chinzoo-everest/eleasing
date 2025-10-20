// @components/RegisterInput.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
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
import SettingsHidePassIcon from "@assets/images/settings_hidepass.svg";
import SettingsShowPassIcon from "@assets/images/settings_showpass.svg";
import { cn } from "@utils/cn";
import SvgIcon from "./SvgIcon";

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  backgroundColor?: string;
  focusColor?: string;
  errorString?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  onChangeText?: (arg: string) => void;
  className?: string;
  mode?: "text" | "password";
};

const RegisterInput = forwardRef(
  (
    {
      label,
      value,
      placeholder,
      placeholderTextColor,
      backgroundColor,
      focusColor,
      errorString,
      maxLength,
      keyboard,
      onChangeText,
      className,
      mode = "text",
      ...props
    }: Props,
    ref: any
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [isShowPass, setIsShowPass] = useState(false);
    const isFocused = useSharedValue(0);

    const borderAnimatedStyle = useAnimatedStyle(() => ({
      borderWidth: withTiming(isFocused.value ? 2 : 1, { duration: 200 }),
      borderColor: withTiming(
        isFocused.value ? focusColor || "#fff" : "#FFFFFF99",
        { duration: 200 }
      ),
    }));

    useImperativeHandle(ref, () => ({
      focus: () => textInputRef.current?.focus(),
    }));

    return (
      <View className={cn(className)} {...props}>
        <TouchableOpacity
          className="flex-col items-start"
          onPress={() => textInputRef.current?.focus()}
          activeOpacity={1}
        >
          <Text className={cn("mb-1.5 text-sm text-white")}>{label}</Text>

          <Animated.View
            style={[
              borderAnimatedStyle,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: backgroundColor || "#fff",
                marginBottom: -25,
                borderRadius: 8,
                borderBottomColor: "#DCE0EB",
                padding: 1,
              },
            ]}
          >
            <View className="flex-row">
              <SvgIcon name={"phone2"} height={20} width={20} />
              <Text className=" ml-2 text-[#1B3C69] opacity-60">
                Утасны дугаар
              </Text>
            </View>
            <TextInput
              ref={textInputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              selectionColor={focusColor || "#1B3C69"}
              maxLength={maxLength}
              keyboardType={keyboard}
              secureTextEntry={mode === "password" ? !isShowPass : false}
              className="h-[40px] w-full flex-1 text-lg leading-6 text-right "
              onFocus={() => (isFocused.value = 1)}
              onBlur={() => (isFocused.value = 0)}
              style={{ color: "#1B3C69", marginLeft: 8, marginBottom: 6 }}
            />

            {mode === "password" && (
              <TouchableOpacity
                onPress={() => setIsShowPass((v) => !v)}
                className="mr-3 rounded-full p-2"
              >
                {isShowPass ? (
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

RegisterInput.displayName = "RegisterInput";
export default RegisterInput;
