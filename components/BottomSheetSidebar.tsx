import {SCREENS} from '@customConfig/route';
import {routePush} from '@utils/routePush';
import React, {useContext} from 'react';
import {Linking, Modal, Text, TouchableOpacity, View} from 'react-native';
import SvgIcon from './SvgIcon';
import {GlobalContext} from '@context/GlobalContext';

interface BottomSheetSidebarProps {
  visible: boolean;
  onClose: () => void;
}

const BottomSheetSidebar: React.FC<BottomSheetSidebarProps> = ({
  visible,
  onClose,
}) => {
  const context = useContext(GlobalContext);

  const handleCall = () => {
    Linking.openURL('tel:76001661');
  };

  const handleFacebook = () => {
    Linking.openURL('https://www.facebook.com/mandaldigitalcredit');
  };

  const handleLocation = () => {
    onClose();
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      routePush(SCREENS.MAP);
    }, 300);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPressOut={onClose}>
        <View className="absolute bottom-0 w-full rounded-t-[4px] bg-black/50 px-6 pb-10 pt-2">
          {/* Handle bar */}
          <View className="mb-6 h-1 w-40 self-center rounded-full bg-Primary" />

          {/* Title */}
          <Text className="mb-6 text-lg font-semibold text-tPrimary opacity-100">
            Хэрэглэгчийн үйлчилгээ
          </Text>

          {/* Item: Operator */}
          <TouchableOpacity
            className="mb-4 h-16 flex-row items-center justify-between rounded-xl bg-bgPrimary px-4 py-3"
            onPress={handleCall}>
            <View className="flex-row items-center gap-3">
              <View className="rounded-full bg-[#2B3034] p-3">
                <SvgIcon name="login_operator" height={20} width={20} />
              </View>
              <View>
                <Text className="text-base font-medium text-white">
                  Оператортой холбогдох
                </Text>
                <Text className="mt-1 text-xs font-medium text-tPrimary">
                  {context?.state.configData?.customerPhoneNo ?? ''}
                </Text>
              </View>
            </View>
            <SvgIcon name="login_help_arrow" />
          </TouchableOpacity>

          {/* Item: Facebook */}
          <TouchableOpacity
            className="mb-4 h-16 flex-row items-center justify-between rounded-xl bg-bgPrimary px-4 py-3"
            onPress={handleFacebook}>
            <View className="flex-row items-center gap-3">
              <View className="rounded-full bg-bgLight p-3">
                <SvgIcon name="login_fb" height={20} width={20} />
              </View>
              <View>
                <Text className="text-base font-medium text-white">
                  Фэйсбүүкээр холбогдох
                </Text>
                <Text className="mt-1 text-xs font-medium text-tPrimary">
                  Mandal Digital Credit
                </Text>
              </View>
            </View>
            <SvgIcon name="login_help_arrow" />
          </TouchableOpacity>

          {/* Item: Location */}
          <TouchableOpacity
            className="h-16 flex-row items-center justify-between rounded-xl bg-bgPrimary px-4 py-3"
            onPress={handleLocation}>
            <View className="flex-row items-center gap-3">
              <View className="rounded-full bg-bgLight p-3">
                <SvgIcon name="login_loc" height={20} width={20} />
              </View>
              <View>
                <Text className="text-base font-medium text-white">
                  Салбарын байршил
                </Text>
                <Text className="mt-1 text-xs font-medium text-tPrimary">
                  Газрын зураг
                </Text>
              </View>
            </View>
            <SvgIcon name="login_help_arrow" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default BottomSheetSidebar;
