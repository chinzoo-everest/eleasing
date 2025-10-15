import Header from "@components/Header";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CLoanPaymentPlan } from "@type/interfaces/Loan";
import { CLoanInfo } from "@type/interfaces/Loan";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import {
  loadGraphicList,
  loadScheduleDataForRequest,
} from "@services/loan.service";
import { loadScheduleData } from "@services/loan.service";
import CustomScrollView from "@components/CustomScrollView";
import LoanGraphicListItem from "@components/LoanGraphicListItem";
import { Config } from "@customConfig/config";

const Graphic = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loan, requestData, prodType } = useLocalSearchParams();

  const [graphList, setGraphList] = useState<CLoanPaymentPlan[]>([]);
  const [mode, setMode] = useState<"graphic" | "schedule">("graphic");

  const LoadLoanGraphic = useCallback(
    async (loanData: CLoanInfo | null, loanRequest: any) => {
      try {
        if (loanData) {
          const data = await loadGraphicList(loanData);
          if (data) setGraphList(data);
        } else if (loanRequest) {
          const data =
            Number(prodType) === Config.DIGITAL_PROD_TYPE
              ? await loadScheduleData(loanRequest)
              : await loadScheduleDataForRequest(loanRequest);
          if (data) {
            setMode("schedule");
            setGraphList(data);
          }
        }
      } catch (error) {
        handleErrorExpo(error, "loadData");
      }
    },
    [prodType]
  );

  useEffect(() => {
    const loanData = loan ? JSON.parse(loan as string) : null;
    const loanRequest = requestData ? JSON.parse(requestData as string) : null;
    LoadLoanGraphic(loanData, loanRequest);
  }, [loan, requestData, LoadLoanGraphic]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title={`Зээлийн ${mode === "graphic" ? "график" : "хуваарь"}`}
        onBack={router.back}
        textColor="#1B3C69"
        bgColor="#fff"
        showBottomLine={false}
      />
      {graphList.length === 0 && (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-light text-center text-sm text-[#1B3C69] opacity-60">
            Зээлийн график ирээгүй байна
          </Text>
        </View>
      )}
      {graphList.length > 0 && (
        <CustomScrollView>
          <View className="flex-1 gap-3 px-5">
            {graphList.map((item: CLoanPaymentPlan, index) =>
              mode === "graphic" ? (
                item.FIRST_LOAN === 0 && (
                  <View key={index}>
                    <LoanGraphicListItem
                      item={item}
                      itemIndex={index}
                      prodType={prodType as string}
                    />
                  </View>
                )
              ) : (
                <View key={index}>
                  <LoanGraphicListItem
                    item={item}
                    itemIndex={index}
                    prodType={prodType as string}
                  />
                </View>
              )
            )}
          </View>
        </CustomScrollView>
      )}
    </View>
  );
};

export default Graphic;
