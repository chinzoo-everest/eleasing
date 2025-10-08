import React from 'react';
import {View, Text} from 'react-native';
import {MotiView} from 'moti';
import {CLoanInfo} from '@type/interfaces/Loan';
import LoanListItem from './LoanListItem';
import EmptyLoanState from './EmptyLoanState';

interface ActiveLoansSectionProps {
  loanList: CLoanInfo[];
  isSubmitting: boolean;
  onLoanPress: (item: CLoanInfo) => void;
}

const ActiveLoansSection = ({
  loanList,
  isSubmitting,
  onLoanPress,
}: ActiveLoansSectionProps) => {
  if (loanList.length > 0) {
    return (
      <MotiView
        className="relative z-10 mt-5 rounded-lg py-6"
        from={{opacity: 0, translateY: 20}}
        animate={{opacity: 1, translateY: 0}}
        transition={{
          type: 'timing',
          duration: 600,
          delay: 300,
        }}>
        <Text className="text-lg font-bold text-white">Идэвхитэй зээл</Text>
        <View className="width-full -mx-10 mb-4 mt-2 h-px bg-gray-500" />

        {loanList.map(item => (
          <LoanListItem
            key={item.LOAN_ID}
            item={item}
            onPress={() => onLoanPress(item)}
          />
        ))}
      </MotiView>
    );
  }

  if (!isSubmitting) {
    return (
      <EmptyLoanState
        title=" "
        description="Танд идэвхитэй зээл байхгүй байна"
      />
    );
  }

  return null;
};

export default ActiveLoansSection;
