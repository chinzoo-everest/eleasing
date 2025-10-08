import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {View} from 'react-native';
import {Config} from '@customConfig/config';

type Props = {
  progress: number;
  min: number;
  max: number;
  prodType?: number;
};

const ProgressBar = ({progress, min, max, prodType}: Props) => {
  const percentage = ((progress - min) / (max - min)) * 100;

  // Define gradient colors based on PROD_ID
  let gradientColors;

  if (prodType === Config.CAR_PROD_TYPE) {
    // Car loan - blue
    gradientColors = ['#fff', '#fff'];
  } else if (prodType === Config.DEPOSIT_PROD_TYPE) {
    // Deposit loan - yellow
    gradientColors = ['#fff', '#fff'];
  } else if (prodType === Config.PHONE_PROD_TYPE) {
    // Phone loan - green
    gradientColors = ['#fff', '#fff'];
  } else {
    // Default - purple
    gradientColors = ['#fff', '#fff'];
  }

  return (
    <View className="h-2.5 w-full overflow-hidden rounded-full bg-[#51565E]">
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{
          height: 8,
          borderRadius: 33,
          width: `${percentage}%`,
        }}
      />
    </View>
  );
};

export default ProgressBar;
