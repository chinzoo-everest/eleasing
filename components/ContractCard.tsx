import { ContractAction } from "@constant/contract";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import LivenessCard from "./LivenessCard";
import SvgIcon from "./SvgIcon";

type Props = {
  title: string;
  description: string;
  reason: string;
  buttonText: string;
  actionCode: string;
  buttonVisible: boolean;
  buttonOnPress: () => void;
  navigation: any;
};

const ContractCard = ({
  title,
  description,
  reason,
  buttonText,
  actionCode,
  buttonVisible,
  buttonOnPress,
}: Props) => {
  return (
    <View className="w-full">
      {/* Outer container */}
      <View className="relative flex-row items-center rounded-2xl bg-[#F6F6F8]  py-6 overflow-hidden">
        {/* Orange strip */}
        <View className="absolute left-0 top-0 bottom-0 w-[41px] bg-[#F7931E] rounded-l-2xl" />

        {/* Icon container overlapping halfway */}
        <View className="absolute left-4 z-10 h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <SvgIcon name="envelope" height={38} width={38} />
        </View>

        {/* Text area */}
        <View className="flex-1 ml-24">
          {description && (
            <Text className="text-sm text-[#1B3C69] mb-1">{description}</Text>
          )}
          {reason && (
            <Text className="text-sm text-[#1B3C69] leading-5">
              <Text className="font-bold">Шалтгаан: </Text>
              {reason}
            </Text>
          )}
        </View>
      </View>

      {/* Button logic unchanged */}
      {buttonVisible && actionCode !== ContractAction.VERIFY_FACE && (
        <TouchableOpacity
          onPress={buttonOnPress}
          className="mt-6 w-full rounded-2xl bg-[#2A45C4] py-4 self-center"
        >
          <Text className="text-center font-bold text-base text-white">
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
      {actionCode === ContractAction.VERIFY_FACE && (
        <LivenessCard onPress={buttonOnPress} disabled={false} />
      )}
    </View>
  );
};

export default ContractCard;
