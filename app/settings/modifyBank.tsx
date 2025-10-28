import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Text, View, Image } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { GlobalContext } from "@context/GlobalContext";
import { CCustBank, CCustomer } from "@type/interfaces/Customer";
import { CBank } from "@type/interfaces/Combo";
import { bankFormSchema } from "@utils/validators";
import { loadCustomerData } from "@services/home.service";
import { showToast } from "@utils/showToast";
import {
  checkBankAccName,
  deleteBank,
  makeBankPrimary,
  saveBank,
} from "@services/basic.service";
import Header from "@components/Header";
import CustomScrollView from "@components/CustomScrollView";
import SettingsInput from "@components/SettingsInput";
import Button from "@components/Button";
import SettingsDropdown from "@components/SettingsDropDown";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@utils/cn";
import SvgIcon from "@components/SvgIcon";

const ModifyBank = () => {
  const router = useRouter();
  const { bank, isDefault } = useLocalSearchParams();
  const [bankData, setBankData] = useState<CCustBank>();
  const { state, dispatch } = useContext(GlobalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [bankComboValues, setBankComboValues] = useState<CBank[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();
  const insets = useSafeAreaInsets();
  // For manual tracking of account value

  useEffect(() => {
    if (!state) return;
    const { comboValue, currentUser } = state;
    setBankComboValues(comboValue.bank);
    setCurrentCustomer(currentUser);
  }, [state]);

  useEffect(() => {
    if (bank) {
      const parsedBank = JSON.parse(bank as string);
      setBankData(parsedBank);
    }
  }, [bank]);

  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bankFormSchema),
    defaultValues: {
      bank: 0,
      account: "",
    },
  });

  useEffect(() => {
    if (bankData) {
      setValue("bank", bankData.BANK_ID);
      setValue("account", String(bankData.ACC_NO));
    }
  }, [bankData, setValue, getValues]);

  const onSaveBank = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!currentCustomer) return;
      const checkAccNameResult = await checkBankAccName(
        formData.bank,
        formData.account
      );
      if (!checkAccNameResult) return;

      const requestData: CCustBank = {
        ...bankData,
        CUST_ID: currentCustomer.CUST_ID,
        CURR_CODE: "MNT",
        ACC_NO: formData.account,
        ACC_NAME: checkAccNameResult.name,
        BANK_ID: formData.bank,
        IS_DEFAULT: isDefault === "true" ? "Y" : "N",
        ROW_STATUS: !bankData ? "I" : "U",
      };

      const result = await saveBank(requestData);
      if (!result) return;

      await loadCustomerData(dispatch);
      showToast("Амжилттай", "Банкны дансыг амжилттай хадгаллаа", "success");
      router.back();
    } catch (error) {
      handleErrorExpo(error, "onSaveBank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBank = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      if (bankData) {
        const result = await deleteBank(bankData.ID);
        if (!result) return;
        await loadCustomerData(dispatch);
        showToast("Амжилттай", "Банкны данс устгагдлаа", "success");
        router.back();
      }
    } catch (error) {
      handleErrorExpo(error, "handleDeleteBank");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrimaryBank = async () => {
    if (isSettingPrimary) return;
    setIsSettingPrimary(true);
    try {
      if (bankData) {
        const result = await makeBankPrimary(bankData.ID);
        if (!result) return;
        await loadCustomerData(dispatch);
        showToast(
          "Амжилттай",
          "Банкны дансыг үндсэн дансаар сонголоо",
          "success"
        );
        router.back();
      }
    } catch (error) {
      handleErrorExpo(error, "handlePrimaryBank");
    } finally {
      setIsSettingPrimary(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Банкны данс"
        onBack={() => router.back()}
        bgColor="white"
        showBottomLine={false}
        textColor="#1B3C69"
      />
      <CustomScrollView className="pt-6">
        <View className="flex-1 items-center px-4">
          <View className="h-28 w-28 items-center justify-center rounded-full border border-dashed border-[#1B3C69]">
            <SvgIcon name="warning" width={50} height={50} />
          </View>
          <Text className="mt-6 text-xl font-bold text-[#1B3C69]">
            Банкны данс
          </Text>
          <Text className="mt-2 text-center text-sm text-[#1B3C69] opacity-70">
            Зөвхөн өөрийн нэр дээр бүртгэлтэй дансыг бүртгүүлнэ үү.
          </Text>

          <View className="mt-10 w-full">
            <Controller
              control={control}
              name="bank"
              render={({ field: { onChange, value } }) => (
                <SettingsDropdown
                  disabled={isSubmitting}
                  title="Банк сонгох"
                  errorString={errors.bank?.message}
                  items={bankComboValues ?? []}
                  selectedValue={value}
                  labelName="BANK_NAME"
                  valueName="BANK_ID"
                  onChange={onChange}
                  renderItem={(item, selected) => (
                    <View
                      className={cn(
                        "flex-row items-center justify-start gap-4 rounded-lg p-3",
                        selected ? "bg-[#fff]" : "bg-transparent"
                      )}
                    >
                      <Image
                        source={{ uri: item.LOGO_URL }}
                        resizeMode="contain"
                        className="h-6 w-6"
                      />
                      <Text
                        className={cn(
                          "text-base text-black",
                          selected ? "font-bold" : "font-normal"
                        )}
                      >
                        {item.BANK_NAME}
                      </Text>
                    </View>
                  )}
                />
              )}
            />

            <Controller
              control={control}
              name="account"
              render={({ field: { onChange, value } }) => (
                <SettingsInput
                  readonly={isSubmitting}
                  label="Банкны данс"
                  keyboard="number-pad"
                  placeholder="0000 000000"
                  value={value}
                  errorString={errors.account?.message}
                  onChangeText={onChange}
                />
              )}
            />

            {bankData && (
              <SettingsInput
                label="Дансны нэр"
                keyboard="default"
                value={bankData?.ACC_NAME}
                readonly={true}
              />
            )}
          </View>
        </View>

        <View className="mx-4 mt-10 space-y-2">
          {bankData?.IS_DEFAULT === "N" && (
            <>
              <Button
                isLoading={isDeleting}
                disabled={isSubmitting || isDeleting || isSettingPrimary}
                onPress={handleDeleteBank}
                isSecondary
                text="Устгах"
                fillColor="#1B3C69"
                textColor="white"
              />
              <Button
                className="mt-2"
                isLoading={isSettingPrimary}
                disabled={isSubmitting || isDeleting || isSettingPrimary}
                onPress={handlePrimaryBank}
                isSecondary
                text="Үндсэн данс болгох"
                fillColor="#2A45C4"
              />
            </>
          )}
          <Button
            className="mt-2"
            textColor="white"
            isLoading={isSubmitting}
            disabled={isSubmitting || isDeleting || isSettingPrimary}
            onPress={handleSubmit(onSaveBank)}
            text="Баталгаажуулах"
            fillColor="#65E33F"
          />
        </View>
      </CustomScrollView>
    </View>
  );
};

export default ModifyBank;
