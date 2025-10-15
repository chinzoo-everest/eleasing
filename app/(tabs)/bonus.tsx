// screens/BonusScreen.tsx (or wherever your current BonusScreen lives)
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import Header from "@components/Header";
import SvgIcon from "@components/SvgIcon";

const HOME_MARKET_URL = "https://pc-mall.mn/";

const isSameDomain = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname.endsWith("pc-mall.mn");
  } catch {
    return false;
  }
};

const BonusScreen = () => {
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [webError, setWebError] = useState<string | null>(null);

  // Reload helper
  const handleReload = useCallback(() => {
    setWebError(null);
    webRef.current?.reload();
  }, []);

  // Hardware back: go back inside WebView first
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack) {
          webRef.current?.goBack();
          return true;
        }
        return false; // let navigator pop the screen
      };
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
    }, [canGoBack])
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* WebView container */}
      <View className="flex-1">
        <WebView
          ref={webRef}
          source={{ uri: HOME_MARKET_URL }}
          onLoadStart={() => {
            setLoading(true);
            setWebError(null);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={(e) => {
            setLoading(false);
            setWebError(
              e.nativeEvent?.description || "Ачааллахад алдаа гарлаа"
            );
          }}
          onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
          originWhitelist={["*"]}
          setSupportMultipleWindows={false}
          pullToRefreshEnabled={Platform.OS === "android"}
          onShouldStartLoadWithRequest={(req) => {
            // Keep pc-mall.mn inside; open other domains externally
            if (isSameDomain(req.url)) return true;
            if (req.navigationType !== "other") {
              Linking.openURL(req.url).catch(() => {});
              return false;
            }
            return true;
          }}
          style={{ backgroundColor: "#FFFFFF" }}
        />

        {/* Loading overlay */}
        {loading && !webError && (
          <View className="absolute inset-0 items-center justify-center bg-white/70">
            <ActivityIndicator size="large" />
          </View>
        )}

        {/* Error overlay with retry */}
        {webError && (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <Text className="mb-3 text-base text-[#6B7280]">{webError}</Text>
            <TouchableOpacity
              onPress={handleReload}
              className="flex-row items-center rounded-xl bg-[#001165] px-4 py-2"
            >
              <SvgIcon name="refresh" width={18} height={18} color="#fff" />
              <Text className="ml-2 text-white font-semibold">
                Дахин ачаалах
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating refresh button (optional) */}
        {!webError && (
          <TouchableOpacity
            onPress={handleReload}
            className="absolute bottom-5 right-5 rounded-full bg-[#001165] p-3 shadow-lg"
            activeOpacity={0.8}
          >
            <SvgIcon name="refresh" width={20} height={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BonusScreen;
