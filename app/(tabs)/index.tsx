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
  const contractCardRef = useRef<View>(null);
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
  const [screenData, setScreenData] = useState<CScreen>();
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

        const configData = await loadConfigData(dispatch);
        const result = await loadCustomerData(dispatch);
        let customerInfo: CCustomer;
        if (result?.customer) {
          console.info("STATUS_ID", result?.customer.STATUS_ID);
          console.info("ONLINE_CONT", result?.customer.ONLINE_CONT);
          setCustBanks(result?.customer?.BANK_LIST || []);
          setCurrentCustomer(result.customer);
          customerInfo = result.customer;
          // Optimize contract screenData logic
          const { REG_RENEW } = result?.customer || {};
          console.info("REG_RENEW", REG_RENEW);
          const faceLivenessEnabled = configData?.faceLiveness === "Y";
          console.info("FACE_LIVENESS", faceLivenessEnabled);

          // Treat null REG_RENEW as 1
          const regRenewValue = REG_RENEW ?? 1;

          if (
            regRenewValue === 1 ||
            (regRenewValue === 2 && faceLivenessEnabled)
          ) {
            const isFaceVerify = regRenewValue === 2 && faceLivenessEnabled;
            setScreenData({
              TITLE: "Баталгаажуулах",
              DESCR: isFaceVerify
                ? "Хэрэглэгч та царайгаа баталгаажуулан зээлийн хүсэлтээ илгээнэ үү"
                : "Хэрэглэгч та өөрийн хувийн мэдээллээ баталгаажуулна уу",
              REASON: "",
              BUTTON_TEXT: "Баталгаажуулах",
              ACTION_CODE: isFaceVerify
                ? ContractAction.VERIFY_FACE
                : ContractAction.VERIFY_ACC,
            });
          } else if (result?.screen) {
            console.info("SCREEN_DATA", result.screen);
            setScreenData(result.screen);
          }
        }

        if (result.cust_prod) {
          setCustProd(result.cust_prod);
        }

        // const prodList = await loadLoanProdData();
        // if (prodList.length > 0) {
        //   setCustProd(
        //     prodList
        //       // .filter(prod =>
        //       //   customerInfo && customerInfo.CUST_ID === 12
        //       //     ? prod.ID === 639
        //       //     : prod.ID !== 639,
        //       // )
        //       .map(prod => {
        //         const custProdItem = result?.cust_prod?.find(
        //           cp => cp.PROD_ID === prod.ID,
        //         );
        //         return {
        //           ...prod,
        //           LOAN_LIMIT: custProdItem?.LOAN_LIMIT || prod.LOAN_LIMIT,
        //           PROD_ID: custProdItem?.PROD_ID || prod.ID,
        //           LOAN_AMT: custProdItem?.LOAN_AMT || prod.LOAN_AMT,
        //           EXP_DATE: custProdItem?.EXP_DATE || prod.EXP_DATE,
        //         };
        //       })
        //       .sort((a, b) => (a.ORDER_NO || 0) - (b.ORDER_NO || 0)),
        //   );
        // }

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
        if (manuallyResetSubmitting) {
          setIsSubmitting(false);
        }

        // eslint-disable-next-line no-undef
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
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
        const result = await processRenewLoanAmt(currentCustomer?.REG_NO);
        if (!result) return;
        await loadData();
      }
    } catch (error) {
      handleErrorExpo(error, "renewLoanAmt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContractCard = useCallback(() => {
    if (contractCardRef.current && scrollViewRef.current) {
      contractCardRef.current.measureLayout(
        // @ts-ignore - Known issue with ScrollView ref typing
        scrollViewRef.current,
        (_, y) => {
          scrollViewRef.current?.scrollTo({ y, animated: true });
        },
        () => console.error("Failed to measure contract card layout")
      );
    }
  }, []);

  useEffect(() => {
    // Scroll to contract card when it's available and needs verification
    if (screenData?.ACTION_CODE === ContractAction.VERIFY_ACC) {
      // Short delay to ensure card is rendered
      global.setTimeout(scrollToContractCard, 500);
    }
  }, [screenData, scrollToContractCard]);

  const handleGetLoan = async (item: CCustProd) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Early validation checks
      if (screenData?.ACTION_CODE === ContractAction.VERIFY_ACC) {
        showToast(screenData.TITLE, screenData.DESCR, "error");
        scrollToContractCard();
        return;
      }

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
          await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, {
            step: "bank",
          });
          return;
        }

        if (!currentCustomer?.PIN1) {
          showToast(
            "Анхааруулга",
            "Та зээл авахын тулд баталгаaжуулах пин кодоо үүсгэнэ үү",
            "error"
          );
          await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, {
            step: "pin",
          });
          return;
        }

        if (!currentCustomer?.EMAIL) {
          showToast(
            "Анхааруулга",
            "Та зээл авахын тулд холбоо барих имэйл хаягаа бүртгүүлнэ үү",
            "error"
          );
          await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, {
            step: "email",
          });
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

      // Success path - can proceed with loan
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

      // Map error codes to actions
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

      // Handle contract related actions
      const contractActions = [
        ContractAction.SEND_CONTRACT,
        ContractAction.RETURN_LOAN,
        ContractAction.CALC_LOAN_AMT,
      ];

      if (
        screenData?.ACTION_CODE &&
        contractActions.includes(screenData.ACTION_CODE as ContractAction)
      ) {
        await handleContract();
        return;
      }

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
    await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, {
      step: "pin",
    });
  };

  const handleGoToBankAccount = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, {
      step: "bank",
    });
  };

  const handleGotoEmail = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    await routePush(SCREENS.GET_LOAN_MULTIPLE_FORMS, {
      step: "email",
    });
  };

  const handleContract = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      switch (screenData?.ACTION_CODE) {
        case ContractAction.CALC_LOAN_AMT: {
          // Check if fee processing is required
          const limitDefAmt = context?.state.configData?.limitDefAmt;
          if (limitDefAmt && limitDefAmt > 0) {
            const feeResult = await checkContractFee(limitDefAmt);
            if (!feeResult) return;
          }

          // Send contract request
          const sendResult = await sendDefCustomerContract();
          if (!sendResult) return;

          showToast("Зээлийн эрх бодох хүсэлт хүлээж авлаа");
          await loadData();
          break;
        }

        case ContractAction.VERIFY_ACC:
          setIsLoading(true);
          await routePush(SCREENS.UPDATE_LOAN_LIMIT, { mode: "danUpdate" });
          break;

        case ContractAction.VERIFY_FACE:
          setIsLoading(true);
          await routePush(SCREENS.LIVENESS);
          break;

        case ContractAction.SEND_CONTRACT:
        case ContractAction.RETURN_LOAN:
          setIsLoading(true);
          await routePush(SCREENS.CONTRACT);
          break;
      }
    } catch (error) {
      handleErrorExpo(error, "handleContract");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoanItemPress = async (item: CLoanInfo) => {
    setIsSubmitting(true);
    setIsLoading(true);
    await routePush(SCREENS.LOAN_DETAIL, {
      loan: JSON.stringify(item),
    });
  };

  const toggleItemExpand = (itemId: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <View className="flex-1 bg-red-400">
      {/* <HomeHeader title={"asd"} /> */}

      <View className="flex-1">
        {isLoading ? (
          <HomeScreenSkeleton />
        ) : (
          <View className="flex-1" style={{ paddingTop: insets.top }}>
            <MotiView
              className="flex-1"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 500,
              }}
            >
              <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-3"
                showsVerticalScrollIndicator={false}
                bounces={true}
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
                  <View className="flex-row items-start justify-start">
                    <TouchableOpacity
                      className="my-6 ml-3 flex-row items-center gap-3"
                      onPress={async () => {
                        setIsLoading(true);
                        await routePush(SCREENS.PERSONAL);
                      }}
                    >
                      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full">
                        {currentCustomer?.AVATAR_URL ? (
                          <Image
                            source={{ uri: currentCustomer?.AVATAR_URL }}
                            className="h-full w-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <SvgIcon name="settings_user" />
                        )}
                      </View>

                      <View>
                        <Text className="text-lg font-bold leading-6 text-white">
                          Сайн байна уу?
                          {"\n"}
                          {currentCustomer?.FIRST_NAME}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {custProd.length > 0 && (
                    <MotiView
                      className="relative -mx-3"
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
                        height={windowWidth * 0.6}
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
                      <View className="-mx-4 mt-4 border-[0.2px] border-b border-gray-600" />
                    </MotiView>
                  )}

                  {/* Contract card with ref */}
                  {screenData?.TITLE &&
                    screenData?.TITLE !== "None" &&
                    screenData?.TITLE !== "" &&
                    (screenData?.ACTION_CODE === ContractAction.VERIFY_ACC ||
                      screenData?.ACTION_CODE ===
                        ContractAction.VERIFY_FACE) && (
                      <MotiView
                        ref={contractCardRef}
                        className="relative items-center justify-center"
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "timing",
                          duration: 600,
                          delay: 200,
                        }}
                      >
                        <ContractCard
                          title={screenData?.TITLE}
                          description={screenData?.DESCR}
                          reason={screenData?.REASON}
                          buttonText={screenData?.BUTTON_TEXT}
                          actionCode={screenData?.ACTION_CODE}
                          buttonVisible={
                            screenData?.BUTTON_TEXT !== "None" &&
                            screenData?.BUTTON_TEXT !== ""
                          }
                          buttonOnPress={handleContract}
                          navigation={navigation}
                        />
                        <Text></Text>
                      </MotiView>
                    )}
                  <View className="mx-2">
                    <PaymentTab
                      prodType={Number(Config.DIGITAL_PROD_TYPE)}
                      text1="Идэвхтэй зээл"
                      text2="Зээлийн хүсэлт"
                      view1={
                        <ActiveLoansSection
                          loanList={loanList}
                          isSubmitting={isSubmitting}
                          onLoanPress={handleLoanItemPress}
                        />
                      }
                      view2={
                        <LoanRequestsSection
                          requestList={loanRequestList}
                          expandedItems={expandedItems}
                          onToggleItem={toggleItemExpand}
                        />
                      }
                    />
                  </View>

                  <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "timing",
                      duration: 600,
                      delay: 700,
                    }}
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
        )}
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
