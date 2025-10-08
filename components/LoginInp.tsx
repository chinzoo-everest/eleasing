import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import {
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {cn} from '@utils/cn';
import SvgIcon from './SvgIcon';

type Props = {
  value?: string;
  placeholder?: string;
  mode?: 'phone' | 'password';
  errorString?: string;
  placeHolderColor?: string;
  maxLength?: number;
  keyboard?: KeyboardTypeOptions;
  readonly?: boolean;
  customBorderColor?: string;
  focusColor?: string;
  onChangeText?: (arg: string) => void;
  onEndEditing?: () => void;
};

type InputRef = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setSelection: (start: number, end?: number) => void;
  measure: (...args: any[]) => void;
  measureInWindow: (...args: any[]) => void;
  measureLayout: (...args: any[]) => void;
  setNativeProps: (nativeProps: object) => void;
};

const Input = forwardRef<InputRef, Props>(
  (
    {
      value,
      placeholder = '...',
      mode,
      errorString = '',
      keyboard = 'default',
      maxLength,
      readonly = false,
      placeHolderColor = '#abb0b0',
      customBorderColor = '#9CA3AF',
      focusColor = '#6265FE',
      onChangeText,
      onEndEditing,
    }: Props,
    ref,
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [isShowPassIcon, setIsShowPassIcon] = useState(false);
    const isFocused = useSharedValue(0);
    const labelAnim = useSharedValue(value ? 1 : 0);

    useEffect(() => {
      labelAnim.value = value ? 1 : 0;
    }, [value]);

    useImperativeHandle<InputRef | null, InputRef | null>(ref, () => {
      const input = textInputRef.current;
      if (!input) return null;
      return {
        focus: () => input.focus(),
        blur: () => input.blur(),
        clear: () => input.clear(),
        isFocused: () => input.isFocused(),
        setSelection: (start: number, end?: number) =>
          input.setSelection(start, end),
        measure: (
          ...args: [
            fn: (
              x: number,
              y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number,
            ) => void,
          ]
        ) => input.measure?.(...args),
        measureInWindow: (
          ...args: [
            fn: (x: number, y: number, width: number, height: number) => void,
          ]
        ) => input.measureInWindow?.(...args),
        measureLayout: (
          ...args: [
            relativeToNativeNode: number,
            onSuccess: (
              x: number,
              y: number,
              width: number,
              height: number,
            ) => void,
            onFail?: () => void,
          ]
        ) => input.measureLayout?.(...args),
        setNativeProps: (nativeProps: object) =>
          input.setNativeProps(nativeProps),
      };
    });

    const borderAnimatedStyle = useAnimatedStyle(() => {
      return {
        borderWidth: withTiming(isFocused.value ? 2 : 1, {duration: 200}),
        borderColor: withTiming(
          isFocused.value ? focusColor : customBorderColor,
          {duration: 200},
        ),
        shadowColor: focusColor,
        shadowOpacity: withTiming(isFocused.value ? 0.5 : 0, {duration: 200}),
        shadowRadius: withTiming(isFocused.value ? 6 : 0, {duration: 200}),
        shadowOffset: {width: 0, height: 0},
      };
    });

    const labelStyle = useAnimatedStyle(() => {
      return {
        top: withTiming(labelAnim.value ? 6 : 12, {duration: 200}),
        fontSize: withTiming(labelAnim.value ? 10 : 18, {duration: 200}),
        color: withTiming(labelAnim.value ? focusColor : placeHolderColor, {
          duration: 200,
        }),
      };
    });

    return (
      <View className="relative">
        <Animated.View
          style={borderAnimatedStyle}
          className="flex h-14 w-full flex-row items-center rounded-xl bg-black px-4">
          {mode === 'phone' && (
            <View className="mr-2">
              <SvgIcon name="phone" height={15} width={15} />
            </View>
          )}
          {mode === 'password' && (
            <View className="mr-2">
              <SvgIcon name="password" height={15} width={15} />
            </View>
          )}

          <View className="flex-1 justify-center">
            <Animated.Text
              style={labelStyle}
              className="absolute left-0 font-[PlayRegular] text-white">
              {placeholder}
            </Animated.Text>
            <TextInput
              ref={textInputRef}
              value={value}
              keyboardType={keyboard}
              onChangeText={onChangeText}
              onEndEditing={onEndEditing}
              maxLength={maxLength}
              numberOfLines={1}
              editable={!readonly}
              onFocus={() => {
                isFocused.value = 1;
                labelAnim.value = 1;
              }}
              onBlur={() => {
                isFocused.value = 0;
                if (!value) labelAnim.value = 0;
              }}
              className="h-14 font-[PlayRegular] text-base text-white"
              secureTextEntry={mode === 'password' && !isShowPassIcon}
            />
          </View>

          {mode === 'password' && (
            <TouchableOpacity
              onPress={() => setIsShowPassIcon(!isShowPassIcon)}
              className="p-2.5">
              {isShowPassIcon ? (
                <SvgIcon name="auth_showpass" />
              ) : (
                <SvgIcon name="auth_hidepass" />
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        {errorString && (
          <Text className="pr-5 pt-2.5 text-right text-sm text-red-500">
            {errorString}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;
