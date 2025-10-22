import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "@components/Header";
import Button from "@components/Button";
import CustomScrollView from "@components/CustomScrollView";
import SvgIcon from "@components/SvgIcon";
import ChangeEmailInput from "@components/ChangeEmailInput";

import { generateVerifyEmailOTP } from "@services/account.service";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { changeEmailFormSchema } from "@utils/validators";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";

const ChangeEmail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changeEmailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await generateVerifyEmailOTP(formData.email);
      if (!result) return;

      await routePush(SCREENS.VERIFY_OTP, {
        mode: "changeEmail",
        email: formData.email,
      });
    } catch (error) {
      handleErrorExpo(error, "ChangeEmail - onSubmit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Header
        title="Имэйл хаяг солих"
        onBack={() => router.back()}
        bgColor="white"
        textColor="#1B3C69"
        showBottomLine={false}
      />

      <CustomScrollView>
        {/* Top Section */}
        <View className="flex-1 items-center justify-start px-6 mt-8">
          <Text className="text-[#1B3C69] text-center mb-10 leading-6 mx-5 ">
            Заавал өөрийн имэйл хаягийг оруулах бөгөөд таны имэйл-д
            баталгаажуулах код илгээж баталгаажуулна.
          </Text>
          {/* SVG Illustration */}
          <View className="items-center mb-20">
            <Image
              source={require("@assets/images/changeemail.png")}
              resizeMode="contain"
              className="w-[278px] h-[278px]"
            />
          </View>

          {/* Input Field */}
          <View className="w-full ">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <ChangeEmailInput
                  label="Имэйл хаяг"
                  value={field.value}
                  placeholder="example@email.com"
                  keyboard="email-address"
                  onChangeText={field.onChange}
                  errorString={errors.email?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="mx-6 mt-10 mb-10">
          <Button
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            text="Баталгаажуулах"
            className="w-full  rounded-2xl py-4"
            textColor="#FFFFFF"
            fillColor="#264EDC"
            isTextBold
          />
        </View>
      </CustomScrollView>
    </View>
  );
};

export default ChangeEmail;
