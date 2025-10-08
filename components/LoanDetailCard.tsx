import React from 'react';
import {Text, View} from 'react-native';
import SvgIcon from './SvgIcon';

interface LoanDetailCardProps {
  title: string;
  bgColor?: string;
  textColor?: string;
  iconName?: string;
}

const LoanDetailCard: React.FC<LoanDetailCardProps> = ({
  title,
  bgColor = '#6265FE',
  textColor = '#ffffff',
  iconName,
}) => {
  return (
    <View
      className="w-full flex-row items-center justify-center rounded-full p-5"
      style={{backgroundColor: bgColor}}>
      {iconName && (
        <View className="mr-2">
          <SvgIcon name={iconName} width={20} height={20} />
        </View>
      )}
      <Text className="text-base font-medium" style={{color: textColor}}>
        {title}
      </Text>
    </View>
  );
};

export default LoanDetailCard;
