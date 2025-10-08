import React, {useContext, useEffect, useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
import SvgIcon from '@components/SvgIcon';
import {GlobalContext} from '@context/GlobalContext';
import {cn} from '@utils/cn';
import {getBankName} from '@utils/getBankName';
import {useRouter} from 'expo-router';
import {CCustBank, CCustomer} from '@type/interfaces/Customer';
import Header from '@components/Header';
import {routePush} from '@utils/routePush';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SCREENS} from '@customConfig/route';

const Personal = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();
  const [custBanks, setCustBanks] = useState<CCustBank[]>([]);
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

  const renderSettingsMenu = (
    icon: string,
    title: string,
    subtitle: string,
    screen: string,
  ) => (
    <TouchableOpacity
      className="mb-1 flex-row items-center justify-between rounded-xl bg-bgLight px-5 py-4"
      onPress={() => handleNavigate(screen)}>
      <View className="flex-row items-center">
        <SvgIcon name={icon} height={22} width={22} />
        <View className="ml-3">
          <Text className="text-base font-medium text-white">{title}</Text>
          {subtitle ? (
            <Text className="text-xs text-white opacity-70">{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <SvgIcon name="settings_arrow" height={16} width={9} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        bgColor="#24292D"
        title="Миний булан"
        onBack={() => router.back()}
        showBottomLine={true}
      />

      <ScrollView>
        {/* Profile */}
        <View className="mx-5 mt-20 items-center rounded-2xl bg-bgLight p-6">
          <View className="absolute -top-12 items-center">
            {currentCustomer?.AVATAR_URL ? (
              <View className="relative">
                <Image
                  source={{uri: currentCustomer?.AVATAR_URL}}
                  className="h-[100px] w-[100px] rounded-full border-4 border-black"
                />
              </View>
            ) : (
              <SvgIcon name="settings_user" height={90} width={90} />
            )}
          </View>

          <View className="mt-14 items-center">
            <Text className="text-lg font-semibold text-white">
              {`${currentCustomer?.LAST_NAME} ${currentCustomer?.FIRST_NAME}`}
            </Text>
            <Text className="text-sm text-white opacity-80">
              {currentCustomer?.REG_NO}
            </Text>
            <Text className="text-sm text-white opacity-80">
              {currentCustomer?.ADDR1}
            </Text>
          </View>
        </View>

        {/* Info menus */}
        <View className="mx-5 mt-1">
          {renderSettingsMenu(
            'personal_inf',
            'Хувийн мэдээлэл',
            'Хувийн мэдээлэл, гэрийн хаяг',
            SCREENS.MY_INFO,
          )}
          {renderSettingsMenu(
            'contact_set',
            'Холбогдох хүний мэдээлэл',
            'Яаралтай үед холбогдох хүний мэдээлэл',
            SCREENS.CONTACT,
          )}
        </View>

        {/* Divider */}

        <Text className="mx-5 mt-7 text-sm font-medium text-[#9CA3AF]">
          Нууцлалын тохиргоо
        </Text>
        <View className="my-4 border-t border-white/10" />

        {/* Security menus */}
        <View className="mx-4 mt-2">
          {renderSettingsMenu(
            'change_pass',
            'Нэвтрэх нууц үг',
            '********',
            SCREENS.CHANGE_PASS,
          )}
          {renderSettingsMenu(
            'changepin',
            'Гүйлгээний нууц үг',
            '****',
            SCREENS.CHANGE_PIN,
          )}
          {renderSettingsMenu(
            'change_phone',
            'Утасны дугаар солих',
            currentCustomer?.PHONE1 || '',
            SCREENS.CHANGE_PHONE,
          )}
          {renderSettingsMenu(
            'change_email',
            'Имэйл хаяг солих',
            currentCustomer?.EMAIL || '',
            SCREENS.CHANGE_EMAIL,
          )}
        </View>

        {/* Bank Accounts */}
        <View className="mx-4 mt-8 space-y-3">
          <Text className="mb-2 text-white">Бүртгэлтэй банк</Text>

          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl border border-dashed border-Primary bg-bgPrimary py-5 pl-2 pr-5"
            style={{
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#6265FE',
            }}
            onPress={async () =>
              await routePush(SCREENS.MODIFY_BANK, {
                bank: JSON.stringify(null),
                isDefault: custBanks.length === 0,
              })
            }>
            <View className="mr-6 flex-row rounded-full">
              <View className="mr-4 rounded-full bg-[#2B3034] p-1">
                <SvgIcon name="bank_add" height={25} width={25} />
              </View>
              <View className="flex-col self-center">
                <Text className="text-base font-medium text-white">
                  Банкны данс нэмэх
                </Text>
              </View>
            </View>
            <SvgIcon
              className="self-center"
              name="settings_arrow"
              height={16}
              width={9}
            />
          </TouchableOpacity>

          {custBanks
            .sort((a, b) => (b.IS_DEFAULT === 'Y' ? 1 : -1))
            .map(bank => (
              <TouchableOpacity
                onPress={async () =>
                  await routePush(SCREENS.MODIFY_BANK, {
                    bank: JSON.stringify(bank),
                    isDefault: bank.IS_DEFAULT === 'Y',
                  })
                }
                key={bank.BANK_ID + bank.ACC_NO}
                className="mt-1 flex-row items-center rounded-md bg-bgLight px-3 py-4">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EAF2F1]">
                  <Image
                    source={{uri: bank.LOGO_URL}}
                    className="h-6 w-6 rounded-full"
                    resizeMode="contain"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium text-white">
                    {getBankName(bank.L_CODE || '')}
                  </Text>
                  <Text className="text-xs text-white opacity-70">
                    {bank.ACC_NO}
                  </Text>
                </View>
                <View className="mr-2">
                  {bank.IS_DEFAULT === 'Y' && (
                    <SvgIcon
                      name="check_circle"
                      height={18}
                      width={18}
                      className="self-center"
                    />
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
