import CustomScrollView from "@components/CustomScrollView";
import Header from "@components/Header";
import { loadTransactionList } from "@services/loan.service";
import { CLoanInfo, CLoanTransaction } from "@type/interfaces/Loan";
import { cn } from "@utils/cn";
import formatDate from "@utils/formatDate";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getProductColorByType,
  getProductTextColorByType,
} from "utils/getProductColor";

const Transaction = () => {
  const insets = useSafeAreaInsets();
  const { loan } = useLocalSearchParams();

  const [transactionList, setTransactionList] = useState<CLoanTransaction[]>(
    []
  );
  const [loanInfo, setLoanInfo] = useState<CLoanInfo | null>(null);

  const LoadTransaction = useCallback(async (loanData: CLoanInfo | null) => {
    try {
      if (!loanData) return;
      const data = await loadTransactionList(loanData);
      if (data) {
        setTransactionList(data);
      }
    } catch (error) {
      handleErrorExpo(error, "loadTransactionList");
    }
  }, []);

  useEffect(() => {
    const loanData = loan ? JSON.parse(loan as string) : null;
    setLoanInfo(loanData);
    LoadTransaction(loanData);
  }, [LoadTransaction, loan]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title={`Гүйлгээний түүх`}
        bgColor="white"
        textColor="#1B3C69"
        onBack={router.back}
        showBottomLine={false}
      />
      {transactionList.length === 0 && (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-light text-center text-sm text-[#1B3C69] opacity-60">
            Гүйлгээний түүх байхгүй байна
          </Text>
        </View>
      )}
      {transactionList.length > 0 && (
        <CustomScrollView>
          <View className="mt-5 flex-1 gap-3 px-4 ">
            {transactionList.map((item) => (
              <View
                className="rounded-xl bg-white shadow px-3 py-5"
                key={item.TRN_ID}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={cn("h-2.5 w-2.5 rounded-full")}
                    style={{
                      backgroundColor: getProductColorByType(
                        loanInfo.APP_PROD_TYPE
                      ),
                    }}
                  />
                  <Text
                    className={cn("text-sm font-medium")}
                    style={{
                      color: "#1B3C69",
                    }}
                  >
                    {formatDate(item.TRN_DATE || "", "yyyy.MM.dd")}
                  </Text>
                </View>
                <View className="my-2 h-px bg-[#34363D]" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-[#1B3C69]">
                    {item.TRN_DESC}
                  </Text>
                  <Text className="text-base text-[#1B3C69]">
                    {item.AMT.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </CustomScrollView>
      )}
    </View>
  );
};

export default Transaction;
