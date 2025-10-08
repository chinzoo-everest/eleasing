import Header from "@components/Header";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LoanDetail = () => {
  const { loan } = useLocalSearchParams();
  const [loanData, setLoanData] = useState<CLoanInfo>();
  const [extendLoanVisible, setExtendLoanVisible] = useState(false);
  const [currentCalc, setCurrentCalc] = useState<CLoanCalc>();
  const [isCanPrepaid, setIsCanPrepaid] = useState(false);
  const insets = useSafeAreaInsets();

  // ===== Load loan data and calculations =====
  const loadData = useCallback(async (loanString: string) => {
    console.log("loadData called with loan:", loanString);
    try {
      const loanTemp = parseResponseData<CLoanInfo>(loanString);
      console.log("Parsed loanTemp:", loanTemp);
      setLoanData(loanTemp);

      const jsonObj = await loadCurrentCalc(loanTemp);
      if (jsonObj) {
        console.log("Loaded currentCalc:", jsonObj.data);
        setCurrentCalc(jsonObj.data);
      }

      if (loanTemp.PERIOD_TYPE === "MONTH") {
        const prepaidResult = await checkPrepaidLoan(loanTemp);
        console.log("Prepaid result:", prepaidResult);
        if (prepaidResult) setIsCanPrepaid(true);
      }

      if (loanTemp.EXT_IS_ACTIVE === "Y") {
        const canExtend = await checkLoanExtendLimit(loanTemp);
        console.log("Can extend:", canExtend);
        if (canExtend) {
          const nextPayDate = new Date(
            loanTemp.NEXT_PAY_DATE?.split("T")[0] + "T12:00:00" || ""
          );
          const beginDate = new Date(nextPayDate);
          beginDate.setDate(beginDate.getDate() - (loanTemp.EXT_PRIV_DAY || 0));

          const today = new Date();
          const futureDate = new Date(nextPayDate);
          futureDate.setDate(
            futureDate.getDate() + (loanTemp.EXT_WAIT_DAY || 0)
          );

          if (beginDate <= today && today <= futureDate) {
            console.log("Extend loan is visible");
            setExtendLoanVisible(true);
          }
        }
      }
    } catch (error) {
      console.error("loadData failed:", error);
      handleErrorExpo(error, "loadLoanDetailData");
    }
  }, []);

  useEffect(() => {
    console.log("LoanDetail Mounted. loan param =", loan);
    loadData(loan as string);
  }, [loan, loadData]);

  // ===== Derived calculations (frontend logic replication) =====
  const derived = useMemo(() => {
    console.log("useMemo triggered with loanData:", loanData);
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

    console.log("==== Derived Loan Data ====");
    console.log("REMAINING_FEE:", REMAINING_FEE);
    console.log("REMAINING_PRE:", REMAINING_PRE);
    console.log("IS_FEE_PAY:", IS_FEE_PAY);
    console.log("IS_PRE_PAY:", IS_PRE_PAY);
    console.log("REMAINING_TOTAL_FEE:", REMAINING_TOTAL_FEE);
    console.log("TOTAL_PERIOD_BALANCE:", TOTAL_PERIOD_BALANCE);

    return {
      REMAINING_FEE,
      REMAINING_PRE,
      IS_FEE_PAY,
      IS_PRE_PAY,
      REMAINING_TOTAL_FEE,
      TOTAL_PERIOD_BALANCE,
    };
  }, [loanData]);

  // ===== Navigation handlers =====
  const handlePayment = async (type: "normal" | "prePay" | "close") => {
    console.log("Navigating to payment:", type);
    await routePush(SCREENS.PAYMENT, {
      loan: JSON.stringify(loanData),
      type,
    });
  };

  const handleLoanGraphic = async () => {
    console.log("Opening loan graphic");
    await routePush(SCREENS.LOAN_GRAPHIC, {
      loan: JSON.stringify(loanData),
    });
  };

  const handleDeposit = async () => {
    console.log("Opening deposit details");
    await routePush(SCREENS.DEPOSIT, { loan: JSON.stringify(loanData) });
  };

  const handleTransfer = async () => {
    console.log("Opening transaction history");
    await routePush(SCREENS.TRANSACTION, { loan: JSON.stringify(loanData) });
  };

  const handlePayFeeOrPre = async () => {
    try {
      const remainingFee = derived?.REMAINING_FEE || 0;
      const remainingPre = derived?.REMAINING_PRE || 0;
      console.log("handlePayFeeOrPre triggered");
      console.log("Remaining Fee:", remainingFee);
      console.log("Remaining Pre:", remainingPre);

      if (remainingFee > 0) {
        console.log("Routing to FEE payment");
        await routePush(SCREENS.PAYMENT, {
          loan: JSON.stringify(loanData),
          type: "fee",
          amount: remainingFee,
        });
        return;
      }

      if (remainingPre > 0) {
        console.log("Routing to PREPAY payment");
        await routePush(SCREENS.PAYMENT, {
          loan: JSON.stringify(loanData),
          type: "prePay",
          amount: remainingPre,
        });
        return;
      }

      console.log("No remaining fee or prepay to handle");
      showToast("", "Төлөх шимтгэл эсвэл урьдчилгаа байхгүй байна.", "info");
    } catch (error) {
      console.error("handlePayFeeOrPre failed:", error);
      handleErrorExpo(error, "handlePayFeeOrPre");
    }
  };

  // ===== UI =====
  return (
    <View className="flex-1 bg-[#fff]" style={{ paddingTop: insets.top }}>
      <Header
        title="Дижитал зээл"
        onBack={router.back}
        textColor="white"
        bgColor="#0A1A64"
        showBottomLine={false}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="m-6 rounded-2xl overflow-hidden bg-white shadow-lg">
          <View className="bg-[#0A1A64] px-6 py-5">
            <Text className="text-white text-xl font-bold">
              {loanData?.PROD_NAME || "Зээл"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center px-6 py-4 bg-[#F8FBFF]">
            {new Date() <= new Date(loanData?.PLAN_FINISH || "") ? (
              <View className="flex-row items-center space-x-2">
                <SvgIcon name="normal" height={33} width={33} />
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
            <View className="items-end">
              <Text className="text-gray-500 text-sm">
                Зээлийн гэрээний дугаар
              </Text>
              <Text className="font-bold text-lg text-[#0A1A64]">
                {loanData?.CONTRACT_NO}
              </Text>
            </View>
          </View>

          <View className="px-6 py-6 bg-[#F8FBFF] rounded-b-3xl">
            <Text className="text-[#1B3C69] opacity-60 text-sm">
              Үлдэгдэл зээл
            </Text>
            <Text className="text-[#1B3C69] text-3xl font-bold mt-1">
              ₮{(loanData?.BALANCE || 0).toLocaleString("mn-MN")}
            </Text>

            <View className="flex-row justify-between mt-6">
              <View>
                <Text className="text-[#1B3C69] opacity-60 text-sm">
                  Олгосон зээл
                </Text>
                <Text className="text-lg font-bold text-[#1B3C69]">
                  ₮{(loanData?.AMT || 0).toLocaleString("mn-MN")}
                </Text>
                <View className="mt-5">
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    Төлөлт хийх огноо
                  </Text>
                  <Text className="text-lg font-bold text-[#1B3C69]">
                    {formatDate(loanData?.NEXT_PAY_DATE || "", "yyyy-MM-dd")}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-[#1B3C69] opacity-60 text-sm">
                  Зээлийн хүү
                </Text>
                <Text className="text-lg font-bold text-[#1B3C69]">
                  {loanData?.INTEREST}%
                </Text>
                <View className="mt-5">
                  <Text className="text-[#1B3C69] opacity-60 text-sm">
                    Төлөх шимтгэл
                  </Text>
                  <Text className="text-lg font-bold text-[#1B3C69]">
                    ₮{derived?.REMAINING_FEE?.toLocaleString("mn-MN")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mt-5 pb-11">
            <TouchableOpacity
              onPress={handleLoanGraphic}
              className="items-center bg-white py-7 px-5 rounded-xl shadow-sm"
            >
              <SvgIcon name="chard" height={26} width={26} color="#0A1A64" />
              <Text className="text-xs mt-5 text-[#0A1A64] font-medium">
                Зээлийн график
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeposit}
              className="items-center bg-white py-7 px-5 rounded-xl shadow-sm"
            >
              <SvgIcon name="deposit" color="#0A1A64" height={26} width={26} />
              <Text className="text-xs mt-5 text-[#0A1A64] font-medium">
                Барьцаа хөрөнгө
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTransfer}
              className="items-center bg-white py-7 px-5 rounded-xl shadow-sm"
            >
              <SvgIcon name="receipt" color="#0A1A64" height={26} width={26} />
              <Text className="text-xs mt-5 text-[#0A1A64] font-medium">
                Гүйлгээний түүх
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conditional bottom buttons */}
        <View className="px-6 mb-10">
          {derived?.IS_FEE_PAY || derived?.IS_PRE_PAY ? (
            <TouchableOpacity
              onPress={handlePayFeeOrPre}
              className="w-full py-4 rounded-2xl bg-[#F9A825] items-center"
            >
              <Text className="text-white font-bold text-base">
                {derived?.IS_FEE_PAY ? "Шимтгэл төлөх" : "Урьдчилгаа төлөх"}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => handlePayment("normal")}
                className="w-full py-4 mb-3 rounded-2xl bg-[#00C853] items-center"
              >
                <Text className="text-white font-bold text-base">
                  Зээл төлөх
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePayment("close")}
                className="w-full py-4 rounded-2xl bg-[#1E40AF] items-center"
              >
                <Text className="text-white font-bold text-base">
                  Зээл хаах
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default LoanDetail;
