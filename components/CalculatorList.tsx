import {CLoanPaymentPlan} from '@type/interfaces/Loan';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {formatNumber} from 'react-native-currency-input';

const CalculatorList = ({
  amount,
  period,
  interest,
  total,
  dataSource,
}: {
  amount: number;
  period: number;
  interest: number;
  total: number;
  dataSource: CLoanPaymentPlan[];
}) => {
  const [paymentList, setPaymentList] =
    useState<CLoanPaymentPlan[]>(dataSource);
  const formatOptions = {
    separator: '.',
    precision: 2,
    delimiter: ',',
  };

  useEffect(() => {
    setPaymentList(dataSource);
  }, [dataSource]);

  return (
    <View className="mb-5 rounded-lg">
      <Text className="font-Inter mb-4 ml-2 text-xs uppercase text-white">
        тооцооллын үр дүн
      </Text>
      <View>
        <View className="rounded-md bg-bgSecondary p-4 shadow-md">
          <View className="my-1 flex-row justify-between">
            <Text className="text-xs text-white">Зээлийн хэмжээ:</Text>
            <Text className="text-xs text-white">
              {formatNumber(amount, formatOptions)}
            </Text>
          </View>
          <View className="my-1 flex-row justify-between">
            <Text className="text-xs text-white">Зээлийн хугацаа:</Text>
            <Text className="text-xs text-white">{formatNumber(period)}</Text>
          </View>
          <View className="my-1 flex-row justify-between">
            <Text className="text-xs text-white">Зээлийн хүү:</Text>
            <Text className="text-xs text-white">
              {formatNumber(interest, formatOptions)}%
            </Text>
          </View>
          <View className="my-2.5 h-[1px] bg-[#d3d3d3]" />
          <View className="my-1 flex-row justify-between">
            <Text className="text-xs text-white">Нийт төлөх:</Text>
            <Text className="text-[14px] text-white">
              {formatNumber(total, formatOptions)}
            </Text>
          </View>
        </View>
        <View className="rounded-md px-4">
          <Text className="font-Inter mb-2 mt-6 text-xs text-white">
            Сар бүрийн төлөлтүүд
          </Text>
          {paymentList.length > 0 && (
            <View className="my-2">
              {paymentList.map((item: CLoanPaymentPlan, index) => (
                <View key={index}>
                  <View className="my-2">
                    <Text className="text-xs text-white">{item.PAY_DATE}</Text>
                  </View>
                  <View className="mb-2 h-[1px] bg-gray-400" />
                  <View className="my-1 flex-row justify-between">
                    <Text className="text-xs text-white">Төлөх дүн</Text>
                    <Text className="text-xs text-white">
                      {formatNumber(item.TOTAL, formatOptions)}
                    </Text>
                  </View>
                  <View className="my-0.5 flex-row justify-between">
                    <Text className="text-xs text-white">Хүү</Text>
                    <Text className="text-xs text-white">
                      {formatNumber(item.INT_AMT, formatOptions)}
                    </Text>
                  </View>
                  <View className="my-0.5 flex-row justify-between">
                    <Text className="text-xs text-white">Үлдэгдэл</Text>
                    <Text className="text-xs text-white">
                      {formatNumber(item.BALANCE, formatOptions)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default CalculatorList;
