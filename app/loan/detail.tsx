import HeaderDetail from "@components/HeaderDetail";
import SvgIcon from "@components/SvgIcon";
import { SCREENS } from "@customConfig/route";
import {
  checkLoanExtendLimit,
  checkPrepaidLoan,
  loadCurrentCalc,
} from "@services/loan.service";
import { CLoanCalc } from "@type/interfaces/Customer";
import { CLoanInfo } from "@type/interfaces/Loan";
import formatDate from "@utils/formatDate";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { parseResponseData } from "@utils/parseResponseData";
import { routePush } from "@utils/routePush";
import { showToast } from "@utils/showToast";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LoanDetail: React.FC = () => {
  const { loan } = useLocalSearchParams();
  const [loanData, setLoanData] = useState<CLoanInfo>();
  const [extendLoanVisible, setExtendLoanVisible] = useState<boolean>(false);
  const [currentCalc, setCurrentCalc] = useState<CLoanCalc>();
  const [isCanPrepaid, setIsCanPrepaid] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const loadData = useCallback(async (loanString: string): Promise<void> => {
    try {
      const loanTemp = parseResponseData<CLoanInfo>(loanString);
      setLoanData(loanTemp);

      const jsonObj = await loadCurrentCalc(loanTemp);
      if (jsonObj) setCurrentCalc(jsonObj.data);

      if (loanTemp.PERIOD_TYPE === "MONTH") {
        const prepaidResult = await checkPrepaidLoan(loanTemp);
        if (prepaidResult) setIsCanPrepaid(true);
      }

      if (loanTemp.EXT_IS_ACTIVE === "Y") {
        const canExtend = await checkLoanExtendLimit(loanTemp);
        if (canExtend) {
          const nextPayDate = new Date(
            (loanTemp.NEXT_PAY_DATE?.split("T")[0] || "") + "T12:00:00"
          );
          const beginDate = new Date(nextPayDate);
          beginDate.setDate(beginDate.getDate() - (loanTemp.EXT_PRIV_DAY || 0));

          const today = new Date();
          const futureDate = new Date(nextPayDate);
          futureDate.setDate(
            futureDate.getDate() + (loanTemp.EXT_WAIT_DAY || 0)
          );

          if (beginDate <= today && today <= futureDate) {
            setExtendLoanVisible(true);
          }
        }
      }
    } catch (error) {
      handleErrorExpo(error, "loadLoanDetailData");
    }
  }, []);

  useEffect(() => {
    if (loan) loadData(loan as string);
  }, [loan, loadData]);

  const derived = useMemo(() => {
    if (!loanData) return null;
    const SERVICE_AMT = loanData.SERVICE_AMT || 0;
    const LOAN_FEE = loanData.LOAN_FEE || 0;
    const PAID_FEE = loanData.PAID_FEE || 0;
    const PRE_AMT = loanData.PRE_AMT || 0;
    const PAID_PRE_AMT = loanData.PAID_PRE_AMT || 0;
    const LOAN_AMT = loanData.LOAN_AMT || 0;
    const INT_AMT = loanData.INT_AMT || 0;
    const LOSS_AMT = loanData.LOSS_AMT || 0;

    const REMAINING_FEE = SERVICE_AMT + LOAN_FEE - PAID_FEE;
    const REMAINING_PRE = PRE_AMT - PAID_PRE_AMT;
    const IS_FEE_PAY = REMAINING_FEE > 0;
    const IS_PRE_PAY = REMAINING_PRE > 0;
    const REMAINING_TOTAL_FEE = REMAINING_FEE + REMAINING_PRE;
    const TOTAL_PERIOD_BALANCE = LOAN_AMT + INT_AMT + LOSS_AMT;

    return {
      REMAINING_FEE,
      REMAINING_PRE,
      IS_FEE_PAY,
      IS_PRE_PAY,
      REMAINING_TOTAL_FEE,
      TOTAL_PERIOD_BALANCE,
    };
  }, [loanData]);

  const remainingPre = Math.max(0, derived?.REMAINING_PRE ?? 0);
  const remainingFee = Math.max(0, derived?.REMAINING_FEE ?? 0);
  const accountPayEnabled = remainingPre <= 0 && remainingFee <= 0;
  const hasDues = useMemo<boolean>(
    () => Boolean(derived?.IS_FEE_PAY || derived?.IS_PRE_PAY),
    [derived]
  );

  const payTotal =
    (currentCalc?.loanAmt ?? 0) +
    (currentCalc?.intAmt ?? 0) +
    (currentCalc?.lossAmt ?? 0);

  useEffect(() => {}, [
    derived,
    remainingPre,
    remainingFee,
    accountPayEnabled,
    payTotal,
    currentCalc,
  ]);

  const handlePayment = async (
    type: "normal" | "prePay" | "close"
  ): Promise<void> => {
    if (!accountPayEnabled && type !== "prePay") {
      await handlePayFeeOrPre();
      return;
    }
    await routePush(SCREENS.PAYMENT, {
      loan: JSON.stringify(loanData),
      type,
      lockAccountTab: remainingPre > 0 || remainingFee > 0,
    });
  };

  const handleLoanGraphic = async (): Promise<void> => {
    await routePush(SCREENS.LOAN_GRAPHIC, { loan: JSON.stringify(loanData) });
  };

  const handleDeposit = async (): Promise<void> => {
    await routePush(SCREENS.DEPOSIT, { loan: JSON.stringify(loanData) });
  };

  const handleTransfer = async (): Promise<void> => {
    await routePush(SCREENS.TRANSACTION, { loan: JSON.stringify(loanData) });
  };

  const handlePayFeeOrPre = async (): Promise<void> => {
    try {
      const rFee = derived?.REMAINING_FEE || 0;
      const rPre = derived?.REMAINING_PRE || 0;

      if (rFee > 0) {
        await routePush(SCREENS.PAYMENT, {
          loan: JSON.stringify(loanData),
          type: "fee",
          amount: rFee,
          lockAccountTab: true,
        });
        return;
      }

      if (rPre > 0) {
        await routePush(SCREENS.PAYMENT, {
          loan: JSON.stringify(loanData),
          type: "prePay",
          amount: rPre,
          lockAccountTab: true,
        });
        return;
      }

      showToast("", "Төлөх шимтгэл эсвэл урьдчилгаа байхгүй байна.", "info");
    } catch (error) {
      handleErrorExpo(error, "handlePayFeeOrPre");
    }
  };

  const handlePayFeeOnly = async (): Promise<void> => {
    try {
      const rFee = derived?.REMAINING_FEE || 0;
      if (rFee > 0) {
        await routePush(SCREENS.PAYMENT, {
          loan: JSON.stringify(loanData),
          type: "fee",
          amount: rFee,
          lockAccountTab: true,
          from: "loan_detail_fee",
        } as unknown as Record<string, unknown>);
      } else {
        showToast("", "Шимтгэл төлөх шаардлагагүй.", "info");
      }
    } catch (error) {
      handleErrorExpo(error, "handlePayFeeOnly");
    }
  };

  const handlePayPreOnly = async (): Promise<void> => {
    try {
      const rPre = derived?.REMAINING_PRE || 0;
      if (rPre > 0) {
        await routePush(SCREENS.PAYMENT, {
          loan: JSON.stringify(loanData),
          type: "prePay",
          amount: rPre,
          lockAccountTab: true,
          from: "loan_detail_prepay",
        } as unknown as Record<string, unknown>);
      } else {
        showToast("", "Урьдчилгаа төлөх шаардлагагүй.", "info");
      }
    } catch (error) {
      handleErrorExpo(error, "handlePayPreOnly");
    }
  };

  return (
    <View className="flex-1 bg-[#fff]">
      <View style={{ paddingTop: insets.top }} className="bg-[#0A1A64]" />
      <HeaderDetail
        title="Дижитал зээл"
        onBack={router.back}
        textColor="white"
        bgColor="#0A1A64"
        showBottomLine={false}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mx-4 my-5 rounded-2xl overflow-hidden bg-white shadow-lg">
          <View className="bg-[#0A1A64] px-6 py-5">
            <Text className="text-white text-xl font-bold">
              {loanData?.PROD_NAME || "Зээл"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center px-6 py-4 bg-[#F8FBFF]">
            <View className="items-end">
              <Text className="text-gray-500 text-sm">
                Зээлийн гэрээний дугаар
              </Text>
              <Text className="font-bold text-lg text-[#0A1A64]">
                {loanData?.CONTRACT_NO}
              </Text>
            </View>
            {new Date() <= new Date(loanData?.PLAN_FINISH || "") ? (
              <View className="flex-row items-center">
                <SvgIcon name="pass" height={33} width={33} />
                <Text className="text-[#1B3C69] text-xs font-medium ml-2">
                  хэвийн
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center ">
                <SvgIcon
                  name="exceeded"
                  color="#1B3C69"
                  height={33}
                  width={33}
                />
                <Text className="text-[#1B3C69] text-xs font-medium ml-2">
                  хэвийн бус
                </Text>
              </View>
            )}
          </View>

          <View className="px-6 py-6 bg-[#F8FBFF] rounded-b-3xl">
            <View className="flex-row justify-between">
              <View className="flex-col justify-between">
                <View className="mb-5">
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    Үлдэгдэл зээл
                  </Text>
                  <Text className="text-[#1B3C69] text-2xl font-bold mt-1">
                    ₮{(loanData?.BALANCE || 0).toLocaleString("mn-MN")}
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    Зээлийн хүү
                  </Text>
                  <Text className="text-lg font-bold text-[#1B3C69] mt-1">
                    {loanData?.INTEREST}%
                  </Text>
                </View>

                <View>
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    Дуусах хугацаа
                  </Text>
                  <Text className="text-lg font-bold text-[#1B3C69] mt-1">
                    {formatDate(loanData?.PLAN_FINISH || "", "yyyy-MM-dd")}
                  </Text>
                </View>
              </View>

              <View className="flex-col justify-between ">
                <View className="mb-5">
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    Олгосон зээл
                  </Text>
                  <Text className="text-2xl font-bold text-[#1B3C69] mt-1">
                    ₮{(loanData?.AMT || 0).toLocaleString("mn-MN")}
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    {remainingPre === 0 ? "Төлөх дүн" : "Урьдчилгаа"}
                  </Text>
                  <Text className="text-lg font-bold text-[#1B3C69] mt-1">
                    {remainingPre === 0
                      ? `${payTotal.toLocaleString("mn-MN")} ₮`
                      : `₮${remainingPre.toLocaleString("mn-MN")}`}
                  </Text>
                </View>

                <View>
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    {remainingFee === 0 ? "Төлөлт хийх огноо" : "Төлөх шимтгэл"}
                  </Text>
                  <Text className="text-lg font-bold text-[#1B3C69] mt-1">
                    {remainingFee === 0
                      ? formatDate(loanData?.NEXT_PAY_DATE || "", "yyyy-MM-dd")
                      : `₮${remainingFee.toLocaleString("mn-MN")}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Hide quick action cards when there are dues */}
          {!hasDues && (
            <View className="flex-row justify-between mt-5 pb-11">
              <TouchableOpacity
                onPress={handleLoanGraphic}
                className="items-center bg-white py-7 w-[30%] rounded-xl shadow-sm border border-gray-200"
              >
                <SvgIcon name="chard" height={26} width={26} color="#0A1A64" />
                <Text className="text-xs mt-5 text-[#0A1A64] font-medium">
                  Зээлийн график
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeposit}
                className="items-center bg-white py-7 w-[30%] rounded-xl shadow-sm border border-gray-200"
              >
                <SvgIcon
                  name="deposit"
                  color="#0A1A64"
                  height={26}
                  width={26}
                />
                <Text className="text-xs mt-5 text-[#0A1A64] font-medium">
                  Барьцаа хөрөнгө
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTransfer}
                className="items-center bg-white py-7 w-[30%] rounded-xl shadow-sm border border-gray-200"
              >
                <SvgIcon
                  name="receipt"
                  color="#0A1A64"
                  height={26}
                  width={26}
                />
                <Text className="text-xs mt-5 text-[#0A1A64] font-medium">
                  Гүйлгээний түүх
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="px-6 mb-10">
          {hasDues ? (
            <>
              {derived?.IS_FEE_PAY && (
                <TouchableOpacity
                  onPress={handlePayFeeOnly}
                  className="w-full py-4 rounded-2xl bg-[#F9A825] items-center mb-3 mt-8"
                >
                  <Text className="text-white font-bold text-base">
                    Шимтгэл төлөх
                  </Text>
                </TouchableOpacity>
              )}

              {derived?.IS_PRE_PAY && (
                <TouchableOpacity
                  onPress={handlePayPreOnly}
                  className="w-full py-4 rounded-2xl bg-[#65E33F] items-center"
                >
                  <Text className="text-white font-bold text-base">
                    Урьдчилгаа төлөх
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => handlePayment("close")}
                className="w-full py-4 rounded-2xl bg-[#1E40AF] items-center mb-3"
              >
                <Text className="text-white font-bold text-base">
                  Зээл хаах
                </Text>
              </TouchableOpacity>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handlePayment("normal")}
                  className="flex-1 py-4 rounded-2xl bg-[#65E33F] items-center"
                >
                  <Text className="text-white font-bold text-base">
                    Зээл төлөх
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!isCanPrepaid}
                  onPress={() => handlePayment("prePay")}
                  className={`flex-1 py-4 rounded-2xl items-center ${
                    isCanPrepaid ? "bg-[#65E33F]" : "bg-gray-300"
                  } ${isCanPrepaid ? "" : "opacity-60"}`}
                >
                  <Text className="text-white font-bold text-base">
                    Урьдчилж төлөх
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default LoanDetail;
