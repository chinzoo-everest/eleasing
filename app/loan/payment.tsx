import Button from "@components/Button";
import { CLoanInfo } from "@type/interfaces/Loan";
import CopyIcon from "@assets/images/copy.svg";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useGlobalContext } from "@hooks/useGlobalContext";
import { calcPaymentData, loadPaymentRequest } from "@services/loan.service";
import { formatToMongolianLocale } from "@utils/formatToMongolianLocale";
import { CCustBank, CLoanCalc } from "@type/interfaces/Customer";
import { router, useLocalSearchParams } from "expo-router";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { routePush } from "@utils/routePush";
import HeaderDetail from "@components/HeaderDetail";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PaymentTab from "@components/PaymentTab";
import { SCREENS } from "@customConfig/route";
import Confirmation from "@modals/Confirmation";
import { parseResponseData } from "@utils/parseResponseData";
import { getProductTextColorByType } from "utils/getProductColor";
import CustomScrollView from "@components/CustomScrollView";
import { MotiView } from "moti";

const DEBUG = true;
const dlog = (...args: unknown[]): void => {
  if (DEBUG) console.log("[Payment]", ...args);
};

const Payment: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { loan, type } = useLocalSearchParams();
  const flow = (type as string) || "normal";

  const { state } = useGlobalContext();
  const { qpayFee } = state.configData;
  const currentUser = state.currentUser;

  const [loanData, setLoanData] = useState<CLoanInfo>();
  const [paymentCalc, setPaymentCalc] = useState<CLoanCalc>();
  const [closeCalc, setCloseCalc] = useState<CLoanCalc>();

  const [bankList, setBankList] = useState<CCustBank[]>([]);
  const [activeBankIndex, setActiveBankIndex] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<CCustBank | undefined>();

  const [remainingFee, setRemainingFee] = useState<number>(0);
  const [remainingPre, setRemainingPre] = useState<number>(0);

  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [tranPaymentAmount, setTranPaymentAmount] = useState<string>("");

  const [principalText, setPrincipalText] = useState<string>("0");
  const [interestText, setInterestText] = useState<string>("0");

  const [tranDescription, setTranDescription] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");

  const showBreakdown = remainingPre <= 0 && remainingFee <= 0;

  const slideWidth = width - 32; // paddingContainer px-4

  const fmt = (n: number): string =>
    `${formatToMongolianLocale(Math.max(0, Math.round(n)))}`;

  const loadData = useCallback(async (): Promise<void> => {
    try {
      if (!loan) return;

      const parsedLoan = parseResponseData<CLoanInfo>(loan as string);
      setLoanData(parsedLoan);

      const SERVICE_AMT = parsedLoan.SERVICE_AMT || 0;
      const LOAN_FEE = parsedLoan.LOAN_FEE || 0;
      const PAID_FEE = parsedLoan.PAID_FEE || 0;
      const PRE_AMT = parsedLoan.PRE_AMT || 0;
      const PAID_PRE_AMT = parsedLoan.PAID_PRE_AMT || 0;

      const REMAINING_FEE = SERVICE_AMT + LOAN_FEE - PAID_FEE;
      const REMAINING_PRE = PRE_AMT - PAID_PRE_AMT;

      setRemainingFee(REMAINING_FEE);
      setRemainingPre(REMAINING_PRE);

      const isPrepaid = flow === "prePay";
      const isClose = flow === "close";
      const calcResult = await calcPaymentData(parsedLoan, isPrepaid, isClose);
      if (calcResult) {
        setPaymentCalc(calcResult.currentPaymentCalc);
        setCloseCalc(calcResult.closePaymentCalc);

        const cur = calcResult.currentPaymentCalc;
        const toUse = isClose ? calcResult.closePaymentCalc : cur;

        setPrincipalText(fmt(Math.max(0, cur.loanAmt || 0)));
        setInterestText(fmt(Math.max(0, toUse.intAmt || 0)));
      }

      if (parsedLoan && typeof parsedLoan.BANKS === "string") {
        try {
          parsedLoan.BANKS = JSON.parse(parsedLoan.BANKS);
        } catch {
          // ignore
        }
      }
      if (parsedLoan && Array.isArray(parsedLoan.BANKS)) {
        const banks: CCustBank[] = parsedLoan.BANKS;
        setBankList(banks);
        setSelectedBank(banks[0]);
        setActiveBankIndex(0);
      }

      const regNo = currentUser?.REG_NO || "";
      const phone = currentUser?.PHONE1 || "";
      const contractNo = parsedLoan?.CONTRACT_NO || "";
      setTranDescription(`${regNo}, ${phone}, ${contractNo}`);

      setIsDataReady(true);
    } catch (error) {
      handleErrorExpo(error, "loadPaymentData");
    }
  }, [loan, flow, currentUser]);

  useEffect((): void => {
    loadData();
  }, [loadData]);

  const baselineTranAmount = useMemo<number>(() => {
    const bothZero = remainingPre <= 0 && remainingFee <= 0;
    const cur = paymentCalc;
    const close = closeCalc;

    const loanAmt = Math.max(0, cur?.loanAmt ?? 0);
    const intAmt = Math.max(
      0,
      (flow === "close" ? close?.intAmt : cur?.intAmt) ?? 0
    );
    const lossAmt = Math.max(
      0,
      (flow === "close" ? close?.lossAmt : cur?.lossAmt) ?? 0
    );

    const feePre = Math.max(0, remainingPre) + Math.max(0, remainingFee);
    return Math.ceil(bothZero ? loanAmt + intAmt + lossAmt : feePre);
  }, [
    flow,
    paymentCalc?.loanAmt,
    paymentCalc?.intAmt,
    paymentCalc?.lossAmt,
    closeCalc?.intAmt,
    closeCalc?.lossAmt,
    remainingPre,
    remainingFee,
  ]);

  useEffect((): void => {
    if (!isDataReady) return;
    const formatted = formatToMongolianLocale(baselineTranAmount);
    setPaymentAmount(formatted);
    setTranPaymentAmount(formatted);
  }, [isDataReady, baselineTranAmount]);

  const handleCopyToClipboard = (text?: string): void => {
    if (text)
      Clipboard.setStringAsync(text).then(() =>
        Alert.alert("Амжилттай хууллаа!")
      );
  };

  const handlePayment = (): void => {
    if (!paymentCalc || !closeCalc) return;

    const convertedAmount = parseFloat(paymentAmount.replace(/,/g, ""));
    if (convertedAmount <= 0) {
      setErrorMessage("Төлбөр төлөх мөнгөн дүн буруу байна");
      return;
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
    void continuePayment();
  };

  const continuePayment = async (): Promise<void> => {
    try {
      setIsConfirmationVisible(false);
      if (!paymentCalc || !loanData) return;

      const convertedAmount = parseFloat(paymentAmount.replace(/,/g, ""));
      const result = await loadPaymentRequest(
        loanData,
        convertedAmount.toString(),
        qpayFee.toString(),
        paymentCalc,
        flow === "prePay",
        flow === "close",
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

  const AmountCard = (): JSX.Element => {
    const interestLabel =
      flow === "prePay" && (paymentCalc?.intDay || 0) > 0
        ? `Хүүгийн төлбөр (${paymentCalc?.intDay} хоног)`
        : "Хүүгийн төлбөр";

    return (
      <View className="mt-4 rounded-3xl bg-[#F4F8FF] px-6 py-6">
        <Text className="text-base text-[#1B3C69]">Төлөх зээлийн дүн</Text>
        <Text className="mt-2 text-4xl font-extrabold tracking-tight text-[#111827]">
          ₮ {tranPaymentAmount}
        </Text>
        <View className="my-5 h-[1px] w-full bg-white/70" />
        {showBreakdown ? (
          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-sm text-[#6B7280]">Үндсэн зээл</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{principalText}
              </Text>
            </View>
            <View className="w-[48%] items-end">
              <Text className="text-sm text-[#6B7280]">{interestLabel}</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{interestText}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-sm text-[#6B7280]">Урьдчилгаа</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{fmt(Math.ceil(remainingPre))}
              </Text>
            </View>
            <View className="w-[48%] items-end">
              <Text className="text-sm text-[#6B7280]">Шимтгэл</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{fmt(Math.ceil(remainingFee))}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const onBankMomentumEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ): void => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / slideWidth);
    if (idx !== activeBankIndex && bankList[idx]) {
      setActiveBankIndex(idx);
      setSelectedBank(bankList[idx]);
    }
  };

  const BankCarousel = (): JSX.Element => {
    const getBankName = (b: CCustBank, i: number): string =>
      // best-effort name extraction
      ((b as unknown as Record<string, string>).BANK_NAME ||
        (b as unknown as Record<string, string>).BANK ||
        (b as unknown as Record<string, string>).NAME ||
        `Банк ${i + 1}`) as string;

    return (
      <View className="mt-4">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onBankMomentumEnd}
          snapToInterval={slideWidth}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 0 }}
          style={{ width: slideWidth }}
        >
          {bankList.map((b: CCustBank, i: number) => (
            <View
              key={`${b.ACC_NO}-${i}`}
              className="px-0"
              style={{ width: slideWidth }}
            >
              <View className="rounded-3xl bg-white shadow-sm">
                <View className="rounded-t-3xl bg-[#001165] px-6 py-4">
                  <Text className="text-lg font-bold text-white">
                    {getBankName(b, i)}
                  </Text>
                </View>

                <View className="px-6 py-5">
                  <View className="flex-row justify-between">
                    <View className="w-[60%]">
                      <Text className="text-xs text-[#6B7280]">Дансны нэр</Text>
                      <Text className="mt-1 text-base font-bold text-[#111827]">
                        {b.ACC_NAME}
                      </Text>
                    </View>
                    <View className="w-[38%] items-end">
                      <Text className="text-xs text-[#6B7280]">
                        Дансны дугаар
                      </Text>
                      <TouchableOpacity
                        onPress={(): void =>
                          handleCopyToClipboard(b.ACC_NO as string)
                        }
                      >
                        <Text className="mt-1 text-base font-bold text-[#111827]">
                          {b.ACC_NO}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="my-4 h-[1px] w-full bg-gray-200" />

                  <View>
                    <Text className="text-xs text-[#6B7280]">
                      Гүйлгээний утга
                    </Text>
                    <TouchableOpacity
                      onPress={(): void =>
                        handleCopyToClipboard(tranDescription)
                      }
                    >
                      <Text className="mt-1 text-base font-bold text-[#111827]">
                        {tranDescription}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {AmountCard()}
            </View>
          ))}
        </ScrollView>

        {/* Dots */}
        {bankList.length > 1 && (
          <View className="mt-3 flex-row items-center justify-center">
            {bankList.map((_, i: number) => {
              const active = i === activeBankIndex;
              return (
                <View
                  key={`dot-${i}`}
                  className={`mx-1 rounded-full ${
                    active ? "h-2 w-6 bg-[#2A45C4]" : "h-2 w-2 bg-gray-300"
                  }`}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const AmountAndBreakdownDirect = (): JSX.Element => {
    const interestLabel =
      flow === "prePay" && (paymentCalc?.intDay || 0) > 0
        ? `Хүүгийн төлбөр (${paymentCalc?.intDay} хоног)`
        : "Хүүгийн төлбөр";

    return (
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 450 }}
        className="rounded-3xl bg-[#F4F8FF] px-6 py-6"
      >
        <Text className="text-base text-[#1B3C69]">Төлөх зээлийн дүн</Text>
        <Text className="mt-2 text-4xl font-extrabold tracking-tight text-[#111827]">
          ₮ {paymentAmount}
        </Text>
        <View className="my-5 h-[1px] w-full bg-white/70" />
        {showBreakdown ? (
          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-sm text-[#6B7280]">Үндсэн зээл</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{principalText}
              </Text>
            </View>
            <View className="w-[48%] items-end">
              <Text className="text-sm text-[#6B7280]">{interestLabel}</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{interestText}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-sm text-[#6B7280]">Урьдчилгаа</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{fmt(Math.ceil(remainingPre))}
              </Text>
            </View>
            <View className="w-[48%] items-end">
              <Text className="text-sm text-[#6B7280]">Шимтгэл</Text>
              <Text className="mt-1 text-xl font-semibold text-[#111827]">
                ₮{fmt(Math.ceil(remainingFee))}
              </Text>
            </View>
          </View>
        )}
        {!!errorMessage && (
          <Text className="mt-2 text-xs text-red-500">{errorMessage}</Text>
        )}
      </MotiView>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="bg-[#001165]" />
      <HeaderDetail
        title={
          flow === "close"
            ? "Зээл хаах"
            : flow === "prePay"
              ? "Урьдчилж төлөх"
              : flow === "fee"
                ? "Хураамж төлөх"
                : "Зээл төлөх"
        }
        onBack={(): void => router.back()}
        bgColor="#001165"
      />

      <PaymentTab
        paddingContainer="px-4"
        prodType={loanData?.APP_PROD_TYPE as number}
        remainingPre={remainingPre}
        remainingFee={remainingFee}
        disableView2={false}
        view1={
          <CustomScrollView className="pt-5">
            {AmountAndBreakdownDirect()}
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 450, delay: 100 }}
              className="mt-6"
            >
              <Button
                className="mb-10"
                isLoading={isSubmitting}
                onPress={handlePayment}
                isTextBold={true}
                fillColor="#65E33F"
                textColor={getProductTextColorByType(
                  loanData?.APP_PROD_TYPE as number
                )}
                text="Төлөлт хийх"
              />
            </MotiView>
          </CustomScrollView>
        }
        view2={
          <CustomScrollView className="pt-5">
            {BankCarousel()}
            <View className="mb-10" />
          </CustomScrollView>
        }
      />

      <Confirmation
        isVisible={isConfirmationVisible}
        onClose={(): void => setIsConfirmationVisible(false)}
        title="Анхааруулга"
        description={confirmationMessage}
        buttonOnPress={continuePayment}
        isConfirmation={true}
      />
    </View>
  );
};

export default Payment;
