import SvgIcon from '@components/SvgIcon';
import {ContractAction} from '@constant/contract';
import {Config} from '@customConfig/config';
import {SCREENS} from '@customConfig/route';
import {CCustProd, CScreen} from '@type/interfaces/Customer';
import {cn} from '@utils/cn';
import {routePush} from '@utils/routePush';
import React, {useMemo} from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';

type Props = {
  source: CCustProd;
  screenData: CScreen;
  handleGetLoan?: (source: CCustProd) => void;
  cardWidth?: number;
  index: number;
};

// Background images for loan types
const CARD_BACKGROUNDS: Record<string, any> = {
  [Config.CAR_PROD_TYPE]: require('@assets/images/purplecard.png'),
  [Config.DEPOSIT_PROD_TYPE]: require('@assets/images/goldencard.png'),
  [Config.PHONE_PROD_TYPE]: require('@assets/images/silvercard.png'),
  default: require('@assets/images/purplecard.png'),
};

const LoanCard = React.memo(
  ({source, screenData, handleGetLoan, cardWidth, index = 0}: Props) => {
    const windowWidth = Dimensions.get('window').width;
    const defaultWidth = windowWidth * 0.59;
    const defaultHeight = windowWidth * 0.6;

    const backgroundImage = useMemo(() => {
      return CARD_BACKGROUNDS[source.APP_PROD_TYPE] || CARD_BACKGROUNDS.default;
    }, [source.APP_PROD_TYPE]);

    const shouldShowPeriodAndInterest = useMemo(() => {
      return (
        (screenData?.TITLE !== 'None' && screenData?.TITLE !== '') ||
        source.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE ||
        source.APP_PROD_TYPE === Config.PHONE_PROD_TYPE
      );
    }, [screenData?.TITLE, source.APP_PROD_TYPE]);

    const isDigitalOrCarLoan = useMemo(() => {
      return (
        source.APP_PROD_TYPE === Config.DIGITAL_PROD_TYPE ||
        source.APP_PROD_TYPE === Config.CAR_PROD_TYPE
      );
    }, [source.APP_PROD_TYPE]);

    const isDepositOrPhoneLoan = useMemo(() => {
      return (
        source.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE ||
        source.APP_PROD_TYPE === Config.PHONE_PROD_TYPE
      );
    }, [source.APP_PROD_TYPE]);

    const renderBottomSection = () => {
      if (
        (screenData?.ACTION_CODE === ContractAction.UNAVAILABLE_LOAN ||
          screenData?.ACTION_CODE === ContractAction.REJECT_LOAN) &&
        isDigitalOrCarLoan
      ) {
        return (
          <View className="flex-col p-4">
            <Text className="text-sm font-bold text-black">
              {screenData?.TITLE}
            </Text>
            <Text className="text-[9px] font-medium text-black/70">
              {screenData?.DESCR}
            </Text>
            {screenData?.REASON && (
              <Text className="text-[9px] font-medium text-black/70">
                <Text className="font-bold">Шалтгаан: </Text>
                {screenData?.REASON}
              </Text>
            )}
          </View>
        );
      } else if (
        (screenData?.ACTION_CODE === ContractAction.SEND_CONTRACT ||
          screenData?.ACTION_CODE === ContractAction.CALC_LOAN_AMT ||
          screenData?.ACTION_CODE === ContractAction.RETURN_LOAN ||
          screenData?.ACTION_CODE === ContractAction.VERIFY_ACC) &&
        isDigitalOrCarLoan
      ) {
        return (
          <View className="flex-col p-4">
            <Text className="text-[9px] font-medium text-black/70">
              {`Зээлийн дээд хэмжээ `}
              <Text className="font-bold">{`${(source?.LOAN_MAX || 0).toLocaleString('mn-MN')}₮`}</Text>
              {` хүртэл боломжтой`}
            </Text>
            <TouchableOpacity
              onPress={() => handleGetLoan && handleGetLoan(source)}
              className="mt-2 w-full rounded-lg bg-black"
              style={{height: windowWidth * 0.13}}>
              <View className="flex-1 flex-row items-center justify-between rounded-md">
                <Text className="text-[12px] font-medium text-white">
                  {(screenData?.ACTION_CODE as ContractAction) ===
                  ContractAction.CALC_LOAN_AMT
                    ? 'Эрх бодох'
                    : 'Эрх тогтоох'}
                </Text>
                <SvgIcon name="loancard_request_arrow" />
              </View>
            </TouchableOpacity>
          </View>
        );
      } else if (isDepositOrPhoneLoan) {
        return (
          <View className="flex-col p-4">
            <Text className="text-[9px] font-medium text-black/70">
              {`Зээлийн дээд хэмжээ `}
              <Text className="font-bold">{`${(source?.LOAN_MAX || 0).toLocaleString('mn-MN')}₮`}</Text>
              {` хүртэл боломжтой`}
            </Text>
            <TouchableOpacity
              onPress={() => handleGetLoan && handleGetLoan(source)}
              disabled={screenData?.ACTION_CODE === ContractAction.SUSPEND_ACC}
              className={cn(
                'mt-2 w-full rounded-lg bg-black',
                screenData?.ACTION_CODE === ContractAction.SUSPEND_ACC &&
                  'opacity-50',
              )}
              style={{height: windowWidth * 0.13}}>
              <View className="flex-1 flex-row items-center justify-between rounded-md px-3">
                <Text className="text-[12px] font-medium text-white">
                  Хүсэлт илгээх
                </Text>
                <SvgIcon name="loancard_request_arrow" />
              </View>
            </TouchableOpacity>
          </View>
        );
      } else {
        return (
          <View>
            <View className="flex-row">
              <Text className="mr-16 mt-1 text-sm font-medium text-white">
                Зээлийн эрх
              </Text>
              <Text
                className={cn(
                  'self-center text-3xl font-bold text-white',
                  source.APP_PROD_TYPE === Config.CAR_PROD_TYPE &&
                    '-mt-2 text-xl',
                )}>
                ₮{(source.LOAN_LIMIT || 0).toLocaleString('mn-MN')}
              </Text>
            </View>

            <View className="flex items-start justify-center px-4">
              {source.APP_PROD_TYPE === Config.CAR_PROD_TYPE &&
                isDigitalOrCarLoan && (
                  <TouchableOpacity
                    onPress={() => routePush(SCREENS.AMT_REQUEST_TYPE)}
                    className="mt-2 rounded-xl border border-black/30">
                    <Text className="text-xs font-medium text-black">
                      Эрх нэмэх
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        );
      }
    };

    try {
      return (
        <TouchableOpacity
          onPress={() => handleGetLoan && handleGetLoan(source)}
          disabled={
            isDepositOrPhoneLoan ||
            (screenData.TITLE !== 'None' && screenData.TITLE !== '')
          }
          delayPressIn={50}
          style={{
            height: defaultHeight,
            width: cardWidth || defaultWidth,
          }}
          className="overflow-hidden rounded-2xl shadow-lg">
          <ImageBackground
            source={backgroundImage}
            resizeMode="cover"
            style={{flex: 1}}
            imageStyle={{borderRadius: 16}}>
            <View className="flex-1 justify-between p-5">
              <View className="">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center justify-center">
                    <SvgIcon name="loancardicon" width={50} height={50} />
                    <Text className="ml-2 text-base font-bold uppercase text-white">
                      <Text className="self-center text-base font-light text-white">
                        |{' '}
                      </Text>
                      {source.NAME}
                    </Text>
                  </View>
                </View>
                <View className="mt-4">
                  <SvgIcon name={'onboard1'} height={37} width={44} />
                </View>

                {screenData?.TITLE !== 'None' &&
                  screenData?.TITLE !== '' &&
                  isDigitalOrCarLoan && (
                    <View className="-mx-1 mr-auto rounded-lg bg-red-500 p-1.5">
                      <Text className="text-xs font-bold text-white">
                        {screenData?.TITLE}
                      </Text>
                    </View>
                  )}
                {screenData?.ACTION_CODE === ContractAction.RETURN_LOAN &&
                  isDigitalOrCarLoan && (
                    <View className="flex-col">
                      <Text className="text-xs font-medium text-black/70">
                        {screenData?.DESCR}
                      </Text>
                      {screenData?.REASON && (
                        <Text className="text-xs font-medium text-black/70">
                          <Text className="font-bold">Шалтгаан: </Text>
                          {screenData?.REASON}
                        </Text>
                      )}
                    </View>
                  )}
              </View>
              {/* Bottom section */}
              <View>{renderBottomSection()}</View>

              {/* Loan limit, Date*/}
              <View className="red-300 flex-row">
                <View className="flex-col">
                  <Text className="text-sm font-medium text-white">
                    {shouldShowPeriodAndInterest ? 'Хугацаа' : 'Үлдэгдэл эрх'}
                  </Text>
                  <Text className="text-sm font-medium text-white">
                    {shouldShowPeriodAndInterest
                      ? 'Сарын хүү'
                      : 'Хүчинтэй хугацаа'}
                  </Text>
                </View>

                <View className="ml-5 mr-4 flex-col">
                  <Text className="text-sm font-semibold text-white">
                    ₮
                    {shouldShowPeriodAndInterest
                      ? `${source.PERIOD_MAX} сар`
                      : (
                          (source.LOAN_LIMIT || 0) - (source.LOAN_AMT || 0)
                        ).toLocaleString('mn-MN')}
                  </Text>
                  <Text className="text-sm font-semibold text-white">
                    {shouldShowPeriodAndInterest
                      ? `${source.INTEREST_MIN}% - ${source.INTEREST_MAX}%`
                      : source.EXP_DATE
                        ? new Date(source.EXP_DATE)
                            .toLocaleDateString('en-CA', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })
                            .replace(/[-]/g, '.')
                            .replace(',', '')
                        : '0000.00.00'}
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering LoanCard:', error);
      return null;
    }
  },
);

LoanCard.displayName = 'LoanCard';
export default LoanCard;
