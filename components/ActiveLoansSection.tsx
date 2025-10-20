import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { CLoanInfo } from "@type/interfaces/Loan";
import LoanListItem from "./LoanListItem";
import EmptyLoanState from "./EmptyLoanState";

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
        className="relative z-10 mt-6 rounded-lg "
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 600,
          delay: 300,
        }}
      >
        <Text className="text-lg mx-4 font-bold text-[#131A43] mb-2">
          Идэвхитэй зээл
        </Text>

        {loanList.map((item) => (
          <LoanListItem
            key={item.LOAN_ID}
            item={item}
            onPress={() => onLoanPress(item)}
          />
        ))}
      </MotiView>
    );
  }

  // if (!isSubmitting) {
  //   return (
  //     <EmptyLoanState
  //       title=" "
  //       description="Танд идэвхитэй зээл байхгүй байна"
  //     />
  //   );
  // }

  return null;
};

export default ActiveLoansSection;
