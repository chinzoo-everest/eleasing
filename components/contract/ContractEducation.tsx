import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {View} from 'react-native';
import {GlobalContext} from '@context/GlobalContext';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {eduFormSchema} from '@utils/validators';
import {saveEducation} from '@services/account.service';
import {showToast} from '@utils/showToast';
import {CCustomer} from '@type/interfaces/Customer';
import SettingsDropdown from '@components/SettingsDropDown';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';

const ContractEducation = forwardRef((_, ref) => {
  ContractEducation.displayName = 'ContractEducation';
  const context = useContext(GlobalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const educations = context?.state.comboValue.education;
  const positions = context?.state.comboValue.position;

  let isValid: boolean;

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(eduFormSchema),
    defaultValues: {
      edu: '',
      position: '',
    },
  });

  useEffect(() => {
    const currentUser: CCustomer = context?.state.currentUser as CCustomer;
    if (currentUser?.EDU_ID) {
      setValue('edu', currentUser?.EDU_ID.toString());
    }
    if (currentUser?.EXT_POS_ID) {
      setValue('position', currentUser?.EXT_POS_ID.toString());
    }
    clearErrors();
  }, [context, clearErrors, setValue]);

  const onSubmit = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const requestData = {
        edu_id: formData.edu,
        pos_id: formData.position,
      };

      const currentUser: CCustomer = context?.state.currentUser as CCustomer;
      if (
        requestData.edu_id === currentUser?.EDU_ID &&
        requestData.pos_id === currentUser?.EXT_POS_ID
      ) {
        isValid = true;
        return;
      }

      const result = await saveEducation(requestData);
      if (!result) return;
      isValid = true;
      showToast('', 'Амжилттай хадгалагдлаа', 'success');
    } catch (error) {
      handleErrorExpo(error, 'ContractWorkEdu - onSubmit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAndSave = async () => {
    isValid = false;
    await handleSubmit(onSubmit)();
    return isValid;
  };

  useImperativeHandle(ref, () => ({
    validateAndSave,
  }));

  return (
    <View className="px-4">
      <Controller
        control={control}
        name="position"
        render={({field: {onChange, value}}) => (
          <SettingsDropdown
            disabled={isSubmitting}
            title="Албан тушаал"
            errorString={errors.position?.message}
            items={positions ? positions : []}
            selectedValue={Number(value)}
            labelName="NAME"
            valueName="ID"
            onChange={selectedItem => {
              onChange(selectedItem);
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="edu"
        render={({field: {onChange, value}}) => (
          <SettingsDropdown
            disabled={isSubmitting}
            title="Боловсрол"
            errorString={errors.edu?.message}
            items={educations ? educations : []}
            selectedValue={Number(value)}
            labelName="EDU_NAME"
            valueName="EDU_ID"
            onChange={selectedItem => {
              onChange(selectedItem);
            }}
          />
        )}
      />
    </View>
  );
});

export default ContractEducation;
