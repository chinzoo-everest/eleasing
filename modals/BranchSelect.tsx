import CustomScrollView from '@components/CustomScrollView';
import SvgIcon from '@components/SvgIcon';
import {CBranch} from '@type/interfaces/Basic';
import {cn} from '@utils/cn';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {getProductColorByType} from 'utils/getProductColor';

type Props = {
  isVisible: boolean;
  prodType: number;
  branches: CBranch[];
  onClose: () => void;
  onSelect: (branch: CBranch) => void;
};

const BranchSelect = ({
  isVisible,
  onClose,
  branches,
  onSelect,
  prodType,
}: Props) => {
  const handleSelect = (branch: CBranch) => {
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
              Хүсэлт гаргах салбар
            </Text>
            <View className="mt-5 gap-3">
              {branches.length > 0 &&
                branches.map(branch => (
                  <TouchableOpacity
                    key={branch.ID}
                    className="rounded-xl bg-[#1B1D26] px-4 pt-3"
                    onPress={() => handleSelect(branch)}>
                    <Text className="text-base font-medium text-white">
                      {branch.NAME}
                    </Text>
                    <View
                      className={cn('my-4 h-px w-full')}
                      style={{
                        backgroundColor: getProductColorByType(
                          Number(prodType),
                        ),
                      }}
                    />
                    <View className="mx-2 flex-row items-center gap-3">
                      <SvgIcon name="get_loan_branch_pin" />
                      <Text className="mr-10 text-sm text-white/60">
                        {branch.ADDR}
                      </Text>
                    </View>
                    <View className="mt-6 h-px w-full bg-gray-600" />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </CustomScrollView>
      </View>
    </Modal>
  );
};

export default BranchSelect;
