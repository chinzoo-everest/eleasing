import {cn} from '@utils/cn';
import React from 'react';
import {Text, View} from 'react-native';
import SvgIcon from './SvgIcon';

type ContractStepperProps = {
  activeIndex: number;
  className?: string;
};

const ContractStepper = ({
  activeIndex,
  className,
  ...props
}: ContractStepperProps) => {
  return (
    <View className={cn('px-12 py-10', className)} {...props}>
      <View className="relative flex-row items-center justify-between">
        <View className="absolute left-0 right-0 top-1/2 h-px flex-1 -translate-y-1/2 bg-[#525457]" />
        {Array.from({length: 7}).map((_, index) => (
          <View key={index} className="bg-bgPrimary p-0.5">
            {activeIndex > index ? (
              <SvgIcon name="check_circle" height={25} width={25} />
            ) : (
              <View
                className={cn(
                  'bg-black, h-[25px] w-[25px] rounded-full border border-white opacity-50',
                  activeIndex === index && 'opacity-100',
                )}>
                {activeIndex === index && (
                  <Text className="my-auto text-center text-white">
                    {index + 1}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default ContractStepper;
