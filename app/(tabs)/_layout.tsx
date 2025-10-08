import React, { useState } from "react";
import { Tabs } from "expo-router";
import TabBar from "@components/TabBar";
import { StatusBar } from "expo-status-bar";
import Sidebar from "@components/Sidebar";
import { View, TouchableOpacity } from "react-native";
import SvgIcon from "@components/SvgIcon";

const TabLayout = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  return (
    <View className="flex-1">
      <StatusBar translucent style="light" />

      {/* Sidebar */}
      <Sidebar
        visible={isSidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Overlay button (top-left menu) */}
      <TouchableOpacity
        onPress={() => setSidebarVisible(true)}
        className="absolute top-10 left-4 z-50 bg-black/50 p-3 rounded-full"
      >
        <SvgIcon name="menu" height={22} width={22} />
      </TouchableOpacity>

      {/* Tabs */}
      <Tabs initialRouteName="index" tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen name="index" options={{ headerShown: false }} />
        <Tabs.Screen name="bonus" options={{ headerShown: false }} />
        <Tabs.Screen name="settings" options={{ headerShown: false }} />
      </Tabs>
    </View>
  );
};

export default TabLayout;
