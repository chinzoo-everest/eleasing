import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MotiView } from "moti";
import { cn } from "@utils/cn";

type LayoutType = "first" | "second";

type PaymentTabProps = {
  prodType?: number;
  paddingContainer?: string;
  view1: React.ReactNode;
  view2: React.ReactNode;
  text1?: string;
  text2?: string;
  remainingPre?: number;
  remainingFee?: number;
  disableView2?: boolean;
  initialIndex?: 0 | 1;
  onTabChange?: (index: 0 | 1) => void;
};

const PaymentTab: React.FC<PaymentTabProps> = ({
  prodType,
  view1,
  view2,
  paddingContainer,
  text1 = "Шууд төлөх",
  text2 = "Дансаар төлөх",
  remainingPre = 0,
  remainingFee = 0,
  disableView2 = false,
  initialIndex = 0,
  onTabChange,
}) => {
  const computedDisableView2 =
    disableView2 || remainingPre > 0 || remainingFee > 0;

  const [layout, setLayout] = useState<LayoutType>(
    computedDisableView2 && initialIndex === 1
      ? "first"
      : initialIndex === 1
        ? "second"
        : "first"
  );

  useEffect(() => {
    if (computedDisableView2 && layout === "second") {
      setLayout("first");
      onTabChange?.(0);
    }
  }, [computedDisableView2, layout, onTabChange]);

  const handleLayoutChange = (chosenLayout: LayoutType): void => {
    if (chosenLayout === layout) return;
    if (chosenLayout === "second" && computedDisableView2) return;
    setLayout(chosenLayout);
    onTabChange?.(chosenLayout === "first" ? 0 : 1);
  };

  return (
    <View className={cn("flex-1", paddingContainer)}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 200 }}
        className="mt-5"
      >
        <View className="h-14 flex-row rounded-full bg-white shadow-lg">
          <TouchableOpacity
            className={cn(
              "flex-1 items-center justify-center rounded-full",
              layout === "first" ? "bg-[#2A45C4]" : ""
            )}
            onPress={() => handleLayoutChange("first")}
            activeOpacity={0.8}
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                layout === "first" ? "text-[#fff]" : "text-[#9CA3AF]"
              )}
            >
              {text1}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={cn(
              "flex-1 items-center justify-center rounded-full",
              layout === "second" ? "bg-[#2A45C4]" : "",
              computedDisableView2 ? "opacity-40" : ""
            )}
            onPress={() => handleLayoutChange("second")}
            activeOpacity={computedDisableView2 ? 1 : 0.8}
            disabled={computedDisableView2}
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                layout === "second" ? "text-[#fff]" : "text-[#9CA3AF]"
              )}
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
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ type: "timing", duration: 400, delay: 150 }}
            className="flex-1"
            key="view1"
          >
            {view1}
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ type: "timing", duration: 400, delay: 150 }}
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
