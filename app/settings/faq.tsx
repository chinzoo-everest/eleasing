import Header from '@components/Header';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View, Text} from 'react-native';
import {useRouter} from 'expo-router';
import {loadFaqsList} from '@services/basic.service';
import {CFaqGroup, CFaqItem} from '@type/interfaces/Basic';
import Accordion from 'react-native-collapsible/Accordion';
import SvgIcon from '@components/SvgIcon';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Faq = () => {
  const router = useRouter();
  const [faqGroups, setFaqGroups] = useState<CFaqGroup[]>([]);
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const insets = useSafeAreaInsets();
  const loadFaqGroups = useCallback(async () => {
    try {
      const groups = await loadFaqsList();
      if (groups && groups.length > 0) {
        setFaqGroups(groups);
      }
    } catch (error) {
      handleErrorExpo(error, 'loadFaqGroups');
    }
  }, []);

  useEffect(() => {
    loadFaqGroups();
  }, [loadFaqGroups]);

  const _renderHeader = (
    section: CFaqGroup,
    index: number,
    isActive: boolean,
  ) => {
    return (
      <View className={`mb-2 rounded-lg bg-bgLight px-3 py-2`}>
        <View className="flex-row items-center justify-between gap-5 p-2">
          <Text className="flex-1 text-base text-white">{section.NAME}</Text>
          <View
            className="ml-2 self-center"
            style={{
              transform: [{rotate: isActive ? '-90deg' : '90deg'}],
            }}>
            <SvgIcon name="settings_arrow" />
          </View>
        </View>
      </View>
    );
  };

  const _renderContent = (
    section: CFaqGroup,
    index: number,
    isActive: boolean,
  ) => {
    return (
      <View className={`mb-1 rounded-xl bg-bgLight px-5 py-1`}>
        {section.QuestionData.map((item: CFaqItem, itemIndex: number) => (
          <View key={itemIndex} className="mb-3">
            <View className="mb-2 h-[1px] bg-gray-600 opacity-50" />
            <Text className="mb-2 text-xs text-[#9CA3AF]">{item.QUE}</Text>
            <Text className="text-xs text-[#9CA3AF]">{item.ANS}</Text>
          </View>
        ))}
      </View>
    );
  };

  const _updateSections = (activeIndexes: number[]) => {
    setActiveSections(activeIndexes);
  };

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <Header
        title={'Түгээмэл асуулт, хариулт'}
        textColor="white"
        onBack={() => router.back()}
        bgColor="#24292D"
        showBottomLine={false}
      />

      <View className="mx-4 mt-4 flex-1">
        <View className="h-full w-full flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Accordion
              sections={faqGroups}
              activeSections={activeSections}
              renderHeader={(section, index) =>
                _renderHeader(section, index, activeSections.includes(index))
              }
              renderContent={(section, index, isActive) => (
                <View style={{paddingBottom: 8}}>
                  {_renderContent(section, index, isActive)}
                </View>
              )}
              onChange={_updateSections}
              underlayColor="transparent"
              touchableProps={{activeOpacity: 1}}
            />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default Faq;
