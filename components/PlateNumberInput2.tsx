import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {cn} from '@utils/cn';

type PlateNumberInput2Ref = {
  focus: () => void;
};

type PlateNumberInput2Props = {
  label?: string;
  value?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  focusColor?: string;
  errorString?: string;
  readonly?: boolean;
  onChangeText?: (text: string) => void;
  className?: string;
};

const PlateNumberInput2 = forwardRef<
  PlateNumberInput2Ref,
  PlateNumberInput2Props
>(
  (
    {
      label = 'Улсын дугаар',
      value = '',
      placeholder,
      placeholderTextColor,
      backgroundColor = '#0B0B13',
      borderColor,
      focusColor = '#A069F9',
      errorString,
      readonly = false,
      onChangeText,
      className,
    },
    ref,
  ) => {
    const numberInputRef = useRef<TextInput>(null);
    const letterInputRef = useRef<TextInput>(null);
    const [numbers, setNumbers] = useState(value.substring(0, 4) || '');
    const [letters, setLetters] = useState(value.substring(4) || '');
    const [formattedNumbers, setFormattedNumbers] = useState('');
    const [formattedLetters, setFormattedLetters] = useState('');
    const isFocused = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      focus: () => {
        numberInputRef.current?.focus();
      },
    }));

    const handleNumberChange = (text: string) => {
      const newNumbers = text.replace(/[^0-9]/g, '').substring(0, 4);
      setNumbers(newNumbers);
      if (onChangeText) {
        onChangeText(newNumbers + letters);
      }
    };

    const handleLetterChange = (text: string) => {
      const newLetters = text
        .replace(/[^А-Яа-я]/g, '')
        .toUpperCase()
        .substring(0, 3);
      setLetters(newLetters);
      if (onChangeText) {
        onChangeText(numbers + newLetters);
      }
    };

    // Update internal state when external value changes
    React.useEffect(() => {
      if (value !== undefined) {
        const nums = value.substring(0, 4);
        const chars = value.substring(4);
        setNumbers(nums);
        setLetters(chars);
        setFormattedNumbers(nums);
        setFormattedLetters(chars);
      }
    }, [value]);

    const borderAnimatedStyle = useAnimatedStyle(() => {
      return {
        borderWidth: withTiming(isFocused.value ? 2 : 1, {duration: 200}),
        borderColor: withTiming(
          isFocused.value ? focusColor : errorString ? '#FF0000' : '#FFFFFF99',
          {duration: 200},
        ),
      };
    });

    return (
      <View className={cn(className)}>
        <TouchableOpacity
          className="flex-col items-start"
          onPress={() => {
            numberInputRef.current?.focus();
          }}>
          <Text className={cn('mb-1.5 text-sm text-white')}>{label}</Text>
          <View className="flex-col space-y-2">
            {/* Numbers input */}
            <Animated.View
              style={[
                borderAnimatedStyle,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor,
                  borderRadius: 12,
                  padding: 1,
                  width: '100%',
                },
              ]}>
              <TextInput
                ref={numberInputRef}
                value={isFocused.value ? numbers : formattedNumbers}
                onChangeText={handleNumberChange}
                onBlur={() => {
                  setFormattedNumbers(numbers);
                  isFocused.value = 0;
                }}
                maxLength={4}
                keyboardType="numeric"
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                editable={!readonly}
                autoCapitalize="characters"
                className="h-[50px] w-full flex-1 text-lg leading-6"
                onFocus={() => (isFocused.value = 1)}
                style={{color: '#FFFFFF', marginLeft: 8, marginBottom: 6}}
              />
            </Animated.View>

            {/* Letters input */}
            <Animated.View
              style={[
                borderAnimatedStyle,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor,
                  borderRadius: 12,
                  marginTop: 10,
                  padding: 1,
                  width: '100%',
                },
              ]}>
              <TextInput
                ref={letterInputRef}
                value={isFocused.value ? letters : formattedLetters}
                onChangeText={handleLetterChange}
                onBlur={() => {
                  setFormattedLetters(letters);
                  isFocused.value = 0;
                }}
                maxLength={3}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                editable={!readonly}
                className="h-[50px] w-full flex-1 text-lg leading-6"
                onFocus={() => (isFocused.value = 1)}
                style={{color: '#FFFFFF', marginLeft: 8, marginBottom: 6}}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
        {errorString && (
          <Text className="mt-4 text-right text-xs text-red-500">
            {errorString}
          </Text>
        )}
      </View>
    );
  },
);

PlateNumberInput2.displayName = 'PlateNumberInput2';

export default PlateNumberInput2;
