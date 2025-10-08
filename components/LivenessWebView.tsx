import {LivenessState, WebViewMessage} from '@type/interfaces/Liveness';
import {AnimatePresence, MotiView} from 'moti';
import React, {useCallback, useRef} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

interface LivenessWebViewProps {
  sessionId: string;
  onMessage: (message: WebViewMessage) => void;
  onError: (error: string) => void;
  loading: boolean;
  state: LivenessState;
}

const LivenessWebView: React.FC<LivenessWebViewProps> = ({
  sessionId,
  onMessage,
  onError,
  loading,
  state,
}) => {
  const webViewRef = useRef<WebView>(null);

  const buildUrl = () => {
    return `https://liveness.everestapp.mn?sessionId=${sessionId}&color=%230B0B13`;
  };

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message: WebViewMessage = JSON.parse(event.nativeEvent.data);
        onMessage(message);
      } catch (error) {
        onError('WebView мессежийг уншихад алдаа гарлаа');
      }
    },
    [onMessage, onError],
  );

  const handleError = useCallback(
    (syntheticEvent: any) => {
      const {nativeEvent} = syntheticEvent;
      onError('WebView ачаалж авахад алдаа гарлаа');
    },
    [onError],
  );

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center bg-bgPrimary">
      <ActivityIndicator size="large" color="#9C4FDD" />
      <Text className="mt-4 text-lg text-white">Ачаалж байна...</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-bgPrimary">
      <WebView
        ref={webViewRef}
        source={{uri: buildUrl()}}
        onMessage={handleMessage}
        onError={handleError}
        onHttpError={handleError}
        style={{flex: 1}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        startInLoadingState={true}
        renderLoading={() => renderLoading()}
        onShouldStartLoadWithRequest={() => true}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        // Additional props for better WebView communication
        mixedContentMode="compatibility"
        allowsProtectedMedia={true}
        cacheEnabled={false}
        incognito={true}
      />

      {/* Loading overlay on top of WebView with Moti animation */}
      <AnimatePresence>
        {loading && (
          <MotiView
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{
              type: 'timing',
              duration: 300,
            }}
            className="absolute inset-0 items-center justify-center bg-bgPrimary bg-opacity-50">
            {renderLoading()}
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

export default LivenessWebView;
