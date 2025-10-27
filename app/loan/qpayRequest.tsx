import { SCREENS } from "@customConfig/route";
import Header from "@components/Header";
import { CQPayResult } from "@type/interfaces/Response";
import { routePush } from "@utils/routePush";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomScrollView from "@components/CustomScrollView";

const QPay = () => {
  const { qpayData } = useLocalSearchParams<{ qpayData: string }>();
  const router = useRouter();
  const parsedQPayData: CQPayResult = JSON.parse(qpayData);
  const insets = useSafeAreaInsets();

  const handleBankUrl = async (url: string) => {
    await Linking.openURL(url);
    await routePush(SCREENS.HOME, {}, true);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="QPay төлбөр төлөх"
        onBack={() => router.back()}
        bgColor="#fff"
        textColor="#1A1A1A"
        showBottomLine={false}
      />

      <CustomScrollView>
        <View className="items-center mt-6">
          <Text className="text-lg font-semibold text-[#1A1A1A]">
            QPay уншуулна уу!
          </Text>

          <View className="mt-5 mb-8 border border-[#E5E7EB] rounded-2xl p-4">
            <Image
              source={{ uri: parsedQPayData.qrImage }}
              className="h-[160px] w-[160px] rounded-lg"
              resizeMode="contain"
            />
          </View>

          <View className="w-full px-6">
            {parsedQPayData.bankList.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleBankUrl(item.link)}
                className="flex-row items-center justify-between border-b border-[#E5E7EB] py-4"
              >
                <View className="flex-row items-center">
                  <View className="h-[36px] w-[36px]">
                    <Image
                      source={{ uri: item.logo }}
                      className="h-full w-full rounded-full object-contain"
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    className={`ml-3 text-base font-medium ${
                      item.selected
                        ? "text-[#0B0B13] font-semibold"
                        : "text-[#1A1A1A]"
                    }`}
                  >
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() =>
              handleBankUrl(parsedQPayData.bankList[0]?.link || "")
            }
            className="mt-8 mb-10 w-[90%] rounded-xl bg-[#4ADE80] py-4"
          >
            <Text className="text-center text-base font-semibold text-white">
              Төлөх
            </Text>
          </TouchableOpacity>
        </View>
      </CustomScrollView>
    </View>
  );
};

export default QPay;
