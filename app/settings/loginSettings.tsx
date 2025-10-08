import React, {useCallback} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import CustomScrollView from '@components/CustomScrollView';
import Header from '@components/Header';
import SvgIcon from '@components/SvgIcon';
import {routePush} from '@utils/routePush';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SCREENS} from '@customConfig/route';

const LoginSettings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleNavigation = useCallback(async (screen: string) => {
    await routePush(screen);
  }, []);

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header title="Тохиргоо" onBack={() => router.back()} bgColor="#0B0B13" />
      <CustomScrollView>
        <View className="mx-4 mt-4 flex-1">
          <Text className="mb-4 text-2xl font-black text-white">
            Нэвтрэх тохиргоо
          </Text>
          <Text className="text-base text-white opacity-75">
            Санхүүгийн аюулгүй байдлыг хангахын тулд хэрэглэгч та нууц үгээ 3
            сардаа нэг удаа шинэчилж байхыг анхааруулж байна.
          </Text>
          <View className="mt-5 space-y-3">
            <TouchableOpacity
              onPress={() => handleNavigation(SCREENS.CHANGE_PASS)}
              className="mb-3 flex-row items-center justify-between rounded-xl bg-bgSecondary px-3 py-2.5">
              <View className="flex-row">
                <View className="rounded-full bg-bgPrimary p-4">
                  <SvgIcon name="change_pass" />
                </View>
                <Text className="ml-2.5 self-center text-lg font-medium text-white">
                  Нэвтрэх нууц үг
                </Text>
              </View>
              <SvgIcon className="ml-auto mr-5" name="settings_arrow" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavigation(SCREENS.CHANGE_PIN)}
              className="mb-3 flex-row items-center justify-between rounded-xl bg-bgSecondary px-3 py-2.5">
              <View className="flex-row">
                <View className="rounded-full bg-bgPrimary p-4">
                  <SvgIcon name="changepin" />
                </View>
                <Text className="ml-2.5 self-center text-lg font-medium text-white">
                  Пин код солих
                </Text>
              </View>
              <SvgIcon className="ml-auto mr-5" name="settings_arrow" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNavigation(SCREENS.CHANGE_PHONE)}
              className="mb-3 flex-row items-center justify-between rounded-xl bg-bgSecondary px-3 py-2.5">
              <View className="flex-row">
                <View className="rounded-full bg-bgPrimary p-4">
                  <SvgIcon name="change_phone" />
                </View>
                <Text className="ml-2.5 self-center text-lg font-medium text-white">
                  Утасны дугаар солих{' '}
                </Text>
              </View>
              <SvgIcon className="ml-auto mr-5" name="settings_arrow" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavigation(SCREENS.CHANGE_EMAIL)}
              className="mb-3 flex-row items-center justify-between rounded-xl bg-bgSecondary px-3 py-2.5">
              <View className="flex-row">
                <View className="rounded-full bg-bgPrimary p-4">
                  <SvgIcon name="change_email" />
                </View>
                <Text className="ml-2.5 self-center text-lg font-medium text-white">
                  Имэйл хаяг солих{' '}
                </Text>
              </View>
              <SvgIcon className="ml-auto mr-5" name="settings_arrow" />
            </TouchableOpacity>
          </View>
        </View>
      </CustomScrollView>
    </View>
  );
};

export default React.memo(LoginSettings);
