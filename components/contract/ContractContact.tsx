import SettingsDropdown from '@components/SettingsDropDown';
import SettingsInput from '@components/SettingsInput';
import {GlobalContext} from '@context/GlobalContext';
import {yupResolver} from '@hookform/resolvers/yup';
import {saveContactPerson} from '@services/account.service';
import {CFamilyType} from '@type/interfaces/Combo';
import {
  CContactPerson,
  CContactRequest,
  CCustomer,
} from '@type/interfaces/Customer';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {showToast} from '@utils/showToast';
import {contactFormSchema} from '@utils/validators';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Text, View} from 'react-native';
import * as yup from 'yup';

type ContactField = {
  title: number;
  lastName: string;
  firstName: string;
  phone: string;
  id?: number | null;
};

type FormValues = {
  contact1: ContactField;
  contact2: ContactField;
  contact3: ContactField;
};

// Use the imported contactFormSchema and extend it to include id field
const contactSchema = contactFormSchema.shape({
  id: yup.number().nullable().optional(),
});

const multipleContactsSchema = yup
  .object({
    contact1: contactSchema,
    contact2: contactSchema,
    contact3: contactSchema,
  })
  .test(
    'unique-phones',
    'Бүх холбогдох хүний утасны дугаар өөр байх ёстой',
    function (values) {
      const phones = [
        values.contact1?.phone,
        values.contact2?.phone,
        values.contact3?.phone,
      ].filter(phone => phone && phone.trim() !== ''); // Filter out empty phones

      // Check for duplicates
      const uniquePhones = new Set(phones);

      if (phones.length !== uniquePhones.size) {
        // Find which contacts have duplicate phones and set errors
        const phoneCounts = phones.reduce(
          (acc, phone) => {
            acc[phone] = (acc[phone] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const duplicatePhones = Object.keys(phoneCounts).filter(
          phone => phoneCounts[phone] > 1,
        );

        // Set error for each contact that has a duplicate phone
        duplicatePhones.forEach(duplicatePhone => {
          if (values.contact1?.phone === duplicatePhone) {
            this.createError({
              path: 'contact1.phone',
              message: 'Энэ утасны дугаар аль хэдийн ашиглагдсан байна',
            });
          }
          if (values.contact2?.phone === duplicatePhone) {
            this.createError({
              path: 'contact2.phone',
              message: 'Энэ утасны дугаар аль хэдийн ашиглагдсан байна',
            });
          }
          if (values.contact3?.phone === duplicatePhone) {
            this.createError({
              path: 'contact3.phone',
              message: 'Энэ утасны дугаар аль хэдийн ашиглагдсан байна',
            });
          }
        });

        return false;
      }

      return true;
    },
  );

const ContractContact = forwardRef((props, ref) => {
  const context = useContext(GlobalContext);
  const [contacts, setContacts] = useState<CContactPerson[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const familyTypes = context?.state.comboValue.title as CFamilyType[];
  const currentCustomer = context?.state.currentUser as CCustomer;

  let isValid: boolean;

  const inputRefs = useRef({
    contact1: {
      title: useRef(null),
      lastName: useRef(null),
      firstName: useRef(null),
      phone: useRef(null),
    },
    contact2: {
      title: useRef(null),
      lastName: useRef(null),
      firstName: useRef(null),
      phone: useRef(null),
    },
    contact3: {
      title: useRef(null),
      lastName: useRef(null),
      firstName: useRef(null),
      phone: useRef(null),
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: {errors},
  } = useForm<FormValues>({
    // Type assertion to bypass TypeScript resolver issue
    resolver: yupResolver(multipleContactsSchema) as any,
    defaultValues: {
      contact1: {
        title: 0,
        lastName: '',
        firstName: '',
        phone: '',
        id: null,
      },
      contact2: {
        title: 0,
        lastName: '',
        firstName: '',
        phone: '',
        id: null,
      },
      contact3: {
        title: 0,
        lastName: '',
        firstName: '',
        phone: '',
        id: null,
      },
    },
  });

  useEffect(() => {
    const contactPerson: CContactPerson[] = context?.state.contactPerson || [];
    setContacts(contactPerson);

    for (let i = 0; i < 3; i++) {
      const contact = contactPerson[i];
      const formKey = `contact${i + 1}` as keyof FormValues;

      if (contact) {
        setValue(`${formKey}.title`, Number(contact.TITLE));
        setValue(`${formKey}.lastName`, contact.LAST_NAME);
        setValue(`${formKey}.firstName`, contact.FIRST_NAME);
        setValue(`${formKey}.phone`, contact.PHONE);
        setValue(`${formKey}.id`, contact.ID ?? null);
      } else {
        setValue(`${formKey}.title`, 0);
        setValue(`${formKey}.lastName`, '');
        setValue(`${formKey}.firstName`, '');
        setValue(`${formKey}.phone`, '');
        setValue(`${formKey}.id`, null);
      }
    }

    clearErrors();
  }, [context?.state.contactPerson, setValue, clearErrors]);

  const scrollToFirstError = () => {
    // Check for errors in all contact fields
    const contactKeys = ['contact1', 'contact2', 'contact3'] as const;
    const fieldOrder = ['title', 'lastName', 'firstName', 'phone'] as const;

    // Find the first contact with error
    for (const contactKey of contactKeys) {
      if (errors[contactKey]) {
        // Find the first field with error in this contact
        for (const field of fieldOrder) {
          if (errors[contactKey]?.[field]) {
            const inputRef = inputRefs.current[contactKey][field];
            if (inputRef?.current) {
              try {
                // Try to focus the input - this will often scroll to it automatically
                inputRef.current.focus();
                return;
              } catch (error) {
                console.error('Could not focus on input', error);
              }
            }
          }
        }
      }
    }
  };

  const onSubmit = async (formData: FormValues): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);

    try {
      const contactKeys = ['contact1', 'contact2', 'contact3'] as const;
      const successfulContacts: string[] = [];
      const failedContacts: string[] = [];

      for (const contactKey of contactKeys) {
        const contact = formData[contactKey];

        // Skip if all fields are empty
        if (!contact.lastName && !contact.firstName && !contact.phone) {
          continue;
        }

        const requestData: CContactRequest = {
          TITLE: contact.title.toString(),
          LAST_NAME: contact.lastName,
          FIRST_NAME: contact.firstName,
          PHONE: contact.phone,
          CUST_ID: currentCustomer.CUST_ID,
        };

        // Check if this is an existing contact that needs update
        const existingContact = contacts.find(x => x.ID === contact.id);
        if (existingContact) {
          requestData.ID = existingContact.ID;

          // Skip if no changes were made
          if (
            existingContact.TITLE.toString() === requestData.TITLE.toString() &&
            existingContact.LAST_NAME === requestData.LAST_NAME &&
            existingContact.FIRST_NAME === requestData.FIRST_NAME &&
            existingContact.PHONE === requestData.PHONE
          ) {
            successfulContacts.push(contactKey);
            continue;
          }

          requestData.ROW_STATUS = 'U';
        } else {
          requestData.ROW_STATUS = 'I';
        }

        try {
          const result = await saveContactPerson(requestData);
          if (result) {
            successfulContacts.push(contactKey);
          } else {
            failedContacts.push(contactKey);
          }
        } catch (error) {
          console.error(`Error saving ${contactKey}:`, error);
          failedContacts.push(contactKey);
        }
      }

      // Check if we had any contacts to save and if they were all successful
      const hadContactsToSave =
        successfulContacts.length + failedContacts.length > 0;

      if (hadContactsToSave && failedContacts.length === 0) {
        showToast('', 'Амжилттай хадгалагдлаа', 'success');
        isValid = true;
        return true;
      } else if (failedContacts.length > 0) {
        showToast(
          '',
          'Зарим холбоо барих хүний мэдээлэл хадгалагдсангүй',
          'error',
        );
      }
    } catch (error) {
      handleErrorExpo(error, 'ContractContact - onSubmit');
    } finally {
      setIsSubmitting(false);
    }

    return false;
  };

  const validateAndSave = async () => {
    isValid = false;
    await handleSubmit(onSubmit)();

    // If there are any errors, scroll to the first error
    if (Object.keys(errors).length > 0) {
      scrollToFirstError();
    }

    return isValid;
  };

  useImperativeHandle(ref, () => ({
    validateAndSave,
  }));

  const renderContactSection = (
    contactKey: 'contact1' | 'contact2' | 'contact3',
    index: number,
  ) => (
    <View
      className={`mb-6 ${index < 2 ? 'border-b border-gray-200' : ''} pb-2`}>
      <Text className="mb-4 text-lg font-semibold text-white">
        Холбогдох хүн - {index + 1}
      </Text>

      <Controller
        control={control}
        name={`${contactKey}.title`}
        render={({field: {onChange, value}}) => (
          <SettingsDropdown
            ref={inputRefs.current[contactKey].title}
            disabled={isSubmitting}
            title="Хамаарал"
            errorString={errors?.[contactKey]?.title?.message}
            items={familyTypes || []}
            selectedValue={Number(value)}
            labelName="TITLE"
            valueName="ID"
            onChange={selectedItem => onChange(selectedItem)}
          />
        )}
      />
      <Controller
        control={control}
        name={`${contactKey}.lastName`}
        render={({field: {onChange, value}}) => (
          <SettingsInput
            ref={inputRefs.current[contactKey].lastName}
            readonly={isSubmitting}
            label="Овог"
            value={value}
            errorString={errors?.[contactKey]?.lastName?.message}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name={`${contactKey}.firstName`}
        render={({field: {onChange, value}}) => (
          <SettingsInput
            ref={inputRefs.current[contactKey].firstName}
            readonly={isSubmitting}
            label="Нэр"
            value={value}
            errorString={errors?.[contactKey]?.firstName?.message}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name={`${contactKey}.phone`}
        render={({field: {onChange, value}}) => (
          <SettingsInput
            ref={inputRefs.current[contactKey].phone}
            readonly={isSubmitting}
            label="Утасны дугаар"
            value={value}
            maxLength={8}
            keyboard="phone-pad"
            errorString={errors?.[contactKey]?.phone?.message}
            onChangeText={onChange}
          />
        )}
      />
    </View>
  );

  return (
    <View className="flex-1 px-4">
      {renderContactSection('contact1', 0)}
      {renderContactSection('contact2', 1)}
      {renderContactSection('contact3', 2)}
    </View>
  );
});

ContractContact.displayName = 'ContractContact';

export default ContractContact;
