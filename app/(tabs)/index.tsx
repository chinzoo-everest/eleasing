import ActiveLoansSection from "@components/ActiveLoansSection";
import { BannerCarousel } from "@components/BannerCarousel";
import ContractCard from "@components/ContractCard";
import LoanCard from "@components/LoanCard";
import LoanRequestsSection from "@components/LoanRequestsSection";
import PaymentTab from "@components/PaymentTab";
import HomeScreenSkeleton from "@components/skeletons/HomeScreen";
import SvgIcon from "@components/SvgIcon";
import { ContractAction } from "@constant/contract";
import { GlobalContext } from "@context/GlobalContext";
import { Config } from "@customConfig/config";
import { ImageBackground } from "react-native";
import { SCREENS } from "@customConfig/route";
import { useGlobalContext } from "@hooks/useGlobalContext";
import Confirmation from "@modals/Confirmation";
import { useFocusEffect } from "@react-navigation/native";
import { sendDefCustomerContract } from "@services/account.service";
import { fetchLoanRequestList } from "@services/depositLoan.service";
import {
  checkBeforeLoan,
  checkContractFee,
  loadBannerData,
  loadComboData,
  loadConfigData,
  loadCustomerData,
  loadLoanData,
  loadLoanProdData,
  processRenewLoanAmt,
} from "@services/home.service";
import {
  CBannerModel,
  CCustBank,
  CCustomer,
  CCustProd,
  CScreen,
} from "@type/interfaces/Customer";
import { LoanRequest } from "@type/interfaces/DepositLoan";
import { CLoanInfo } from "@type/interfaces/Loan";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { routePush } from "@utils/routePush";
import { showToast } from "@utils/showToast";
import { MotiView } from "moti";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeHeader from "@components/HomeHeader";

