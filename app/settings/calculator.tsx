import Button from '@components/Button';
import Header from '@components/Header';
import NumberInput from '@components/NumberInput';
import {yupResolver} from '@hookform/resolvers/yup';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {ScrollView, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {CLoanPaymentPlan} from '@type/interfaces/Loan';
import CalculatorList from '@components/CalculatorList';
import {loanCalculatorSchema} from '@utils/validators';
import {loadLoanCalcList} from '@services/loan.service';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Calculator = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(loanCalculatorSchema),
    defaultValues: {
      amt: 0,
      interest: 0,
      period: 0,
    },
  });

  const [amount, setAmount] = useState(0);
  const [period, setPeriod] = useState(0);
  const [interest, setInterest] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<CLoanPaymentPlan[]>([]);

  const calculateLoan = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      setAmount(formData.amt);
      setInterest(formData.interest);
      setPeriod(formData.period);

      const result = await loadLoanCalcList(
        formData.amt,
        formData.interest,
        new Date().getDate(),
        formData.period,
      );
      const totalAmt = result.reduce((acc, item) => acc + item.TOTAL, 0);

      setTotal(totalAmt);
      setPaymentDetails(result);
    } catch (error) {
      handleErrorExpo(error, 'LoanCalculator');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        title="Зээлийн тооцоолуур"
        textColor="white"
        bgColor="#0B0B13"
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1 rounded-md px-3">
        <View className="mt-4 w-full">
          <View className="rounded-xl bg-bgSecondary p-4">
            <View className="flex-col">
              <Text className="pb-1 text-sm text-white">Зээлийн хэмжээ</Text>
              <Controller
                control={control}
                rules={{required: true}}
                render={({field: {onChange, value}}) => (
                  <NumberInput
                    value={value}
                    onChangeValue={onChange}
                    errorString={errors.amt?.message}
                    keyboard="numeric"
                    placeholder="100,000"
                    maxValue={1000000000}
                    placeHolderColor="#6b7280"
                    precision={0}
                  />
                )}
                name="amt"
              />
            </View>

            <View className="flex-col">
              <Text className="pb-1 text-sm text-white">Зээлийн хүү</Text>
              <Controller
                control={control}
                rules={{required: true}}
                render={({field: {onChange, value}}) => (
                  <NumberInput
                    value={value}
                    onChangeValue={onChange}
                    errorString={errors.interest?.message}
                    keyboard="numeric"
                    placeholder="1.2%"
                    maxValue={100}
                    suffix=" %"
                    placeHolderColor="#6b7280"
                  />
                )}
                name="interest"
              />
            </View>

            <View className="flex-col">
              <Text className="text-3 pb-1 text-white">
                Зээлийн хугацаа (сар)
              </Text>
              <Controller
                control={control}
                rules={{required: true}}
                render={({field: {onChange, value}}) => (
                  <NumberInput
                    value={value}
                    onChangeValue={onChange}
                    errorString={errors.period?.message}
                    keyboard="numeric"
                    placeholder="24"
                    maxValue={120}
                    placeHolderColor="#6b7280"
                    precision={0}
                  />
                )}
                name="period"
              />
            </View>
          </View>

          <Button
            onPress={handleSubmit(calculateLoan)}
            isLoading={isSubmitting}
            className="mx-9 my-7 h-14"
            text="Тооцоолох"
            isTextBold={true}
          />

          {paymentDetails.length > 0 && !isSubmitting && (
            <CalculatorList
              amount={amount}
              interest={interest}
              period={period}
              total={total}
              dataSource={paymentDetails}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Calculator;
