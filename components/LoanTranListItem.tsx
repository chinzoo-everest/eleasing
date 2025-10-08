import {CLoanTransaction} from '@type/interfaces/Loan';
import formatDate from '@utils/formatDate';
import React from 'react';
import {Text, View} from 'react-native';

type Props = {
  item: CLoanTransaction;
  isLast: boolean;
};

const LoanTranListItem = ({item, isLast}: Props) => {
  if (!item) return null;

  return (
    <View className="mb-2 flex-row justify-between rounded border border-[#E7E8EC] px-4 py-2.5">
      <View className="flex-col">
        <View className="mb-1 flex-row items-center">
          {item.FIRST_LOAN === 0 ? (
            <Text className="text-sm font-semibold text-[#6E7074]">
              {item.TRN_DESC}
            </Text>
          ) : (
            <Text className="text-sm font-semibold text-[#3DA48D]">
              {item.TRN_DESC}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-[#6E7074] opacity-90">
            {formatDate(item.TRN_DATE || '', 'yyyy.MM.dd')}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-end space-x-2">
        {item.FIRST_LOAN === 0 ? (
          <Text className="text-base text-[#FF6D31]">
            {(item.AMT || 0).toLocaleString('mn-MN') + ' ₮'}
          </Text>
        ) : (
          <Text className="text-base font-semibold text-[#3DA48D]">
            {(item.AMT || 0).toLocaleString('mn-MN') + ' ₮'}
          </Text>
        )}
      </View>
    </View>
  );
};

export default LoanTranListItem;
