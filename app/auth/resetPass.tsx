import CustomScrollView from "@components/CustomScrollView";
import Header from "@components/Header";
import RegInput from "@components/RegInput";
import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPassFormSchema } from "@utils/validators";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { generateVerifyCode } from "@services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingsInput from "@components/SettingsInput";
import Button from "@components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";
import PasswordCretCorrect from "@assets/images/pass.svg";
import PasswordCretWrong from "@assets/images/reject.svg";
import SvgIcon from "@components/SvgIcon";
import InviteInput from "@components/InviteInput";
import ChangePasswordInput from "@components/ChangePasswordInput";

const ResetPass = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPassFormSchema),
    defaultValues: {
      phone_no: "",
      reg_no: "",
      new_password: "",
      new_password_confirm: "",
    },
  });

  const newPassword = useWatch({
    control,
    name: "new_password",
    defaultValue: "",
  });

  const passwordCriteria = React.useMemo(
    () => ({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      digit: /[0-9]/.test(newPassword),
      specialChar: /[^A-Za-z0-9]/.test(newPassword),
    }),
    [newPassword]
  );

  const allCriteriaMet = React.useMemo(
    () =>
      passwordCriteria.length &&
      passwordCriteria.uppercase &&
      passwordCriteria.lowercase &&
      passwordCriteria.digit &&
      passwordCriteria.specialChar,
    [passwordCriteria]
  );

  const onSubmit = async (data: any) => {
    if (isSubmitting) return; // Prevent function from proceeding if already submitting
    setIsSubmitting(true); // Set submitting state to true

    try {
      await AsyncStorage.removeItem("access_token");
      const result = await generateVerifyCode(data.phone_no, data.reg_no);
      if (!result) return;

      await routePush(SCREENS.VERIFY_OTP, {
        mode: "resetPassword",
        regNo: data.reg_no,
        phoneNo: data.phone_no,
        password: data.new_password,
      });
    } catch (error) {
      handleErrorExpo(error, "ResetPass - onSubmit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Нууц үг сэргээх"
        onBack={() => router.back()}
        bgColor="#0B0B13"
      />
      <CustomScrollView>
        <View className="mt-5 flex-1 px-4">
          <View className="self-center">
            <Image
              source={require("@assets/images/reset_phone.png")}
              style={{ width: 278, height: 278, marginBottom: 20 }}
              resizeMode="contain"
            />
          </View>

          <View className="w-full">
            <Controller
              control={control}
              name="reg_no"
              render={({ field }) => (
                <RegInput
                  isReadOnly={isSubmitting}
                  label="Регистрийн дугаар"
                  backgroundColor="#fff"
                  placeholder=""
                  onChangeText={(value) => {
                    field.onChange(value);
                  }}
                  errorString={errors.reg_no?.message}
                />
              )}
            />
          </View>
          <Controller
            control={control}
            name="phone_no"
            render={({ field }) => (
              <InviteInput
                value={field.value}
                maxLength={9}
                keyboard="phone-pad"
                placeholder=""
                onChangeText={field.onChange}
              />
            )}
          />

          <View
            style={styles.checklistContainer}
            className="flex flex-col gap-y-4 px-4"
          >
            <View style={styles.checkItem}>
              {passwordCriteria.length ? (
                <PasswordCretCorrect />
              ) : (
                <PasswordCretWrong />
              )}
              <Text style={styles.checkText}>
                8 болон түүнээс олон тэмдэгтэй байх
              </Text>
            </View>
            <View style={styles.checkItem}>
              {passwordCriteria.uppercase ? (
                <PasswordCretCorrect />
              ) : (
                <PasswordCretWrong />
              )}
              <Text style={styles.checkText}>Том үсэг агуулсан байх</Text>
            </View>
            <View style={styles.checkItem}>
              {passwordCriteria.lowercase ? (
                <PasswordCretCorrect />
              ) : (
                <PasswordCretWrong />
              )}
              <Text style={styles.checkText}>Жижиг үсэг агуулсан байх</Text>
            </View>
            <View style={styles.checkItem}>
              {passwordCriteria.digit ? (
                <PasswordCretCorrect />
              ) : (
                <PasswordCretWrong />
              )}
              <Text style={styles.checkText}>Тоо агуулсан байх</Text>
            </View>
            <View style={styles.checkItem}>
              {passwordCriteria.specialChar ? (
                <PasswordCretCorrect />
              ) : (
                <PasswordCretWrong />
              )}
              <Text style={styles.checkText}>Тусгай тэмдэгт агуулсан байх</Text>
            </View>
          </View>
          <View className="mb-3 mt-10">
            <Controller
              control={control}
              name="new_password"
              render={({ field }) => (
                <ChangePasswordInput
                  label="Шинэ нууц үг"
                  mode="password"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorString={errors.new_password?.message}
                />
              )}
            />
          </View>
          <Controller
            control={control}
            name="new_password_confirm"
            render={({ field }) => (
              <ChangePasswordInput
                label="Шинэ нууц үг давтах"
                mode="password"
                value={field.value}
                onChangeText={field.onChange}
                errorString={errors.new_password_confirm?.message}
              />
            )}
          />
        </View>
        <Button
          isLoading={isSubmitting}
          className="mx-4 mt-5 rounded-3xl"
          onPress={handleSubmit(onSubmit)}
          isTextBold
          text="Баталгаажуулах"
          fillColor="#2A45C4"
          disabled={!allCriteriaMet}
        />
      </CustomScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  checklistContainer: {
    paddingTop: 15,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  checkText: {
    fontSize: 12,
    color: "#1B3C69",
    lineHeight: 18,
    opacity: 0.6,
  },
});

export default ResetPass;
