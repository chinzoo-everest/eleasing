import React from 'react';
import {Text, View} from 'react-native';

import Button from './Button';
import {CCustProd} from '@type/interfaces/Customer';
import {scale} from '@app/utils/scaling';
import {routePush} from '@utils/routePush';

type Props = {
  navigation: any;
  source: CCustProd;
  page?: 'home' | 'bonus';
  cardWidth?: number;
  handleGetLoan?: (source: CCustProd) => void;
};

const LoanCard = ({
  source,
  page,
  handleGetLoan,
  navigation,
  cardWidth,
  ...props
}: Props) => {
  return (
    <View className="h-50 w-72 rounded-md bg-gray-100">
      <View className="flex w-full flex-col items-start rounded-md bg-white p-6">
        <Text className="text-primary text-lg">{source.NAME}</Text>
        <View className="flex w-full flex-col space-y-6 pt-4">
          <View className="flex flex-col space-y-2">
            <Text className="text-tPrimary text-sm uppercase">зээлийн эрх</Text>
            <View className="bg-bgThird w-full rounded-md p-3">
              <Text
                className="text-primary text-2xl font-bold"
                style={{fontSize: scale(24)}}>
                {source.LOAN_LIMIT.toLocaleString('mn-MN')}
              </Text>
            </View>
          </View>
          {/* <View className="flex flex-col space-y-2">
            <Text className="text-sm uppercase text-tPrimary">зээлийн хүү</Text>
            <View className="mt-2 w-full rounded-md bg-bgThird p-3">
              <Text
                className="text-2xl font-bold text-primary"
                style={{fontSize: scale(24)}}>
                {source?.INTEREST.toFixed(2) || 0} %
              </Text>
            </View>
          </View> */}
          <Button
            text="Дэлгэрэнгүй"
            fillColor="#34837B"
            isTextBold={true}
            onPress={() => {
              routePush('../../loan/bonuscarddetail');
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default LoanCard;
