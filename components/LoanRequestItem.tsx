import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {MotiView} from 'moti';
import SvgIcon from './SvgIcon';
import {cn} from '@utils/cn';
import {LoanRequest} from '@type/interfaces/DepositLoan';
import formatDate from '@utils/formatDate';
import {getProductColorByType} from 'utils/getProductColor';
import {Config} from '@customConfig/config';

interface LoanRequestItemProps {
  item: LoanRequest;
  isExpanded: boolean;
  onToggle: () => void;
}

const LoanRequestItem = ({
  item,
  isExpanded,
  onToggle,
}: LoanRequestItemProps) => {
  const getStatusIconName = (isActive: boolean, prodType: number) => {
    if (prodType === Config.CAR_PROD_TYPE) {
      return isActive ? 'request_status_active_car' : 'carloancheck';
    }
    if (prodType === Config.PHONE_PROD_TYPE) {
      return isActive ? 'request_status_active_phone' : 'carloancheck';
    }
    return isActive ? 'request_status_active_deposit' : 'carloancheck';
  };

  const getProductIconName = (prodType: number) => {
    if (prodType === Config.CAR_PROD_TYPE) {
      return 'get_loan_header_car';
    }
    if (prodType === Config.PHONE_PROD_TYPE) {
      return 'get_loan_header_phone';
    }
    if (prodType === Config.DEPOSIT_PROD_TYPE) {
      return 'get_loan_header_deposit';
    }
    return 'get_loan_header_car';
  };

  const getProductArrowColor = (prodType: number) => {
    if (prodType === Config.CAR_PROD_TYPE) {
      return 'arrow_car';
    }
    if (prodType === Config.PHONE_PROD_TYPE) {
      return 'arrow_phone';
    }
    if (prodType === Config.DEPOSIT_PROD_TYPE) {
      return 'arrow_deposit';
    }
    return 'arrow_car';
  };

  // Find the last active status (with ID and created date)
  const findLastActiveStatusIndex = () => {
    if (!item.ST_HIS || !Array.isArray(item.ST_HIS)) return -1;

    for (let i = item.ST_HIS.length - 1; i >= 0; i--) {
      const status = item.ST_HIS[i];
      if (status.ID && status.CREATED) {
        return i;
      }
    }
    return -1;
  };

  const lastActiveIndex = findLastActiveStatusIndex();

  return (
    <MotiView
      from={{opacity: 0, translateY: 10}}
      animate={{opacity: 1, translateY: 0}}
      transition={{type: 'timing', duration: 500}}
      className="mb-3 rounded-xl bg-bgLight px-4">
      <TouchableOpacity
        className="my-4 flex-row items-center gap-4"
        onPress={onToggle}>
        <SvgIcon
          name={getProductIconName(item.APP_PROD_TYPE)}
          width={52}
          height={52}
        />
        <View className="flex-1">
          <Text className="text-base font-medium text-white">
            {item.PROD_NAME}
          </Text>
          <Text
            className="text-sm font-medium"
            style={{
              color: getProductColorByType(item.APP_PROD_TYPE),
            }}>
            {item.STATUS_ID === 2
              ? `${item.APPROVE_AMT.toLocaleString()}₮`
              : `${item.REQ_AMT.toLocaleString()}₮`}
          </Text>
          {item.ST_HIS && item.ST_HIS.length > 0 && lastActiveIndex !== -1 && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-medium capitalize text-white/60">
                {item.ST_HIS[lastActiveIndex].STATUS_NAME}
              </Text>
              <Text className="text-sm font-medium text-white/60">
                {formatDate(
                  item.ST_HIS[lastActiveIndex].CREATED,
                  'yyyy.MM.dd / HH:mm',
                )}
              </Text>
            </View>
          )}
        </View>
        <SvgIcon
          name={getProductArrowColor(item.APP_PROD_TYPE)}
          width={16}
          height={9}
          style={{
            transform: [{rotate: isExpanded ? '180deg' : '0deg'}],
          }}
        />
      </TouchableOpacity>

      <View className="h-px bg-white/10" />

      {isExpanded &&
        item.ST_HIS &&
        Array.isArray(item.ST_HIS) &&
        item.ST_HIS.length > 0 && (
          <MotiView
            from={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: 'auto'}}
            transition={{type: 'timing', duration: 300}}
            className="mb-10 mt-6 gap-3">
            {item.ST_HIS.map((state, index) => {
              const isActive =
                state.ID && state.CREATED && index === lastActiveIndex;
              const isSkipped = !state.ID || !state.CREATED;

              return (
                <View
                  key={index}
                  className={cn(
                    'flex-row items-center gap-5 rounded-xl px-4 py-4',
                    isActive && 'bg-[#181C23]',
                  )}>
                  <SvgIcon
                    name={getStatusIconName(isActive, item.APP_PROD_TYPE)}
                    style={{
                      opacity: isSkipped ? 0.3 : 1,
                    }}
                  />
                  <View className="flex-1">
                    <Text
                      className={cn(
                        'text-base font-medium capitalize text-white',
                        isSkipped && 'text-white/40',
                      )}>
                      {state.STATUS_NAME}
                    </Text>
                    {state.CREATED && (
                      <Text
                        className={cn(
                          'text-sm text-white/60',
                          isSkipped && 'text-white/40',
                        )}>
                        {formatDate(state.CREATED, 'yyyy.MM.dd / HH:mm')}
                      </Text>
                    )}
                    {state.DESCR && (
                      <Text
                        className={cn(
                          'flex-shrink flex-wrap text-sm text-white/60',
                          isSkipped && 'text-white/40',
                        )}>
                        {state.DESCR}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </MotiView>
        )}
    </MotiView>
  );
};

export default LoanRequestItem;
