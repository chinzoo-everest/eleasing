import SvgIcon from '@components/SvgIcon';
import {Config} from '@customConfig/config';
import {Ionicons} from '@expo/vector-icons';
import {CCustProd} from '@type/interfaces/Customer';
import {LoanRequest} from '@type/interfaces/DepositLoan';
import {routePush} from '@utils/routePush';
import {LinearGradient} from 'expo-linear-gradient';
import {useRouter} from 'expo-router';
import {ImageBackground, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getProductColorByType} from 'utils/getProductColor';
import LoanRequestStatus from './LoanRequestStatus';

interface LoanOnboardProps {
  loanRequest?: LoanRequest;
  custProd?: CCustProd;
  title: string;
  description: string;
  nextScreen: string;
  nextScreenParams?: any;
  backgroundImage?: any;
  period: string;
  interest: string;
  maxLoan: string;
  showInfoIcon?: boolean;
  requestIconName?: string;
  onBackPress?: () => void; // Custom back button handler
}

export default function LoanOnboard({
  loanRequest,
  custProd,
  title,
  description,
  nextScreen,
  nextScreenParams,
  backgroundImage,
  period,
  interest,
  maxLoan,
  showInfoIcon = false,
  requestIconName = 'get_loan_header_deposit',
  onBackPress,
}: LoanOnboardProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (loanRequest) {
    return (
      <LoanRequestStatus
        loanRequest={loanRequest}
        productName={custProd?.NAME || ''}
        productLimit={loanRequest.REQ_AMT || 0}
        productType={custProd?.APP_PROD_TYPE}
        iconName={requestIconName}
      />
    );
  }

  const renderContent = () => (
    <LinearGradient
      colors={
        custProd?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE
          ? ['#BFA75B33', 'transparent']
          : custProd?.APP_PROD_TYPE === Config.PHONE_PROD_TYPE
            ? [
                'rgba(255, 82, 82, 0.3)',
                'rgba(255, 82, 82, 0.1)',
                'transparent',
              ]
            : ['rgba(68, 68, 68, 0.57)', 'transparent']
      }
      start={
        custProd?.APP_PROD_TYPE === Config.PHONE_PROD_TYPE
          ? {x: 0, y: 0}
          : {
              x: 0.1,
              y: custProd?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE ? 0.4 : 0,
            }
      }
      end={
        custProd?.APP_PROD_TYPE === Config.PHONE_PROD_TYPE
          ? {x: 0.5, y: 1}
          : {
              x: 1,
              y: custProd?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE ? 1 : 0,
            }
      }
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: '6%',
      }}>
      <View
        style={{marginTop: '4%', marginBottom: '5%'}}
        className="flex-row items-center justify-between">
        <TouchableOpacity onPress={onBackPress || (() => router.back())}>
          <SvgIcon name="back" />
        </TouchableOpacity>
        {showInfoIcon && (
          <Ionicons
            name="information-circle-outline"
            size={40}
            color={getProductColorByType(custProd?.APP_PROD_TYPE)}
          />
        )}
      </View>

      <Text
        className={`mb-[5%] ${
          custProd?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE ? 'mr-[20%]' : ''
        } mt-[10%] text-3xl font-extrabold uppercase leading-snug text-white`}>
        {title}
      </Text>

      <Text className="mb-[5%] text-base leading-relaxed text-gray-300">
        {`${description}`}
      </Text>

      <View
        style={{
          marginTop: 'auto',
          marginBottom:
            custProd?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE ? '8%' : '10%',
        }}>
        <View style={{marginBottom: '6%'}}>
          <Text
            style={{
              color: getProductColorByType(custProd?.APP_PROD_TYPE),
            }}>
            Зээлийн хугацаа
          </Text>
          <Text className="mt-1 text-4xl font-semibold text-white">
            <Text
              style={{color: getProductColorByType(custProd?.APP_PROD_TYPE)}}
              className="text-4xl font-semibold">
              •{' '}
            </Text>
            {period}
          </Text>
        </View>
        <View style={{marginBottom: '6%'}}>
          <Text
            style={{
              color: getProductColorByType(custProd?.APP_PROD_TYPE),
            }}>
            Зээлийн хүү
          </Text>
          <Text className="mt-1 text-4xl font-semibold text-white">
            <Text
              style={{color: getProductColorByType(custProd?.APP_PROD_TYPE)}}
              className="text-4xl font-semibold">
              •{' '}
            </Text>
            {interest}
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: getProductColorByType(custProd?.APP_PROD_TYPE),
            }}>
            Зээлийн дээд хэмжээ
          </Text>
          <Text className="mt-1 text-4xl font-semibold text-white">
            <Text
              style={{color: getProductColorByType(custProd?.APP_PROD_TYPE)}}
              className="text-4xl font-semibold">
              •{' '}
            </Text>
            {maxLoan}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginBottom: insets.bottom,
        }}
        className="mt-[5%] items-end">
        <View className="flex-row items-center">
          <Text className="mr-3 mt-2 text-base text-neutral-300">Эхлүүлэх</Text>
          <TouchableOpacity
            style={{
              backgroundColor:
                custProd?.APP_PROD_TYPE === Config.DEPOSIT_PROD_TYPE
                  ? '#FFDA7E'
                  : custProd?.APP_PROD_TYPE === Config.PHONE_PROD_TYPE
                    ? '#FF5252'
                    : '#00C7EB',
            }}
            className="h-14 w-14 items-center justify-center rounded-full"
            onPress={() => {
              routePush(nextScreen, nextScreenParams);
            }}>
            <Ionicons name="arrow-forward" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  if (backgroundImage) {
    return (
      <View className="flex-1 overflow-hidden">
        <ImageBackground
          source={backgroundImage}
          style={{flex: 1}}
          imageStyle={{resizeMode: 'cover', marginTop: -80, marginLeft: -120}}>
          {renderContent()}
        </ImageBackground>
      </View>
    );
  }

  return <View className="flex-1 bg-bgPrimary">{renderContent()}</View>;
}
