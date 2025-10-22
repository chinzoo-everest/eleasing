import Button from "@components/Button";
import Header from "@components/Header";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { loadFriendsList, sendFriendRequest } from "@services/basic.service";
import { CAppFriend } from "@type/interfaces/Basic";
import { GlobalContext } from "@context/GlobalContext";
import { inviteFriendFormSchema } from "@utils/validators";
import SettingsInput from "@components/SettingsInput";
import CustomScrollView from "@components/CustomScrollView";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showToast } from "@utils/showToast";

// ✅ New SVG illustration import
import FriendsSvg from "@assets/images/friends.svg";
import InviteInput from "@components/InviteInput";

const Invite = () => {
  const router = useRouter();
  const context = useContext(GlobalContext);
  const currentCustomer = context?.state?.currentUser;
  const [appFriends, setAppFriends] = useState<CAppFriend[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(inviteFriendFormSchema),
    defaultValues: {
      phone: "",
    },
  });

  const handleInviteFriend = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (currentCustomer) {
        const result = await sendFriendRequest(
          currentCustomer?.PHONE1,
          formData.phone
        );

        if (result) {
          showToast(
            "Амжилттай",
            "Найзын хүсэлт амжилттай илгээгдлээ",
            "success"
          );
          await loadFriendsData();
          setValue("phone", "");
        }
      }
    } catch (error) {
      handleErrorExpo(error, "handlePrimaryBank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadFriendsData = useCallback(async () => {
    try {
      const result = await loadFriendsList();
      if (result && result.length > 0) {
        setAppFriends(result);
      }
    } catch (error) {
      handleErrorExpo(error, "loadFriendsData");
    }
  }, []);

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Найзаа урих"
        textColor="#1B3C69"
        onBack={() => router.back()}
        showBottomLine={false}
        bgColor="white"
      />

      <CustomScrollView>
        {/* Main content */}
        <View className="mt-5 px-5 flex-1 items-center">
          {/* Title */}

          <Text className="text-[#1B3C69] text-center mb-6">
            Та урих найзынхаа утасны дугаарыг оруулна уу!
          </Text>

          {/* SVG Illustration */}
          <View className="items-center mb-8">
            <FriendsSvg width={240} height={220} />
          </View>

          {/* Input Field */}
          <View className="w-full mb-5">
            <Controller
              name="phone"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <InviteInput
                  value={field.value}
                  label="Утасны дугаар"
                  placeholder="Утасны дугаар"
                  keyboard="number-pad"
                  onChangeText={field.onChange}
                  maxLength={9}
                />
              )}
            />
            {errors.phone && (
              <Text className="h-[18] text-left text-sm text-red-500 mt-1">
                {errors.phone.message}
              </Text>
            )}
          </View>

          {/* Subtext */}
          <Text className="mb-6 text-center font-inter text-xs text-[#768AA4] leading-5">
            Шинээр нэмэх найзынхаа утасны дугаарыг оруулан{"\n"}боломжийг
            найзтайгаа хуваалцаарай.
          </Text>

          {/* Pending Friends Section */}
          {appFriends.length > 0 && (
            <View className="w-full mt-4">
              <Text className="font-inter text-base text-[#1B3C69] mb-2">
                Хүлээгдэж байгаа дугаар
              </Text>
              <View className="mb-3 h-[1px] bg-gray-300 opacity-50" />
              <View className="flex flex-col gap-y-2">
                {appFriends.map((item, index) => (
                  <View
                    key={index}
                    className="flex-row rounded-lg bg-[#F2F4F8] p-4"
                  >
                    <Text className="font-inter text-sm text-[#1B3C69]">
                      {item.PHONENO}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Button */}
        <View className="mt-8 mb-6 w-full px-5">
          <Button
            onPress={handleSubmit(handleInviteFriend)}
            text="Найзаа урих"
            isLoading={isSubmitting}
            className=" rounded-2xl  py-4"
            style={{ marginBottom: insets.bottom }}
            fillColor="#2A45C4"
          />
        </View>
      </CustomScrollView>
    </View>
  );
};

export default Invite;
