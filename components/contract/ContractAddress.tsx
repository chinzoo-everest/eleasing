import React, {
  useContext,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View} from 'react-native';
import {GlobalContext} from '@context/GlobalContext';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {addressFormSchema} from '@utils/validators';
import {CCity, CDistrict, CSubDistrict} from '@type/interfaces/Combo';
import {saveAddress} from '@services/account.service';
import {showToast} from '@utils/showToast';
import SettingsDropdown from '@components/SettingsDropDown';
import SettingsInput from '@components/SettingsInput';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';

const ContractAddress = forwardRef((_, ref) => {
  ContractAddress.displayName = 'ContractAddress';
  const context = useContext(GlobalContext);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cities = context?.state.comboValue.cities as CCity[];
  const districts = context?.state.comboValue.districts as CDistrict[];
  const subDistricts = context?.state.comboValue
    .sub_districts as CSubDistrict[];
  const currentCustomer = context?.state.currentUser;

  let isValid: boolean;

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    clearErrors,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(addressFormSchema),
    defaultValues: {
      city: '',
      district: '',
      subDistrict: '',
      buildingNo: '',
      doorNo: '',
    },
  });

  useEffect(() => {
    if (currentCustomer) {
      setValue('city', currentCustomer?.CITY_ID?.toString() || '');
      setSelectedCity(currentCustomer?.CITY_ID);
      setValue('district', currentCustomer?.DIST_ID?.toString() || '');
      setSelectedDistrict(currentCustomer?.DIST_ID);
      setValue('subDistrict', currentCustomer?.SUB_DIST_ID?.toString() || '');
      setValue('buildingNo', currentCustomer?.BUILDING_NO?.toString() || '');
      setValue('doorNo', currentCustomer?.DOOR_NO?.toString() || '');
    }
    clearErrors();
  }, [currentCustomer, setValue, clearErrors]);

  const validateAndSave = async () => {
    isValid = false;
    await handleSubmit(onSubmit)();
    return isValid;
  };

  const onSubmit = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!currentCustomer) return;

      const requestData = {
        city_id: Number(formData.city),
        dist_id: Number(formData.district),
        sub_dist_id: Number(formData.subDistrict),
        building_no: formData.buildingNo,
        door_no: formData.doorNo,
      };

      const oldData = {
        city_id: currentCustomer?.CITY_ID || null,
        dist_id: currentCustomer?.DIST_ID || null,
        sub_dist_id: currentCustomer?.SUB_DIST_ID || null,
        building_no: currentCustomer?.BUILDING_NO?.toString() || '',
        door_no: currentCustomer?.DOOR_NO?.toString() || '',
      };

      const isDataUpdated =
        requestData.city_id !== oldData.city_id ||
        requestData.dist_id !== oldData.dist_id ||
        requestData.sub_dist_id !== oldData.sub_dist_id ||
        requestData.building_no !== oldData.building_no ||
        requestData.door_no !== oldData.door_no;

      if (!isDataUpdated) {
        isValid = true;
        return;
      }
      const result = await saveAddress(requestData);
      if (!result) return;
      isValid = true;
      showToast('', 'Амжилттай хадгалагдлаа', 'success');
    } catch (error) {
      handleErrorExpo(error, 'ContractAddress - onSubmit');
    } finally {
      setIsSubmitting(false);
    }
  };

  useImperativeHandle(ref, () => ({
    validateAndSave,
  }));

  return (
    <View className="px-4">
      <Controller
        control={control}
        name="city"
        render={({field: {onChange, value}}) => (
          <SettingsDropdown
            disabled={isSubmitting}
            title="Аймаг/хот"
            errorString={errors.city?.message}
            items={cities || []}
            selectedValue={Number(value)}
            labelName="CITY_NAME"
            valueName="CITY_ID"
            onChange={selectedItem => {
              setSelectedCity(selectedItem);
              onChange(selectedItem);
              // Reset district and sub-district when city changes
              resetField('district');
              resetField('subDistrict');
              setSelectedDistrict(null);
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="district"
        render={({field: {onChange, value}}) => {
          const cityValue = control._formValues.city;
          const filteredDistricts =
            cityValue && districts
              ? districts.filter(x => x.CITY_ID === Number(cityValue))
              : [];

          return (
            <SettingsDropdown
              disabled={
                isSubmitting ||
                !Number(cityValue) ||
                filteredDistricts.length === 0
              }
              title="Сум/дүүрэг"
              errorString={errors.district?.message}
              items={filteredDistricts}
              selectedValue={Number(value)}
              labelName="DIST_NAME"
              valueName="DIST_ID"
              onChange={selectedItem => {
                setSelectedDistrict(selectedItem);
                onChange(selectedItem);
                // Reset sub-district when district changes
                resetField('subDistrict');
              }}
            />
          );
        }}
      />
      <Controller
        control={control}
        name="subDistrict"
        render={({field: {onChange, value}}) => {
          const districtValue = control._formValues.district;
          const filteredSubDistricts =
            districtValue && subDistricts
              ? subDistricts.filter(x => x.DIST_ID === Number(districtValue))
              : [];

          return (
            <SettingsDropdown
              disabled={
                isSubmitting ||
                !Number(districtValue) ||
                filteredSubDistricts.length === 0
              }
              title="Баг/хороо"
              errorString={errors.subDistrict?.message}
              items={filteredSubDistricts}
              selectedValue={Number(value)}
              labelName="SUB_DIST_NAME"
              valueName="SUB_DIST_ID"
              onChange={selectedItem => {
                onChange(selectedItem);
              }}
            />
          );
        }}
      />
      <Controller
        control={control}
        name="buildingNo"
        render={({field: {onChange, value}}) => (
          <SettingsInput
            readonly={isSubmitting}
            label="Байр, гудамж"
            value={value}
            errorString={errors.buildingNo?.message}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="doorNo"
        render={({field: {onChange, value}}) => (
          <SettingsInput
            readonly={isSubmitting}
            label="Хаалга, тоот"
            value={value}
            errorString={errors.doorNo?.message}
            onChangeText={onChange}
          />
        )}
      />
    </View>
  );
});

export default ContractAddress;
