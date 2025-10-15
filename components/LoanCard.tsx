import React, { useMemo } from "react";
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import SvgIcon from "@components/SvgIcon";
import { CCustProd, CScreen } from "@type/interfaces/Customer";
import { Config } from "@customConfig/config";
import { cn } from "@utils/cn";

type Props = {
  source: CCustProd;
  screenData?: CScreen;
  handleGetLoan?: (source: CCustProd) => void;
  cardWidth?: number;
  index: number;
};

const CARD_BG = require("@assets/images/loancard.png");

const LoanCard = React.memo(({ source, handleGetLoan, cardWidth }: Props) => {
  const windowWidth = Dimensions.get("window").width;
  const width = cardWidth || windowWidth * 0.92;
  const height = Math.round(windowWidth * 0.5);

  const limit = Math.max(0, source?.LOAN_LIMIT ?? 0);
  const used = Math.max(0, source?.LOAN_AMT ?? 0);
  const remaining = Math.max(0, limit - used);

  const formatMNT = (n: number) =>
    `₮${n.toLocaleString("mn-MN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatExpiry = (v?: string | number | Date) => {
    const d = new Date(v ?? "");
    if (isNaN(d.getTime())) return "—";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}.${mm}.${dd} `;
  };

  const rightAlignSmall = useMemo(
    () =>
      source.APP_PROD_TYPE === Config.DIGITAL_PROD_TYPE ||
      source.APP_PROD_TYPE === Config.CAR_PROD_TYPE,
    [source.APP_PROD_TYPE]
  );

  return (
    <View
      accessibilityRole="button"
      style={{ width, height }}
      className="overflow-hidden rounded-3xl bg-[#001372] shadow-lg ring-1 ring-white/20"
    >
      <ImageBackground
        source={CARD_BG}
        resizeMode="cover"
        style={{ flex: 1 }}
        imageStyle={{ borderRadius: 24 }}
      >
        {/* Top content */}
        <View className="flex-1 flex-row justify-between px-5">
          {/* Left block: amounts */}
          <View className="flex-col justify-center">
            <View className=" mb-9">
              <Text className="text-white/80 text-xs mb-2">Зээлийн эрх</Text>
              <Text
                className="text-white font-bold text-lg "
                allowFontScaling={false}
              >
                {formatMNT(limit)}
              </Text>
            </View>

            <View className="">
              <Text className="text-white/80 text-xs mb-2">Үлдэгдэл эрх</Text>
              <Text
                className="text-white font-bold text-lg"
                allowFontScaling={false}
              >
                {formatMNT(remaining)}
              </Text>
            </View>
          </View>

          {/* Right block: logo + title + expiry */}
          <View
            className={cn("justify-center items-center", rightAlignSmall && "")}
          >
            <View className="flex-col items-center">
              <SvgIcon name="loancardicon" width={43.5} height={43.5} />
              <Text
                className="text-white text-base font-bold mt-2"
                numberOfLines={1}
              >
                {source?.NAME || "Дижитал зээл"}
              </Text>
            </View>

            <Text className="text-xs text-white/80 mt-6">
              Эрхийн хүчинтэй хугацаа
            </Text>
            <Text className="text-white text-base font-medium mt-1">
              {formatExpiry(source?.EXP_DATE)}
            </Text>
          </View>
        </View>

        {/* bottom spacer (buttons intentionally omitted) */}
        <View className="h-2" />
      </ImageBackground>
    </View>
  );
});

LoanCard.displayName = "LoanCard";
export default LoanCard;
