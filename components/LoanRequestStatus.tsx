import {View, Text} from 'react-native';
import SvgIcon from '@components/SvgIcon';
import {cn} from '@utils/cn';
import formatDate from '@utils/formatDate';
import CustomScrollView from '@components/CustomScrollView';
import Header from '@components/Header';
import {useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Config} from '@customConfig/config';
import {getProductColorByType} from 'utils/getProductColor';

type StatusHistory = {
  STATUS_NAME: string;
  CREATED: string;
  ID?: number;
  DESCR?: string;
};

interface LoanRequestStatusProps {
  loanRequest: {
    ST_HIS: StatusHistory[];
    STATUS_ID?: number;
    APPROVE_AMT?: number;
    REQ_AMT?: number;
  };
  productName: string;
  productLimit: number;
  iconName?: string;
  productType: number;
}

export default function LoanRequestStatus({
  loanRequest,
  productName,
  productLimit,
  iconName = 'get_loan_header_deposit',
  productType,
}: LoanRequestStatusProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getStatusIconName = (isActive: boolean) => {
    if (productType === Config.CAR_PROD_TYPE) {
      return isActive ? 'request_status_active_car' : 'carloancheck';
    }
    if (productType === Config.PHONE_PROD_TYPE) {
      return isActive ? 'request_status_active_phone' : 'carloancheck';
    }
    return isActive ? 'request_status_active_deposit' : 'carloancheck';
  };

  // Find the last active status (with ID and created date)
  const findLastActiveStatusIndex = () => {
    if (!loanRequest.ST_HIS || !Array.isArray(loanRequest.ST_HIS)) return -1;

    for (let i = loanRequest.ST_HIS.length - 1; i >= 0; i--) {
      const status = loanRequest.ST_HIS[i];
      if (status.ID && status.CREATED) {
        return i;
      }
    }
    return -1;
  };

  const lastActiveIndex = findLastActiveStatusIndex();

  return (
    <View className="flex-1" style={{paddingTop: insets.top}}>
      <Header title={'Зээлийн хүсэлт'} onBack={() => router.back()} />
      <CustomScrollView>
        <View className="flex-1 px-4">
          <View className="mt-10 w-full items-center">
            <SvgIcon name="arrow_right" />
          </View>

          <Text className="mt-10 text-center text-sm font-medium text-white">
            Зээлийн хүсэлт ажлын 8 цагт шийдвэрлэгдэнэ.
          </Text>
          <Text className="mt-2.5 text-center text-sm text-white/60">
            Харилцагч та өмнө илгээсэн зээлийн хүсэлтүүдийн шийдвэр гарсны дараа
            зээлийн хүсэлт илгээх боломжтой.
          </Text>

          <View className="mt-10 rounded-xl bg-bgLight px-4">
            <View className="my-4 flex-row items-center gap-4">
              <SvgIcon name={iconName} width={52} height={52} />
              <View className="flex-1">
                <Text className="text-base font-medium text-white">
                  {productName}
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: getProductColorByType(productType),
                  }}>
                  {loanRequest.STATUS_ID === 2 && loanRequest.APPROVE_AMT
                    ? `${loanRequest.APPROVE_AMT.toLocaleString()}₮`
                    : loanRequest.REQ_AMT
                      ? `${loanRequest.REQ_AMT.toLocaleString()}₮`
                      : `${productLimit.toLocaleString()}₮`}
                </Text>
                {loanRequest.ST_HIS &&
                  loanRequest.ST_HIS.length > 0 &&
                  lastActiveIndex !== -1 && (
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-medium capitalize text-white/60">
                        {loanRequest.ST_HIS[lastActiveIndex].STATUS_NAME}
                      </Text>
                      <Text className="text-sm font-medium text-white/60">
                        {formatDate(
                          loanRequest.ST_HIS[lastActiveIndex].CREATED,
                          'yyyy.MM.dd / HH:mm',
                        )}
                      </Text>
                    </View>
                  )}
              </View>
            </View>
            <View className="h-px bg-white/10" />
            {loanRequest?.ST_HIS &&
              Array.isArray(loanRequest?.ST_HIS) &&
              loanRequest?.ST_HIS.length > 0 && (
                <View className="mb-10 mt-6 gap-3">
                  {loanRequest.ST_HIS.map((state, index) => {
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
                          name={getStatusIconName(isActive)}
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
                </View>
              )}
          </View>
        </View>
      </CustomScrollView>
    </View>
  );
}
