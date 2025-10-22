import React from "react";
import { Text, View } from "react-native";
import { CLoanPaymentPlan } from "@type/interfaces/Loan";
import { cn } from "@utils/cn";
import { getProductColorByType } from "utils/getProductColor";

type Props = {
  item: CLoanPaymentPlan;
  itemIndex: number;
  prodType: string;
};

const LoanGraphicListItem: React.FC<Props> = ({
  item,
  itemIndex,
  prodType,
}) => {
  return (
    <View className="rounded-xl px-2 py-4" key={itemIndex}>
      <View className="flex-row items-center">
        <Text
          className={cn("text-sm font-medium mb-2 text-[#1B3C69]")}
          style={{
            color: getProductColorByType(Number(prodType)),
          }}
        >
          {item.PAY_DATE || ""}
        </Text>
      </View>

      <View className="flex-col">
        <View className="flex-row justify-between mb-1">
          <Text className="text-lg font-semibold text-[#1B3C69]">
            Нийт төлөх
          </Text>
          <Text className="self-center text-xl font-bold text-[#1B3C69]">
            {item.TOTAL?.toLocaleString("mn-MN") || "0"}
          </Text>
        </View>
        <View className=" h-px w-full bg-[#1B3C69] opacity-60" />
        <View className=" flex-row justify-between my-1">
          <Text className="text-sm text-[#1B3C69]">Зээлээс төлөх</Text>
          <Text className="text-sm text-[#1B3C69]">
            {item.AMT?.toLocaleString("mn-MN") || "0"}
          </Text>
        </View>
        <View className=" flex-row justify-between">
          <Text className="text-sm text-[#1B3C69] my-1">Хүүнээс төлөх</Text>
          <Text className="text-sm text-[#1B3C69]">
            {item.INT_AMT?.toLocaleString("mn-MN") || "0"}
          </Text>
        </View>
        <View className="h-px w-full bg-white opacity-20" />
        <View className=" flex-row justify-between my-1">
          <Text className="text-sm text-[#1B3C69] ">Үлдэгдэл</Text>
          <Text className="text-sm text-[#1B3C69]">
            {item.BALANCE?.toLocaleString("mn-MN") || "0"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoanGraphicListItem;
