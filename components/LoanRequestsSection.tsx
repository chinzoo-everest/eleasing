import React from 'react';
import {View} from 'react-native';
import {LoanRequest} from '@type/interfaces/DepositLoan';
import LoanRequestItem from './LoanRequestItem';
import EmptyLoanState from './EmptyLoanState';

interface LoanRequestsSectionProps {
  requestList: LoanRequest[];
  expandedItems: Record<string, boolean>;
  onToggleItem: (itemId: number) => void;
}

const LoanRequestsSection = ({
  requestList,
  expandedItems,
  onToggleItem,
}: LoanRequestsSectionProps) => {
  if (requestList.length > 0) {
    return (
      <View className="mt-5 flex-1">
        {requestList.map(item => (
          <LoanRequestItem
            key={item.ID}
            item={item}
            isExpanded={!!expandedItems[item.ID]}
            onToggle={() => onToggleItem(item.ID)}
          />
        ))}
      </View>
    );
  }

  return (
    <EmptyLoanState
      title=""
      description="Танд зээлийн хүсэлтийн түүх байхгүй байна."
    />
  );
};

export default LoanRequestsSection;
