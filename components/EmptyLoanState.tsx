import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import SvgIcon from "./SvgIcon";

interface EmptyLoanStateProps {
  title: string;
  description: string;
}

const EmptyLoanState = ({ title, description }: EmptyLoanStateProps) => {
  return (
    <MotiView
      className="rounded-lgpx-5 relative z-10 mt-5 py-10 bg-white shadow-sm rounded-2xl"
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 600,
        delay: 300,
      }}
    >
      {/* <Text className="font-inter text-sm text-white">
        {title === 'Зээлийн түүх' ? 'ИДЭВХИТЭЙ ЗЭЭЛ' : 'ХҮСЭЛТИЙН ТҮҮХ'}
      </Text> */}

      <View className="">
        <View className="self-center"></View>
      </View>
      <Text className="absolute pt-14 text-base text-[#000] opacity-60">
        {title}
      </Text>
      <Text className="mx-8 self-center text-center text-xs text-black opacity-60">
        {description}
      </Text>
    </MotiView>
  );
};

export default EmptyLoanState;
