import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { Ionicons, Feather } from "@expo/vector-icons";

type EbarimtLottery = {
  TRN_DATE: string | Date;
  TRN_DESC: string;
  BILL_ID: string;
  LOTTERY: string;
  AMT: number;
  QR_DATA: string;
};

const formatDate = (d: string | Date) => {
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
};

const formatAmt = (n: number) =>
  new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 }).format(n);

async function fetchEbarimtLotteries(): Promise<EbarimtLottery[]> {
  return Promise.resolve([
    {
      TRN_DATE: "2025-08-26T12:00:00Z",
      TRN_DESC: "Төлбөрийн бүртгэл",
      BILL_ID: "INV-000123",
      LOTTERY: "A1B2-C3D4-E5F6",
      AMT: 1250000,
      QR_DATA: "INV-000123|1250000|2025-08-26",
    },
    {
      TRN_DATE: "2025-09-11T09:30:00Z",
      TRN_DESC: "Сунгалтын төлбөр",
      BILL_ID: "INV-000124",
      LOTTERY: "Z9Y8-X7W6-V5U4",
      AMT: 980000,
      QR_DATA: "INV-000124|980000|2025-09-11",
    },
  ]);
}

const EbarimtCard: React.FC<{ item: EbarimtLottery }> = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="rounded-xl bg-white shadow-sm shadow-black/5">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="px-6 py-5 gap-2"
        accessibilityRole="button"
        accessibilityLabel="Expand transaction"
      >
        <View className="flex-row items-center gap-2">
          <Feather name="calendar" size={16} color="#496387" />
          <Text className="text-[14px] text-[#496387]">
            {formatDate(item.TRN_DATE)}
          </Text>
        </View>
        <Text className="text-[14px] text-[#496387] font-medium">
          {item.TRN_DESC}
        </Text>
      </Pressable>

      {open && (
        <View className="px-5 pb-6">
          <View className="gap-2">
            <View className="gap-1">
              <Text className="text-[14px] text-[#496387] font-bold">
                ДДТД:
              </Text>
              <Text className="text-[14px] text-[#496387]">{item.BILL_ID}</Text>
            </View>

            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-[14px] text-[#496387] font-bold">
                Сугалааны дугаар:
              </Text>
              <Text className="text-[14px] text-[#496387] font-bold">
                {item.LOTTERY}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-[14px] text-[#496387] font-bold">
                Бүртгүүлэх дүн:
              </Text>
              <Text className="text-[14px] text-[#496387] font-bold">
                {formatAmt(item.AMT)}
              </Text>
            </View>

            <View className="items-center mt-5">
              <QRCode value={item.QR_DATA || ""} size={300} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const Ebarimt: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<EbarimtLottery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchEbarimtLotteries();
        if (mounted) setData(items);
      } catch (e) {
        console.warn("Failed to load Ebarimt lotteries", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const contentTopPad = useMemo(
    () => ({ paddingTop: insets.top }),
    [insets.top]
  );

  return (
    <View className="flex-1 bg-white" style={contentTopPad}>
      <View className="h-[60px] flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-[100px] h-full justify-center"
          hitSlop={10}
        >
          <View className="pl-7">
            <Ionicons name="chevron-back" size={28} color="#1B3C69" />
          </View>
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <Text className="text-[18px] text-[#1B3C69] font-bold">
            И-Баримт түүх
          </Text>
        </View>

        <View className="w-[100px]" />
      </View>

      <View className="flex-1 px-[30px]">
        {!loading && data.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[14px] text-[#496387] text-center">
              Таны и-баримт сугалааны баримт олдсонгүй.
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(it, idx) => `${it.BILL_ID}-${idx}`}
            contentContainerStyle={{ paddingVertical: 20 }}
            ItemSeparatorComponent={() => <View className="h-5" />}
            renderItem={({ item }) => <EbarimtCard item={item} />}
          />
        )}
      </View>
    </View>
  );
};

export default Ebarimt;
