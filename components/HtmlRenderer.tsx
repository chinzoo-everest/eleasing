import React, {useMemo} from 'react';
import {ScrollView, View, ViewStyle, LogBox} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {useWindowDimensions} from 'react-native';

// Ignore specific warnings from react-native-render-html
LogBox.ignoreLogs([
  'Warning: bound renderChildren: Support for defaultProps will be removed from function components',
]);

interface HtmlRendererProps {
  htmlContent: string;
  containerClassName?: string;
  containerStyle?: ViewStyle;
  scrollable?: boolean;
  customStyles?: Record<string, any>;
}

const defaultCustomStyles = {
  p: {color: '#FFFFFF'},
  h1: {color: '#FFFFFF'},
  h2: {color: '#FFFFFF'},
  h3: {color: '#FFFFFF'},
  h4: {color: '#FFFFFF'},
  h5: {color: '#FFFFFF'},
  h6: {color: '#FFFFFF'},
  label: {color: '#FFFFFF'},
  span: {color: '#FFFFFF'},
  body: {backgroundColor: '#0B0B13', padding: 15, margin: -15},
  a: {color: '#FFFFFF'},
  li: {color: '#FFFFFF'},
  ul: {color: '#FFFFFF'},
  ol: {color: '#FFFFFF'},
  button: {color: '#FFFFFF'},
};

const HtmlRenderer: React.FC<HtmlRendererProps> = React.memo(
  ({
    htmlContent,
    containerClassName = 'p-4',
    containerStyle,
    scrollable = true,
    customStyles = {},
  }) => {
    const {width} = useWindowDimensions();

    // Memoize the merged styles to prevent unnecessary re-renders
    const mergedStyles = useMemo(
      () => ({
        ...defaultCustomStyles,
        ...customStyles,
      }),
      [customStyles],
    );

    // Memoize the source to prevent unnecessary re-renders
    const source = useMemo(
      () => ({
        html: htmlContent,
      }),
      [htmlContent],
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
      [containerClassName, containerStyle, width, source, mergedStyles],
    );

    if (scrollable) {
      return <ScrollView className="flex-1">{content}</ScrollView>;
    }

    return content;
  },
);

HtmlRenderer.displayName = 'HtmlRenderer';
export default HtmlRenderer;
