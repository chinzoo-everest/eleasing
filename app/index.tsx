import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import SvgIcon from "@components/SvgIcon";
import { routePush } from "@utils/routePush";
import { SCREENS } from "../config/route";
import { BaseURLService } from "@services/baseURL.service";

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
  const [selectedType, setSelectedType] = useState<"loan" | "leasing" | null>(
    null
  );
  const imageFade = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length) {
      Animated.timing(imageFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => prev + 1);
        imageFade.setValue(1);
      });
    } else {
      handleStart();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      Animated.timing(imageFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => prev - 1);
        imageFade.setValue(1);
      });
    }
  };

  const handleStart = async () => {
    await routePush(SCREENS.LOGIN);
  };

  const handleSelectType = async (type: "loan" | "leasing") => {
    setSelectedType(type);

    // Uses BaseURLService directly — no shared code modification
    if (type === "loan") {
      BaseURLService.setBaseURL("https://pcmall2-api.everestapp.mn/");
      console.log("BaseURLService now:", BaseURLService.getCurrentBaseURL());
    } else {
      BaseURLService.setBaseURL("https://hleasing.everestapp.mn/");
      console.log("BaseURLService now:", BaseURLService.getCurrentBaseURL());
    }

    // Skip backend handling for now
    await routePush(SCREENS.LOGIN);
  };

  return (
    <View className="flex-1 bg-[#2A45C4]">
      <StatusBar barStyle="light-content" backgroundColor="#2A45C4" />
      <SafeAreaView className="absolute left-0 right-0 top-0 z-10">
        {currentIndex > 0 && currentIndex < onboardingData.length && (
          <TouchableOpacity className="mx-4 mt-4" onPress={handleBack}>
            <SvgIcon name="back" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      <Animated.View className="flex-1" style={{ opacity: imageFade }}>
        {currentIndex < onboardingData.length ? (
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
                style={{
                  width: "95%",
                  height: "55%",
                }}
              />
            </View>

            <View className="mt-8">
              {/* Indicator — only for first 3 pages */}
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
          <View className="flex-1 justify-center bg-[#2A45C4]">
            <View className="mx-10 mt-6">
              <Text className="text-2xl font-bold text-white">
                НЭВТРЭХ СИСТЕМ
              </Text>
              <Text className="mr-10 mt-4 text-lg text-white opacity-90 leading-6">
                Та өөрийн бүртгэлтэй системээ сонгож үргэлжлүүлэх товчыг дарна
                уу.
              </Text>
            </View>

            <View className="mx-8 mt-10 space-y-5">
              <TouchableOpacity
                activeOpacity={0.8}
                className={`rounded-2xl p-5 ${
                  selectedType === "loan" ? "bg-blue-700" : "bg-blue-500"
                }`}
                onPress={() => handleSelectType("loan")}
              >
                <View className="flex-row items-center space-x-4">
                  <View
                    className={`h-6 w-6 rounded-full border-2 ${
                      selectedType === "loan"
                        ? "border-white bg-white"
                        : "border-white"
                    }`}
                  />
                  <View>
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
                onPress={() => handleSelectType("leasing")}
              >
                <View className="flex-row items-center space-x-4">
                  <View
                    className={`h-6 w-6 rounded-full border-2 ${
                      selectedType === "leasing"
                        ? "border-white bg-white"
                        : "border-white"
                    }`}
                  />
                  <View>
                    <Text className="text-lg font-bold text-white">
                      ХЭРЭГЛЭЭНИЙ ЛИЗИНГ
                    </Text>
                    <Text className="text-sm text-white">(Орон нутаг)</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default Onboarding;
