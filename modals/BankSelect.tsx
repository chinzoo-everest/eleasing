import {CCustBank} from '@type/interfaces/Customer';
import React from 'react';
import Modal from 'react-native-modal';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import CustomScrollView from '@components/CustomScrollView';
import {cn} from '@utils/cn';
import {getBankName} from '@utils/getBankName';
import {getProductColorByType} from 'utils/getProductColor';

type Props = {
  isVisible: boolean;
  banks: CCustBank[];
  onClose: () => void;
  onSelect: (bank: CCustBank) => void;
  prodType: number;
};

const BankSelect = ({isVisible, onClose, banks, onSelect, prodType}: Props) => {
  const handleSelect = (branch: CCustBank) => {
    onSelect(branch);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      propagateSwipe
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{justifyContent: 'center', margin: 0, marginTop: '40%'}}>
      <View className="flex-1 rounded-t-2xl bg-bgLight">
        <CustomScrollView className="mt-10">
          <View className="px-4">
            <Text
              className={cn('ml-3 text-sm font-medium')}
              style={{color: getProductColorByType(Number(prodType))}}>
              Хүлээн авах банкны данс
            </Text>
            <View className="mt-5 gap-3 px-4">
              {banks.map(bank => (
                <TouchableOpacity
                  key={bank.ID}
                  className="flex-row items-center gap-4 py-2"
                  onPress={() => handleSelect(bank)}>
                  <View
                    className={cn(
                      'h-12 w-12 items-center justify-center overflow-hidden',
                    )}>
                    <Image
                      source={{uri: bank.LOGO_URL}}
                      className="h-full w-full"
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text className="text-base font-medium text-white">
                      {getBankName(bank.L_CODE || '')}
                    </Text>
                    <Text className="text-xs text-white/60">{bank.ACC_NO}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </CustomScrollView>
      </View>
    </Modal>
  );
};

export default BankSelect;
