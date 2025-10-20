import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { useGlobalContext } from "@hooks/useGlobalContext";
import Header from "@components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { handleErrorExpo } from "@utils/handleErrorOnExpo";
import { Config } from "@customConfig/config";
import WebView from "react-native-webview";
import { showToast } from "@utils/showToast";
import { routePush } from "@utils/routePush";
import { SCREENS } from "@customConfig/route";

const UpdateLoanLimit = () => {
  const { mode } = useGlobalSearchParams();
  const router = useRouter();
  const { state } = useGlobalContext();
  const insets = useSafeAreaInsets();
  const currentCustomer = state?.currentUser;
  const [webUri, setWebUri] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const successDetected = useRef(false);

  // JavaScript to be injected into the WebView to scan for success message
  const INJECTED_JAVASCRIPT = `
    (function() {
      function checkForSuccessMessage() {
        const content = document.body.innerText || document.body.textContent;
        if (content && content.includes('Таны мэдээллийг амжилттай шинэчлэлээ')) {
          window.ReactNativeWebView.postMessage('SUCCESS_MESSAGE_FOUND');
        }
        setTimeout(checkForSuccessMessage, 1000); // Check every second
      }
      checkForSuccessMessage();
    })();
    true; // Note: this is needed to prevent warnings
  `;

  const fetchHtmlContent = useCallback(async () => {
    if (!currentCustomer?.CUST_ID) return;
    setIsLoading(true);

    try {
      const baseUrl =
        mode === "updateLoanLimit"
          ? Config.UPDATE_LOAN_LIMIT_WEBVIEW_URL +
              `${currentCustomer?.CUST_ID}` || ""
          : Config.UPDATE_DAN_INFO_WEBVIEW_URL +
              `${currentCustomer?.CUST_ID}` || "";
      setWebUri(baseUrl);
    } catch (error) {
      handleErrorExpo(error, "UpdateLoanLimit - fetchHtmlContent");
    } finally {
      setIsLoading(false);
    }
  }, [currentCustomer, mode]);

  useEffect(() => {
    fetchHtmlContent();
  }, [fetchHtmlContent]);

  const handleNavigationStateChange = (navState: any) => {
    // Check if the URL includes the target URL pattern
    if (
      navState.url.includes("e-mandaldigital.everestapp.mn/xyp/dan/authorized")
    ) {
      // If we're on the authorized URL, check for success message in the content
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          (function() {
            const content = document.body.innerText || document.body.textContent;
            if (content && content.includes('Таны мэдээллийг амжилттай шинэчлэлээ')) {
              window.ReactNativeWebView.postMessage('SUCCESS_MESSAGE_FOUND');
            }
            true;
          })();
        `);
      }
    }
  };

  const handleMessage = async (event: any) => {
    const { data } = event.nativeEvent;

    if (data === "SUCCESS_MESSAGE_FOUND" && !successDetected.current) {
      successDetected.current = true; // Prevent multiple executions

      // Show success toast and navigate back
      showToast("Амжилттай", "Таны мэдээллийг амжилттай шинэчлэлээ", "success");

      // Add slight delay before navigation to ensure toast is visible
      // eslint-disable-next-line no-undef
      setTimeout(async () => {
        await routePush(SCREENS.HOME, {}, true);
      }, 1500);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Header
        title={
          mode === "updateLoanLimit" ? "Эрх шинэчлэх" : "Бүртгэл баталгаажуулах"
        }
        bgColor="#fff"
        textColor="#1B3C69"
        showBottomLine={false}
        onBack={() => router.back()}
      />

      <View className="h-full w-full flex-1">
        {webUri && (
          <WebView
            ref={webViewRef}
            source={{ uri: webUri }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            className="bg-bgPrimary"
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              backgroundColor: "#fff",
            }}
          />
        )}
        {isLoading && (
          <View className="absolute h-full w-full items-center justify-center bg-[#1B3C69]">
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </View>
    </View>
  );
};

export default UpdateLoanLimit;
