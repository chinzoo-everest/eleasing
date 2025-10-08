import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import SvgIcon from '@components/SvgIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const TabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View className="absolute bottom-0 left-0 right-0">
      <View className="absolute bottom-0 left-0 right-0 h-28">
        <View className="h-full w-full bg-gradient-to-t from-[#0B0B13] to-transparent" />
      </View>
      <View className="mx-0 h-20 flex-row items-center overflow-hidden rounded-lg border border-gray-700 bg-bgSecondary shadow-md">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          let iconName = '';
          let name = '';
          switch (route.name) {
            case 'index':
              iconName = 'home';
              name = 'Нүүр';
              break;
            case 'bonus':
              iconName = 'bonus';
              name = 'Урамшуулал';
              break;
            case 'settings':
              iconName = 'menu';
              name = 'Цэс';
              break;
            default:
              iconName = 'unknown';
              name = 'Тодорхойгүй';
              break;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
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
                className={`flex-1 items-center justify-center ${
                  isFocused ? 'space-y-1' : 'space-y-3'
                }`}>
                <SvgIcon
                  name={iconName}
                  width={24}
                  height={24}
                  style={{opacity: isFocused ? 1 : 0.9}}
                />
                <Text
                  className={`mt-2 text-xs font-medium ${
                    isFocused ? 'text-white' : 'text-tPrimary opacity-100'
                  }`}>
                  {name}
                </Text>
              </TouchableOpacity>

              {index !== state.routes.length - 1 && (
                <View className="h-8 w-[1px] bg-gray-700" />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View className="bg-transparent" style={{paddingBottom: insets.bottom}} />
    </View>
  );
};

export default TabBar;
