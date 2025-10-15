import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "@components/Header";
import Button from "@components/Button";
import SettingsInput from "@components/SettingsInput";
import CustomScrollView from "@components/CustomScrollView";

import {
  checkUsername,
  generateVerifyPhoneOTP,
} from "@services/account.service";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { changePhoneFormSchema } from "@utils/validators";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";
import SvgIcon from "@components/SvgIcon";
import InviteInput from "@components/InviteInput";

const ChangePhone = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePhoneFormSchema),
    defaultValues: {
      phone_no: "",
    },
  });

  const onSubmit = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const checkResult = await checkUsername(formData.phone_no);
      if (!checkResult) return;

      const result = await generateVerifyPhoneOTP(formData.phone_no);
      if (!result) return;

      await routePush(SCREENS.VERIFY_OTP, {
        phoneNo: formData.phone_no,
        mode: "changePhone",
      });
    } catch (error) {
      handleErrorExpo(error, "ChangePhone - onSubmit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Header
        title="Утасны дугаар солих"
        onBack={() => router.back()}
        bgColor="white"
        textColor="#1B3C69"
        showBottomLine={false}
      />

      <CustomScrollView>
        {/* Content Section */}
        <View className="flex-1 items-center justify-start px-6 mt-8">
          {/* Subtitle */}
          <Text className="text-[#768AA4] text-center mb-10 leading-6 mx-5 ">
            Заавал өөрийн утасны дугаарыг оруулах бөгөөд таны дугаарт
            баталгаажуулах код илгээж баталгаажуулна.
          </Text>

          {/* ✅ SVG Illustration */}
          <View className="items-center mb-20">
            <Image source={require("@assets/images/changephone.png")} />
          </View>

          {/* Input Field */}
          <View className="w-full">
            <Controller
              control={control}
              name="phone_no"
              render={({ field }) => (
                <InviteInput
                  label="Шинэ утасны дугаар"
                  value={field.value}
                  maxLength={9}
                  keyboard="number-pad"
                  onChangeText={field.onChange}
                  focusColor="#264EDC"
                />
              )}
            />
          </View>
        </View>

        {/* Bottom Button */}
        <View className="mx-6 mt-10 mb-10">
          <Button
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            text="Код авах"
            className="w-full rounded-2xl py-4"
            textColor="#FFFFFF"
            fillColor="#264EDC"
            isTextBold
          />
        </View>
      </CustomScrollView>
    </View>
  );
};

export default ChangePhone;
