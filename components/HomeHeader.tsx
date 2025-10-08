import React, {useState} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import SvgIcon from './SvgIcon';
import {routePush} from '@utils/routePush';
import {SCREENS} from '@customConfig/route';

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
  const [, setSidebarVisible] = useState(false);

  return (
    <View className="bg-HDefault px-7">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <SvgIcon name="menu_home" width={30} height={30} />
        </TouchableOpacity>

        {isShowNotification && (
          <TouchableOpacity
            onPress={async () => await routePush(SCREENS.NOTIFICATION)}>
            <SvgIcon name="noti_bell" width={23} height={23} />
            {notificationCount > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-[#FF6D31]">
                <Text className="text-xs text-white">{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text className="mb-4 mr-20 text-left text-2xl font-medium">{title}</Text>
    </View>
  );
};

export default HomeHeader;
