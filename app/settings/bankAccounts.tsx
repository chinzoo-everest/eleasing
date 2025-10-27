import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { GlobalContext } from "@context/GlobalContext";
import { useRouter } from "expo-router";
import { getBankName } from "@utils/getBankName";
import Header from "@components/Header";
import { CCustBank, CCustomer } from "@type/interfaces/Customer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomScrollView from "@components/CustomScrollView";
import { routePush } from "@utils/routePush";
import { showToast } from "@utils/showToast";
import { SCREENS } from "@customConfig/route";

const BankAccounts: React.FC = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const [defaultBank, setDefaultBank] = useState<CCustBank | null>(null);
  const [registeredBanks, setRegisteredBanks] = useState<CCustBank[]>([]);
  const insets = useSafeAreaInsets();
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer | undefined>(
    undefined
  );
  const hasNoBanks = !defaultBank && registeredBanks.length === 0;

  useEffect(() => {
    const currentUser = context?.state?.currentUser as CCustomer | undefined;
    const banks = currentUser?.BANK_LIST || [];

    setCurrentCustomer(currentUser);

    let defaultAcc: CCustBank | null =
      banks.find((bank) => bank.IS_DEFAULT === "Y") || null;
    const otherBanks = banks.filter((bank) => bank.IS_DEFAULT !== "Y");

    if (!defaultAcc && otherBanks.length > 0) {
      defaultAcc = otherBanks[0];
      setRegisteredBanks(otherBanks.slice(1));
    } else {
      setRegisteredBanks(otherBanks);
    }

    setDefaultBank(defaultAcc);
  }, [context?.state]);

  const handleEditBank = async (bank: CCustBank): Promise<void> => {
    if (!currentCustomer) return;
    if (
      !(currentCustomer.ONLINE_CONT === 0 || currentCustomer.ONLINE_CONT === 2)
    ) {
      showToast(
        "Анхааруулга",
        "Уучлаарай та банкны дансаа засах боломжгүй төлөвт байна",
        "error"
      );
      return;
    }
    await routePush(SCREENS.MODIFY_BANK, { bank: JSON.stringify(bank) });
  };

  return (
    <View className="flex-1 bg-HDefault">
      <View className="bg-[#EBF6F3]" style={{ paddingTop: insets.top }} />
      <Header
        title="Банкны данс"
        onBack={() => router.back()}
        bgColor="#EBF6F3"
      />
      <CustomScrollView className="px-4">
        {hasNoBanks ? (
          <View className="mt-12 items-center justify-center">
            <Text className="text-lg text-gray-500">
              Бүртгэлтэй данс байхгүй байна.
            </Text>
          </View>
        ) : (
          <View className="mt-8 space-y-3">
            {defaultBank && (
              <View>
                <Text className="mb-2 text-lg font-bold text-black">
                  Үндсэн данс
                </Text>
                <TouchableOpacity
                  onPress={() => handleEditBank(defaultBank)}
                  className="flex-row items-center rounded-lg border border-[#7AB49B] px-4 py-4"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EAF2F1]">
                    <Image
                      source={{ uri: defaultBank.LOGO_URL }}
                      className="h-6 w-6 rounded-full"
                      resizeMode="contain"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-medium text-[#3B8361]">
                      {getBankName(defaultBank.L_CODE || "")}
                    </Text>
                    <Text className="text-lg font-semibold text-black">
                      {defaultBank.ACC_NO}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {registeredBanks.length > 0 && (
              <View className="mt-5">
                <Text className="mb-2 text-lg font-bold text-black">
                  Бүртгэлтэй данс
                </Text>
                {registeredBanks.map((bank) => (
                  <TouchableOpacity
                    key={`${bank.BANK_ID}-${bank.ACC_NO}`}
                    onPress={async () =>
                      await routePush(SCREENS.MODIFY_BANK, {
                        bank: JSON.stringify(bank),
                      })
                    }
                    className="mb-3 flex-row items-center rounded-lg border border-gray-300 px-4 py-4"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EAF2F1]">
                      <Image
                        source={{ uri: bank.LOGO_URL }}
                        className="h-6 w-6 rounded-full"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-medium text-[#3B8361]">
                        {getBankName(bank.L_CODE || "")}
                      </Text>
                      <Text className="text-lg font-semibold text-black">
                        {bank.ACC_NO}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="mx-4 mt-6">
          <TouchableOpacity
            className="flex-row items-center justify-center rounded border border-dashed border-[#3DA48D] px-4 py-2"
            onPress={async () =>
              await routePush(SCREENS.MODIFY_BANK, {
                bank: JSON.stringify(null),
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Данс нэмэх"
          >
            <Text className="text-center text-4xl font-extralight text-[#3DA48D]">
              +
            </Text>
          </TouchableOpacity>
        </View>
      </CustomScrollView>
    </View>
  );
};

export default BankAccounts;
