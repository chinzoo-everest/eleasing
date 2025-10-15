import React, { useContext } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import SvgIcon from "@components/SvgIcon";
import { CBranch } from "@type/interfaces/Basic";
import { GlobalContext } from "@context/GlobalContext";

interface BranchCardProps {
  branch: CBranch;
  isCarLoan?: boolean;
  onPress: (branch: CBranch) => void;
}

const BranchCard = ({ branch, onPress, isCarLoan }: BranchCardProps) => {
  const context = useContext(GlobalContext);

  return (
    <TouchableOpacity
      onPress={() => onPress(branch)}
      className="mb-4 flex-col rounded-xl bg-[#FFFFFF] shadow-lg"
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <View className="bg-[#2A45C4] py-4 rounded-t-xl">
            <Text className="mx-5 text-sm font-medium text-[#fff] ">
              {branch.NAME}
            </Text>
          </View>
          <View className=" w-full border-b border-tPrimary mb-4" />
          {/* Address */}
          <View className="mb-5 flex-row items-center px-5">
            <View className=" pr-5">
              <Text className="text-base text-[#1B3C69]">{branch.ADDR}</Text>
            </View>
          </View>
          {/* Schedule */}
          <View className="mx-5 mb-5 flex-row items-center">
            <SvgIcon
              name={isCarLoan ? "branch_schedule_car" : "branch_schedule"}
              height={28}
              width={28}
            />
            <Text className="ml-5 text-base text-[#1B3C69] ">
              {branch.TIME_TABLE}
            </Text>
          </View>

          {/* Phone number */}
          <View className="mx-5 flex-row items-center mb-4">
            <SvgIcon name="branch_phone" height={28} width={28} />
            <Text className="ml-5 text-base text-[#1B3C69] font-bold">
              {context?.state.configData?.customerPhoneNo ?? ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BranchCard;
