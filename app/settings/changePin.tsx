import Button from "@components/Button";
import CustomScrollView from "@components/CustomScrollView";
import Header from "@components/Header";
import SettingsInput from "@components/SettingsInput";
import SvgIcon from "@components/SvgIcon";
import { GlobalContext } from "@context/GlobalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePinCode, recoverPin } from "@services/account.service";
import { showToast } from "@utils/showToast";
import { changePinCodeFormSchema } from "@utils/validators";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import ChangePassword from "./changePass";
import ChangePasswordInput from "@components/ChangePasswordInput";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";
import { cn } from "@utils/cn";

const ChangePin = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePinCodeFormSchema),
    defaultValues: {
      old_pin: "",
      new_pin: "",
      new_pin_confirm: "",
    },
  });

  const onSubmit = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await changePinCode(formData.old_pin, formData.new_pin);
      if (!result) return;
      router.back();
    } catch (error) {
      handleErrorExpo(error, "ChangePin - onSubmit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverPinCode = async () => {
    try {
      if (!context?.state?.currentUser?.CUST_ID) {
        showToast("", "Хэрэглэгчийн код хоосон байна", "error");
        return;
      }
      await recoverPin(context?.state?.currentUser?.CUST_ID.toString());
    } catch (error) {
      handleErrorExpo(error, "handleRecoverPinCode");
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Header
        title="Пин код солих"
        onBack={() => router.back()}
        bgColor="white"
        textColor="#1B3C69"
        showBottomLine={false}
      />

      <CustomScrollView>
        {/* Warning icon + text */}
        <View className="mt-10 items-center px-6">
          <SvgIcon name="warning" width={60} height={60} color="#FFC107" />
          <Text className="mt-6 text-center text-base text-[#1B3C69] font-semibold">
            Пин кодоо алдахаас сэргийлж сар тутам шинэчилж байвал тохиромжтой.
          </Text>
        </View>

        {/* Inputs */}
        <View className=" px-6 ">
          {/* Old PIN */}
          <View className="mb-16">
            <Controller
              control={control}
              name="old_pin"
              render={({ field }) => (
                <ChangePasswordInput
                  readonly={isSubmitting}
                  label="Хуучин пин код"
                  mode="password"
                  value={field.value}
                  maxLength={4}
                  placeholder="****"
                  keyboard="number-pad"
                  onChangeText={field.onChange}
                  errorString={errors.old_pin?.message}
                  focusColor="#264EDC"
                />
              )}
            />
          </View>

          {/* New PIN */}
          <View className="mb-4">
            <Controller
              control={control}
              name="new_pin"
              render={({ field }) => (
                <ChangePasswordInput
                  readonly={isSubmitting}
                  label="Шинэ пин код"
                  mode="password"
                  value={field.value}
                  maxLength={4}
                  keyboard="number-pad"
                  placeholder="****"
                  onChangeText={field.onChange}
                  errorString={errors.new_pin?.message}
                  focusColor="#264EDC"
                />
              )}
            />
          </View>

          {/* Confirm New PIN */}
          <Controller
            control={control}
            name="new_pin_confirm"
            render={({ field }) => (
              <ChangePasswordInput
                readonly={isSubmitting}
                label="Шинэ пин код давтах"
                mode="password"
                value={field.value}
                placeholder="****"
                maxLength={4}
                keyboard="number-pad"
                onChangeText={field.onChange}
                errorString={errors.new_pin_confirm?.message}
                focusColor="#264EDC"
              />
            )}
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className={cn(
            "flex-row items-center justify-center rounded-2xl bg-[#2E53F1] py-5 mb-4 mx-4"
          )}
          style={{ bottom: (insets.bottom || 0) + 8 }}
        >
          <Text className="text-base font-medium text-white">Хадгалах</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRecoverPinCode}
          className={cn(
            "absolute left-4 right-4 flex-row items-center justify-center rounded-2xl bg-[#E7EBF1] py-5"
          )}
          style={{ bottom: (insets.bottom || 0) + 8 }}
        >
          <Text className="text-base font-medium text-[#1B3C69]">
            Пин код сэргээх
          </Text>
        </TouchableOpacity>

        {/* <View className="mx-6 mt-10 mb-10">
          <Button
            className="w-full  rounded-2xl py-4"
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            isTextBold
            fillColor="#2A45C4"
            text="Хадгалах"
          />

          <Button
            className="w-full rounded-2xl mt-3 py-4"
            onPress={handleRecoverPinCode}
            text="Пин код сэргээх"
            fillColor="#E7EBF1"
            textColor="#1B3C69"
          />
        </View> */}
      </CustomScrollView>
    </View>
  );
};

export default ChangePin;
