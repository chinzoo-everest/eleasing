import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import SvgIcon from "@components/SvgIcon";
import { GlobalContext } from "@context/GlobalContext";
import { getBankName } from "@utils/getBankName";
import { useRouter } from "expo-router";
import { CCustBank, CCustomer } from "@type/interfaces/Customer";
import { routePush } from "@utils/routePush";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREENS } from "@customConfig/route";

// Enable smooth animation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Personal = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();
  const [custBanks, setCustBanks] = useState<CCustBank[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleNavigate = useCallback(async (screen: string) => {
    await routePush(screen);
  }, []);

  useEffect(() => {
    const initializeSettings = async () => {
      setCustBanks([]);
      const currentUser = context?.state?.currentUser;
      setCustBanks(currentUser?.BANK_LIST || []);
      setCurrentCustomer(currentUser);
    };
    initializeSettings();
  }, [context?.state]);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSubItem = (title: string, screen: string) => (
    <TouchableOpacity
      onPress={() => handleNavigate(screen)}
      className="my-0.5 rounded-xl bg-[#EFF1F5] px-5 py-4"
    >
      <Text className="text-base text-[#1B3C69]">{title}</Text>
    </TouchableOpacity>
  );

  const renderMenuItem = (
    icon: string,
    title: string,
    screenOrSectionKey: string,
    hasDropdown?: boolean
  ) => (
    <TouchableOpacity
      onPress={() =>
        hasDropdown
          ? toggleSection(screenOrSectionKey)
          : handleNavigate(screenOrSectionKey)
      }
      activeOpacity={0.8}
      className="flex-row items-center justify-between mb-0.5 bg-[#2A45C4] px-5 py-3 shadow-sm"
    >
      <View className="flex-row items-center">
        <View className="p-2.5 bg-[#1C37B5] rounded-full">
          <SvgIcon name={icon} height={16} width={16} />
        </View>
        <Text className="ml-3 text-base font-medium text-white">{title}</Text>
      </View>
      {hasDropdown && (
        <SvgIcon
          name={
            expandedSection === screenOrSectionKey
              ? "arrow_up"
              : "settings_arrow"
          }
          height={16}
          width={16}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="mt-8 items-center">
          <View className="h-20 w-20 justify-center items-center bg-white rounded-[26px] shadow-md">
            {currentCustomer?.AVATAR_URL ? (
              <Image
                source={{ uri: currentCustomer?.AVATAR_URL }}
                className="h-[63px] w-[63px] rounded-full"
              />
            ) : (
              <SvgIcon name="settings_user" height={63} width={63} />
            )}
          </View>
          <Text className="mt-4 text-lg font-semibold text-[#1B3C69]">
            {`${currentCustomer?.LAST_NAME || ""} ${
              currentCustomer?.FIRST_NAME || ""
            }`}
          </Text>
        </View>

        {/* Menu Groups */}
        <View className="mx-5 mt-8 space-y-3">
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-t-xl mb-0.5 bg-[#2A45C4] px-5 py-3 shadow-sm"
            onPress={() => handleNavigate(SCREENS.MY_INFO)}
          >
            <View className="flex-row items-center">
              <View className="p-2.5 bg-[#1C37B5] rounded-full">
                <SvgIcon name={"my_info"} height={16} width={16} />
              </View>
              <Text className="ml-3 text-base font-medium text-white">
                Миний мэдээлэл
              </Text>
            </View>
          </TouchableOpacity>

          {renderMenuItem(
            "invite_friend",
            "Найзаа урих",
            SCREENS.INVITE_FRIEND
          )}
          {renderMenuItem("change_pass", "Нэвтрэх тохиргоо", "login", true)}

          {expandedSection === "login" && (
            <View className=" ml-6 border-l-2 border-[#D6D8E0] pl-4 space-y-2">
              {renderSubItem("Нууц үг солих", SCREENS.CHANGE_PASS)}
              {renderSubItem("Пин код солих", SCREENS.CHANGE_PIN)}
              {renderSubItem("Утасны дугаар солих", SCREENS.CHANGE_PHONE)}
              {renderSubItem("Имэйл хаяг солих", SCREENS.CHANGE_EMAIL)}
            </View>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-between rounded-b-xl bg-[#2A45C4] px-5 py-3 shadow-sm"
            onPress={() => handleNavigate(SCREENS.CONTACT)}
          >
            <View className="flex-row items-center">
              <View className="p-2.5 bg-[#1C37B5] rounded-full">
                <SvgIcon name={"contact_set"} height={16} width={16} />
              </View>
              <Text className="ml-3 text-base font-medium text-white">
                Холбоо барих хүний мэдээлэл
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bank Section */}
        <View className="mx-4 mt-10 space-y-3">
          <Text className="text-[#1B3C69] font-medium mb-2">
            Бүртгэлтэй банк
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl border border-dashed border-[#6265FE] bg-[#F6F6F8] py-5 pl-3 pr-5"
            onPress={async () =>
              await routePush(SCREENS.MODIFY_BANK, {
                bank: JSON.stringify(null),
                isDefault: custBanks.length === 0,
              })
            }
          >
            <View className="flex-row items-center">
              <View className="mr-4 rounded-full bg-[#2B3034] p-1">
                <SvgIcon name="bank_add" height={25} width={25} />
              </View>
              <Text className="text-base font-medium text-[#1B3C69]">
                Банкны данс нэмэх
              </Text>
            </View>
            <SvgIcon name="settings_arrow" height={16} width={9} />
          </TouchableOpacity>

          {custBanks
            .sort((a, b) => (b.IS_DEFAULT === "Y" ? 1 : -1))
            .map((bank) => (
              <TouchableOpacity
                onPress={async () =>
                  await routePush(SCREENS.MODIFY_BANK, {
                    bank: JSON.stringify(bank),
                    isDefault: bank.IS_DEFAULT === "Y",
                  })
                }
                key={bank.BANK_ID + bank.ACC_NO}
                className="mt-1 flex-row items-center rounded-md bg-[#F6F6F8] px-3 py-4"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EAF2F1]">
                  <Image
                    source={{ uri: bank.LOGO_URL }}
                    className="h-6 w-6 rounded-full"
                    resizeMode="contain"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium text-[#1B3C69]">
                    {getBankName(bank.L_CODE || "")}
                  </Text>
                  <Text className="text-xs text-[#1B3C69] opacity-70">
                    {bank.ACC_NO}
                  </Text>
                </View>
                <View className="mr-2">
                  {bank.IS_DEFAULT === "Y" && (
                    <SvgIcon name="check_circle" height={18} width={18} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default Personal;
