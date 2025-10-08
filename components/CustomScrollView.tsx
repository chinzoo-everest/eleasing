import React, {ForwardedRef, forwardRef, useState} from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type Props = {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
};

const CustomScrollView = forwardRef(
  ({children, className, ...props}: Props, ref: ForwardedRef<any>) => {
    const [scrollViewHeight, setScrollViewHeight] = useState(0);
    const [isScrollable, setIsScrollable] = useState(false);

    const handleLayout = (event: any) => {
      const {height} = event.nativeEvent.layout;
      setScrollViewHeight(height);
    };

    const keyboardAwareProps = {
      ...props,
      ref,
      style: {flex: 1},
      onLayout: handleLayout,
      className,
      showsVerticalScrollIndicator: false,
      enableResetScrollToCoords: false,
      keyboardShouldPersistTaps: 'handled' as const,
      enableOnAndroid: true,
      extraHeight: Platform.OS === 'android' ? 120 : 0,
      extraScrollHeight: Platform.OS === 'android' ? 20 : 0,
      onContentSizeChange: (width: number, height: number) => {
        const isContentScrollable = height > scrollViewHeight;
        setIsScrollable(isContentScrollable);
      },
      contentContainerStyle: {
        paddingBottom: isScrollable ? 50 : 30,
        flexGrow: 1,
        justifyContent: 'space-between' as const,
      },
    };

    // For Android, use a hybrid approach with KeyboardAvoidingView
    if (Platform.OS === 'android') {
      return (
        <KeyboardAvoidingView
          behavior="height"
          style={{flex: 1}}
          keyboardVerticalOffset={20}>
          <KeyboardAwareScrollView {...keyboardAwareProps}>
            {children}
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      );
    }

    // For iOS, use KeyboardAwareScrollView directly
    return (
      <KeyboardAwareScrollView {...keyboardAwareProps}>
        {children}
      </KeyboardAwareScrollView>
    );
  },
);

CustomScrollView.displayName = 'CustomScrollView';

export default CustomScrollView;
