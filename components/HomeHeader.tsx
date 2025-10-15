// HomeHeader.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import SvgIcon from "./SvgIcon";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sidebar from "./Sidebar";

type HomeHeaderProps = {
  title: string;
  notificationCount?: number;
  isShowNotification?: boolean;
};

const HomeHeader = ({
  title,
  notificationCount = 0,
  isShowNotification = true,
}: HomeHeaderProps) => {
  const insets = useSafeAreaInsets();
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  return (
    <View className=" px-7 bg-white" style={{ paddingTop: insets.top }}>
      <Sidebar
        visible={isSidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <View className="mb-2 flex-row items-center justify-between bg-red-400">
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SvgIcon name="noti_bell" width={24} height={24} />
        </TouchableOpacity>
        <Text>{title}</Text>
        {isShowNotification ? (
          <TouchableOpacity
            onPress={async () => await routePush(SCREENS.NOTIFICATION)}
          >
            <SvgIcon name="noti_bell" width={23} height={23} />
            {notificationCount > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-[#FF6D31]">
                <Text className="text-xs text-white">{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 23, height: 23 }} />
        )}
      </View>

      {/* title */}
    </View>
  );
};

export default HomeHeader;
