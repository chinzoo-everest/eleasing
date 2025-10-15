import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import SvgIcon from "./SvgIcon";

const Header = ({
  title,
  onBack,
  textColor = "#ffffff",
  bgColor = "#0B0B13",
  showBottomLine = true,
}: {
  title: string;
  onBack: () => void;
  textColor?: string;
  bgColor?: string;
  showBottomLine?: boolean;
}) => {
  const isAndroid = Platform.OS === "android";

  return (
    <View>
      <View
        className={`flex-row items-center px-6 py-6 ${isAndroid ? "pt-6" : ""}`}
        style={{ backgroundColor: bgColor, justifyContent: "center" }}
      >
        {/* Back button (kept left) */}
        <TouchableOpacity onPress={onBack} className="absolute left-6">
          <SvgIcon name="header_back" />
        </TouchableOpacity>

        {/* Centered title */}
        <Text
          className="font-Inter text-xl text-center font-bold"
          style={{ color: textColor }}
        >
          {title}
        </Text>

        {/* Right placeholder for balance */}
        <View style={{ width: 24 }} />
      </View>

      {showBottomLine && (
        <View
          className="w-full border-b border-[#32363D]"
          style={{ borderWidth: 0.5 }}
        />
      )}
    </View>
  );
};

export default Header;
