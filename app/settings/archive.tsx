import Header from '@components/Header';
import React, {useCallback, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useRouter} from 'expo-router';
import {loadLoanArchiveList} from '@services/loan.service';
import {CLoanInfo} from '@type/interfaces/Loan';
import formatDate from '@utils/formatDate';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomScrollView from '@components/CustomScrollView';

const Archive = () => {
  const router = useRouter();
  const [loanList, setLoanList] = useState<CLoanInfo[]>([]);
  const insets = useSafeAreaInsets();
  const loadLoanArchiveData = useCallback(async () => {
    try {
      const result = await loadLoanArchiveList();
      if (result && result.length > 0) {
        setLoanList(result);
      }
    } catch (error) {
      handleErrorExpo(error, 'loadLoanArchiveData');
    }
  }, []);

  useEffect(() => {
    loadLoanArchiveData();
  }, [loadLoanArchiveData]);

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        title="Зээлийн архив"
        bgColor="#0B0B13"
        showBottomLine={false}
        textColor="white"
        onBack={() => router.back()}
      />
      <View className="h-full w-full flex-1 px-4">
        <Text className="mb-6 mt-9 text-2xl font-extrabold uppercase text-white">
          {'Зээлийн мэдээллийн\nархив'}
        </Text>
        <CustomScrollView>
          <View className="flex-1">
            {loanList.length > 0 ? (
              <View>
                {loanList.map((item, index) => (
                  <View
                    key={index}
                    className="mb-2 rounded-xl border-l-2 border-[#00C7EB] bg-bgSecondary px-3 py-3">
                    <View className="mt-1 flex-row items-center">
                      <View className="mr-2 h-2 w-2 rounded-full bg-[#00C7EB]" />
                      <Text className="text-sm font-black text-white">
                        {item.PROD_NAME}
                      </Text>
                    </View>

                    <View className="my-1 flex-1 border-b border-gray-600" />

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-white opacity-50">
                        Гэрээний дугаар
                      </Text>
                      <Text className="text-sm text-white">
                        {item.CONTRACT_NO}
                      </Text>
                    </View>
                    <View className="my-1 flex-1 border-b border-gray-600" />

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-white opacity-50">
                        Зээлийн огноо
                      </Text>
                      <Text className="text-sm text-white">
                        {formatDate(item?.LOAN_DATE || '', 'yyyy.MM.dd')}
                      </Text>
                    </View>
                    <View className="my-1 flex-1 border-b border-gray-600" />

                    <View className="mb-1 flex-row justify-between">
                      <Text className="text-sm text-white opacity-50">
                        Зээлийн төлөв
                      </Text>
                      <Text className="xs text-sm font-medium text-white">
                        Төлөгдсөн
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center px-10">
                <Text className="text-light text-center text-sm text-white opacity-60">
                  Зээлийн архивын мэдээлэл байхгүй байна
                </Text>
              </View>
            )}
          </View>
        </CustomScrollView>
      </View>
    </View>
  );
};

export default Archive;
