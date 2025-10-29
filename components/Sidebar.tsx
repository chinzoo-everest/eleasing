import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SvgIcon from "@components/SvgIcon";
import { GlobalContext } from "@context/GlobalContext";
import * as Application from "expo-application";

import { CCustomer } from "@type/interfaces/Customer";
import { routePush } from "@utils/routePush";
import { LogOutUser } from "@services/auth.service";
import { SCREENS } from "@customConfig/route";
import Confirmation from "@modals/Confirmation";

const { width } = Dimensions.get("window");

const Sidebar = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [showConfirm, setShowConfirm] = useState(false);

  const [slideAnim] = useState(new Animated.Value(-width));
  const [fadeAnim] = useState(new Animated.Value(0));
  const context = useContext(GlobalContext);
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();

  useEffect(() => {
    setCurrentCustomer(context?.state?.currentUser);
  }, [context?.state]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = useCallback(
    async (screen: string) => {
      await routePush(screen);
      onClose();
    },
    [onClose]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/40" />

        <Animated.View
          className="absolute inset-y-0 left-0 shadow-lg"
          style={{
            transform: [{ translateX: slideAnim }],
            width: width * 0.78,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            className="bg-[#2A45C4] flex-row pl-10 pb-4"
            style={{ paddingTop: insets.top }}
          >
            <View className="mr-5">
              {currentCustomer?.AVATAR_URL ? (
                <Image
                  source={{ uri: currentCustomer?.AVATAR_URL }}
                  className="h-16 w-16 rounded-3xl"
                />
              ) : (
                <View className="rounded-xl">
                  <SvgIcon
                    name="settings_user"
                    height={63}
                    width={63}
                    color="#1E3AFF"
                  />
                </View>
              )}
            </View>
            <View className="flex-col self-center">
              <Text className="text-white/80 text-base">Сайн байна уу!</Text>
              <Text className="text-white text-lg font-semibold">
                {currentCustomer?.FIRST_NAME || ""}{" "}
                {currentCustomer?.LAST_NAME || ""}
              </Text>
            </View>
          </View>

          {/* Body */}
          <View className="flex-1 bg-white">
            <ScrollView
              contentContainerStyle={{ paddingVertical: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="px-10 py-6">
                {/* <SidebarItem
                  icon="archive"
                  text="Бонус"
                  onPress={() => handleNavigate(SCREENS.SETTINGS_BONUS)}
                /> */}
                <SidebarItem
                  icon="archive"
                  text="Зээлийн архив"
                  onPress={() => handleNavigate(SCREENS.LOAN_ARCHIVE)}
                />
                <SidebarItem
                  icon="archive"
                  text="И-Баримт түүх"
                  onPress={() => handleNavigate(SCREENS.EBARIMT)}
                />
                <SidebarItem
                  icon="terms"
                  text="Банкны данс"
                  onPress={() => handleNavigate(SCREENS.BANK)}
                />

                <SidebarItem
                  icon="faq"
                  text="Асуулт хариулт"
                  onPress={() => handleNavigate(SCREENS.FAQ)}
                />
                <SidebarItem
                  icon="calculator"
                  text="Зээлийн тооцоолуур"
                  onPress={() => handleNavigate(SCREENS.LOAN_CALCULATOR)}
                />
                <SidebarItem
                  icon="terms"
                  text="Үйлчилгээний нөхцөл"
                  onPress={() => handleNavigate(SCREENS.TERMS)}
                />
                <SidebarItem
                  icon="location"
                  text="Салбарын байршил"
                  onPress={() => handleNavigate(SCREENS.MAP)}
                />
                <SidebarItem
                  icon="operator"
                  text="Оператортой холбогдох"
                  onPress={() =>
                    Linking.openURL(
                      `tel:${context?.state.configData?.customerPhoneNo}`
                    )
                  }
                />
                <SidebarItem
                  icon="facebook"
                  text="Фэйсбүүк"
                  onPress={() => Linking.openURL("https://facebook.com")}
                />
                <SidebarItem
                  icon="email"
                  text="И-мэйл"
                  onPress={() => Linking.openURL("mailto:support@example.com")}
                />
              </View>

              {/* Logout */}
              <View className="mt-10 px-5 pb-8">
                <Text className="text-gray-600 mb-3 text-xs text-center">
                  Та системээс гарахдаа итгэлтэй байна уу?
                </Text>
                <TouchableOpacity
                  onPress={() => setShowConfirm(true)}
                  className="flex-row items-start justify-start border border-[#E9E9ED] rounded-full "
                >
                  <View className="bg-[#2A45C4] p-5 rounded-3xl">
                    <SvgIcon name="exit" height={22} width={22} />
                  </View>
                  <Text className="text-[#131A43] font-medium text-base self-center ml-5">
                    Гарах
                  </Text>
                </TouchableOpacity>
                <View className="mt-5 flex flex-row items-center justify-center">
                  <Text className="text-primary text-xs opacity-80">
                    Developed by
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL("https://everestsolution.mn/")
                    }
                  >
                    <Text className="text-primary text-xs font-bold opacity-80">
                      {" "}
                      {"Everest Solution LLC"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="mb-20 mt-2.5 text-center text-xs text-black opacity-60">
                  {Application.nativeApplicationVersion} {" ("}
                  {Application.nativeBuildVersion}
                  {")"}
                </Text>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>
      <Confirmation
        isVisible={showConfirm}
        isConfirmation
        title="Системээс гарах уу?"
        description="Гарахад таны идэвхтэй сешн хаагдана."
        onClose={() => setShowConfirm(false)}
        buttonOnPress={() => {
          setShowConfirm(false);
          onClose();
          LogOutUser();
        }}
      />
    </Modal>
  );
};

const SidebarItem = ({
  icon,
  text,
  onPress,
}: {
  icon: string;
  text: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-5 border-b border-gray-100"
  >
    <View className="mr-4">
      <SvgIcon name={icon} height={22} width={22} color="#1E3AFF" />
    </View>
    <Text className="text-[#001165] text-base">{text}</Text>
  </TouchableOpacity>
);

export default Sidebar;
