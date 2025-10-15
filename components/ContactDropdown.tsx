import { cn } from "@utils/cn";
import React, { forwardRef, useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Dropdown, IDropdownRef } from "react-native-element-dropdown";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import SvgIcon from "@components/SvgIcon";

type Props = {
  title?: string; // caption under the value (e.g., "Хамаарал")
  items: any[];
  focusColor?: string; // divider color on focus
  backgroundColor?: string; // background for icon button
  renderItem?: (item: any, selected: boolean) => React.ReactElement;
  errorString?: string;
  className?: string;
  selectedValue: any;
  labelName?: string; // default: "TITLE"
  valueName?: string; // default: "ID"
  onChange: (value: any) => void;
  disabled?: boolean;
  placeholder?: string;
  rightIconName?: string; // SvgIcon name, default "edit_link"
};

const ContactDropdown = forwardRef<any, Props>(
  (
    {
      title,
      items,
      focusColor = "#2E53F1",
      backgroundColor = "#FFFFFF",
      renderItem,
      errorString,
      className,
      selectedValue,
      labelName = "TITLE",
      valueName = "ID",
      onChange,
      disabled,
      placeholder = "",
      rightIconName = "edit_link",
      ...props
    },
    ref
  ) => {
    const dropDownRef = useRef<IDropdownRef>(null);
    const isFocused = useSharedValue(0);

    const selectedItem = useMemo(
      () => items.find((it) => it?.[valueName] === selectedValue),
      [items, selectedValue, valueName]
    );

    const dividerStyle = useAnimatedStyle(() => ({
      backgroundColor: withTiming(isFocused.value ? focusColor : "#E3E9F3", {
        duration: 160,
      }),
      height: 1,
      width: "100%",
    }));

    return (
      <View className={cn(className)} {...props} ref={ref}>
        {/* Visual row (press to open) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => !disabled && dropDownRef.current?.open()}
          className={cn("flex-row items-center", disabled ? "opacity-60" : "")}
        >
          <View className="flex-1">
            <Text
              className="text-lg"
              style={{
                color: selectedItem ? "#001165" : "#A2B0C6",
                fontWeight: "400",
                paddingVertical: 4,
              }}
              numberOfLines={1}
            >
              {selectedItem ? selectedItem[labelName] : placeholder}
            </Text>
            {title ? (
              <Text className="text-[#768AA4] text-xs mt-1">{title}</Text>
            ) : null}
          </View>

          <View>
            <SvgIcon name={rightIconName} width={20} height={20} />
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <Animated.View style={[{ marginTop: 10 }, dividerStyle]} />

        {/* Invisible dropdown anchor (opens the menu) */}
        <Dropdown
          ref={dropDownRef}
          disable={disabled}
          data={items}
          labelField={labelName}
          valueField={valueName}
          value={selectedItem?.[valueName]}
          onChange={(item) => {
            onChange(item?.[valueName]);
            isFocused.value = 0;
          }}
          onFocus={() => (isFocused.value = 1)}
          onBlur={() => (isFocused.value = 0)}
          renderItem={(item, selected) =>
            renderItem ? (
              renderItem(item, selected)
            ) : (
              <View
                className={cn(
                  "flex-row items-center justify-between rounded-lg p-3",
                  selected ? "bg-[#F5F7FC]" : "bg-transparent"
                )}
              >
                <Text className="text-xl text-[#2A45C4]">
                  {item[labelName]}
                </Text>
              </View>
            )
          }
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 48,
            opacity: 0,
          }}
          containerStyle={{
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
          }}
          itemTextStyle={{ color: "#2A45C4", fontSize: 16 }}
          selectedTextStyle={{ color: "transparent" }}
          placeholder=""
          activeColor="#F5F7FC"
        />

        {errorString ? (
          <Text className="mt-2 text-right text-xs text-red-500">
            {errorString}
          </Text>
        ) : null}
      </View>
    );
  }
);

export default ContactDropdown;
ContactDropdown.displayName = "ContactDropdown";
