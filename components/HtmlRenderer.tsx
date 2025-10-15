import React, { useMemo } from "react";
import { ScrollView, View, ViewStyle, LogBox } from "react-native";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";

// Ignore specific warnings from react-native-render-html
LogBox.ignoreLogs([
  "Warning: bound renderChildren: Support for defaultProps will be removed from function components",
]);

interface HtmlRendererProps {
  htmlContent: string;
  containerClassName?: string;
  containerStyle?: ViewStyle;
  scrollable?: boolean;
  customStyles?: Record<string, any>;
}

const defaultCustomStyles = {
  p: { color: "#1B3C69" },
  h1: { color: "#1B3C69" },
  h2: { color: "#1B3C69" },
  h3: { color: "#1B3C69" },
  h4: { color: "#1B3C69" },
  h5: { color: "#1B3C69" },
  h6: { color: "#1B3C69" },
  label: { color: "#1B3C69" },
  span: { color: "#1B3C69" },
  body: { backgroundColor: "#fff", padding: 15, margin: -15 },
  a: { color: "#1B3C69" },
  li: { color: "#1B3C69" },
  ul: { color: "#1B3C69" },
  ol: { color: "#1B3C69" },
  button: { color: "#1B3C69" },
};

const HtmlRenderer: React.FC<HtmlRendererProps> = React.memo(
  ({
    htmlContent,
    containerClassName = "p-4",
    containerStyle,
    scrollable = true,
    customStyles = {},
  }) => {
    const { width } = useWindowDimensions();

    // Memoize the merged styles to prevent unnecessary re-renders
    const mergedStyles = useMemo(
      () => ({
        ...defaultCustomStyles,
        ...customStyles,
      }),
      [customStyles]
    );

    // Memoize the source to prevent unnecessary re-renders
    const source = useMemo(
      () => ({
        html: htmlContent,
      }),
      [htmlContent]
    );

    const content = useMemo(
      () => (
        <View className={containerClassName} style={containerStyle}>
          <RenderHtml
            contentWidth={width}
            source={source}
            tagsStyles={mergedStyles}
            enableExperimentalBRCollapsing={true}
            enableExperimentalGhostLinesPrevention={true}
          />
        </View>
      ),
      [containerClassName, containerStyle, width, source, mergedStyles]
    );

    if (scrollable) {
      return <ScrollView className="flex-1">{content}</ScrollView>;
    }

    return content;
  }
);

HtmlRenderer.displayName = "HtmlRenderer";
export default HtmlRenderer;
