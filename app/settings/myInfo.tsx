import Header from "@components/Header";
import { GlobalContext } from "@context/GlobalContext";
import { CCustomer } from "@type/interfaces/Customer";
import React, { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomScrollView from "@components/CustomScrollView";
import Svg from "react-native-svg";
import SvgIcon from "@components/SvgIcon";

const MyInfo = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const [custInfo, setCustInfo] = useState<CCustomer | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (context) {
      setCustInfo(context.state.currentUser);
    }
  }, [context]);

  const customerInfoFields = [
    { title: "Ургийн овог", text: custInfo?.FAM_NAME },
    { title: "Овог", text: custInfo?.LAST_NAME },
    { title: "Нэр", text: custInfo?.FIRST_NAME },
    { title: "Регистрийн дугаар", text: custInfo?.REG_NO },
    { title: "Хүйс", text: custInfo?.GENDER },
    { title: "Утасны дугаар", text: custInfo?.PHONE1 },
    { title: "Имэйл хаяг", text: custInfo?.EMAIL },
  ];

  const getAddressParts = () => {
    const address =
      custInfo?.ADDR2 || custInfo?.L_ADDR || custInfo?.ADDR1 || "";
    return address
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part);
  };

  return (
    <View className="flex-1 bg-[#fff]" style={{ paddingTop: insets.top }}>
      <Header
        title="Хувийн тохиргоо"
        onBack={() => router.back()}
        bgColor="#fff"
        textColor="#1B3C69"
        showBottomLine={false}
      />

      <CustomScrollView className="flex-1   pt-6 px-7">
        <View className="flex-1">
          <View className="flex-row justify-start ">
            {/* ----- Personal Info Section ----- */}
            <SvgIcon name={"my_inf"} height={30} width={30} />
            <Text className="text-[#1B3C69] ml-5 text-lg font-bold self-center">
              Өөрийн мэдээлэл
            </Text>
          </View>

          <View className="h-px bg-[#C0BFBC] my-3" />

          {customerInfoFields.map((field, index) => (
            <View className="flex-col">
              <View key={index} className="mb-3 flex-row justify-between">
                <Text className="text-[#1B3C69] text-lg font-medium flex-1">
                  {field.text || "Мэдээлэл байхгүй"}
                </Text>
                <Text className="text-[#768AA4] text-xs ml-2 w-[35%] text-right self-center">
                  {field.title}
                </Text>
              </View>
              <View className="h-px bg-[#C0BFBC] my-2" />
            </View>
          ))}

          {/* ----- Address Section ----- */}
          <View className="mt-5">
            <Text className="text-[#1B3C69] text-lg font-bold ">
              Оршин суугаа хаяг
            </Text>

            <View className="h-px bg-[#C0BFBC] my-2" />

            {getAddressParts().length > 0 ? (
              getAddressParts().map((part, index) => (
                <View className="flex-col">
                  <View key={index} className="mb-3 flex-row justify-between">
                    <Text className="text-[#1B3C69] text-lg font-medium flex-1">
                      {part}
                    </Text>
                    <Text className="text-[#768AA4] text-xs ml-2 w-[35%] text-right self-center">
                      Хаяг {index + 1}
                    </Text>
                  </View>
                  <View className="h-px bg-[#C0BFBC] my-2" />
                </View>
              ))
            ) : (
              <Text className="text-[#1B3C69] text-lg font-medium flex-1">
                Мэдээлэл байхгүй
              </Text>
            )}
          </View>
        </View>
      </CustomScrollView>
    </View>
  );
};

export default MyInfo;
