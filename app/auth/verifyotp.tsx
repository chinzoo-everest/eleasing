import { SCREENS } from "@customConfig/route";
import Button from "@components/Button";
import CustomScrollView from "@components/CustomScrollView";
import Header from "@components/Header";
import { LogOutUser, verifyAuthOTP } from "@services/auth.service";
import { registerDepositToRequest } from "@services/depositLoan.service";
import { CLoanDepositRequest } from "@type/interfaces/DepositLoan";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { routePush } from "@utils/routePush";
import { showToast } from "@utils/showToast";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getProductColorByType,
  getProductTextColorByType,
} from "utils/getProductColor";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const insets = useSafeAreaInsets();
  const { requestId, isOwner, loanAmount, prodId, prodType } =
    useLocalSearchParams();
  const { mode, email, phoneNo, isRememberDevice, regNo, password } =
    useLocalSearchParams();
  const [time, setTime] = useState(60);
  const [errorString, setErrorString] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpInputRef = useRef<OtpInputRef>(null);

  useFocusEffect(
    useCallback(() => {
      setOtp("");
      setErrorString("");
      setTime(60);
      const interval = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            // eslint-disable-next-line no-undef
            setTimeout(() => {
              router.back();
            }, 0);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => window.clearInterval(interval);
    }, [])
  );

  const onVerify = async () => {
    if (otp.length !== 6) {
      setErrorString("OTP кодыг оруулна уу");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorString("");

    try {
      const checkData =
        (mode === "verifyEmail" || mode === "changeEmail") && email
          ? email
          : phoneNo;
      if (!checkData) {
        throw new Error("check data is required");
      }
      const result = await verifyAuthOTP(
        (regNo as string) || "",
        otp,
        mode as string,
        checkData as string,
        isRememberDevice?.toString() === "true",
        password as string
      );
      if (!result) {
        otpInputRef.current?.clear();
        return;
      }
      if (mode === "recoverAccount") {
        showToast("Таны бүртгэл шинэчлэгдлээ. Та нэвтрэх хэсгээр нэвтэрнэ үү.");
        await LogOutUser();
      } else if (mode === "resetPassword") {
        showToast(
          "Нууц үг амжилттай шинэчлэгдлээ. Та нэвтрэх хэсгээр нэвтэрнэ үү."
        );
        await LogOutUser();
      } else if (mode === "changePhone") {
        showToast("Утасны дугаар амжилттай солигдлоо. Та дахин нэвтэрнэ үү");
        await LogOutUser();
      } else if (mode === "changeEmail") {
        showToast("Имэйл хаяг амжилттай солигдлоо.");
        await routePush(SCREENS.HOME, {}, true);
      } else if (mode === "verifyPhone" || mode === "verifyEmail") {
        return;
      } else if (mode === "verifyNewPhone") {
        showToast(
          "Утасны дугаарыг амжилттай баталгаажууллаа. Та апп-руу нэвтрэх нууц үгээ оруулна уу"
        );
        await routePush(
          SCREENS.REGISTER,
          {
            isPassed: true,
            phoneNo: phoneNo as string,
            regNo: regNo as string,
          },
          true
        );
      } else if (mode === "verifyDepositPhone") {
        if (!requestId) {
          showToast("Амжилтгүй", "Алдаа гарлаа. Та дахин оруулна уу", "error");
          return await routePush(SCREENS.HOME, {}, true);
        }
        const depositRequest: CLoanDepositRequest = {
          REQ_ID: parseInt(requestId as string),
          TYPE_ID: 3,
          SUB_TYPE_CODE: "009",
          N_PHONE_NO: phoneNo as string,
          N_IS_OWNER: (isOwner as string) === "true" ? "Y" : "N",
          N_IS_CORP_OWNER: (isOwner as string) === "false" ? "Y" : "N",
        };

        const depositResult = await registerDepositToRequest(depositRequest);
        if (!depositResult) {
          return await routePush(SCREENS.HOME, {}, true);
        }
        await routePush(
          SCREENS.DEPOSIT_REGISTER,
          {
            requestId: requestId as string,
            loanAmount: loanAmount as string,
            prodId: prodId as string,
            prodType: prodType as string,
          },
          true
        );
      } else {
        router.back();
      }
    } catch (error) {
      handleErrorExpo(error, "VerifyOTP - onSubmit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="OTP баталгаажуулалт"
        onBack={() => router.back()}
        bgColor="#fff"
        showBottomLine={false}
        textColor="#1B3C69"
      />
      <CustomScrollView>
        <View className="mx-6 mt-10 flex-1 items-center">
          <Text className="text-xl font-bold text-[#1B3C69]">
            Баталгаажуулах
          </Text>
          <Text className="mt-3 text-center text-sm text-[#1B3C69] opacity-60">
            ****{typeof phoneNo === "string" ? phoneNo.slice(-4) : ""} дугаарт
            илгээсэн баталгаажуулах{"\n"}6 оронтой кодыг оруулна уу
          </Text>

          <View className="mt-10 w-full items-center">
            <OtpInput
              ref={otpInputRef}
              numberOfDigits={6}
              onTextChange={(value) => {
                setOtp(value);
                if (value.length === 6) {
                  Keyboard.dismiss();
                }
              }}
              autoFocus
              type="numeric"
              theme={{
                pinCodeContainerStyle: {
                  borderColor: "#9CA3AF",
                  borderWidth: 1,
                  borderRadius: 8,
                  marginHorizontal: 0,
                  width: 60,
                  height: 55,
                  backgroundColor: "#fff",
                },
                focusedPinCodeContainerStyle: {
                  borderColor: "#1B3C69",
                  borderWidth: 2,
                },
                pinCodeTextStyle: {
                  color: "#1B3C69",
                  fontSize: 22,
                  fontWeight: "bold",
                  textAlign: "center",
                },
              }}
            />
            {errorString ? (
              <Text className="mt-2 text-sm text-red-400">{errorString}</Text>
            ) : null}
          </View>

          <Text className="mt-8 text-lg text-[#1B3C69] opacity-70">
            {`0${Math.floor(time / 60)}:${time % 60 < 10 ? "0" : ""}${time % 60}`}
          </Text>
          <Text className="mt-2 text-sm text-[#1B3C69]">Дахин илгээх үү?</Text>

          <View className="mt-10 w-full">
            <Button
              text="Баталгаажуулах"
              onPress={onVerify}
              isLoading={isSubmitting}
              fillColor="#1B3C69"
              textColor="#FFFFFF"
            />
          </View>
        </View>
      </CustomScrollView>
    </View>
  );
};

export default VerifyOTP;
