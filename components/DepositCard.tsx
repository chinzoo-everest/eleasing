import {CLoanDeposit} from '@type/interfaces/DepositLoan';
import React from 'react';
import {View, Text, Image} from 'react-native';
import {getProductColorByType} from 'utils/getProductColor';

const DepositCard = ({
  deposit,
  prodType,
}: {
  deposit: CLoanDeposit;
  prodType: number;
}) => {
  return (
    <View
      className="mb-4 flex-row items-center rounded-xl bg-bgLight px-4 py-4"
      key={deposit.DEP_ID}>
      <View className="mr-3 h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-bgPrimary p-3">
        <Image
          source={
            deposit.TYPE_ID === 2
              ? require('@assets/images/housedep.png')
              : deposit.TYPE_ID === 3
                ? require('@assets/images/phonedep.png')
                : require('@assets/images/cardep.png')
          }
          className="h-10 w-10"
          resizeMode="contain"
        />
      </View>
      <View>
        <Text className="text-base font-semibold text-white">
          {deposit.TYPE_ID === 2
            ? `${deposit.P_SQUARE?.toLocaleString()} м.кв`
            : deposit.TYPE_ID === 3
              ? deposit.N_PHONE_NO
              : deposit.C_PLATE_NUM}
        </Text>
        <Text
          className="mt-1 text-xs"
          style={{color: getProductColorByType(prodType)}}>
          {deposit.TYPE_ID === 2
            ? deposit.P_INTENT
            : deposit.TYPE_ID === 3
              ? 'Баталгаажсан'
              : deposit.C_EDITION || 'Автомашин'}
        </Text>
      </View>
    </View>
  );
};

export default DepositCard;
