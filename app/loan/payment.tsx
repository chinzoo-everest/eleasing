import Button from "@components/Button";
import { CLoanInfo } from "@type/interfaces/Loan";
import CopyIcon from "@assets/images/copy.svg";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useGlobalContext } from "@hooks/useGlobalContext";
import { Dropdown } from "react-native-element-dropdown";
import { calcPaymentData, loadPaymentRequest } from "@services/loan.service";
import { formatToMongolianLocale } from "@utils/formatToMongolianLocale";
import { CCustBank, CLoanCalc } from "@type/interfaces/Customer";
import { router, useLocalSearchParams } from "expo-router";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { routePush } from "@utils/routePush";
import Header from "@components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PaymentTab from "@components/PaymentTab";
import SvgIcon from "@components/SvgIcon";
import { SCREENS } from "@customConfig/route";
import Confirmation from "@modals/Confirmation";
import { parseResponseData } from "@utils/parseResponseData";
import {
  getProductColorByType,
  getProductTextColorByType,
} from "utils/getProductColor";
import CustomScrollView from "@components/CustomScrollView";
import { MotiView } from "moti";

const Payment = () => {
  const insets = useSafeAreaInsets();
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
  const [additionalPayment, setAdditionalPayment] = useState("");
  const [lossAmtPayment, setLossAmtPayment] = useState("0");
  const [intAmtPayment, setIntAmtPayment] = useState("0");
  const [errorMessage, setErrorMessage] = useState("");
  const [tranDescription, setTranDescription] = useState<string>("");
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const isPrepaid = type === "prePay";
      const isClose = type === "close";
      const isFee = type === "fee";

      if (!loan) return;
      const parsedLoan = parseResponseData<CLoanInfo>(loan as string);
      setLoanData(parsedLoan);

      const calcResult = await calcPaymentData(parsedLoan, isPrepaid, isClose);
      if (calcResult) {
        setPaymentCalc(calcResult.currentPaymentCalc);
        setCloseCalc(calcResult.closePaymentCalc);

        // Default payment amount logic
        const defaultAmount = Math.ceil(
          calcResult?.currentPaymentCalc.intAmt +
            calcResult?.currentPaymentCalc.lossAmt +
            calcResult?.currentPaymentCalc.loanAmt
        );

        // If type === 'fee', use remaining fee amount from navigation param
        const feeAmount =
          isFee && amount ? parseFloat(amount as string) : defaultAmount;

        const formattedFee = formatToMongolianLocale(feeAmount);

        setPaymentAmount(formattedFee);
        setTranPaymentAmount(formattedFee);
        setLossAmtPayment(
          formatToMongolianLocale(calcResult?.currentPaymentCalc.lossAmt)
        );
        setIntAmtPayment(
          formatToMongolianLocale(calcResult?.currentPaymentCalc.intAmt)
        );
      }

      // Handle BANK list
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
      }

      // Transaction description
      const regNo = currentUser?.REG_NO || "";
      const phone = currentUser?.PHONE1 || "";
      const contractNo = parsedLoan?.CONTRACT_NO || "";
      setTranDescription(`${regNo}, ${phone}, ${contractNo}`);
    } catch (error) {
      handleErrorExpo(error, "loadPaymentData");
    }
  }, [loan, type, amount, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayment = () => {
    if (!paymentCalc || !closeCalc) return;

    const convertedPayment = parseFloat(paymentAmount.replace(/,/g, ""));
    if (convertedPayment <= 0) {
      setErrorMessage("Төлбөр төлөх мөнгөн дүн буруу байна");
      return;
    }

    if (qpayFee > 0) {
      setConfirmationMessage(
        "QPAY-ээр төлөх үед таны төлбөр дээр гүйлгээний шимтгэл " +
          qpayFee +
          "₮ нэмэгдэхийг анхаарна уу."
      );
      setIsConfirmationVisible(true);
      return;
    }
    continuePayment();
  };

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
            <Text className="font-Inter text-sm font-bold text-white">
              ГЭРЭЭНИЙ ДУГААР
            </Text>
            <Text className="font-Inter text-base font-medium text-white">
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
              className="text-sm font-medium"
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
      <View className="pb-8 flex-col">
        <View className="flex-row items-center justify-between">
          <Text className="text-base text-[#9CA3AF]">Үлдэгдэл</Text>
          <Text className="text-lg font-medium text-white">
            {`${formatToMongolianLocale(Math.round(loanData?.BALANCE || 0))}₮`}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-">
          <Text className="text-base text-[#9CA3AF]">Үлдэгдэл</Text>
          <Text className="text-lg font-medium text-white">
            {paymentAmount}
          </Text>
        </View>
      </View>
    </MotiView>
  );

  const paymentSection = (mode: "payment" | "transaction") => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 400 }}
      className="rounded-xl border-4 border-[#3D4181] bg-bgLight px-5 py-2"
    >
      <View className="flex-col justify-between">
        <Text className="mb-1 mt-2 text-sm font-bold text-white">
          ТӨЛӨХ ДҮН
        </Text>

        {mode === "payment" && (
          <View className="flex-row items-center rounded-xl px-1 pb-2">
            <TextInput
              readOnly={true}
              value={paymentAmount}
              className="flex-1 text-3xl font-bold text-white"
            />
          </View>
        )}

        {mode === "transaction" && (
          <View className="pb2- flex-row items-center justify-between rounded-xl px-1 pb-2">
            <Text
              className="text-3xl font-bold"
              style={{
                color: getProductTextColorByType(
                  loanData?.LOAN_PROD_ID as number
                ),
              }}
            >
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
      {selectedBank && (
        <View className="my-1 rounded-xl bg-bgLight px-4 py-3">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-col">
              <Text className="text-sm text-white opacity-50">
                Данс эзэмшигч
              </Text>
              <Text className="mt-1 text-base font-bold text-white">
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
              <Text className="text-sm text-white opacity-50">
                Дансны дугаар
              </Text>
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
              <Text className="text-sm text-white opacity-50">
                Гүйлгээний утга
              </Text>
              <Text className="mt-1 text-base font-bold text-white">
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
      )}
    </MotiView>
  );

  return (
    <View className="flex-1 bg-bgPrimary" style={{ paddingTop: insets.top }}>
      <Header
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
        bgColor="#24292D"
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
                fillColor={getProductColorByType(
                  loanData?.APP_PROD_TYPE as number
                )}
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
