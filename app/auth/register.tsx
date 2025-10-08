import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Header from '@components/Header';
import {useLocalSearchParams} from 'expo-router';
import * as Network from 'expo-network';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Config} from '@customConfig/config';
import {
  DEFAULT_LOADING_CONTENT,
  getCustomHtmlContent,
} from '@services/html.service';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import HtmlRenderer from '@components/HtmlRenderer';
import Button from '@components/Button';
import CheckBox from '@components/CheckBox';
import {showToast} from '@utils/showToast';
import {routePush} from '@utils/routePush';
import {SCREENS} from '@customConfig/route';
import SettingsInput from '@components/SettingsInput';
import {Controller, useForm, useWatch} from 'react-hook-form';
import RegInput from '@components/RegInput';
import CustomScrollView from '@components/CustomScrollView';
import {yupResolver} from '@hookform/resolvers/yup';
import {
  registerFormSchema,
  registerPasswordFormSchema,
} from '@utils/validators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateUnregisteredPhoneVerifyCode,
  sendRegisterUser,
} from '@services/auth.service';
import PasswordCretCorrect from '@assets/images/pass.svg';
import PasswordCretWrong from '@assets/images/reject.svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

// Password criteria item component
const PasswordCriteriaItem = ({isValid, text}) => (
  <View style={styles.checkItem}>
    {isValid ? <PasswordCretCorrect /> : <PasswordCretWrong />}
    <Text style={styles.checkText}>{text}</Text>
  </View>
);

