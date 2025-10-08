import CustomScrollView from "@components/CustomScrollView";
import Header from "@components/Header";
import RegInput from "@components/RegInput";
import React, { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { renewAccFormSchema } from "@utils/validators";
import { generateRenewAccCode } from "@services/auth.service";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChangePasswordInput from "@components/ChangePasswordInput";
import Button from "@components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";
import PasswordCretCorrect from "@assets/images/pass.svg";
import PasswordCretWrong from "@assets/images/reject.svg";
import { router } from "expo-router";

const RenewAccount = () => {
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(renewAccFormSchema),
    defaultValues: {
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await AsyncStorage.removeItem("access_token");
      const result = await generateRenewAccCode(data.reg_no);
      if (!result) return;

      await routePush(SCREENS.VERIFY_OTP, {
        mode: "recoverAccount",
        regNo: data.reg_no,
        phoneNo: result.data,
        password: data.new_password,
      });
    } catch (error) {
      handleErrorExpo(error, "RenewAccount - onSubmit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Бүртгэл сэргээх"
        onBack={() => router.back()}
        bgColor="#FFFFFF"
        textColor="#0B0B13"
      />

      <CustomScrollView>
        <View className="flex-1 items-center justify-start px-6 mt-4">
          {/* Illustration */}
          <Image
            source={require("@assets/images/reset_phone.png")}
            style={{ width: 240, height: 240, marginBottom: 20 }}
            resizeMode="contain"
          />

          {/* Registration number */}
          <View className="w-full">
            <Controller
              control={control}
              name="reg_no"
              render={({ field }) => (
                <RegInput
                  isReadOnly={isSubmitting}
                  label="Регистрийн дугаар"
                  placeholder=""
                  backgroundColor="#fff"
                  onChangeText={(value) => field.onChange(value)}
                  errorString={errors.reg_no?.message}
                />
              )}
            />
          </View>

          {/* Password requirement checklist */}
          <View
            style={styles.checklistContainer}
            className="flex flex-col gap-y-3 px-3 py-4 rounded-xl bg-[#F8F9FC] w-full mt-4"
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

          {/* New Password */}
          <View className="w-full mb-3 mt-10">
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

          {/* Confirm Password */}
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

          {/* Submit Button */}
          <Button
            isLoading={isSubmitting}
            className="w-full mt-8 rounded-3xl"
            onPress={handleSubmit(onSubmit)}
            isTextBold
            text="Баталгаажуулах"
            fillColor="#2A45C4"
            disabled={!allCriteriaMet}
          />
        </View>
      </CustomScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  checklistContainer: {
    paddingTop: 10,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkText: {
    fontSize: 13,
    color: "#1B3C69",
    lineHeight: 18,
    opacity: 0.8,
  },
});

export default RenewAccount;
