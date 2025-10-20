import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native";
import Header from "@components/Header";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Network from "expo-network";
import { Config } from "@customConfig/config";

const Register = () => {
  const [isConnected, setIsConnected] = useState(true);
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected ?? false);
    };

    checkConnection();
  }, []);

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    console.info("message", message);
    switch (message) {
      case "go_to_login":
        router.back();
        break;
      default:
        console.warn("Received unknown message:", message);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top, backgroundColor: "#fff" }} />
      <SafeAreaView className="bg-[#EBF6F3]">
        <Header
          title="Бүртгүүлэх"
          showBottomLine={false}
          onBack={() => router.back()}
          bgColor="#fff"
          textColor="#1B3C69"
        />
      </SafeAreaView>
      <View className="flex-1">
        {!isConnected ? (
          <Text className="m-[20px] text-center">
            Интернэт сүлжээнд холбогдоогүй байна.
          </Text>
        ) : (
          <WebView
            className="flex-1"
            source={{
              uri: Config.REGISTER_WEBVIEW_URL as string,
            }}
            ignoreSilentHardwareSwitch={true}
            onMessage={handleMessage}
            onNavigationStateChange={(navState) => {
              if (navState.url.includes("xyp/dan/authorized")) {
                // Perform actions when URL contains 'xyp/dan/authorized'
                console.info("URL contains xyp/dan/authorized");
                webViewRef.current?.injectJavaScript(`
                  setTimeout(function() {
                    var checkExist = setInterval(function() {
                      var loginButtons = document.querySelectorAll('.btn.btn-primary');
                      if (loginButtons.length > 0) {
                        ('Re-injecting JS - Buttons found:', loginButtons.length);
                        clearInterval(checkExist);
                        loginButtons.forEach(function(button) {
                          console.log('Button text:', button.textContent);
                          button.classList.remove('btn-primary');
                          if (button.textContent.trim().toLowerCase() == 'системд нэвтрэх') {
                            button.onclick = function() {
                              console.log('Click handler re-assigned');
                              window.ReactNativeWebView.postMessage('go_to_login');
                            }
                          }
                        });
                      }
                    }, 100); // check every 100ms
                  }, 500); // initial delay before starting the interval
                  true; // Add this to ensure the script returns something
                `);
              }
            }}
            javaScriptEnabled={true}
            style={{ flex: 1 }}
            ref={webViewRef}
          />
        )}
      </View>
    </View>
  );
};

export default Register;
