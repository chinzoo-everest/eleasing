import Header from '@components/Header';
import {CNotification} from '@type/interfaces/Basic';
import {useRouter, useLocalSearchParams} from 'expo-router';
import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const NotificationDetail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const item: CNotification | null = params.item
    ? JSON.parse(params.item as string)
    : null;

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-bgPrimary">
        <Text className="text-lg text-white">No notification data found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header title="Мэдэгдэл" onBack={() => router.back()} bgColor="#0B0B13" />
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}>
        <View>
          <Text className="mb-2 ml-4 text-base text-white">{item.TITLE}</Text>
          <View className="rounded-xl bg-bgSecondary px-5 py-4">
            <Text className="text-sm font-light text-white">{item.BODY}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationDetail;
