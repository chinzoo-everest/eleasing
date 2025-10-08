import Header from '@components/Header';
import {GlobalContext} from '@context/GlobalContext';
import {CContactPerson} from '@type/interfaces/Customer';
import React, {useContext, useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {routePush} from '@utils/routePush';
import {SCREENS} from '@customConfig/route';
import CustomScrollView from '@components/CustomScrollView';
import {cn} from '@utils/cn';
import SettingsInput from '@components/SettingsInput';

const Contact = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const insets = useSafeAreaInsets();

  const [contacts, setContacts] = useState<CContactPerson[]>([]);

  useEffect(() => {
    if (context) {
      const {contactPerson} = context.state;
      setContacts(contactPerson);
    }
  }, [context]);

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        title="Холбогдох хүний мэдээлэл"
        onBack={() => router.back()}
        bgColor="#24292D"
      />
      <CustomScrollView className="px-4 pt-7">
        <View className="flex-1">
          {contacts &&
            contacts.length > 0 &&
            contacts.map(
              (contact, index) =>
                contact && (
                  <View className="mt-1 flex-col pt-2" key={index}>
                    <Text className="text-tPrimary text-xs uppercase">
                      Холбогдох хүн - {index + 1}
                    </Text>
                    <View className="my-2 h-0.5 bg-[#34363D]" />

                    <TouchableOpacity
                      onPress={async () => {
                        await routePush(SCREENS.MODIFY_CONTACT, {
                          contactId: contact.ID,
                        });
                      }}
                      className="mt-2 flex-col rounded-xl py-3">
                      <SettingsInput label="Овог" value={contact.LAST_NAME} />
                      <SettingsInput label="Нэр" value={contact.FIRST_NAME} />
                      <SettingsInput
                        label="Утасны дугаар"
                        value={contact.PHONE}
                      />
                    </TouchableOpacity>
                  </View>
                ),
            )}
          {contacts.length === 0 && (
            <View className="flex-1 items-center justify-center px-10">
              <Text className="text-light text-center text-sm text-white opacity-60">
                Холбогдох хүний мэдээлэл хоосон байна
              </Text>
            </View>
          )}
        </View>
        {contacts && contacts?.length < 6 && (
          <TouchableOpacity
            onPress={async () => {
              await routePush(SCREENS.MODIFY_CONTACT, {
                contactId: null,
              });
            }}
            className={cn(
              'mb-20 mt-4 w-full flex-row items-center justify-center self-center rounded-full bg-Primary py-2',
            )}>
            <Text className="text-4xl font-medium uppercase text-white">+</Text>
          </TouchableOpacity>
        )}
      </CustomScrollView>
    </View>
  );
};

export default Contact;
