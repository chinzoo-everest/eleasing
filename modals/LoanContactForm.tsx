import CustomScrollView from '@components/CustomScrollView';
import React, {useState, useContext} from 'react';
import Modal from 'react-native-modal';
import {View} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {loanContactFormSchema} from '@utils/validators';
import SettingsDropdown from '@components/SettingsDropDown';
import SettingsInput from '@components/SettingsInput';
import RegInput from '@components/RegInput';
import {CFamilyType} from '@type/interfaces/Combo';
import {GlobalContext} from '@context/GlobalContext';
import {showToast} from '@utils/showToast';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import Button from '@components/Button';
import {CContactPerson} from '@type/interfaces/Customer';
import {createLoanContact} from '@services/depositLoan.service';
import {
  getProductColorByType,
  getProductTextColorByType,
} from 'utils/getProductColor';

interface LoanContactFormValues {
  title: number;
  midName: string;
  lastName: string;
  firstName: string;
  reg_no: string;
  companyName: string;
  position: string;
  phone: string;
}

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: CContactPerson) => void;
  REQ_ID: number;
  CUST_ID: number;
  prodType: number;
};

const LoanContactForm = ({
  isVisible,
  onClose,
  onSave,
  REQ_ID,
  CUST_ID,
  prodType,
}: Props) => {
  const context = useContext(GlobalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const familyTypes = context?.state.comboValue.title as CFamilyType[];

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<LoanContactFormValues>({
    resolver: yupResolver(loanContactFormSchema) as any,
    defaultValues: {
      title: 0,
      midName: '',
      lastName: '',
      firstName: '',
      reg_no: '',
      companyName: '',
      position: '',
      phone: '',
    },
  });

  const onSubmit = async (data: LoanContactFormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestData: CContactPerson = {
        CUST_ID: CUST_ID,
        TITLE: data.title,
        LAST_NAME: data.lastName,
        FIRST_NAME: data.firstName,
        PHONE: data.phone,
        FAM_NAME: data.midName,
        REG_NO: data.reg_no,
        COM_NAME: data.companyName,
        POSITION: data.position,
        ROW_STATUS: 'I',
      };

      const result = await createLoanContact(requestData, REQ_ID);
      if (!result) return;

      showToast(
        'Амжилттай',
        'Хамтран зээлдэгчийг амжилттай бүртгэлээ',
        'success',
      );
      reset();
      onSave(requestData);
      onClose();
    } catch (error) {
      handleErrorExpo(error, 'LoanContactForm - onSubmit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      propagateSwipe
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{justifyContent: 'center', margin: 0, marginTop: '40%'}}>
      <View className="flex-1 rounded-t-2xl bg-bgLight">
        <CustomScrollView className="mt-10">
          <View className="px-4">
            <View className="gap-3">
              <Controller
                control={control}
                name="title"
                render={({field: {onChange, value}}) => (
                  <SettingsDropdown
                    disabled={isSubmitting}
                    title="Хамаарал"
                    errorString={errors.title?.message}
                    items={familyTypes ? familyTypes : []}
                    selectedValue={Number(value)}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                    labelName="TITLE"
                    valueName="ID"
                    onChange={selectedItem => onChange(selectedItem)}
                  />
                )}
              />

              <Controller
                control={control}
                name="midName"
                render={({field: {onChange, value}}) => (
                  <SettingsInput
                    readonly={isSubmitting}
                    label="Ургийн овог"
                    value={value}
                    errorString={errors.midName?.message}
                    onChangeText={onChange}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({field: {onChange, value}}) => (
                  <SettingsInput
                    readonly={isSubmitting}
                    label="Овог"
                    value={value}
                    errorString={errors.lastName?.message}
                    onChangeText={onChange}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                  />
                )}
              />

              <Controller
                control={control}
                name="firstName"
                render={({field: {onChange, value}}) => (
                  <SettingsInput
                    readonly={isSubmitting}
                    label="Нэр"
                    value={value}
                    errorString={errors.firstName?.message}
                    onChangeText={onChange}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                  />
                )}
              />

              <Controller
                control={control}
                name="reg_no"
                render={({field: {onChange}}) => (
                  <RegInput
                    label="Регистрийн дугаар"
                    prodType={Number(prodType)}
                    isReadOnly={isSubmitting}
                    errorString={errors.reg_no?.message}
                    onChangeText={onChange}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                  />
                )}
              />

              <Controller
                control={control}
                name="companyName"
                render={({field: {onChange, value}}) => (
                  <SettingsInput
                    readonly={isSubmitting}
                    label="Компанийн нэр"
                    value={value}
                    errorString={errors.companyName?.message}
                    onChangeText={onChange}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                  />
                )}
              />

              <Controller
                control={control}
                name="position"
                render={({field: {onChange, value}}) => (
                  <SettingsInput
                    readonly={isSubmitting}
                    label="Албан тушаал"
                    value={value}
                    errorString={errors.position?.message}
                    onChangeText={onChange}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({field: {onChange, value}}) => (
                  <SettingsInput
                    readonly={isSubmitting}
                    label="Утасны дугаар"
                    value={value}
                    maxLength={8}
                    keyboard="phone-pad"
                    errorString={errors.phone?.message}
                    onChangeText={onChange}
                    backgroundColor="#222630"
                    focusColor={getProductColorByType(Number(prodType))}
                  />
                )}
              />
            </View>
          </View>
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="mx-4 mt-5"
            text="Хадгалах"
            fillColor={getProductColorByType(Number(prodType))}
            textColor={getProductTextColorByType(Number(prodType))}
          />
        </CustomScrollView>
      </View>
    </Modal>
  );
};

export default LoanContactForm;
