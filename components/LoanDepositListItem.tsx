import React from 'react';
import {Text, View} from 'react-native';
import {CLoanDeposit} from '@type/interfaces/Loan';
import formatDate from '@utils/formatDate';

type Props = {
  item: CLoanDeposit;
  isLast: boolean;
};

const InfoRow = ({label, value, ...props}: {label: string; value: string}) => (
  <View className="my-2 flex-row justify-between" {...props}>
    <Text className="text-tPrimary text-base">{label}:</Text>
    <Text className="text-tDefault text-base font-semibold">{value}</Text>
  </View>
);

const LoanDepositListItem = ({item, isLast}: Props) => {
  return (
    <View>
      <View className="mx-4 w-full flex-row items-center justify-between self-center rounded-md bg-[#085544] px-4 py-3">
        <Text className="font-Inter text-xs text-white">ГЭРЭЭНИЙ ДУГААР</Text>
        <Text className="text-xs text-white">{item.CONTRACT_ID}</Text>
      </View>

      <View className="mt-4 flex-1 rounded-md border border-[#E7E8EC] px-4 py-3">
        <View className="bg-Secondary -mx-4 -my-3 mb-2 flex-row justify-between rounded-t px-4">
          <Text className="my-2 text-base font-semibold text-black">
            Барьцаа хөрөнгийн төрөл:
          </Text>
          <Text className="text-tDefault self-center text-lg font-semibold">
            {item.TYPE_NAME}
          </Text>
        </View>

        {item?.CREATED && (
          <InfoRow
            label="Барьцаанд бүртгэгдсэн огноо"
            value={
              item?.CREATED
                ? formatDate(item?.CREATED, 'yyyy.MM.dd')
                : '_______'
            }
          />
        )}
        <InfoRow label="Гэрээний дугаар" value={item.CONTRACT_ID} />
        <InfoRow label="Барьцаа дугаар" value={item.DOC_NO} />
        <InfoRow label="Хөрөнгийн нэр" value={item.DEP_NAME} />
        <InfoRow
          label={item.IS_CAR ? 'Улсын дугаар' : 'Улсын бүртгэлийн дугаар'}
          value={item.CAR_NO}
        />
        {item.IS_CAR && (
          <View className="space-y-3">
            <InfoRow label="Машины төрөл" value={item.CAR_MODEL} />
            <InfoRow label="Машины өнгө" value={item.CAR_COLOR} />
            <InfoRow label="Арлын дугаар" value={item.CAR_VIN_NO} />
            <InfoRow label="Үйлдвэрлэсэн огноо" value={item.CAR_MANU_DATE} />
            <InfoRow label="Орж ирсэн огноо" value={item.CAR_IMP_DATE} />
          </View>
        )}
        <View className="my-2 flex-row justify-between">
          <Text className="text-tDefault text-base">Нэмэлт мэдээлэл:</Text>
          <Text className="text-tDefault flex-1 break-words text-right text-base font-semibold">
            {item.DESCR}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoanDepositListItem;
