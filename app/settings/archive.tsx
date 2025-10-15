import Header from "@components/Header";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { loadLoanArchiveList } from "@services/loan.service";
import { CLoanInfo } from "@type/interfaces/Loan";
import formatDate from "@utils/formatDate";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomScrollView from "@components/CustomScrollView";

const Archive = () => {
  const router = useRouter();
  const [loanList, setLoanList] = useState<CLoanInfo[]>([]);
  const insets = useSafeAreaInsets();

  const loadLoanArchiveData = useCallback(async () => {
    try {
      const result = await loadLoanArchiveList();
      if (result && result.length > 0) {
        setLoanList(result);
      }
    } catch (error) {
      handleErrorExpo(error, "loadLoanArchiveData");
    }
  }, []);

  useEffect(() => {
    loadLoanArchiveData();
  }, [loadLoanArchiveData]);

  const formatCurrency = (n?: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Зээл архив"
        bgColor="white"
        showBottomLine={false}
        textColor="#1B3C69"
        onBack={() => router.back()}
      />

      <View className="h-full w-full flex-1 px-4">
        <CustomScrollView>
          <View className="flex-1">
            {loanList.length > 0 ? (
              <View className="mt-2">
                {loanList.map((item, index) => {
                  const amount = item.LOAN_AMT ?? item.AMT ?? item.TOTAL ?? 0;
                  const startDate = formatDate(
                    item?.LOAN_DATE || item?.START_DATE || "",
                    "yyyy.MM.dd"
                  );
                  const endDate = formatDate(
                    item?.PAID_UP_DATE ||
                      item?.FINISH_DATE ||
                      item?.CLOSED_DATE ||
                      "",
                    "yyyy.MM.dd"
                  );

                  return (
                    <View key={index} className="py-5">
                      <View className="flex-row items-start justify-between">
                        <Text className="text-[16px] font-semibold text-[#1F3E6D]">
                          Зээлийн ДҮН
                        </Text>
                        <Text className="text-[18px] font-semibold text-[#374B76]">
                          ₮{formatCurrency(amount)}
                        </Text>
                      </View>

                      {/* Dates */}
                      <View className="mt-3 flex-row items-center justify-between">
                        <Text className="text-[13px] text-[#8DA0BF]">
                          Зээл авсан огноо
                        </Text>
                        <Text className="text-[13px] text-[#3B4F7B]">
                          {startDate}
                        </Text>
                      </View>
                      <View className="mt-1 flex-row items-center justify-between">
                        <Text className="text-[13px] text-[#8DA0BF]">
                          Зээл хаагдсан огноо
                        </Text>
                        <Text className="text-[13px] text-[#3B4F7B]">
                          {endDate}
                        </Text>
                      </View>

                      <View className="mt-5 h-[1px] w-full bg-[#E6EDF7]" />
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center px-10">
                <Text className="text-center text-sm text-[#94A3B8]">
                  Зээлийн архивын мэдээлэл байхгүй байна
                </Text>
              </View>
            )}
          </View>
        </CustomScrollView>
      </View>
    </View>
  );
};

export default Archive;