const Register = () => {
  const {isPassed, phoneNo, regNo} = useLocalSearchParams();
  const [isConnected, setIsConnected] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const [htmlContent, setHtmlContent] = useState<string>(
    DEFAULT_LOADING_CONTENT,
  );

  // Animation values
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);

  // Animated styles
  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      opacity: opacity1.value,
      display: opacity1.value === 0 ? 'none' : 'flex',
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      opacity: opacity2.value,
      display: opacity2.value === 0 ? 'none' : 'flex',
    };
  });

  const animatedStyle3 = useAnimatedStyle(() => {
    return {
      opacity: opacity3.value,
      display: opacity3.value === 0 ? 'none' : 'flex',
    };
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(registerFormSchema),
    defaultValues: {
      phone_no: '',
      reg_no: '',
    },
  });

  const {
    control: controlPassword,
    handleSubmit: handleSubmitPassword,
    formState: {errors: errorsPassword},
  } = useForm({
    resolver: yupResolver(registerPasswordFormSchema),
    defaultValues: {
      new_password: '',
      new_password_confirm: '',
    },
  });

  // Combined network check and HTML content fetching
  useEffect(() => {
    const checkConnectionAndFetchContent = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(networkState.isConnected ?? false);

        if (networkState.isConnected) {
          setIsSubmitting(true);
          const url = Config.TERMS_SERVICE_URL || '';
          const response = await getCustomHtmlContent(url);
          setHtmlContent(response.content);
        }
      } catch (error) {
        handleErrorExpo(error, 'Terms - fetchHtmlContent');
      } finally {
        setIsSubmitting(false);
      }
    };

    checkConnectionAndFetchContent();
  }, []);

  // Set initial step based on isPassed
  useEffect(() => {
    if (isPassed === 'true') {
      setCurrentStep(3);
      opacity1.value = 0;
      opacity2.value = 0;
      opacity3.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPassed]);

  // Changes the step with an opacity animation
  const changeStep = newStep => {
    const duration = 300;

    // First fade out current step
    if (currentStep === 1) {
      opacity1.value = withTiming(0, {duration});
    } else if (currentStep === 2) {
      opacity2.value = withTiming(0, {duration});
    } else if (currentStep === 3) {
      opacity3.value = withTiming(0, {duration});
    }

    // Update current step state
    setCurrentStep(newStep);

    // Then fade in new step
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      if (newStep === 1) {
        opacity1.value = withTiming(1, {duration});
      } else if (newStep === 2) {
        opacity2.value = withTiming(1, {duration});
      } else if (newStep === 3) {
        opacity3.value = withTiming(1, {duration});
      }
    }, duration); // Wait for fade out to complete
  };

  const handleTerms = () => {
    if (!isChecked) {
      showToast(
        'Анхааруулах',
        'Үйлчилгээний нөхцөлийг хүлээн зөвшөөрнө үү.',
        'error',
      );
      return;
    }

    changeStep(2);
  };

  const onVerifyRegister = async (data: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await AsyncStorage.removeItem('access_token');
      const result = await generateUnregisteredPhoneVerifyCode(
        data.phone_no,
        data.reg_no,
      );
      if (!result) return;

      await routePush(SCREENS.VERIFY_OTP, {
        mode: 'verifyNewPhone',
        regNo: data.reg_no,
        phoneNo: data.phone_no,
      });
    } catch (error) {
      handleErrorExpo(error, 'Register - onVerifyRegister');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newPassword = useWatch({
    control: controlPassword,
    name: 'new_password',
    defaultValue: '',
  });

  const passwordCriteria = useMemo(
    () => ({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      digit: /[0-9]/.test(newPassword),
      specialChar: /[^A-Za-z0-9]/.test(newPassword),
    }),
    [newPassword],
  );

  const allCriteriaMet = useMemo(
    () =>
      passwordCriteria.length &&
      passwordCriteria.uppercase &&
      passwordCriteria.lowercase &&
      passwordCriteria.digit &&
      passwordCriteria.specialChar,
    [passwordCriteria],
  );

  const onFinishRegister = async (data: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const result = await sendRegisterUser(
        regNo as string,
        phoneNo as string,
        data.new_password,
        token as string,
      );
      if (!result) return;

      showToast(
        'Амжилттай',
        'Бүртгэл амжилттай үүслээ. Та бүртгүүлсэн мэдээллээрээ нэвтрэн орно уу',
      );
      await routePush(SCREENS.LOGIN, {}, true);
    } catch (error) {
      handleErrorExpo(error, 'Register - onFinishRegister');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step content components for better organization
  const renderTermsStep = () => (
    <View className="flex-1">
      <HtmlRenderer htmlContent={htmlContent} containerClassName="px-4" />
      <View className="px-5 pt-6">
        <View className="mx-1 mb-4">
          <CheckBox
            isChecked={isChecked}
            text={'Нөхцөлийг хүлээн зөвшөөрч байна.'}
            toggleCheckbox={() => setIsChecked(!isChecked)}
          />
        </View>
        <Button
          disabled={!isChecked}
          isLoading={isSubmitting}
          onPress={handleTerms}
          className="mb-8"
          isTextBold={true}
          text="Үргэлжлүүлэх"
        />
      </View>
    </View>
  );

  const renderRegisterFormStep = () => (
    <CustomScrollView>
      <View className="mt-5 flex-1 px-4">
        <Controller
          control={control}
          name="reg_no"
          render={({field}) => (
            <RegInput
              isReadOnly={isSubmitting}
              label="Регистрийн дугаар"
              backgroundColor="#0B0B13"
              onChangeText={field.onChange}
              errorString={errors.reg_no?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phone_no"
          render={({field}) => (
            <SettingsInput
              label="Утасны дугаар"
              value={field.value}
              maxLength={8}
              keyboard="phone-pad"
              onChangeText={field.onChange}
              errorString={errors.phone_no?.message}
            />
          )}
        />
      </View>
      <Button
        isLoading={isSubmitting}
        className="mx-4 mt-5"
        onPress={handleSubmit(onVerifyRegister)}
        isTextBold
        text="Баталгаажуулах"
      />
    </CustomScrollView>
  );

  const renderPasswordStep = () => (
    <CustomScrollView>
      <View className="mt-5 flex-1 px-4">
        <Controller
          control={controlPassword}
          name="new_password"
          render={({field}) => (
            <SettingsInput
              label="Шинэ нууц үг"
              mode="password"
              value={field.value}
              onChangeText={field.onChange}
              errorString={errorsPassword.new_password?.message}
              className="mt-2"
            />
          )}
        />
        <Controller
          control={controlPassword}
          name="new_password_confirm"
          render={({field}) => (
            <SettingsInput
              label="Шинэ нууц үг /давтах/"
              mode="password"
              value={field.value}
              onChangeText={field.onChange}
              errorString={errorsPassword.new_password_confirm?.message}
              className="mt-2"
            />
          )}
        />
        <View
          style={styles.checklistContainer}
          className="flex flex-col gap-y-4 px-4">
          <PasswordCriteriaItem
            isValid={passwordCriteria.length}
            text="8 болон түүнээс олон тэмдэгтэй байх"
          />
          <PasswordCriteriaItem
            isValid={passwordCriteria.uppercase}
            text="Том үсэг агуулсан байх"
          />
          <PasswordCriteriaItem
            isValid={passwordCriteria.lowercase}
            text="Жижиг үсэг агуулсан байх"
          />
          <PasswordCriteriaItem
            isValid={passwordCriteria.digit}
            text="Тоо агуулсан байх"
          />
          <PasswordCriteriaItem
            isValid={passwordCriteria.specialChar}
            text="Тусгай тэмдэгт агуулсан байх"
          />
        </View>
      </View>
      <Button
        isLoading={isSubmitting}
        disabled={!allCriteriaMet}
        className="mx-4 mt-5"
        onPress={handleSubmitPassword(onFinishRegister)}
        isTextBold
        text="Баталгаажуулах"
      />
    </CustomScrollView>
  );

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        title="Бүртгүүлэх"
        onBack={() => routePush(SCREENS.LOGIN, {}, true)}
        bgColor="#0B0B13"
      />
      <View className="flex-1">
        {!isConnected ? (
          <Text className="m-[20px] text-center">
            Интернэт сүлжээнд холбогдоогүй байна.
          </Text>
        ) : (
          <View className="flex-1">
            <Animated.View style={[styles.stepContainer, animatedStyle1]}>
              {renderTermsStep()}
            </Animated.View>
            <Animated.View style={[styles.stepContainer, animatedStyle2]}>
              {renderRegisterFormStep()}
            </Animated.View>
            <Animated.View style={[styles.stepContainer, animatedStyle3]}>
              {renderPasswordStep()}
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checklistContainer: {
    paddingTop: 15,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkText: {
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 18,
    opacity: 0.6,
  },
  disclaimer: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 12,
    color: '#00ffcc',
    lineHeight: 18,
  },
  stepContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default Register;
