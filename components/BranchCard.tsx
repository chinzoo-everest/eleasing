import React, {useContext} from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import SvgIcon from '@components/SvgIcon';
import {CBranch} from '@type/interfaces/Basic';
import {GlobalContext} from '@context/GlobalContext';

interface BranchCardProps {
  branch: CBranch;
  isCarLoan?: boolean;
  onPress: (branch: CBranch) => void;
}

const BranchCard = ({branch, onPress, isCarLoan}: BranchCardProps) => {
  const context = useContext(GlobalContext);

  return (
    <TouchableOpacity
      onPress={() => onPress(branch)}
      className="mb-4 flex-col rounded-md bg-bgLight py-5">
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="mx-5 text-base font-medium text-white">
            {branch.NAME}
          </Text>
          <View className="my-3 w-full border-b border-tPrimary" />
          {/* Address */}
          <View className="mb-5 flex-row items-center px-5">
            <SvgIcon
              name={isCarLoan ? 'branch_pin_car' : 'branch_pin'}
              height={10}
              width={12}
            />
            <View className="ml-5 pr-5">
              <Text className="text-sm text-tPrimary">{branch.ADDR}</Text>
            </View>
          </View>
          {/* Schedule */}
          <View className="mx-5 mb-5 flex-row items-center">
            <SvgIcon
              name={isCarLoan ? 'branch_schedule_car' : 'branch_schedule'}
              height={10}
              width={12}
            />
            <Text className="ml-5 text-sm text-tPrimary">
              {branch.TIME_TABLE}
            </Text>
          </View>

          {/* Phone number */}
          <View className="mx-5 flex-row items-center">
            <SvgIcon name="phone" height={10} width={12} />
            <Text className="ml-5 text-sm text-tPrimary">
              {context?.state.configData?.customerPhoneNo ?? ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BranchCard;
