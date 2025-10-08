import React from 'react';
import {View} from 'react-native';

type Props = {
  progress: number;
  min: number;
  max: number;
  barColor?: string;
};

const CarLoanProgressBar = ({
  progress,
  min,
  max,
  barColor = '#00C7EB',
}: Props) => {
  const percentage = ((progress - min) / (max - min)) * 100;

  return (
    <View className="h-1 w-full overflow-hidden rounded-full bg-[#33363D]">
      <View
        style={{
          height: 8,
          width: `${percentage}%`,
          backgroundColor: barColor,
          borderRadius: 33,
        }}
      />
    </View>
  );
};

export default CarLoanProgressBar;
