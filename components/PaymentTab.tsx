import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import {
  getProductColorByType,
  getProductTextColorByType,
} from "utils/getProductColor";
import { MotiView } from "moti";
import { cn } from "@utils/cn";

type PaymentTabProps = {
  prodType: number;
  paddingContainer?: string;
  view1: React.ReactNode;
  view2: React.ReactNode;
  text1?: string;
  text2?: string;
};

const PaymentTab = ({
  prodType,
  view1,
  view2,
  paddingContainer,
  text1 = "Шууд төлөх",
  text2 = "Дансаар төлөх",
}: PaymentTabProps) => {
  const [layout, setLayout] = useState<string>("first");

  const handleLayoutChange = (chosenLayout: string) => {
    if (chosenLayout === layout) return;
    setLayout(chosenLayout);
  };

  return (
    <View className={cn("flex-1", paddingContainer)}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 600,
          delay: 200,
        }}
        className="mt-5"
      >
        <View className="h-14 flex-row rounded-full bg-[#fff]">
          <TouchableOpacity
            style={{
              backgroundColor: layout === "first" ? "#EBF6FC" : "",
              margin: 0,
              flex: 1,
              borderRadius: 23,
            }}
            className="items-center justify-center"
            onPress={() => handleLayoutChange("first")}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: layout === "first" ? "#1B3C69" : "#9CA3AF",
              }}
            >
              {text1}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: layout === "second" ? "#EBF6FC" : "#",
              margin: 0,
              flex: 1,
              borderRadius: 23,
            }}
            className="items-center justify-center"
            onPress={() => handleLayoutChange("second")}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: layout === "second" ? "#1B3C69" : "#9CA3AF",
              }}
            >
              {text2}
            </Text>
          </TouchableOpacity>
        </View>
      </MotiView>

      <View className="flex-1">
        {layout === "first" ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{
              opacity: 0,
              translateY: -20,
            }}
            transition={{
              type: "timing",
              duration: 400,
              delay: 150,
            }}
            className="flex-1"
            key="view1"
          >
            {view1}
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{
              opacity: 0,
              translateY: -20,
            }}
            transition={{
              type: "timing",
              duration: 400,
              delay: 150,
            }}
            className="flex-1"
            key="view2"
          >
            {view2}
          </MotiView>
        )}
      </View>
    </View>
  );
};

export default PaymentTab;
