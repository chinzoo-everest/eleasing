import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ProgressBar from "@components/ProgressBar";
import { CLoanInfo } from "@type/interfaces/Loan";

const formatLocalDate = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const LoanListItem = ({
  item,
  onPress,
}: {
  item: CLoanInfo;
  onPress: () => void;
}) => {
  const loan: CLoanInfo = item;
  const startDate = item.LOAN_DATE;
  const endDate = item.PLAN_FINISH;
  const amount = item.AMT || 0;

  // ✅ Status calculation (хэвийн / хэвийн бус)
  const isNormal = endDate && new Date() <= new Date(endDate);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-4 flex-row overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      {/* Left side: blue date section */}
      <View className="w-[40%] bg-[#001E60] px-4 py-5 justify-center">
        <View className="mb-3">
          <Text className="text-xs text-[#9CA3AF]">Эхлэх хугацаа</Text>
          <Text className="text-base font-bold text-white">
            {formatLocalDate(startDate)}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-[#9CA3AF]">Дуусах хугацаа</Text>
          <Text className="text-base font-bold text-white">
            {formatLocalDate(endDate)}
          </Text>
        </View>
      </View>

      {/* Right side: white info section */}
      <View className="flex-1 flex-col px-5 py-5 justify-center bg-[#F9FAFB] rounded-r-2xl">
        <Text className="text-sm text-gray-500">Зээлийн дүн</Text>
        <Text className="text-2xl font-bold text-[#001E60] mb-2">
          ₮{amount.toLocaleString("mn-MN", { minimumFractionDigits: 2 })}
        </Text>

        <View className="flex-row items-center">
          {isNormal ? (
            <>
              <View className="h-5 w-5 mr-1 rounded-full bg-[#00C853] items-center justify-center">
                <Text className="text-white font-bold text-xs">✓</Text>
              </View>
              <Text className="text-[#00C853] font-semibold">хэвийн</Text>
            </>
          ) : (
            <Text className="text-red-500 font-semibold">хэвийн бус</Text>
          )}
        </View>

        {/* Optional Progress bar if needed */}
        {/* <View className="mt-3">
          <ProgressBar
            progress={(loan.AMT || 1) - (loan.BALANCE || 0)}
            min={0}
            max={loan.AMT || 1}
            prodType={loan.APP_PROD_TYPE}
          />
        </View> */}
      </View>
    </TouchableOpacity>
  );
};

export default LoanListItem;
