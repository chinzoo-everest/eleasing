import BottomSheetSidebar from "@components/BottomSheetSidebar";
import Button from "@components/Button";
import CheckBox from "@components/CheckBox";
import CustomScrollView from "@components/CustomScrollView";
import IconButton from "@components/IconButton";
import Input from "@components/Input";
import SvgIcon from "@components/SvgIcon";
import TransparentButton from "@components/TransparentButton";
import { SCREENS } from "@customConfig/route";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGlobalContext } from "@hooks/useGlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import messaging from '@react-native-firebase/messaging';
import { postCheckCanRegister } from "@services/api/auth";
import { LoginUser } from "@services/auth.service";
import { CDeviceInfo } from "@type/interfaces/Device";
import { checkResponse } from "@utils/checkResponse";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { routePush } from "@utils/routePush";
import { showToast } from "@utils/showToast";
import { loginFromSchema } from "@utils/validators";
import checkAppVersion from "@utils/version";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Login = () => {
  const { dispatch } = useGlobalContext();
  const insets = useSafeAreaInsets();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bioText, setBioText] = useState("");
  const [bioType, setBioType] = useState("");
  const [isShowBioButton, setIsShowBioButton] = useState(false);
  const [isShowBioCheckBox, setIsShowBioCheckBox] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const removeToken = async () => {
        setIsSubmitting(true);
        await AsyncStorage.removeItem("access_token");
        setIsSubmitting(false);
      };
      removeToken();
    }, [])
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginFromSchema),
    defaultValues: {
      username: "80444997",
      password: "Test1234!",
    },
  });

  const getUsername = useCallback(async () => {
    try {
      const encodedUsername = await AsyncStorage.getItem("username");
      if (encodedUsername !== null) {
        // eslint-disable-next-line no-undef
        const decodedUsername = atob(encodedUsername);
        setValue("username", decodedUsername);
      }
    } catch (error) {
      console.error("Failed to fetch the username:", error);
    }
  }, [setValue]);

  const requestNotificationPermission = useCallback(async () => {
    try {
      // First try to request permissions using Expo's API for Android 13+ (API 33+)
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.info("Expo notification request result:", finalStatus);
      }

      if (finalStatus !== "granted") {
        console.info("Expo notification permission not granted");
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    }
  }, []);

  const checkBioMetricAvailable = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return;
    }

    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      )
    ) {
      setBioText("Цаашид FaceID -аар нэвтрэх");
      setBioType("faceid");
    } else if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      )
    ) {
      setBioText("Цаашид хурууны хээгээр нэвтрэх");
      setBioType("fingerprint");
    }

    const isBiometricEnabled = await AsyncStorage.getItem("isBiometricEnabled");
    if (isBiometricEnabled === "true") {
      setIsShowBioButton(true);
      setIsShowBioCheckBox(false);
    } else {
      setIsShowBioCheckBox(true);
      setIsShowBioButton(false);
    }
  };

  useEffect(() => {
    getUsername();
    checkBioMetricAvailable();
    requestNotificationPermission();
  }, [getUsername, requestNotificationPermission]);

  const promptBiometric = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Баталгаажуулалт",
        fallbackLabel: "Нууц үгээр нэвтрэх",
      });

      if (result.success) {
        return true;
      } else {
        console.error(
          "Biometric authentication failed:",
          result?.success === false ? result.error : undefined
        );
        return false;
      }
    } catch (error) {
      console.error("Error during biometric authentication:", error);
      return false;
    }
  };

  const handleBioMetric = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const success = await promptBiometric();
      if (success) {
        AsyncStorage.multiGet(["username", "password"])
          .then((response) => {
            // eslint-disable-next-line no-undef
            const username = response[0][1] ? atob(response[0][1]) : "";
            // eslint-disable-next-line no-undef
            const password = response[1][1] ? atob(response[1][1]) : "";
            setValue("username", username);
            setValue("password", password);
            handleSubmit(onSignIn)();
          })
          .catch((error) => {
            throw error;
          });
      } else {
        showToast("", "Биометрик баталгаажуулалт амжилтгүй боллоо", "error");
      }
    } catch (error) {
      handleErrorExpo(error, "handleBioMetric");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const isVersionValid = await checkAppVersion();
      if (!isVersionValid) {
        setIsSubmitting(false); // Reset submitting state
        return;
      }
      const response = await postCheckCanRegister();
      if (!(await checkResponse(response))) {
        return;
      }
      await routePush(SCREENS.REGISTER);
    } catch (error) {
      handleErrorExpo(error, "handleRegister");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const isVersionValid = await checkAppVersion();
      if (!isVersionValid) {
        setIsSubmitting(false);
        return;
      }
      await routePush(SCREENS.RESET_PASS);
    } catch (error) {
      handleErrorExpo(error, "handleForgotPassword");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenewAccount = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const isVersionValid = await checkAppVersion();
      if (!isVersionValid) {
        setIsSubmitting(false);
        return;
      }
      await routePush(SCREENS.RENEW_ACCOUNT);
    } catch (error) {
      handleErrorExpo(error, "handleRenewAccount");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = async () => {
    try {
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("password");
      setValue("password", "");
      if (bioType) {
        setIsShowBioCheckBox(true);
      }
      AsyncStorage.setItem("isBiometricEnabled", "false");
      setIsShowBioButton(false);
    } catch (error) {
      console.error("Error clearing credentials:", error);
    }
  };

  const onSignIn = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const isVersionValid = await checkAppVersion();
      if (!isVersionValid) {
        setIsSubmitting(false);
        return;
      }
      let deviceInfo: CDeviceInfo = {
        device_id: Device.osBuildId,
        manufacturer: Device.manufacturer,
        model: Device.modelName,
        version: Device.osVersion,
        device_name: Device.deviceName,
        platform: Device.osName,
        idiom:
          Device.deviceType === Device.DeviceType.PHONE ? "phone" : "tablet",
        app_build: Application.nativeBuildVersion,
        app_version: Application.nativeApplicationVersion,
        is_device: Device.isDevice ? "True" : "False",
      };

      // if (deviceInfo.is_device == 'True') {
      //   try {
      //     const authStatus = await messaging().requestPermission();
      //     const enabled =
      //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      //     if (enabled) {
      //       const token = await messaging().getToken();
      //       if (token) {
      //         console.info('MESSAGE TOKEN', token);
      //         deviceInfo.device_token = token;
      //       }
      //     }
      //   } catch (error) {
      //     handleErrorExpo(error, 'onSignIn-firebase');
      //   }
      // }
      if (isChecked) {
        const success = await promptBiometric();
        if (success) {
          await AsyncStorage.setItem("isBiometricEnabled", "true");
        } else {
          showToast("", "Биометрик баталгаажуулалт амжилтгүй боллоо", "error");
          return;
        }
      }
      await LoginUser(
        formData.username,
        formData.password,
        deviceInfo,
        dispatch
      );
    } catch (error) {
      handleErrorExpo(error, "onSignIn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <View className="flex-1 bg-[#000A39] px-7">
      {/* Menu Button */}
      {/* <View className="absolute left-8 z-10" style={{top: insets.top + 20}}>
        <TouchableOpacity onPress={() => setIsSidebarVisible(true)}>
          <SvgIcon name="login_menu" height={30} width={30} />
        </TouchableOpacity>
      </View> */}

      {/* Background */}

      {/* Scrollable content */}
      <CustomScrollView>
        <View className="absolute inset-0 items-center justify-start">
          <Image
            source={require("@assets/images/login_background.png")}
            className="h-[60%] w-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1">
          <View
            className="items-center justify-center"
            style={{ marginTop: Dimensions.get("window").width * 0.2 }}
          >
            <Image source={require("@assets/images/login_logo.png")} />
          </View>
          <Text className="mb-1 text-center text-4xl font-bold text-white">
            e·leasing
          </Text>
          <View className="mt-14 rounded-2xl bg-[#001165] p-2">
            {/* Username */}
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onEndEditing={handleUsernameChange}
                  mode="username"
                  errorString={errors.username?.message}
                  keyboard="phone-pad"
                  maxLength={8}
                  placeholder="Утасны дугаар"
                  customBorderColor="transparent"
                />
              )}
              name="username"
            />
            <View className="h-[1px] w-full bg-[#25347C]" />
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChangeText={onChange}
                  value={value}
                  mode="password"
                  errorString={errors.password?.message}
                  customBorderColor="transparent"
                  placeholder="Нууц үг"
                />
              )}
              name="password"
            />
          </View>

          {/* Password */}
          <View className="w-full">
            {isShowBioCheckBox && (
              <View className="mt-4 w-full">
                <CheckBox
                  fillColor="#00D27B"
                  text={bioText}
                  isChecked={isChecked}
                  toggleCheckbox={toggleCheckbox}
                />
              </View>
            )}

            {/* Buttons */}
            <View className="mt-8 w-full gap-2">
              <Button
                onPress={handleSubmit(onSignIn)}
                text="Нэвтрэх"
                fillColor="#65E33F"
                isLoading={isSubmitting}
              />

              <View className="">
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-[28px] bg-[#2A45C4] py-3"
                >
                  <Text className="text-center text-lg font-semibold text-white">
                    Бүртгүүлэх
                  </Text>
                </TouchableOpacity>
                <View className="mt-10 w-full flex-col items-center self-center">
                  <TransparentButton
                    disabled={isSubmitting}
                    onPress={handleForgotPassword}
                    text="Нууц үгээ мартсан уу?"
                  />
                  <View className="mt-4">
                    <TransparentButton
                      disabled={isSubmitting}
                      onPress={handleRenewAccount}
                      text="Бүртгэл сэргээх"
                    />
                  </View>

                  {/* {isShowBioButton && (
                    <IconButton
                      icon={bioType}
                      className="p-4"
                      onPress={handleBioMetric}
                      disabled={isSubmitting}
                    />
                  )} */}
                </View>
              </View>
            </View>
          </View>
        </View>
      </CustomScrollView>

      {/* Sidebar */}
      <BottomSheetSidebar
        visible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />
    </View>
  );
};

export default Login;
