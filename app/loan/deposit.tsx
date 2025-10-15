import CustomScrollView from "@components/CustomScrollView";
import Header from "@components/Header";
import { loadDepositList } from "@services/loan.service";
import { CLoanDeposit, CLoanInfo } from "@type/interfaces/Loan";
import formatDate from "@utils/formatDate";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LABEL_W = "w-44"; // ~176px – tweak if you need tighter/wider labels

const Deposit = () => {
  const insets = useSafeAreaInsets();
  const { loan } = useLocalSearchParams();

  const [depositList, setDepositList] = useState<CLoanDeposit[]>([]);

  const LoadDeposit = useCallback(async (loanData: CLoanInfo | null) => {
    try {
      if (!loanData) return;
      const data = await loadDepositList(loanData);
      if (data) {
        setDepositList(data);
      }
    } catch (error) {
      handleErrorExpo(error, "loadDepositList");
    }
  }, []);

  useEffect(() => {
    const loanData = loan ? JSON.parse(loan as string) : null;
    LoadDeposit(loanData);
  }, [LoadDeposit, loan]);

  return (
    // Light page like the screenshot
    <View className="flex-1 bg-[#fff]" style={{ paddingTop: insets.top }}>
      <Header
        title={`Барьцаа хөрөнгө`}
        onBack={router.back}
        bgColor="white"
        showBottomLine={false}
        textColor="#1B3C69"
      />

      {depositList.length === 0 && (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-sm text-[#1B3C69]/40">
            Барьцаа бүртгэгдээгүй байна
          </Text>
        </View>
      )}

      {depositList.length > 0 && (
        <CustomScrollView>
          <View className="mt-4 flex-1 px-4 pb-8">
            {depositList.map((item) => (
              <View
                key={item.DEP_ID}
                // Card container like the photo: light surface, border, rounded, soft shadow
                className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
              >
                {/* Гэрээний дугаар */}
                <View>
                  <View className="flex-row justify-between">
                    <Text className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}>
                      Гэрээний дугаар
                    </Text>
                    <Text className="flex-1 text-base text-[#1B3C69]">
                      {item.CONTRACT_ID}
                    </Text>
                  </View>
                  <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                </View>

                {/* Барьцаа хөрөнгийн төрөл */}
                <View className="mt-2">
                  <View className="flex-row items-start">
                    <Text className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}>
                      Барьцаа хөрөнгийн төрөл
                    </Text>
                    <Text className="flex-1 text-base text-[#1B3C69]">
                      {item.TYPE_NAME}
                    </Text>
                  </View>
                  <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                </View>

                {/* Барьцаанд бүртгэгдсэн огноо */}
                {item?.CREATED && (
                  <View className="mt-2">
                    <View className="flex-row items-start">
                      <Text
                        className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}
                      >
                        Барьцаанд бүртгэгдсэн огноо
                      </Text>
                      <Text className="flex-1 text-base text-[#1B3C69]">
                        {formatDate(item?.CREATED, "yyyy.MM.dd")}
                      </Text>
                    </View>
                    <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                  </View>
                )}

                {/* Барьцаа дугаар */}
                <View className="mt-2">
                  <View className="flex-row items-start">
                    <Text className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}>
                      Барьцаа дугаар
                    </Text>
                    <Text className="flex-1 text-base text-[#1B3C69]">
                      {item.DOC_NO}
                    </Text>
                  </View>
                  <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                </View>

                {/* Хөрөнгийн нэр */}
                <View className="mt-2">
                  <View className="flex-row items-start">
                    <Text className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}>
                      Хөрөнгийн нэр
                    </Text>
                    <Text className="flex-1 text-base text-[#1B3C69]">
                      {item.DEP_NAME}
                    </Text>
                  </View>
                  <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                </View>

                {/* Улсын/Улсын бүртгэлийн дугаар */}
                <View className="mt-2">
                  <View className="flex-row items-start">
                    <Text className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}>
                      {item.IS_CAR ? "Улсын дугаар" : "Улсын бүртгэлийн дугаар"}
                    </Text>
                    <Text className="flex-1 text-base text-[#1B3C69]">
                      {item.CAR_NO}
                    </Text>
                  </View>
                  <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                </View>

                {/* Машины мэдээлэл (if IS_CAR) */}
                {item.IS_CAR && (
                  <View className="mt-2">
                    {/* Машины төрөл */}
                    <View className="mt-1">
                      <View className="flex-row items-start">
                        <Text
                          className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}
                        >
                          Машины төрөл
                        </Text>
                        <Text className="flex-1 text-base text-[#1B3C69]">
                          {item.CAR_MODEL}
                        </Text>
                      </View>
                      <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                    </View>
                    {/* Машины өнгө */}
                    <View className="mt-1">
                      <View className="flex-row items-start">
                        <Text
                          className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}
                        >
                          Машины өнгө
                        </Text>
                        <Text className="flex-1 text-base text-[#1B3C69]">
                          {item.CAR_COLOR}
                        </Text>
                      </View>
                      <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                    </View>
                    {/* Арлын дугаар */}
                    <View className="mt-1">
                      <View className="flex-row items-start">
                        <Text
                          className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}
                        >
                          Арлын дугаар
                        </Text>
                        <Text className="flex-1 text-base text-[#1B3C69]">
                          {item.CAR_VIN_NO}
                        </Text>
                      </View>
                      <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                    </View>
                    {/* Үйлдвэрлэсэн огноо */}
                    <View className="mt-1">
                      <View className="flex-row items-start">
                        <Text
                          className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}
                        >
                          Үйлдвэрлэсэн огноо
                        </Text>
                        <Text className="flex-1 text-base text-[#1B3C69]">
                          {item.CAR_MANU_DATE}
                        </Text>
                      </View>
                      <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                    </View>
                    {/* Орж ирсэн огноо */}
                    <View className="mt-1">
                      <View className="flex-row items-start">
                        <Text
                          className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}
                        >
                          Орж ирсэн огноо
                        </Text>
                        <Text className="flex-1 text-base text-[#1B3C69]">
                          {item.CAR_IMP_DATE}
                        </Text>
                      </View>
                      <View className="mt-2 h-px bg-[#34363D] opacity-0" />
                    </View>
                  </View>
                )}

                {/* Нэмэлт мэдээлэл */}
                {item.DESCR && (
                  <View className="mt-2">
                    <View className="flex-row items-start">
                      <Text
                        className={`text-base text-[#1B3C69]/50 ${LABEL_W}`}
                      >
                        Нэмэлт мэдээлэл
                      </Text>
                      <Text className="flex-1 text-base text-[#1B3C69]">
                        {item.DESCR}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </CustomScrollView>
      )}
    </View>
  );
};

export default Deposit;
