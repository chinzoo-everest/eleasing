import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "@components/Header";
import CustomScrollView from "@components/CustomScrollView";
import SvgIcon from "@components/SvgIcon";

import { GlobalContext } from "@context/GlobalContext";
import { CNotification } from "@type/interfaces/Basic";
import { loadNotiList, saveNotiRead } from "@services/basic.service";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";

const Notification = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const context = useContext(GlobalContext);
  const currentCustomer = context?.state.currentUser;

  const [notificationList, setNotificationList] = useState<CNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await loadNotiList(currentCustomer?.CUST_ID, 1);
      if (Array.isArray(result)) setNotificationList(result);
    } catch (error) {
      handleErrorExpo(error, "loadNotifications");
    }
  }, [currentCustomer?.CUST_ID]);

  const setNotiRead = useCallback(async (item: CNotification) => {
    try {
      const ok = await saveNotiRead(item.ID);
      if (!ok) return;
      setNotificationList((prev) =>
        prev.map((n) => (n.ID === item.ID ? { ...n, IS_READ: "Y" } : n))
      );
      await routePush(SCREENS.NOTIFICATION_DETAIL, {
        item: JSON.stringify(item),
      });
    } catch (error) {
      handleErrorExpo(error, "saveNotiRead");
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Таны шуудан"
        onBack={() => router.back()}
        showBottomLine={false}
        bgColor="#FFFFFF"
        textColor="#1B3C69"
      />

      <CustomScrollView
        className="pt-2"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="mx-4">
          {(notificationList || []).map((item, idx) => {
            const isRead = item.IS_READ === "Y";
            return (
              <TouchableOpacity
                key={`${item.ID}-${idx}`}
                onPress={() => setNotiRead(item)}
                activeOpacity={0.8}
                className="w-full"
              >
                <View className="flex-row items-start gap-3 py-4">
                  <View className="pt-1">
                    <SvgIcon
                      name="noti_bell"
                      width={20}
                      height={20}
                      color={isRead ? "#94A3B8" : "#2E53F1"}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`text-[15px] font-semibold ${
                        isRead ? "text-[#6B7280]" : "text-[#1B3C69]"
                      }`}
                    >
                      {item.TITLE || "Мэдэгдэл"}
                    </Text>

                    <Text
                      className={`mt-2 text-[14px] leading-5 ${
                        isRead ? "text-[#6B7280]" : "text-[#203764]"
                      }`}
                    >
                      {item.BODY}
                    </Text>

                    <Text className="mt-2 text-[12px] text-[#94A3B8]">
                      {dayjs(item.CREATED).format("YYYY.MM.DD")}
                    </Text>
                  </View>
                </View>

                <View className="h-[1px] w-full bg-[#E2E8F0]" />
              </TouchableOpacity>
            );
          })}

          {notificationList.length === 0 && (
            <View className="items-center justify-center px-10 pt-40">
              <Text className="text-center text-sm text-[#6B7280]">
                Мэдэгдэл ирээгүй байна
              </Text>
            </View>
          )}
        </View>
      </CustomScrollView>
    </View>
  );
};

export default Notification;
