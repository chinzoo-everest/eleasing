import Button from "@components/Button";
import Header from "@components/Header";
import SettingsInput from "@components/SettingsInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePassword } from "@services/account.service";
import { LogOutUser } from "@services/auth.service";
import { changePasswordFormSchema } from "@utils/validators";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import PasswordCretCorrect from "@assets/images/pass.svg";
import PasswordCretWrong from "@assets/images/reject.svg";
import CustomScrollView from "@components/CustomScrollView";
import SvgIcon from "@components/SvgIcon";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import ChangePasswordInput from "@components/ChangePasswordInput";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";
import { cn } from "@utils/cn";

const ChangePassword = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordFormSchema),
    defaultValues: {
      old_password: "",
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

  const onSubmit = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const isSuccess = await changePassword(
        formData.old_password,
        formData.new_password
      );
      if (!isSuccess) {
        return;
      }
      await LogOutUser();
    } catch (error) {
      handleErrorExpo(error, "handleChangePassword");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Header
        title="Нууц үг солих"
        onBack={() => router.back()}
        bgColor="white"
        textColor="#1B3C69"
        showBottomLine={false}
      />

      <CustomScrollView>
        {/* Warning Icon + Message */}
        <View className="mt-10 items-center px-6">
          <SvgIcon name="warning" width={60} height={60} color="#FFC107" />
          <Text className="mt-6 text-center text-base text-[#1B3C69] font-semibold">
            Нууц үгээ алдахаас сэргийлж сар тутам шинэчилж байвал тохиромжтой.
          </Text>
        </View>

        {/* Inputs Section */}
        <View className="mt-10 px-6 space-y-6">
          {/* Old Password */}
          <View className="mb-16">
            <Controller
              control={control}
              name="old_password"
              render={({ field }) => (
                <ChangePasswordInput
                  label="Хуучин нууц үг"
                  mode="password"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="********"
                  errorString={errors.old_password?.message}
                  focusColor="#264EDC"
                />
              )}
            />
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Controller
              control={control}
              name="new_password"
              render={({ field }) => (
                <ChangePasswordInput
                  label="Шинэ нууц үг"
                  mode="password"
                  placeholder="********"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorString={errors.new_password?.message}
                  focusColor="#264EDC"
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
                placeholder="********"
                mode="password"
                value={field.value}
                onChangeText={field.onChange}
                errorString={errors.new_password_confirm?.message}
                focusColor="#264EDC"
              />
            )}
          />
        </View>

        {/* Password Criteria */}
        <View
          style={styles.checklistContainer}
          className="mx-6 mt-8 flex flex-col gap-y-3 rounded-lg bg-[#F8FAFD] px-4 py-5"
        >
          <CriteriaItem
            met={passwordCriteria.length}
            text="8 болон түүнээс олон тэмдэгтэй байх"
          />
          <CriteriaItem
            met={passwordCriteria.uppercase}
            text="Том үсэг агуулсан байх"
          />
          <CriteriaItem
            met={passwordCriteria.lowercase}
            text="Жижиг үсэг агуулсан байх"
          />
          <CriteriaItem met={passwordCriteria.digit} text="Тоо агуулсан байх" />
          <CriteriaItem
            met={passwordCriteria.specialChar}
            text="Тусгай тэмдэгт агуулсан байх"
          />
        </View>

        {/* Buttons */}

        <View className="mx-6 mt-10 mb-10 ">
          <Button
            className="w-full  rounded-2xl py-4"
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            isTextBold
            fillColor="#2A45C4"
            text="Хадгалах"
            disabled={!allCriteriaMet}
          />
        </View>
      </CustomScrollView>
    </View>
  );
};

const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
  <View style={styles.checkItem}>
    {met ? <PasswordCretCorrect /> : <PasswordCretWrong />}
    <Text style={styles.checkText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  checklistContainer: {
    borderWidth: 1,
    borderColor: "#E0E6ED",
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkText: {
    fontSize: 13,
    color: "#1B3C69",
    lineHeight: 18,
  },
});

export default ChangePassword;
