import React, {useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import CustomScrollView from '@components/CustomScrollView';
import {router, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {contactFormSchema} from '@utils/validators';
import SettingsDropdown from '@components/SettingsDropDown';
import {CFamilyType} from '@type/interfaces/Combo';
import {GlobalContext} from '@context/GlobalContext';
import {CContactPerson, CCustomer} from '@type/interfaces/Customer';
import {showToast} from '@utils/showToast';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {saveContact} from '@services/basic.service';
import Button from '@components/Button';
import Header from '@components/Header';
import SettingsInput from '@components/SettingsInput';
import {loadCustomerData} from '@services/home.service';
import {useGlobalContext} from '@hooks/useGlobalContext';

const ModifyContact = () => {
  const insets = useSafeAreaInsets();
  const {contactId} = useLocalSearchParams();
  const {dispatch} = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relatedComboValues, setRelatedComboValues] = useState<CFamilyType[]>(
    [],
  );
  const context = useContext(GlobalContext);
  const [contact, setContact] = useState<CContactPerson>();
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(contactFormSchema),
    defaultValues: {
      title: 0,
      lastName: '',
      firstName: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (context) {
      const {contactPerson, currentUser, comboValue} = context.state;
      const contact = contactId
        ? contactPerson.find(
            contact =>
              contact.ID &&
              contactId &&
              contact.ID.toString() === contactId.toString(),
          )
        : undefined;

      setRelatedComboValues(comboValue.title);
      setContact(contact);
      setCurrentCustomer(currentUser);
      setValue('title', contact?.TITLE ? Number(contact.TITLE) : 0);
      setValue('lastName', contact?.LAST_NAME);
      setValue('firstName', contact?.FIRST_NAME);
      setValue('phone', contact?.PHONE);
    }
    clearErrors();
  }, [context, contactId, setValue, clearErrors]);

  const onSaveContact = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!currentCustomer) return;
    const requestData: CContactPerson = {
      TITLE: formData.title,
      LAST_NAME: formData.lastName,
      FIRST_NAME: formData.firstName,
      PHONE: formData.phone,
      CUST_ID: currentCustomer.CUST_ID,
      ROW_STATUS: contact ? 'U' : 'I',
      ...(contact && {ID: contact.ID}),
    };
    try {
      const result = await saveContact(requestData);
      if (!result) return;
      await loadCustomerData(dispatch);
      showToast(
        'Амжилттай',
        'Холбоо барих хүний мэдээллийг амжилттай хадгаллаа',
        'success',
      );
      router.back();
    } catch (error) {
      handleErrorExpo(error, 'onSaveContact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        title="Холбоо барих хүн"
        onBack={() => router.back()}
        bgColor="#24292D"
      />
      <CustomScrollView>
        <View className="mt-5 flex-1 px-4">
          <Controller
            control={control}
            name="title"
            render={({field: {onChange, value}}) => (
              <SettingsDropdown
                disabled={isSubmitting}
                title="Хамаарал"
                errorString={errors.title?.message}
                items={relatedComboValues}
                selectedValue={value}
                labelName="TITLE"
                valueName="ID"
                onChange={onChange}
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
              />
            )}
          />
        </View>
      </CustomScrollView>
      {(contact === null || contact === undefined) && (
        <Button
          isLoading={isSubmitting}
          className="mx-6 mt-5"
          onPress={handleSubmit(onSaveContact)}
          isTextBold
          text="Хадгалах"
        />
      )}
      <View
        style={{paddingBottom: insets.bottom, backgroundColor: '#0B0B13'}}
      />
    </View>
  );
};

export default ModifyContact;
