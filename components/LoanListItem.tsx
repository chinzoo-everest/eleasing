// components/LoanListItem.tsx
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CLoanInfo } from "@type/interfaces/Loan";

const formatLocalDate = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

type Derived = {
  REMAINING_FEE: number;
  REMAINING_PRE: number;
  IS_FEE_PAY: boolean;
  IS_PRE_PAY: boolean;
  REMAINING_TOTAL_FEE: number;
  TOTAL_PERIOD_BALANCE: number;
};

type Props = {
  item: CLoanInfo;
  onPress: () => void;
  /** optional precomputed derived from parent useMemo */
  derived?: Derived | null;
};

const Pill = ({
  text,
  tone = "success",
}: {
  text: string;
  tone?: "success" | "danger";
}) => {
  const base =
    "px-2 py-1 rounded-full text-[11px] font-semibold border mr-2 mt-1";
  if (tone === "success") {
    return (
      <View className={`${base} bg-[#E6F7EC] border-[#00C853]`}>
        <Text className="text-[#00C853] text-xs">{text}</Text>
      </View>
    );
  }
  return (
    <View className={`${base} bg-[#FEF2F2] border-[#EF4444]`}>
      <Text className="text-[#EF4444] text-xs">{text}</Text>
    </View>
  );
};

const LoanListItem = ({ item, onPress, derived }: Props) => {
  const startDate = item.LOAN_DATE;
  const endDate = item.PLAN_FINISH;
  const amount = item.AMT || 0;

  const isNormal = endDate && new Date() <= new Date(endDate);

  // Use parent-derived if provided; otherwise compute here (same math as your useMemo).
  const localDerived = useMemo<Derived>(() => {
    if (derived) return derived as Derived;

    const SERVICE_AMT = item.SERVICE_AMT || 0;
    const LOAN_FEE = item.LOAN_FEE || 0;
    const PAID_FEE = item.PAID_FEE || 0;
    const PRE_AMT = item.PRE_AMT || 0;
    const PAID_PRE_AMT = item.PAID_PRE_AMT || 0;
    const LOAN_AMT = item.LOAN_AMT || 0;
    const INT_AMT = item.INT_AMT || 0;
    const LOSS_AMT = item.LOSS_AMT || 0;

    const REMAINING_FEE = SERVICE_AMT + LOAN_FEE - PAID_FEE;
    const REMAINING_PRE = PRE_AMT - PAID_PRE_AMT;

    // NOTE: spec said "more than one" -> treat threshold as > 1 (₮1)
    const IS_FEE_PAY = REMAINING_FEE > 1;
    const IS_PRE_PAY = REMAINING_PRE > 1;

    const REMAINING_TOTAL_FEE = REMAINING_FEE + REMAINING_PRE;
    const TOTAL_PERIOD_BALANCE = LOAN_AMT + INT_AMT + LOSS_AMT;

    return {
      REMAINING_FEE,
      REMAINING_PRE,
      IS_FEE_PAY,
      IS_PRE_PAY,
      REMAINING_TOTAL_FEE,
      TOTAL_PERIOD_BALANCE,
    };
  }, [derived, item]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-4 flex-row overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      {/* Left: dates */}
      <View className="w-[40%] bg-[#001E60] px-4 py-5 justify-center">
        <View className="mb-3">
          <Text className="text-xs text-[#9CA3AF]">Эхлэх хугацаа</Text>
          <Text className="text-base font-bold text-white">
            {formatLocalDate(startDate)}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-[#9CA3AF]">Дуусах хугацаа</Text>
          <Text className="text-base font-bold text-white">
            {formatLocalDate(endDate)}
          </Text>
        </View>
      </View>

      {/* Right: info */}
      <View className="flex-1 flex-col px-5 py-5 justify-center bg-[#F9FAFB] rounded-r-2xl">
        <Text className="text-sm text-gray-500">Зээлийн дүн</Text>
        <Text className="text-2xl font-bold text-[#001E60] mb-2">
          ₮
          {amount.toLocaleString("mn-MN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>

        <View className="flex-row flex-wrap items-center">
          {isNormal ? (
            <Pill text="хэвийн" tone="success" />
          ) : (
            <Pill text="хэвийн бус" tone="danger" />
          )}

          {localDerived.IS_FEE_PAY && (
            <Pill text="Шимтгэл төлөгдөөгүй" tone="danger" />
          )}
          {localDerived.IS_PRE_PAY && (
            <Pill text="Урьдчилгаа төлөгдөөгүй" tone="danger" />
          )}
        </View>

        {/* <View className="mt-3">
          <ProgressBar
            progress={(item.AMT || 1) - (item.BALANCE || 0)}
            min={0}
            max={item.AMT || 1}
            prodType={item.APP_PROD_TYPE}
          />
        </View> */}
      </View>
    </TouchableOpacity>
  );
};

export default LoanListItem;
