import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {routePush} from '@utils/routePush';
import {SCREENS} from '@customConfig/route';
import {Ionicons} from '@expo/vector-icons';
import {cn} from '@utils/cn';
import {Config} from '@customConfig/config';
import {getProductColorByType} from 'utils/getProductColor';

const AddDepsitCard = ({
  requestId,
  loanAmount,
  prodType,
  prodId,
}: {
  requestId: string;
  loanAmount: string;
  prodType: number;
  prodId: number;
}) => {
  const handleAddDeposit = async () => {
    await routePush(
      prodType === Config.DEPOSIT_PROD_TYPE
        ? SCREENS.DEPOSIT_TYPE
        : SCREENS.PHONE_INPUT,
      {
        requestId: requestId,
        loanAmount: loanAmount,
        prodType: prodType,
        prodId: prodId,
      },
    );
  };

  return (
    <TouchableOpacity
      onPress={handleAddDeposit}
      className="mb-4 flex-row items-center rounded-xl bg-bgLight px-4 py-4">
      <View className="mr-3 items-center rounded-full bg-bgPrimary p-3">
        <Ionicons
          name="add"
          size={24}
          color={getProductColorByType(prodType)}
        />
      </View>
      <View>
        <Text className="text-base font-semibold text-white">
          Барьцаа хөрөнгө бүртгэх
        </Text>
        <Text
          className={cn('mt-1 text-xs')}
          style={{
            color: getProductColorByType(prodType),
          }}>
          Идэвхгүй
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddDepsitCard;
