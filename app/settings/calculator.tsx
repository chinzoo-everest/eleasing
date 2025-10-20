// app/(loan)/LoanCalculator.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Header from "@components/Header";

/** ----- helpers ----- */
const parseNumber = (text: string) => {
  const t = (text || "").replace(/[,\s₮%]/g, "");
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
};

const formatNumber = (n: number, fractionDigits = 0) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(n) ? n : 0);

const formatCurrencyMNT = (n: number, fractionDigits = 2) =>
  `${formatNumber(n, fractionDigits)} ₮`;

const pmt = (rate: number, nper: number, pv: number) => {
  if (!rate) return pv / nper;
  return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
};

const Calculator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [amount, setAmount] = useState<string>("100,000");
  const [period, setPeriod] = useState<string>("12");
  const [interest, setInterest] = useState<string>("1.00");

  const monthlyPayment = useMemo(() => {
    const amt = parseNumber(amount);
    const per = parseNumber(period);
    const rate = parseNumber(interest) / 100;
    if (amt <= 0 || per <= 0) return 0;
    return pmt(rate, per, amt);
  }, [amount, period, interest]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Header
        title="Зээлийн тооцоолуур"
        onBack={() => router.back()}
        showBottomLine={false}
        bgColor="#fff"
        textColor="#1B3C69"
      />

      <ScrollView
        className="flex-1 px-7"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount */}
        <View className="mt-20  border-b border-b-[#99A0C1]">
          <Text className="mb-1 text-right text-[12px] text-[#768AA4]">
            Зээлийн хэмжээ
          </Text>
          <TextInput
            value={amount}
            onChangeText={(t) => setAmount(t)}
            onBlur={() => setAmount(formatNumber(parseNumber(amount), 0))}
            keyboardType="numeric"
            placeholder="100,000"
            placeholderTextColor="#A2B0C6"
            className="text-right text-[34px] font-semibold text-[#496387]"
            selectTextOnFocus={true}
          />
          <View className="mt-2 h-[1px] w-full bg-[#C0C5D9]" />
        </View>

        {/* Period + Interest */}
        <View className="mt-8 flex-row gap-3">
          {/* Period */}
          <View className="flex-1">
            <Text className="mb-1 text-right text-[12px] text-[#768AA4]">
              Зээлийн хугацаа
            </Text>
            <TextInput
              value={period}
              onChangeText={(t) => setPeriod(t)}
              onBlur={() => setPeriod(formatNumber(parseNumber(period), 0))}
              keyboardType="numeric"
              placeholder="12"
              placeholderTextColor="#A2B0C6"
              className="text-right text-[34px] font-semibold text-[#496387]"
              selectTextOnFocus={true}
            />
            <View className="mt-2 h-[1px] w-full bg-[#99A0C1]" />
          </View>

          {/* Interest (monthly %) */}
          <View className="flex-1">
            <Text className="mb-1 text-right text-[12px] text-[#768AA4]">
              Зээлийн хүү
            </Text>
            <TextInput
              value={interest}
              onChangeText={(t) => setInterest(t)}
              onBlur={() => {
                const val = parseNumber(interest);
                setInterest(formatNumber(val, 2));
              }}
              keyboardType="numeric"
              placeholder="1.00"
              placeholderTextColor="#A2B0C6"
              className="text-right text-[34px] font-semibold text-[#496387]"
              selectTextOnFocus={true}
            />
            <View className="mt-2 h-[1px] w-full bg-[#99A0C1]" />
          </View>
        </View>

        {/* Monthly payment card */}
        <View className="mt-9 rounded-lg bg-[#F8F8F8] px-5 py-4">
          <Text className="text-right text-[12px] text-[#768AA4]">
            Зээлийн сарын төлбөр
          </Text>
          <Text className="mt-1 text-right text-[34px] font-semibold text-[#496387]">
            {formatCurrencyMNT(monthlyPayment, 2)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Calculator;
