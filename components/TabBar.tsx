import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import SvgIcon from "@components/SvgIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient"; // expo install expo-linear-gradient

const ACCENT = "#65E33F";
const BORDER = "#E6ECF4";
const INACTIVE = "#fff";
const ACTIVE_TEXT = "#0B1B34";

const LABELS: Record<string, { icon: string; label: string }> = {
  index: { icon: "home", label: "Нүүр хуудас" },
  bonus: { icon: "market", label: "Маркет" },
  settings: { icon: "menu", label: "Цэс" },
};

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute left-0 right-0 bottom-0">
      <View
        className=" overflow-hidden bg-white rounded-t-3xl pt-3 pb-9"
        style={{
          borderColor: BORDER,
          borderWidth: 1,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <View className="h-20 flex-row items-center">
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const meta = LABELS[route.name] ?? {
              icon: "unknown",
              label: "Тодорхойгүй",
            };

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <React.Fragment key={route.key}>
                <TouchableOpacity
                  onPress={onPress}
                  className="flex-1 items-center justify-center"
                  activeOpacity={0.9}
                >
                  <View className="items-center justify-center">
                    <SvgIcon
                      name={meta.icon}
                      width={31.5}
                      height={31.5}
                      style={{ opacity: isFocused ? 1 : 0.9 }}
                    />

                    <View
                      className="mt-1.5 h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: isFocused ? ACCENT : "#EEF3F8",
                      }}
                    />
                  </View>

                  <Text
                    className="mt-2 text-xs font-medium"
                    style={{ color: isFocused ? ACTIVE_TEXT : INACTIVE }}
                    numberOfLines={1}
                  >
                    {meta.label}
                  </Text>
                </TouchableOpacity>

                {index !== state.routes.length - 1 && (
                  <View
                    className="h-10"
                    style={{ width: 1, backgroundColor: BORDER }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default TabBar;
