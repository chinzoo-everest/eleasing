import Button from "@components/Button";
import { CLoanInfo } from "@type/interfaces/Loan";
import CopyIcon from "@assets/images/copy.svg";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useGlobalContext } from "@hooks/useGlobalContext";
import { calcPaymentData, loadPaymentRequest } from "@services/loan.service";
import { formatToMongolianLocale } from "@utils/formatToMongolianLocale";
import { CCustBank, CLoanCalc } from "@type/interfaces/Customer";
import { router, useLocalSearchParams } from "expo-router";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { routePush } from "@utils/routePush";
import Header from "@components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PaymentTab from "@components/PaymentTab";
import { SCREENS } from "@customConfig/route";
import Confirmation from "@modals/Confirmation";
import { parseResponseData } from "@utils/parseResponseData";
import {
  getProductColorByType,
  getProductTextColorByType,
} from "utils/getProductColor";
import CustomScrollView from "@components/CustomScrollView";
import { MotiView } from "moti";
import SvgIcon from "@components/SvgIcon";
import HeaderDetail from "@components/HeaderDetail";

const Payment = () => {
  const insets = useSafeAreaInsets();
  const [additionalPayment, setAdditionalPayment] = useState(""); // from principal
  const [lossAmtPayment, setLossAmtPayment] = useState("0");
  const [intAmtPayment, setIntAmtPayment] = useState("0");

  const { loan, type, amount } = useLocalSearchParams();
  const [loanData, setLoanData] = useState<CLoanInfo>();
  const { state } = useGlobalContext();
  const { qpayFee } = state.configData;
  const currentUser = state.currentUser;
  const [paymentCalc, setPaymentCalc] = useState<CLoanCalc>();
  const [closeCalc, setCloseCalc] = useState<CLoanCalc>();
  const [bankList, setBankList] = useState<CCustBank[]>();
  const [selectedBank, setSelectedBank] = useState<CCustBank>();
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [tranPaymentAmount, setTranPaymentAmount] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [tranDescription, setTranDescription] = useState<string>("");
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingFee, setRemainingFee] = useState<number>(0);
  const [remainingPre, setRemainingPre] = useState<number>(0);
  const flow = (type as string) || "normal";

  const loadData = useCallback(async () => {
    try {
      const isPrepaid = type === "prePay";
      const isClose = type === "close";
      const isFee = type === "fee";

      if (!loan) return;
      const parsedLoan = parseResponseData<CLoanInfo>(loan as string);
      setLoanData(parsedLoan);

      // Calculate remaining values directly from loanData
      const SERVICE_AMT = parsedLoan.SERVICE_AMT || 0;
      const LOAN_FEE = parsedLoan.LOAN_FEE || 0;
      const PAID_FEE = parsedLoan.PAID_FEE || 0;
      const PRE_AMT = parsedLoan.PRE_AMT || 0;
      const PAID_PRE_AMT = parsedLoan.PAID_PRE_AMT || 0;

      const REMAINING_FEE = SERVICE_AMT + LOAN_FEE - PAID_FEE;
      const REMAINING_PRE = PRE_AMT - PAID_PRE_AMT;
      const TOTAL_REMAINING = REMAINING_FEE + REMAINING_PRE;

      setRemainingFee(REMAINING_FEE);
      setRemainingPre(REMAINING_PRE);

      console.log("REMAINING_FEE:", REMAINING_FEE);
      console.log("REMAINING_PRE:", REMAINING_PRE);
      console.log("TOTAL_REMAINING:", TOTAL_REMAINING);

      // Use calculated total as base amount
      const calcResult = await calcPaymentData(parsedLoan, isPrepaid, isClose);
      if (calcResult) {
        setPaymentCalc(calcResult.currentPaymentCalc);
        setCloseCalc(calcResult.closePaymentCalc);

        const bothZero = REMAINING_FEE <= 0 && REMAINING_PRE <= 0;

        if (bothZero) {
          const cur = calcResult.currentPaymentCalc;
          const tLoan = Math.max(0, cur.loanAmt || 0);
          const tInt = Math.max(0, cur.intAmt || 0);
          const tLoss = Math.max(0, cur.lossAmt || 0);
          const total = Math.ceil(tLoan + tInt + tLoss);

          // show example behavior
          setAdditionalPayment(formatToMongolianLocale(tLoan));
          setIntAmtPayment(formatToMongolianLocale(tInt));
          setLossAmtPayment(formatToMongolianLocale(tLoss));

          const formatted = formatToMongolianLocale(total);
          console.log("formatted", formatted);
          setPaymentAmount(formatted);
          setTranPaymentAmount(formatted);
        } else {
          // fallback to remaining fee+pre like before
          const formatted = formatToMongolianLocale(Math.ceil(TOTAL_REMAINING));
          setPaymentAmount(formatted);
          setTranPaymentAmount(formatted);

          // clear breakdown rows
          setAdditionalPayment("");
          setIntAmtPayment("0");
          setLossAmtPayment("0");
        }
      }

      if (parsedLoan && typeof parsedLoan.BANKS === "string") {
        try {
          parsedLoan.BANKS = JSON.parse(parsedLoan.BANKS);
        } catch {}
      }

      if (parsedLoan && Array.isArray(parsedLoan.BANKS)) {
        const banks = parsedLoan.BANKS;
        if (banks.length > 0) {
          setBankList(banks);
          setSelectedBank(banks[0]);
        }
        console.log;
      }

      const regNo = currentUser?.REG_NO || "";
      const phone = currentUser?.PHONE1 || "";
      const contractNo = parsedLoan?.CONTRACT_NO || "";
      setTranDescription(`${regNo}, ${phone}, ${contractNo}`);
    } catch (error) {
      handleErrorExpo(error, "loadPaymentData");
    }
  }, [loan, type, currentUser]);
  useEffect(() => {
    // Only balance + interest when both upfront/fee are 0
    const bothZero = remainingPre <= 0 && remainingFee <= 0;

    const balance = Math.max(0, loanData?.BALANCE ?? 0);
    const interest =
      type === "close"
        ? Math.max(0, closeCalc?.intAmt ?? 0)
        : Math.max(0, paymentCalc?.intAmt ?? 0);

    const total = bothZero
      ? balance + interest
      : Math.max(0, remainingPre) + Math.max(0, remainingFee);

    const formatted = formatToMongolianLocale(Math.ceil(total));
    setPaymentAmount(formatted);
    setTranPaymentAmount(formatted);
  }, [
    type,
    loanData?.BALANCE,
    paymentCalc?.intAmt,
    closeCalc?.intAmt,
    remainingPre,
    remainingFee,
  ]);

  // helpers for conditional rendering + formatted parts
  const showBreakdown = remainingPre <= 0 && remainingFee <= 0;

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayment = () => {
    if (!paymentCalc || !closeCalc) return;

    const convertedAdditionalPayment = parseFloat(
      paymentAmount.replace(/,/g, "")
    );
    const totalPayment =
      (paymentCalc.intAmt || 0) +
      (paymentCalc.lossAmt || 0) +
      (paymentCalc.loanAmt || 0);
    const closeAmount =
      (closeCalc.intAmt || 0) +
      (closeCalc.lossAmt || 0) +
      (closeCalc.loanAmt || 0);

    if (convertedAdditionalPayment <= 0) {
      setErrorMessage("Төлбөр төлөх мөнгөн дүн буруу байна");
      return;
    }

    if (!["close", "prePay"].includes(type as string)) {
      const isBelowMinimum =
        convertedAdditionalPayment <
        (Math.round(loanData?.PAY_MIN || 0) > 0 && type !== "close"
          ? Math.round(loanData?.PAY_MIN || 0)
          : Math.round(totalPayment));
      const isAboveCloseAmount =
        Math.round(convertedAdditionalPayment) > Math.round(closeAmount);

      if (isBelowMinimum || isAboveCloseAmount) {
        const message = isBelowMinimum
          ? `Нийт төлөх дүн ${
              Math.round(loanData?.PAY_MIN || 0) > 0
                ? formatToMongolianLocale(Math.round(loanData?.PAY_MIN || 0))
                : formatToMongolianLocale(Math.round(totalPayment))
            }-өөс бага байна.`
          : `Нийт төлөх дүн ${formatToMongolianLocale(
              Math.round(closeAmount)
            )}-өөс их байна.`;
        setErrorMessage(message);
        return;
      }
    }

    if (qpayFee > 0) {
      setConfirmationMessage(
        "QPAY-ээр төлөх үед таны төлбөр дээр гүйлгээний шимтгэл " +
          qpayFee +
          " нэмэгдэх болохыг анхаарна уу."
      );
      setIsConfirmationVisible(true);
      return;
    }
    continuePayment();
  };
  const baselineTranAmount = useMemo(() => {
    // when fee & pre are zero, behave like the example: loanAmt + intAmt + lossAmt
    const bothZero = remainingPre <= 0 && remainingFee <= 0;
    const cur = paymentCalc;
    const close = closeCalc;

    const loan = Math.max(0, cur?.loanAmt ?? 0);
    const int = Math.max(
      0,
      (flow === "close" ? close?.intAmt : cur?.intAmt) ?? 0
    );
    const loss = Math.max(
      0,
      (flow === "close" ? close?.lossAmt : cur?.lossAmt) ?? 0
    );

    const feePre = Math.max(0, remainingPre) + Math.max(0, remainingFee);
    const total = bothZero ? loan + int + loss : feePre;

    return Math.ceil(total);
  }, [
    type,
    paymentCalc?.loanAmt,
    paymentCalc?.intAmt,
    paymentCalc?.lossAmt,
    closeCalc?.intAmt,
    closeCalc?.lossAmt,
    remainingPre,
    remainingFee,
  ]);

  const continuePayment = async () => {
    try {
      setIsConfirmationVisible(false);
      if (!paymentCalc) return;

      const convertedAmount = parseFloat(paymentAmount.replace(/,/g, ""));
      const result = await loadPaymentRequest(
        loanData as CLoanInfo,
        convertedAmount.toString(),
        qpayFee.toString(),
        paymentCalc as CLoanCalc,
        type === "prePay",
        type === "close",
        currentUser
      );
      if (result)
        await routePush(SCREENS.QPAY, { qpayData: JSON.stringify(result) });
    } catch (error) {
      handleErrorExpo(error, "continuePayment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    if (text)
      Clipboard.setStringAsync(text).then(() =>
        Alert.alert("Амжилттай хууллаа!")
      );
  };

  const handlePaymentInputChange = (text: string) => {
    const numericValue = parseFloat(text.replace(/,/g, ""));
    if (isNaN(numericValue)) {
      setPaymentAmount("");
      setErrorMessage("");
      return;
    }
    const formattedValue = formatToMongolianLocale(numericValue);
    setPaymentAmount(formattedValue);

    if (!paymentCalc || !closeCalc) {
      setErrorMessage("");
      return;
    }

    const totalPayment =
      (paymentCalc.intAmt || 0) +
      (paymentCalc.lossAmt || 0) +
      (paymentCalc.loanAmt || 0);

    const closeAmount =
      (closeCalc.intAmt || 0) +
      (closeCalc.lossAmt || 0) +
      (closeCalc.loanAmt || 0);

    const minPayment =
      loanData?.PAY_MIN && loanData?.PAY_MIN > 0
        ? loanData.PAY_MIN
        : totalPayment;

    if (numericValue < (minPayment || 0)) {
      setErrorMessage(
        `Нийт төлөх дүн ${formatToMongolianLocale(minPayment || 0)}-өөс бага байна.`
      );
      setAdditionalPayment("");
      return;
    }
    if (numericValue > closeAmount) {
      setErrorMessage(
        `Нийт төлөх дүн ${formatToMongolianLocale(closeAmount)}-өөс их байна.`
      );
      setAdditionalPayment("");
      return;
    }

    setErrorMessage("");
    // Waterfall: loss -> interest -> principal
    const loss = Math.max(0, paymentCalc.lossAmt || 0);
    const int = Math.max(0, paymentCalc.intAmt || 0);

    const afterLoss = Math.max(0, numericValue - loss);
    const afterInt = Math.max(0, afterLoss - int);

    setLossAmtPayment(formatToMongolianLocale(Math.min(numericValue, loss)));
    setIntAmtPayment(
      formatToMongolianLocale(Math.min(Math.max(numericValue - loss, 0), int))
    );
    setAdditionalPayment(formatToMongolianLocale(afterInt));
  };

  const handleFocus = () => setPaymentAmount(paymentAmount.replace(/,/g, ""));
  const handleBlur = () => {
    const n = parseFloat(paymentAmount.replace(/,/g, ""));
    if (!isNaN(n)) {
      const f = formatToMongolianLocale(n);
      setPaymentAmount(formatToMongolianLocale(n));
    }
  };

  useEffect(() => {
    setTranPaymentAmount(formatToMongolianLocale(baselineTranAmount));

    if (!paymentAmount) {
      setPaymentAmount(formatToMongolianLocale(baselineTranAmount));
    }
  }, [baselineTranAmount]);

  const detailSection = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 300 }}
      className="px-4"
    >
      <View className="py-4">
        <View className="mt-5 flex-row justify-between">
          <View className="flex-col rounded-md">
            <Text className="font-Inter text-sm font-bold text-[#001165]">
              ГЭРЭЭНИЙ ДУГААР
            </Text>
            <Text className="font-Inter text-base font-medium text-[#001165]">
              {loanData?.LOAN_ID}
            </Text>
          </View>
          <View
            className="self-center rounded-xl px-3 py-1"
            style={{
              backgroundColor: getProductColorByType(
                loanData?.APP_PROD_TYPE as number
              ),
            }}
          >
            <Text
              className="text-sm font-medium text-[#001165]"
              style={{
                color: getProductTextColorByType(
                  loanData?.APP_PROD_TYPE as number
                ),
              }}
            >
              {loanData?.CLASS_NAME}
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-1 mt-4 h-[1px] w-full bg-[#34363D]" />

      {/* When both = 0 → show breakdown block */}
      {showBreakdown ? (
        <View className="pb-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-[#9CA3AF]">Үлдэгдэл</Text>
            <Text className="text-lg font-medium text-[#001165]">
              {`${formatToMongolianLocale(Math.round(loanData?.BALANCE || 0))}₮`}
            </Text>
          </View>
          <View className="my-1 h-[1px] w-full bg-[#34363D]" />

          {type === "normal" && (
            <>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-[#9CA3AF]">Зээлээс төлөх</Text>
                <Text className="text-lg font-medium text-[#001165]">
                  {`${additionalPayment || 0}₮`}
                </Text>
              </View>
              <View className="my-1 h-[1px] w-full bg-[#34363D]" />
            </>
          )}

          {paymentCalc && paymentCalc.intAmt > 0 && (
            <>
              <View className="flex-row items-center justify-between">
                <View className="flex-row">
                  <Text className="text-base text-[#9CA3AF]">
                    Хүүгийн төлбөр
                  </Text>
                  {type === "normal" && (
                    <Text className="ml-2 text-base font-medium text-[#001165] opacity-50">
                      | {paymentCalc?.intDay} хоног |
                    </Text>
                  )}
                </View>
                <Text className="text-lg font-medium text-[#001165]">
                  {`${intAmtPayment}₮`}
                </Text>
              </View>
              <View className="my-1 h-[1px] w-full bg-[#34363D]" />
            </>
          )}

          {paymentCalc && paymentCalc.lossAmt > 0 && (
            <>
              <View className="flex-row items-center justify-between">
                <View className="flex-row">
                  <Text className="text-base text-[#9CA3AF]">
                    Нэмэгдүүлсэн хүү
                  </Text>
                  {type === "normal" && (
                    <Text className="ml-2 text-base font-medium text-[#001165] opacity-50">
                      | {paymentCalc?.lossDay} хоног |
                    </Text>
                  )}
                </View>
                <Text className="text-lg font-medium text-[#001165]">
                  {`${lossAmtPayment}₮`}
                </Text>
              </View>
              <View className="my-1 h-[1px] w-full bg-[#34363D]" />
            </>
          )}
        </View>
      ) : (
        // Otherwise show original rows, hiding each when its value is 0
        <View className="pb-8 flex-col">
          {remainingPre > 0 && (
            <>
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-base text-[#001165] opacity-80">
                  Урьдчилгаа
                </Text>
                <Text className="text-lg font-medium text-[#001165]">
                  {formatToMongolianLocale(Math.ceil(remainingPre))}
                </Text>
              </View>
              <View className="my-1 h-[1px] w-full bg-[#34363D]" />
            </>
          )}

          {remainingFee > 0 && (
            <>
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-base text-[#001165] opacity-80">
                  Шимтгэл
                </Text>
                <Text className="text-lg font-medium text-[#001165]">
                  {formatToMongolianLocale(Math.ceil(remainingFee))}
                </Text>
              </View>
              <View className="my-1 h-[1px] w-full bg-[#34363D]" />
            </>
          )}

          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-base text-[#001165] opacity-80">
              Нийт төлөх
            </Text>
            <Text className="text-lg font-medium text-[#001165]">
              {paymentAmount}
            </Text>
          </View>
        </View>
      )}
    </MotiView>
  );
  const isClose = type === "close";

  const paymentSection = (mode: "payment" | "transaction") => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 400 }}
      className="rounded-xl border-b-4 border-b-[#E2E2E2] px-5 py-2"
    >
      <View className="flex-col justify-between">
        <Text className="mb-1 mt-2 text-sm font-bold text-[#001165] opacity-80">
          ТӨЛӨХ ДҮН
        </Text>

        {mode === "payment" && (
          <>
            <View className="flex-row items-center rounded-xl px-1 pb-2">
              <TextInput
                readOnly={
                  !(
                    (loanData?.PAY_MIN || 0) > 0 &&
                    !["close", "prePay"].includes(flow)
                  )
                }
                value={paymentAmount}
                onChangeText={handlePaymentInputChange}
                onFocus={handleFocus}
                keyboardType="number-pad"
                className="flex-1 text-3xl font-bold text-black"
              />
              <TouchableOpacity
                disabled={
                  !(
                    (loanData?.PAY_MIN || 0) > 0 &&
                    !["close", "prePay"].includes(type as string)
                  )
                }
                onPress={() => {}}
              >
                <SvgIcon name="payment_edit" width={20} height={20} />
              </TouchableOpacity>
            </View>

            {!!errorMessage && (
              <Text className="mt-2 self-center text-xs text-red-500">
                {errorMessage}
              </Text>
            )}
          </>
        )}

        {mode === "transaction" && (
          <View className="flex-row items-center justify-between px-1 pb-2">
            <Text className="text-3xl font-bold text-[#1B3C69]">
              {tranPaymentAmount}
            </Text>
            <TouchableOpacity
              className="ml-3 rounded-md"
              onPress={() => handleCopyToClipboard(tranPaymentAmount)}
            >
              <CopyIcon width={18} height={18} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </MotiView>
  );

  const transactionSection = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 500 }}
      className="mt-6"
    >
      {/* {selectedBank && ( */}
      <View className="my-1 rounded-xl bg-[#F8FBFF] px-4 py-3">
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-col">
            <Text className="text-sm text-[#1B3C69] ">Данс эзэмшигч</Text>
            <Text className="mt-1 text-base font-bold text-[#1B3C69]">
              {selectedBank?.ACC_NAME}
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-md p-2"
            onPress={() => handleCopyToClipboard(selectedBank?.ACC_NAME)}
          >
            <CopyIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
        <View className="h-[1px] w-full bg-[#34363D]" />
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-col">
            <Text className="text-sm text-[#1B3C69] ">Дансны дугаар</Text>
            <Text className="mt-1 text-base font-bold text-white">
              {selectedBank?.ACC_NO}
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-md p-2"
            onPress={() => handleCopyToClipboard(selectedBank?.ACC_NO)}
          >
            <CopyIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
        <View className="h-[1px] w-full bg-[#34363D]" />
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-col">
            <Text className="text-sm text-[#1B3C69] ">Гүйлгээний утга</Text>
            <Text className="mt-1 text-base font-bold text-[#1B3C69]">
              {tranDescription || ""}
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-md p-2"
            onPress={() => handleCopyToClipboard(tranDescription)}
          >
            <CopyIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>
      {/* )} */}
    </MotiView>
  );

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="bg-[#001165]" />
      <HeaderDetail
        title={
          type === "close"
            ? "Зээл хаах"
            : type === "prePay"
              ? "Урьдчилж төлөх"
              : type === "fee"
                ? "Хураамж төлөх"
                : "Зээл төлөх"
        }
        onBack={() => router.back()}
        bgColor="#001165"
      />

      <PaymentTab
        paddingContainer="px-4"
        prodType={loanData?.APP_PROD_TYPE}
        view1={
          <CustomScrollView className="pt-5">
            {detailSection()}
            {paymentSection("payment")}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600, delay: 600 }}
            >
              <Button
                className="mb-10 mt-5"
                isLoading={isSubmitting}
                onPress={handlePayment}
                isTextBold={true}
                fillColor="#2A45C4"
                textColor={getProductTextColorByType(
                  loanData?.APP_PROD_TYPE as number
                )}
                text="Төлөх"
              />
            </MotiView>
          </CustomScrollView>
        }
        view2={
          <CustomScrollView className="pt-5">
            {detailSection()}
            {paymentSection("transaction")}
            {transactionSection()}
          </CustomScrollView>
        }
      />

      <Confirmation
        prodType={loanData?.APP_PROD_TYPE as number}
        isVisible={isConfirmationVisible}
        onClose={() => setIsConfirmationVisible(false)}
        title="Анхааруулга"
        description={confirmationMessage}
        buttonOnPress={continuePayment}
        isConfirmation={true}
      />
    </View>
  );
};

export default Payment;
