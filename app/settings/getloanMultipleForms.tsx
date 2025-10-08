import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {View, Text, Image} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {OtpInput} from 'react-native-otp-entry';
import {Keyboard} from 'react-native';

// Components
import Header from '@components/Header';
import CustomScrollView from '@components/CustomScrollView';
import Button from '@components/Button';
import SettingsInput from '@components/SettingsInput';
import SettingsDropdown from '@components/SettingsDropDown';
import SvgIcon from '@components/SvgIcon';

// Services and Utils
import {GlobalContext} from '@context/GlobalContext';
import {checkBankAccName, saveBank} from '@services/basic.service';
import {createPin} from '@services/auth.service';
import {generateVerifyEmailOTP} from '@services/account.service';
import {loadCustomerData} from '@services/home.service';
import {showToast} from '@utils/showToast';
import {bankFormSchema} from '@utils/validators';
import {routePush} from '@utils/routePush';
import {cn} from '@utils/cn';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {SCREENS} from '@customConfig/route';

// Types
import {CCustBank, CCustomer} from '@type/interfaces/Customer';
import {CBank} from '@type/interfaces/Combo';

// Custom ContractStepper for 3 steps
const FormStepper = ({
  activeIndex,
  className,
}: {
  activeIndex: number;
  className?: string;
}) => {
  return (
    <View className={cn('px-12 py-10', className)}>
      <View className="relative flex-row items-center justify-between">
        <View className="absolute left-0 right-0 top-1/2 h-px flex-1 -translate-y-1/2 bg-[#525457]" />
        {Array.from({length: 3}).map((_, index) => (
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

// Validation schemas
const pinFormSchema = yup.object().shape({
  pin: yup
    .string()
    .required('PIN код оруулна уу')
    .length(4, 'PIN код 4 оронтой байна'),
});

const emailFormSchema = yup.object().shape({
  email: yup
    .string()
    .required('И-мэйл хаяг оруулна уу')
    .email('И-мэйл хаяг буруу байна'),
});

interface ScreenData {
  index: number;
  title: string;
}

const screenData: Record<string, ScreenData> = {
  bank: {index: 0, title: 'Банкны данс бүртгэх'},
  pin: {index: 1, title: 'PIN код үүсгэх'},
  email: {index: 2, title: 'И-мэйл хаяг бүртгэх'},
};

const GetLoanMultipleForms = () => {
  const router = useRouter();
  const {step} = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const {state, dispatch} = useContext(GlobalContext);

  // State variables
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState('Бүртгэл');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();
  const [bankComboValues, setBankComboValues] = useState<CBank[]>([]);
  const [pin, setPin] = useState('');

  // Setup initial state from global context
  useEffect(() => {
    if (!state) return;
    const {comboValue, currentUser} = state;
    setBankComboValues(comboValue.bank);
    setCurrentCustomer(currentUser);
  }, [state]);

  // Set active index based on route params
  useEffect(() => {
    if (step) {
      setActiveIndex(screenData[step as keyof typeof screenData]?.index || 0);
      setTitle(screenData[step as keyof typeof screenData]?.title || 'Бүртгэл');
    }
  }, [step]);

  // Update title when active index changes
  useEffect(() => {
    const newKey = Object.keys(screenData)[activeIndex];
    setTitle(screenData[newKey]?.title || 'Бүртгэл');
  }, [activeIndex]);

  // Bank Form
  const {
    control: bankControl,
    handleSubmit: handleBankSubmit,
    formState: {errors: bankErrors},
  } = useForm({
    resolver: yupResolver(bankFormSchema),
    defaultValues: {
      bank: 0,
      account: '',
    },
  });

  // PIN Form
  const {
    setValue: setPinValue,
    formState: {errors: pinErrors},
  } = useForm({
    resolver: yupResolver(pinFormSchema),
    defaultValues: {
      pin: '',
    },
  });

  // Email Form
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: {errors: emailErrors},
  } = useForm({
    resolver: yupResolver(emailFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSaveBank = useCallback(
    async (formData: any) => {
      try {
        if (!currentCustomer) return;

        const checkAccNameResult = await checkBankAccName(
          formData.bank,
          formData.account,
        );

        if (!checkAccNameResult) return;

        const requestData: Partial<CCustBank> = {
          CUST_ID: currentCustomer.CUST_ID,
          CURR_CODE: 'MNT',
          ACC_NO: formData.account,
          ACC_NAME: checkAccNameResult.name,
          BANK_ID: formData.bank,
          IS_DEFAULT: 'Y',
          ROW_STATUS: 'I',
        };

        const result = await saveBank(requestData as CCustBank);
        if (!result) return;

        await loadCustomerData(dispatch);
        showToast('Амжилттай', 'Банкны дансыг амжилттай хадгаллаа', 'success');

        // Move to next step
        setActiveIndex(prevIndex => prevIndex + 1);
      } catch (error) {
        handleErrorExpo(error, 'onSaveBank');
      } finally {
        setIsLoading(false);
      }
    },
    [currentCustomer, dispatch, setIsLoading, setActiveIndex],
  );

  // Pin form submission handler
  const handlePinSubmit = useCallback(async () => {
    try {
      if (pin.length !== 4) {
        showToast('Анхааруулга', 'Пин код 4 оронтой байна', 'error');
        return;
      }

      const result = await createPin(pin);
      if (result) {
        showToast('Амжилттай', 'Пин код үүслээ', 'success');
        // Move to next step
        setActiveIndex(prevIndex => prevIndex + 1);
      }
    } catch (error) {
      handleErrorExpo(error, 'handlePinSubmit');
    } finally {
      setIsLoading(false);
    }
  }, [pin, setActiveIndex, setIsLoading]);

  // Email form submission handler
  const onSaveEmail = useCallback(
    async (formData: any) => {
      try {
        const result = await generateVerifyEmailOTP(formData.email);
        if (!result) return;

        await routePush(SCREENS.VERIFY_OTP, {
          mode: 'changeEmail',
          email: formData.email,
          returnPath: SCREENS.HOME,
        });
      } catch (error) {
        handleErrorExpo(error, 'onSaveEmail');
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading],
  );

  // Handle Next button press
  const handleNext = useCallback(async () => {
    try {
      setIsLoading(true);

      if (activeIndex === 0) {
        // Bank form submission
        await handleBankSubmit(onSaveBank)();
      } else if (activeIndex === 1) {
        // Pin form submission
        await handlePinSubmit();
      } else if (activeIndex === 2) {
        // Email form submission
        await handleEmailSubmit(onSaveEmail)();
      }
    } catch (error) {
      handleErrorExpo(error, 'handleNext');
    }
  }, [
    activeIndex,
    handleBankSubmit,
    handleEmailSubmit,
    handlePinSubmit,
    onSaveBank,
    onSaveEmail,
  ]);

  // Form components for each step
  const BankForm = useCallback(
    () => (
      <View className="flex-1 px-4">
        <Text className="mb-6 text-base font-light leading-5 text-white">
          Та зээл авахын тулд банкны дансаа бүртгүүлэх шаардлагатай.
        </Text>

        <Controller
          control={bankControl}
          name="bank"
          render={({field: {onChange, value}}) => (
            <SettingsDropdown
              disabled={isLoading}
              title="Банк"
              errorString={bankErrors.bank?.message}
              items={bankComboValues ?? []}
              selectedValue={value}
              labelName="BANK_NAME"
              valueName="BANK_ID"
              onChange={onChange}
              renderItem={(item, selected) => (
                <View
                  className={cn(
                    'flex-row items-center justify-start gap-4 rounded-lg p-3',
                    selected ? 'bg-[#A069F970]' : 'bg-transparent',
                  )}>
                  <Image
                    source={{uri: item.LOGO_URL}}
                    resizeMode="contain"
                    className="h-6 w-6"
                  />
                  <Text
                    className={cn(
                      'text-base text-white',
                      selected ? 'font-bold' : 'font-normal',
                    )}>
                    {item.BANK_NAME}
                  </Text>
                </View>
              )}
            />
          )}
        />

        <Controller
          control={bankControl}
          name="account"
          render={({field: {onChange, value}}) => (
            <SettingsInput
              readonly={isLoading}
              label="Банкны данс"
              keyboard="number-pad"
              value={value}
              errorString={bankErrors.account?.message}
              onChangeText={onChange}
            />
          )}
        />
      </View>
    ),
    [bankControl, bankErrors, bankComboValues, isLoading],
  );

  const PinFormComponent = useCallback(
    () => (
      <View className="mx-5 flex-1">
        <Text className="mb-10 text-base text-white opacity-70">
          Таны оруулсан пин кодыг зээл авах үед баталгаажуулах зорилгоор ашиглах
          болно
        </Text>
        <OtpInput
          autoFocus
          onTextChange={value => {
            setPin(value);
            setPinValue('pin', value);
            if (value.length === 4) {
              Keyboard.dismiss();
            }
          }}
          numberOfDigits={4}
          secureTextEntry
          type="numeric"
          theme={{
            pinCodeContainerStyle: {
              borderColor: '#D1D1D2',
              borderWidth: 1,
              width: '20%',
              height: 56,
            },
            focusedPinCodeContainerStyle: {
              borderColor: '#9C4FDD',
              borderWidth: 2,
            },
            focusStickStyle: {
              backgroundColor: '#9C4FDD',
            },
            pinCodeTextStyle: {
              color: '#BABABC',
              fontSize: 25,
              fontWeight: 'bold',
              textAlign: 'center',
            },
          }}
        />
        {pinErrors.pin && (
          <Text className="mt-2 text-right text-sm font-light text-red-400">
            {pinErrors.pin.message}
          </Text>
        )}
      </View>
    ),
    [pinErrors, setPinValue],
  );

  const EmailFormComponent = useCallback(
    () => (
      <View className="mx-4 flex-1">
        <View className="mt-4 flex-row rounded-xl bg-bgSecondary py-7 pl-3">
          <View className="mr-5">
            <SvgIcon name="warning" />
          </View>
          <Text className="mr-20 text-start text-sm font-light leading-5 text-white">
            Өөрийн аккаунттай холбох и-мэйл хаягаа оруулна уу. Та аюулгүй
            байдлаа хангахын тулд зөвхөн өөрийн и-мэйл хаягийг ашиглана уу.
          </Text>
        </View>

        <View className="mt-5 space-y-1 rounded-md">
          <Controller
            control={emailControl}
            name="email"
            render={({field}) => (
              <SettingsInput
                label="И-Мэйл хаяг"
                mode="email"
                value={field.value}
                keyboard="email-address"
                onChangeText={text => {
                  field.onChange(text);
                }}
                errorString={emailErrors.email?.message}
              />
            )}
          />
        </View>
        <Text className="ml-2 mt-1 w-[70%] text-xs font-light text-white">
          Дээрх имэйл хаяг руу баталгаажуулах код илгээх болно.
        </Text>
      </View>
    ),
    [emailControl, emailErrors],
  );

  // Render content based on active index
  const renderContent = useMemo(() => {
    switch (activeIndex) {
      case 0:
        return <BankForm />;
      case 1:
        return <PinFormComponent />;
      case 2:
        return <EmailFormComponent />;
      default:
        return null;
    }
  }, [BankForm, EmailFormComponent, PinFormComponent, activeIndex]);

  return (
    <View
      className={cn('flex-1 bg-bgPrimary')}
      style={{paddingTop: insets.top}}>
      <Header
        title="Шаардлагатай мэдээлэл"
        onBack={() => router.back()}
        bgColor="#0B0B13"
        showBottomLine={false}
      />
      <View className="flex-1">
        <FormStepper activeIndex={activeIndex} className="mx-3.5" />
        <View className="mb-2 h-[0.5px] w-full border-b border-gray-500"></View>
        <Text className="font-montserrat mb-4 ml-4 mr-40 mt-4 text-2xl font-extrabold uppercase text-white">
          {title}
        </Text>

        <CustomScrollView className="flex-1 pt-2">
          {renderContent}
        </CustomScrollView>

        <Button
          text={activeIndex === 2 ? 'Хадгалах' : 'Үргэлжлүүлэх'}
          isLoading={isLoading}
          className="mx-4 mt-5"
          style={{marginBottom: insets.bottom}}
          onPress={handleNext}
        />
      </View>
    </View>
  );
};

export default GetLoanMultipleForms;
