import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import SvgIcon from "@components/SvgIcon";
import { routePush } from "@utils/routePush";
import { SCREENS } from "../config/route";
import { BaseURLService } from "@services/baseURL.service";

type TypeChoice = "loan" | "leasing" | null;

const onboardingData = [
  {
    title: "HELLO E LEASING",
    description:
      "Барьцаатай болон барьцаагүй бэлэн мөнгөний зээлийг минутанд шийдэх үйлчилгээг үзүүлнэ.",
    image: require("@assets/images/onboard1.png"),
  },
  {
    title: "УРАМШУУЛАЛ",
    description: "Зээл авах тутамд таны зээлийн эрх нэмэгдэж, шимтгэл буурна.",
    image: require("@assets/images/onboard2.png"),
  },
  {
    title: "БАРЬЦААГҮЙ ЗЭЭЛ",
    description:
      "Хамгийн шуурхай ба хялбар аргаар санхүүгийн асуудлаа шийдэх үйлчилгээ.",
    image: require("@assets/images/onboard3.png"),
  },
];

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<TypeChoice>(null);

  const goToIndex = (next: number) => {
    setCurrentIndex(next);
  };

  const handleNext = () => {
    const lastSlideIndex = onboardingData.length - 1;
    if (currentIndex <= lastSlideIndex) {
      const next = Math.min(currentIndex + 1, onboardingData.length);
      goToIndex(next);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedType) return;

    if (selectedType === "loan") {
      BaseURLService.setBaseURL("https://pcmall2-api.everestapp.mn/");
      console.log("BaseURLService now:", BaseURLService.getCurrentBaseURL());
    } else {
      BaseURLService.setBaseURL("https://hleasing.everestapp.mn/");
      console.log("BaseURLService now:", BaseURLService.getCurrentBaseURL());
    }

    await routePush(SCREENS.LOGIN);
  };

  const onSelectType = (type: Exclude<TypeChoice, null>) => {
    setSelectedType(type);
  };

  const onSlides = currentIndex < onboardingData.length;

  return (
    <View className="flex-1 bg-[#2A45C4]">
      <StatusBar barStyle="light-content" backgroundColor="#2A45C4" />
      <SafeAreaView className="z-10">
        {currentIndex > 0 && (
          <TouchableOpacity className="mx-4" onPress={handleBack}>
            <SvgIcon name="back" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* No Animated.View, just a plain View */}
      <View className="flex-1">
        {onSlides ? (
          <View className="flex-1 justify-between px-8 pb-10 pt-24">
            <View>
              <Text className="text-2xl font-extrabold text-white">
                {onboardingData[currentIndex].title}
              </Text>
              <Text className="mt-4 text-lg leading-6 text-white opacity-90">
                {onboardingData[currentIndex].description}
              </Text>
            </View>

            <View className="flex-1 items-center justify-center mt-6">
              <Image
                source={onboardingData[currentIndex].image}
                resizeMode="contain"
                style={{ width: "95%", height: "55%" }}
              />
            </View>

            <View className="mt-8">
              <View className="mb-8 flex-row justify-center space-x-2">
                {onboardingData.map((_, i) => (
                  <View
                    key={i}
                    className={`h-1 rounded-full ${
                      i === currentIndex ? "w-14 bg-white" : "w-5 bg-[#6B7DD6]"
                    }`}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNext}
                className="self-end rounded-full bg-[#65E33F] px-10 py-3.5"
              >
                <Text className="text-lg font-bold text-white">
                  Үргэлжлүүлэх
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Selection page
          <View className="flex-1 justify-center bg-[#2A45C4]">
            <View className="mx-10 mt-6">
              <Text className="text-2xl font-bold text-white">
                НЭВТРЭХ СИСТЕМ
              </Text>
              <Text className="mr-10 mt-4 text-lg text-white opacity-90 leading-6">
                Та өөрийн бүртгэлтэй системээ сонгож “Үргэлжлүүлэх” товчыг дарна
                уу.
              </Text>
            </View>

            <View className="mx-8 mt-10 space-y-5">
              <TouchableOpacity
                activeOpacity={0.8}
                className={`rounded-2xl p-5 mb-5 ${
                  selectedType === "loan" ? "bg-blue-700" : "bg-blue-500"
                }`}
                onPress={() => onSelectType("loan")}
              >
                <View className="flex-row items-center space-x-4">
                  <View className="h-6 w-6 rounded-full border-2 border-white items-center justify-center">
                    {selectedType === "loan" && (
                      <View className="h-3.5 w-3.5 rounded-full bg-white" />
                    )}
                  </View>
                  <View className="ml-4 ">
                    <Text className="text-lg font-bold text-white">
                      ХЭРЭГЛЭЭНИЙ ЗЭЭЛ
                    </Text>
                    <Text className="text-sm text-white">
                      (Улаанбаатар хот)
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                className={`rounded-2xl p-5 ${
                  selectedType === "leasing" ? "bg-blue-700" : "bg-blue-500"
                }`}
                onPress={() => onSelectType("leasing")}
              >
                <View className="flex-row items-center space-x-4">
                  <View className="h-6 w-6 rounded-full border-2 border-white items-center justify-center">
                    {selectedType === "leasing" && (
                      <View className="h-3.5 w-3.5 rounded-full bg-white" />
                    )}
                  </View>
                  <View className="ml-4">
                    <Text className="text-lg font-bold text-white">
                      ХЭРЭГЛЭЭНИЙ ЛИЗИНГ
                    </Text>
                    <Text className="text-sm text-white">(Орон нутаг)</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={selectedType ? 0.8 : 1}
              disabled={!selectedType}
              onPress={handleConfirmSelection}
              className={`mx-8 mt-8 rounded-full px-10 py-4 ${
                selectedType ? "bg-[#65E33F]" : "bg-[#65E33F] opacity-40"
              }`}
            >
              <Text className="text-center text-lg font-bold text-white">
                Үргэлжлүүлэх
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default Onboarding;
