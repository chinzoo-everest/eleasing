import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Accordion from "react-native-collapsible/Accordion";

import { loadFaqsList } from "@services/basic.service";
import { CFaqGroup, CFaqItem } from "@type/interfaces/Basic";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import SvgIcon from "@components/SvgIcon";
import Header from "@components/Header";

/** ─────────────────────────  FAQ screen  ───────────────────────── */
const Faq: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [faqGroups, setFaqGroups] = useState<CFaqGroup[]>([]);
  const [activeSections, setActiveSections] = useState<number[]>([]);
  const [query, setQuery] = useState("");

  const loadFaqGroups = useCallback(async () => {
    try {
      const groups = await loadFaqsList();
      if (groups?.length) setFaqGroups(groups);
    } catch (error) {
      handleErrorExpo(error, "loadFaqGroups");
    }
  }, []);

  useEffect(() => {
    loadFaqGroups();
  }, [loadFaqGroups]);

  /** Flatten to question-level sections to match the new design */
  const allQuestions = useMemo(() => {
    const flat: Array<CFaqItem & { groupName?: string }> = [];
    faqGroups.forEach((g) =>
      g.QuestionData.forEach((q) => flat.push({ ...q, groupName: g.NAME }))
    );
    return flat;
  }, [faqGroups]);

  /** Optional search filter */
  const sections = useMemo(() => {
    if (!query.trim()) return allQuestions;
    const q = query.toLowerCase();
    return allQuestions.filter(
      (item) =>
        item.QUE.toLowerCase().includes(q) ||
        item.ANS.toLowerCase().includes(q) ||
        item.groupName?.toLowerCase().includes(q)
    );
  }, [allQuestions, query]);

  /** Card header (collapsed/expanded) */
  const renderHeader = (
    section: CFaqItem & { groupName?: string },
    index: number,
    isActive: boolean
  ) => {
    return (
      <View className=" rounded-2xl mb-2 bg-white py-6 shadow-sm shadow-black pr-4 ">
        {/* Blue corner badge */}
        <View className="absolute left-0 top-0 h-14 w-14 items-center justify-center rounded-br-full rounded-tl-2xl bg-[#2E53F1]">
          <View className="self-center absolute top-4 left-4">
            <SvgIcon name="faq_corner" width={16} height={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Title row */}
        <View className="flex-row items-start">
          <Text className="flex-1 pl-16 pr-3 text-[15px] font-semibold leading-5 text-[#163660]">
            {section.QUE}
          </Text>

          {/* Plus / minus */}
          <View className="ml-2 h-6 w-6 items-center justify-center rounded-md bg-transparent">
            <Text className="text-2xl leading-6 text-[#7787A6]">
              {isActive ? "–" : "+"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /** Card content (answer) */
  const renderContent = (
    section: CFaqItem & { groupName?: string },
    index: number,
    isActive: boolean
  ) => {
    return (
      <View className=" mb-3 rounded-2xl  px-4 pb-4 pt-3 shadow-sm shadow-black bg-white ">
        <Text className="pl-12 pr-2 text-[13px] leading-5 text-[#1B3C69]">
          {section.ANS}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Асуулт хариулт"
        bgColor="white"
        showBottomLine={false}
        textColor="#1B3C69"
        onBack={() => router.back()}
      />
      {/* Subtitle */}
      <View className="px-4 pt-2"></View>
      {/* Search */}
      <View className="px-4 pt-5">
        <View className="flex-row items-center rounded-full bg-[#F2F6FC] px-4 py-3 shadow-sm shadow-black/5">
          <View className="mr-2">
            <SvgIcon name="search" width={18} height={18} color="#99A7BF" />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Хайх"
            placeholderTextColor="#99A7BF"
            className="flex-1 text-[15px] text-[#1C2B49]"
          />
        </View>
      </View>
      {/* List */}
      <ScrollView
        className="mt-5 flex-1 px-3"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Accordion
          sections={sections}
          activeSections={activeSections}
          renderHeader={(s, i) =>
            renderHeader(s, i, activeSections.includes(i))
          }
          renderContent={(s, i) =>
            renderContent(s, i, activeSections.includes(i))
          }
          onChange={(idxs: number[]) => setActiveSections(idxs)}
          underlayColor="transparent"
          touchableProps={{ activeOpacity: 1 }}
          expandMultiple={false}
        />
      </ScrollView>
    </View>
  );
};

export default Faq;
