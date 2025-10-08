import React from 'react';
import {Text, View} from 'react-native';
import {CLoanPaymentPlan} from '@type/interfaces/Loan';
import {cn} from '@utils/cn';
import {getProductColorByType} from 'utils/getProductColor';

type Props = {
  item: CLoanPaymentPlan;
  itemIndex: number;
  prodType: string;
};

const LoanGraphicListItem: React.FC<Props> = ({item, itemIndex, prodType}) => {
  return (
    <View className="rounded-xl bg-bgLight px-5 py-4" key={itemIndex}>
      <View className="flex-row items-center">
        <Text
          className={cn('text-xs font-medium')}
          style={{
            color: getProductColorByType(Number(prodType)),
          }}>
          {item.PAY_DATE || ''}
        </Text>
      </View>

      <View className="flex-col">
        <View className="mt-2.5 h-px w-full bg-white opacity-20" />
        <View className="mb-1.5 mt-4 flex-row justify-between">
          <Text className="text-sm text-tPrimary">Зээлээс төлөх</Text>
          <Text className="text-sm text-tPrimary">
            {item.AMT?.toLocaleString('mn-MN') || '0'}
          </Text>
        </View>
        <View className="mb-4 flex-row justify-between">
          <Text className="text-sm text-tPrimary">Хүүнээс төлөх</Text>
          <Text className="text-sm text-tPrimary">
            {item.INT_AMT?.toLocaleString('mn-MN') || '0'}
          </Text>
        </View>
        <View className="h-px w-full bg-white opacity-20" />
        <View className="my-3 flex-row justify-between">
          <Text className="text-sm text-tPrimary">Үлдэгдэл</Text>
          <Text className="text-sm text-tPrimary">
            {item.BALANCE?.toLocaleString('mn-MN') || '0'}
          </Text>
        </View>
        <View className="h-1 w-full bg-[#6265FE]" />
      </View>

      <View className="mt-3 flex-row justify-between">
        <Text className="text-sm text-tPrimary">Нийт төлөх</Text>
        <Text className="self-center text-sm font-bold text-white">
          {item.TOTAL?.toLocaleString('mn-MN') || '0'}
        </Text>
      </View>
    </View>
  );
};

export default LoanGraphicListItem;
