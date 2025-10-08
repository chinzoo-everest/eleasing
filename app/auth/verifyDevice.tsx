import {SCREENS} from '@customConfig/route';
import Button from '@components/Button';
import CheckBox from '@components/CheckBox';
import CustomScrollView from '@components/CustomScrollView';
import Header from '@components/Header';
import SvgIcon from '@components/SvgIcon';
import {
  generateVerifyCode,
  generateVerifyEmailCode,
} from '@services/auth.service';
import {cn} from '@utils/cn';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {routePush} from '@utils/routePush';
import {router, useLocalSearchParams} from 'expo-router';
import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const VerifyDevice = () => {
  const insets = useSafeAreaInsets();
  const {phoneNo, email} = useLocalSearchParams();
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [isRememberDevice, setIsRememberDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let result;
      if (mode === 'email') {
        result = await generateVerifyEmailCode(
          email as string,
          phoneNo as string,
        );
      } else {
        result = await generateVerifyCode(phoneNo as string);
      }
      if (!result) return;

      await routePush(SCREENS.VERIFY_OTP, {
        email: mode === 'email' ? email : undefined,
        phoneNo: mode === 'phone' ? phoneNo : undefined,
        mode: mode === 'email' ? 'verifyEmail' : 'verifyPhone',
        isRememberDevice: isRememberDevice.toString(),
      });
    } catch (error) {
      handleErrorExpo(error, 'VerifyDevice - onSubmit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header title="Бүртгэлгүй төхөөрөмж" onBack={() => router.back()} />
      <CustomScrollView>
        <View className="mx-4 mt-5 flex-1 rounded-xl">
          <View className="mt-4 flex-row bg-bgSecondary py-7 pl-3">
            <View className="mr-5">
              <SvgIcon name="warning" />
            </View>
            <Text className="mr-20 text-start text-sm font-light leading-5 text-white">
              {`Энэ төхөөрөмжөөр анх удаа нэвтрэх гэж байгаа тул доорх сувгуудаас сонгож баталгаажуулалт хийгээрэй`}
            </Text>
          </View>
          <TouchableOpacity
            className={cn(
              'mt-5 rounded-xl border bg-bgLight px-4 py-6',
              mode === 'phone' && 'border-Primary',
            )}
            onPress={() => setMode('phone')}>
            <Text className="text-sm text-white/60">Утасны дугаар</Text>
            <Text className="text-base font-bold text-white">
              {phoneNo as string}
            </Text>
          </TouchableOpacity>
          {email && (
            <TouchableOpacity
              className={cn(
                'mt-5 rounded-xl border bg-bgLight px-4 py-6',
                mode === 'email' && 'border-Primary',
              )}
              onPress={() => setMode('email')}>
              <Text className="text-sm text-white/60">И-мэйл хаяг</Text>
              <Text className="text-base font-bold text-white">
                {email
                  ? (Array.isArray(email) ? email[0] : email).replace(
                      /(?<=.{3}).(?=.*@)/g,
                      '*',
                    )
                  : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="mx-4 gap-4">
          <View className="mx-1">
            <CheckBox
              text="Тус төхөөрөмжийг сануулах"
              isChecked={isRememberDevice}
              toggleCheckbox={() => setIsRememberDevice(!isRememberDevice)}
            />
          </View>
          <Button
            text="Баталгаажуулах"
            onPress={onSubmit}
            isLoading={isSubmitting}
          />
        </View>
      </CustomScrollView>
    </View>
  );
};

export default VerifyDevice;
