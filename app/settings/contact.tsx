import Header from "@components/Header";
import { GlobalContext } from "@context/GlobalContext";
import { CContactPerson } from "@type/interfaces/Customer";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";
import CustomScrollView from "@components/CustomScrollView";
import { cn } from "@utils/cn";
import SvgIcon from "@components/SvgIcon";

const Contact = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const insets = useSafeAreaInsets();

  const [contacts, setContacts] = useState<CContactPerson[]>([]);

  useEffect(() => {
    if (context) {
      const { contactPerson } = context.state;
      setContacts(contactPerson);
    }
  }, [context]);

  // button height + spacing used to pad the ScrollView content
  const bottomPad = useMemo(() => {
    const btnHeight = 56; // ~rounded-full button height
    const gap = 16; // spacing above button
    return btnHeight + gap + (insets.bottom || 0);
  }, [insets.bottom]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Холбоо барих хүн"
        onBack={() => router.back()}
        bgColor="#FFFFFF"
        textColor="#203764"
        showBottomLine={false}
      />

      <View className="flex-1">
        <CustomScrollView
          className="px-4 pt-4"
          contentContainerStyle={{
            paddingBottom: contacts?.length < 6 ? bottomPad : 16,
          }}
        >
          <View className="flex-1">
            {contacts &&
              contacts.length > 0 &&
              contacts.map(
                (contact, index) =>
                  contact && (
                    <View className="mt-3" key={index}>
                      <View className="overflow-hidden rounded-md border-b border-b-[#C9CDDF] bg-white">
                        <View className="flex-row items-center px-3 py-3">
                          <View>
                            <SvgIcon
                              name="phone_outline"
                              width={21}
                              height={21}
                              color="#2E53F1"
                            />
                            <Text className="mt-2 text-[11px] text-[#8EA1C0]">
                              Холбоо барих хүн - {index + 1}
                            </Text>
                          </View>

                          <View className="flex-1 flex-col items-end">
                            <Text className="text-[18px] font-semibold text-[#203764]">
                              {(contact.LAST_NAME || "") +
                                (contact.FIRST_NAME
                                  ? ` ${contact.FIRST_NAME}`
                                  : "")}
                            </Text>
                            <Text className="text-[14px] text-[#7186AD]">
                              {contact.PHONE}
                            </Text>
                          </View>

                          <View className="ml-5 items-end">
                            <TouchableOpacity
                              onPress={async () => {
                                await routePush(SCREENS.MODIFY_CONTACT, {
                                  contactId: contact.ID,
                                });
                              }}
                            >
                              <SvgIcon
                                name="edit_link"
                                width={20}
                                height={20}
                                color="#6E85B4"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  )
              )}

            {contacts.length === 0 && (
              <View className="flex-1 items-center justify-center px-10 py-20">
                <Text className="text-center text-sm text-[#94A3B8]">
                  Холбогдох хүний мэдээлэл хоосон байна
                </Text>
              </View>
            )}
          </View>
        </CustomScrollView>

        {contacts && contacts?.length < 6 && (
          <TouchableOpacity
            onPress={async () => {
              await routePush(SCREENS.MODIFY_CONTACT, { contactId: null });
            }}
            className={cn(
              "absolute left-4 right-4 flex-row items-center justify-center rounded-2xl bg-[#2E53F1] py-3"
            )}
            style={{ bottom: (insets.bottom || 0) + 8 }}
          >
            <Text className="text-2xl font-medium text-white">+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Contact;
