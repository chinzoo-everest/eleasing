import React from 'react';
import {View} from 'react-native';
import SvgIcon from './SvgIcon';

interface StepperProps {
  activeIndex: number;
}

const Stepper: React.FC<StepperProps> = ({activeIndex}) => {
  return (
    <View className="rounded-lg bg-bgPrimary px-12 py-10 shadow-md">
      <View className="relative flex-row items-center justify-center">
        <View className="absolute left-[20%] right-[20%] top-1/2 h-px -translate-y-1/2 bg-[#525457]" />

        {Array.from({length: 3}).map((_, index) => (
          <View key={index} className="mx-8 bg-bgPrimary p-0.5">
            {activeIndex > index ? (
              <SvgIcon name="stepper_done" height={25} width={25} />
            ) : activeIndex === index ? (
              <SvgIcon name="stepper_current" height={25} width={25} />
            ) : (
              <View className="h-6 w-6 rounded-full border border-white bg-black opacity-50" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default Stepper;
