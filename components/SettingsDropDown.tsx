import { cn } from "@utils/cn";
import React, { forwardRef, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Dropdown, IDropdownRef } from "react-native-element-dropdown";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
// Component implementation
type Props = {
  title?: string;
  items: any[];
  focusColor?: string;
  backgroundColor?: string;
  renderItem?: (item: any, selected: boolean) => React.ReactElement;
  errorString?: string;
  className?: string;
  selectedValue: any;
  labelName?: string;
  valueName?: string;
  onChange: (value: any) => void;
  disabled?: boolean;
};

const SettingsDropdown = forwardRef<any, Props>(
  (
    {
      title,
      items,
      focusColor,
      backgroundColor,
      renderItem,
      errorString,
      className,
      selectedValue,
      labelName = "TITLE",
      valueName = "ID",
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const dropDownRef = useRef<IDropdownRef>(null);
    const isFocused = useSharedValue(0);

    const borderAnimatedStyle = useAnimatedStyle(() => {
      return {
        borderWidth: withTiming(isFocused.value ? 2 : 1, { duration: 200 }),
        borderColor: withTiming(
          isFocused.value ? focusColor || "#2A45C4" : "#6972B266",
          { duration: 200 }
        ),
      };
    });

    return (
      <TouchableOpacity
        onPress={() => dropDownRef.current?.open()}
        {...props}
        ref={ref}
      >
        {title && (
          <Text className={cn("mb-1.5 text-sm text-[#1B3C69]")}>{title}</Text>
        )}
        <Animated.View
          style={[
            borderAnimatedStyle,
            {
              borderRadius: 8,
              height: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: backgroundColor || "#fff",
            },
          ]}
        >
          <Dropdown
            ref={dropDownRef}
            disable={disabled}
            placeholder=""
            activeColor="#fff"
            renderItem={(item, selected) => {
              if (renderItem) return renderItem(item, selected);
              return (
                <View
                  className={cn(
                    "flex-row items-center justify-between rounded-lg p-2.5",
                    selected ? "bg-[#fff]" : "bg-transparent"
                  )}
                >
                  <Text className="text-base text-white">
                    {item[labelName]}
                  </Text>
                </View>
              );
            }}
            style={{
              flex: 1,
              backgroundColor: backgroundColor || "#fff",
            }}
            iconStyle={{ marginRight: 15 }}
            selectedTextStyle={{
              textAlign: "left",
              fontSize: 16,
              paddingHorizontal: 15,
              color: "#000",
              backgroundColor: backgroundColor || "#fff",
            }}
            itemTextStyle={{
              textAlign: "left",
              fontSize: 16,
              color: "#ffffff",
            }}
            containerStyle={{
              width: "90%",
              borderRadius: 8,
              backgroundColor: backgroundColor || "#fff",
            }}
            itemContainerStyle={{
              borderRadius: 8,
              margin: 2,
              backgroundColor: "transparent",
            }}
            data={items}
            labelField={labelName}
            valueField={valueName}
            value={
              items.find((item) => item[valueName] === selectedValue)?.[
                valueName
              ]
            }
            onChange={(item) => {
              onChange(item[valueName]);
              isFocused.value = 1;
            }}
            onFocus={() => (isFocused.value = 1)}
            onBlur={() => (isFocused.value = 0)}
          />
        </Animated.View>
        <Text className="mt-2 text-right text-xs text-red-500">
          {errorString}
        </Text>
      </TouchableOpacity>
    );
  }
);

export default SettingsDropdown;
SettingsDropdown.displayName = "SettingsDropdown";
