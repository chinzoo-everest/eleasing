import Header from "@components/Header";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HtmlRenderer from "@components/HtmlRenderer";
import {
  DEFAULT_LOADING_CONTENT,
  getCustomHtmlContent,
} from "@services/html.service";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { Config } from "@customConfig/config";

const Terms = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [htmlContent, setHtmlContent] = useState<string>(
    DEFAULT_LOADING_CONTENT
  );

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const url = Config.TERMS_SERVICE_URL || "";
        const response = await getCustomHtmlContent(url);
        setHtmlContent(response.content);
      } catch (error) {
        handleErrorExpo(error, "Terms - fetchHtmlContent");
      }
    };

    fetchHtmlContent();
  }, []);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title="Үйлчилгээний нөхцөл"
        textColor="#1B3C69"
        showBottomLine={false}
        onBack={() => router.back()}
        bgColor="white"
      />
      <View className="h-full w-full flex-1">
        <HtmlRenderer htmlContent={htmlContent} containerClassName="px-4" />
      </View>
    </View>
  );
};

export default Terms;