const Home = ({ navigation }: any) => {
  const context = useContext(GlobalContext);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [custProd, setCustProd] = useState<CCustProd[]>([]);
  const [loanList, setLoanList] = useState<CLoanInfo[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();
  const [bannerList, setBannerList] = useState<CBannerModel[]>([]);
  const { dispatch } = useGlobalContext();
  const windowWidth = Dimensions.get("window").width;
  const [confirmationDesc, setConfirmationDesc] = useState("");
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationCallback, setConfirmationCallback] =
    useState<() => void>();
  // keep prop presence for LoanCard if it expects it; never set any contract/verify data
  const [screenData] = useState<CScreen>();
  const [custBanks, setCustBanks] = useState<CCustBank[]>([]);
  const [loanRequestList, setLoanRequestList] = useState<LoanRequest[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const loadData = useCallback(
    async (manuallyResetSubmitting = true) => {
      try {
        setIsSubmitting(true);
        setCustProd([]);
        setLoanList([]);
        setBannerList([]);

        // still load config to populate context, but do not use it for contract/verify gates
        await loadConfigData(dispatch);
        const result = await loadCustomerData(dispatch);

        if (result?.customer) {
          setCustBanks(result.customer.BANK_LIST || []);
          setCurrentCustomer(result.customer);
        }

        if (result?.cust_prod) {
          setCustProd(result.cust_prod);
        }

        setLoanList(await loadLoanData());
        setBannerList(await loadBannerData());

        const requestResult = await fetchLoanRequestList();
        if (requestResult) {
          setLoanRequestList(
            requestResult.filter((item) => item.STATUS_ID !== 0)
          );
        }
      } catch (error) {
        handleErrorExpo(error, "loadData");
      } finally {
        if (manuallyResetSubmitting) setIsSubmitting(false);
        setTimeout(() => setIsLoading(false), 1000);
      }
    },
    [dispatch]
  );

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    loadComboData(dispatch);
  }, [dispatch]);

  const renewLoanAmt = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (currentCustomer?.REG_NO) {
        const result = await processRenewLoanAmt(currentCustomer.REG_NO);
        if (!result) return;
        await loadData();
      }
    } catch (error) {
      handleErrorExpo(error, "renewLoanAmt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLoan = async (item: CCustProd) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Handle specific product types
      if (
        item?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE ||
        item?.APP_PROD_TYPE === Config.PHONE_PROD_TYPE
      ) {
        if (custBanks.length === 0) {
          showToast(
            "Анхааруулга",
            "Та зээл хүлээн авах банкны дансаа холбоно уу",
            "error"
          );
          await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, { step: "bank" });
          return;
        }

        if (!currentCustomer?.PIN1) {
          showToast(
            "Анхааруулга",
            "Та зээл авахын тулд баталгаaжуулах пин кодоо үүсгэнэ үү",
            "error"
          );
          await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, { step: "pin" });
          return;
        }

        if (!currentCustomer?.EMAIL) {
          showToast(
            "Анхааруулга",
            "Та зээл авахын тулд холбоо барих имэйл хаягаа бүртгүүлнэ үү",
            "error"
          );
          await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, { step: "email" });
          return;
        }

        setIsLoading(true);
        const screen =
          item?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE
            ? SCREENS.DEPOSIT_ONBOARD
            : SCREENS.PHONE_ONBOARD;

        await routePush(screen, { product: JSON.stringify(item) });
        return;
      }

      // Handle expired credit score
      if (item?.CS_EXPIRED === "Y") {
        const limitRenewAmt = context?.state.configData?.limitRenewAmt;
        if (limitRenewAmt && limitRenewAmt > 0) {
          const result = await checkContractFee(limitRenewAmt, "LIMIT_RENEW");
          if (!result) return;
        }

        if (item?.INC_EXPIRED === "Y") {
          setIsLoading(true);
          await routePush(SCREENS.VERIFY_OTP, { mode: "updateLoanLimit" });
          return;
        }

        if (item.OUT_EXPIRED === "Y") {
          setIsLoading(true);
          await renewLoanAmt();
          return;
        }
      }

      // Handle non-expired cases
      const checkResult = await checkBeforeLoan(item);

      // Success path
      if (checkResult.int_result === 0) {
        setIsLoading(true);
        if (item?.APP_PROD_TYPE === Config.CAR_PROD_TYPE) {
          await routePush(SCREENS.CAR_ONBOARD, {
            product: JSON.stringify(item),
          });
        } else {
          await routePush(SCREENS.GET_LOAN, {
            prodId: item.ID,
            prodType: item.APP_PROD_TYPE,
          });
        }
        return;
      }

      // Handle various error conditions
      if (!checkResult) {
        showToast("Анхааруулах", "Алдаа гарлаа. Дахин оролдоно уу", "error");
        return;
      }

      const errorActions: Record<number, () => void> = {
        1: () =>
          showConfirmation(
            checkResult.str_result ||
              "Та зээл хүлээн авах банкны дансаа холбоно уу",
            handleGoToBankAccount
          ),
        2: () =>
          showConfirmation(
            checkResult.str_result ||
              "Та зээл авахын тулд баталгаaжуулах пин кодоо үүсгэнэ үү",
            handleGotoPin
          ),
        6: () =>
          showConfirmation(
            checkResult.str_result ||
              "Та зээл авахын тулд холбоо барих имэйл хаягаа бүртгүүлнэ үү",
            handleGotoEmail
          ),
      };

      const handleError = errorActions[checkResult.int_result];
      if (handleError) {
        handleError();
        return;
      }

      // Removed: contractActions & handleContract routing

      // Default error case
      showToast("Анхааруулах", checkResult.str_result, "error");
    } catch (error) {
      handleErrorExpo(error, "handleGetLoan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showConfirmation = (message: string, callback: () => void) => {
    setConfirmationTitle("Анхааруулга");
    setConfirmationDesc(message);
    setConfirmationCallback(() => callback);
    setIsConfirmationVisible(true);
    setIsSubmitting(false);
  };

  const handleGotoPin = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, { step: "pin" });
  };

  const handleGoToBankAccount = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, { step: "bank" });
  };

  const handleGotoEmail = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, { step: "email" });
  };

  const handleLoanItemPress = async (item: CLoanInfo) => {
    setIsSubmitting(true);
    setIsLoading(true);
    await routePush(SCREENS.LOAN_DETAIL, { loan: JSON.stringify(item) });
  };

  const toggleItemExpand = (itemId: number) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <View className="flex-1 bg-white">
      <HomeHeader title={""} />
      <View className="flex-1">
        {/* {isLoading ? (
          <HomeScreenSkeleton />
        ) : ( */}
        <View className="flex-1">
          <MotiView
            className="flex-1"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500 }}
          >
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              bounces
              refreshControl={
                <RefreshControl
                  refreshing={isSubmitting}
                  tintColor={"#9C4FDD"}
                  onRefresh={() => {
                    setIsLoading(true);
                    loadData();
                  }}
                />
              }
            >
              <View className="flex-1">
                <View className="flex-row items-start justify-start ">
                  <TouchableOpacity
                    className="my-3 ml-3 flex-row items-center gap-3"
                    onPress={async () => {
                      setIsLoading(true);
                      await routePush(SCREENS.PERSONAL);
                    }}
                  >
                    <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-3xl p-1 bg-[#F3F5F9] shadow-2xl ">
                      {currentCustomer?.AVATAR_URL ? (
                        <Image
                          source={{ uri: currentCustomer?.AVATAR_URL }}
                          className="h-full w-full rounded-3xl"
                          resizeMode="cover"
                        />
                      ) : (
                        <SvgIcon name="settings_user" height={64} width={64} />
                      )}
                    </View>

                    <View>
                      <Text className="text-sm text-[#71768E]">
                        Сайн байна уу?{"\n"}
                        <Text className="text-[#131A43] font-bold text-lg">
                          {currentCustomer?.FIRST_NAME}{" "}
                          {currentCustomer?.LAST_NAME}
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {custProd.length > 0 && (
                  <MotiView
                    className="relative -mx-5"
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: "timing",
                      duration: 600,
                      delay: 300,
                    }}
                  >
                    <Carousel
                      loop={false}
                      width={windowWidth}
                      snapEnabled={false}
                      height={windowWidth * 0.48}
                      autoPlay={false}
                      data={custProd}
                      mode="parallax"
                      modeConfig={{
                        parallaxScrollingScale: 0.93,
                        parallaxScrollingOffset: windowWidth * 0.09,
                      }}
                      renderItem={({ item, index }) => (
                        <LoanCard
                          source={item}
                          screenData={screenData}
                          handleGetLoan={handleGetLoan}
                          cardWidth={
                            custProd.length > 1 ? windowWidth : windowWidth
                          }
                          index={index}
                        />
                      )}
                    />
                  </MotiView>
                )}

                <View className="">
                  <ActiveLoansSection
                    loanList={loanList}
                    isSubmitting={isSubmitting}
                    onLoanPress={handleLoanItemPress}
                  />
                </View>

                <MotiView
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 600, delay: 700 }}
                >
                  <BannerCarousel
                    data={bannerList}
                    className="mb-25 -mx-3 mt-5"
                  />
                </MotiView>
              </View>
              <View className="h-[120px]" />
            </ScrollView>
          </MotiView>
        </View>
        {/* )} */}
      </View>

      <View>
        <Confirmation
          isVisible={isConfirmationVisible}
          onClose={() => setIsConfirmationVisible(false)}
          title={confirmationTitle}
          description={confirmationDesc}
          callBack={confirmationCallback}
          buttonOnPress={() => setIsConfirmationVisible(false)}
          isConfirmation={false}
        />
      </View>
    </View>
  );
};

export default Home;
