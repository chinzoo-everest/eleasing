import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';
import {loadNotiList, saveNotiRead} from '@services/basic.service';
import {GlobalContext} from '@context/GlobalContext';
import {CNotification} from '@type/interfaces/Basic';
import dayjs from 'dayjs';
import SvgIcon from '@components/SvgIcon';
import CustomScrollView from '@components/CustomScrollView';
import Header from '@components/Header';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {routePush} from '@utils/routePush';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SCREENS} from '@customConfig/route';

const Notification = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const currentCustomer = context?.state.currentUser;
  const insets = useSafeAreaInsets();
  const [notificationList, setNotificationList] = useState<CNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await loadNotiList(currentCustomer?.CUST_ID, 1);
      if (result && result.length > 0) {
        setNotificationList(result);
      }
    } catch (error) {
      handleErrorExpo(error, 'loadNotifications');
    }
  }, [currentCustomer?.CUST_ID]);

  const setNotiRead = useCallback(async (item: CNotification) => {
    try {
      const result = await saveNotiRead(item.ID);
      if (!result) return;
      setNotificationList(prev =>
        prev.map(noti =>
          noti.ID === item.ID ? {...noti, IS_READ: 'Y'} : noti,
        ),
      );
      await routePush(SCREENS.NOTIFICATION_DETAIL, {
        item: JSON.stringify(item),
      });
    } catch (error) {
      handleErrorExpo(error, 'saveNotiRead');
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        title="Таны шуудан"
        onBack={() => router.back()}
        bgColor="#0B0B13"
      />

      <CustomScrollView className="pb-20 pt-5">
        <View className="mx-4 flex-1 gap-4">
          {(notificationList || []).map((item: CNotification, index) => (
            <TouchableOpacity
              key={`${item.ID}-${index}`}
              className={`flex-row items-start rounded-xl border border-white/60 p-4 ${
                item.IS_READ === 'N' ? 'opacity-100' : 'opacity-60'
              }`}
              onPress={() => setNotiRead(item)}>
              <View className="flex-1">
                <View className="mb-2 flex-row justify-between">
                  <View className="flex-row">
                    <View className="mr-4 self-center">
                      <SvgIcon
                        width={8}
                        height={8}
                        name={
                          item.IS_READ === 'N' ? 'notf_active' : 'notf_read'
                        }
                        className="self-center"
                      />
                    </View>
                    <Text className="font-PlayBold text-left text-base text-[#ffffff]">
                      {item.TITLE}
                    </Text>
                  </View>
                  <Text className="font-PlayRegular text-left text-[12px] text-[#ffffff] opacity-60">
                    {dayjs(item.CREATED).format('YYYY.MM.DD')}
                  </Text>
                </View>

                <Text className="ml-6 pr-8 text-left text-sm font-light text-[#ffffff]">
                  {item.BODY}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {notificationList.length === 0 && (
            <View className="flex-1 items-center justify-center px-10">
              <Text className="text-light text-center text-sm text-white opacity-60">
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
