import React, { useState } from "react";
import { Tabs } from "expo-router";
import TabBar from "@components/TabBar";
import { StatusBar } from "expo-status-bar";
import Sidebar from "@components/Sidebar";
import { View, TouchableOpacity } from "react-native";
import SvgIcon from "@components/SvgIcon";

const TabLayout = () => {
  return (
    <View className="flex-1">
      <StatusBar translucent style="light" />

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
