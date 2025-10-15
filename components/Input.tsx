import { cn } from "@utils/cn";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SvgIcon from "./SvgIcon";

type Props = {
  value?: string;
  placeholder?: string;
  mode?: string;
  errorString?: string;
  placeHolderColor?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  customBorderColor?: string;
  onChangeText?: (arg: string) => void;
  onEndEditing?: () => void;
};

const Input = ({
  value,
  placeholder = "...",
  mode,
  errorString = "",
  keyboard = "default",
  maxLength,
  readonly = false,
  placeHolderColor = "#abb0b0",
  customBorderColor,
  onChangeText,
  onEndEditing,
}: Props) => {
  const [isShowPassIcon, setIsShowPassIcon] = useState(false);

  return (
    <View>
      <View
        className="flex h-14 w-full flex-row items-center  border bg-[#001165] px-4"
        style={{
          borderColor: customBorderColor || "#A45AE1",
        }}
      >
        <TextInput
          value={value}
          placeholder={placeholder}
          keyboardType={keyboard}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          maxLength={maxLength}
          numberOfLines={1}
          editable={!readonly}
          placeholderClassName="translate-y-2"
          className={cn(
            "mb-1 h-14 flex-1 font-[PlayRegular] text-base text-[#ffffff]"
          )}
          secureTextEntry={mode === "password" && !isShowPassIcon}
          placeholderTextColor={placeHolderColor}
        />

        {mode === "password" && (
          <TouchableOpacity
            onPress={() => setIsShowPassIcon(!isShowPassIcon)}
            className="absolute right-2 p-2.5"
          >
            {isShowPassIcon ? (
              <SvgIcon name="auth_hidepass" />
            ) : (
              <SvgIcon name="auth_showpass" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {errorString && (
        <Text className="pr-5 pt-2.5 text-right text-sm text-red-500">
          {errorString}
        </Text>
      )}
    </View>
  );
};

export default Input;
