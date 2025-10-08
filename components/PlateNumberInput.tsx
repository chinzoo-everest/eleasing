import AlphaBetList from '@modals/AlphabetList';
import React, {useState, useEffect, forwardRef} from 'react';
import {View, Text, TextInput, TouchableOpacity, Keyboard} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type PlateNumberInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  errorString?: string;
  readonly?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  isDeposit?: boolean;
};

const PlateNumberInput = forwardRef<TextInput, PlateNumberInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      errorString,
      readonly = false,
      backgroundColor = '#0B0B13',
      borderColor = '#B4B4B6',
      isDeposit = false,
    },
    ref,
  ) => {
    const isFocused = useSharedValue(0);
    const letterBoxAnimations = [
      useSharedValue(0),
      useSharedValue(0),
      useSharedValue(0),
    ];
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

    // Separate the plate number into digits and letters
    const [numbers, setNumbers] = useState('');
    const [letters, setLetters] = useState(['', '', '']);

    // Update internal state when value changes from outside
    useEffect(() => {
      if (value) {
        const nums = value.substring(0, 4).replace(/[^0-9]/g, '');
        let chars = value
          .substring(4)
          .replace(/[^А-Я]/g, '')
          .split('');
        // Pad letters array to length 3
        while (chars.length < 3) chars.push('');

        setNumbers(nums);
        setLetters(chars);
      }
    }, [value]);

    // Combine and notify parent when internal state changes
    const updateParent = (newNumbers: string, newLetters: string[]) => {
      const newValue = newNumbers + newLetters.join('');
      onChangeText(newValue);
    };

    const handleLetterPress = (letter: string) => {
      setModalVisible(false);
      const newLetters = [...letters];
      newLetters[currentLetterIndex] = letter;
      setLetters(newLetters);
      updateParent(numbers, newLetters);

      // Add animation when letter is selected
      letterBoxAnimations[currentLetterIndex].value = withTiming(1, {
        duration: 300,
        easing: Easing.bounce,
      });

      global.setTimeout(() => {
        letterBoxAnimations[currentLetterIndex].value = withTiming(0, {
          duration: 300,
        });
      }, 600);

      // Move to next letter slot if available
      if (currentLetterIndex < 2) {
        global.setTimeout(() => {
          setCurrentLetterIndex(currentLetterIndex + 1);
          setModalVisible(true);
        }, 300);
      }
    };

    const handleCloseModal = () => {
      setModalVisible(false);
    };

    const handleOpenLetterPicker = (index: number) => {
      setCurrentLetterIndex(index);

      // Animate the selected letter box
      letterBoxAnimations.forEach((anim, i) => {
        anim.value = withTiming(i === index ? 1 : 0, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      });

      // Dismiss keyboard first if it's open
      Keyboard.dismiss();
      global.setTimeout(() => {
        setModalVisible(true);
      }, 50);
    };

    const numberInputStyle = useAnimatedStyle(() => {
      return {
        borderWidth: 1,
        borderColor: withTiming(isFocused.value ? borderColor : '#B4B4B6', {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        borderRadius: 12,
        height: 54,
        backgroundColor,
        transform: [
          {
            scale: withTiming(isFocused.value ? 1.02 : 1, {
              duration: 300,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
          },
        ],
      };
    });

    // Create animated styles for each letter box directly
    const letterBoxStyle0 = useAnimatedStyle(() => {
      return {
        backgroundColor,
        borderColor: '#B4B4B6',
        borderWidth: 1,
        borderRadius: 12,
        height: 54,
        width: 54,
        marginLeft: 4,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [
          {
            scale: withTiming(letterBoxAnimations[0].value ? 1.05 : 1, {
              duration: 300,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
          },
        ],
      };
    });

    const letterBoxStyle1 = useAnimatedStyle(() => {
      return {
        backgroundColor,
        borderColor: '#B4B4B6',
        borderWidth: 1,
        borderRadius: 12,
        height: 54,
        width: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
        transform: [
          {
            scale: withTiming(letterBoxAnimations[1].value ? 1.05 : 1, {
              duration: 300,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
          },
        ],
      };
    });

    const letterBoxStyle2 = useAnimatedStyle(() => {
      return {
        backgroundColor,
        borderColor: '#B4B4B6',
        borderWidth: 1,
        borderRadius: 12,
        height: 54,
        width: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
        transform: [
          {
            scale: withTiming(letterBoxAnimations[2].value ? 1.05 : 1, {
              duration: 300,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
          },
        ],
      };
    });

    const letterBoxStyles = [letterBoxStyle0, letterBoxStyle1, letterBoxStyle2];

    return (
      <View>
        <Text className="mb-2 ml-4 text-sm font-semibold text-white">
          {label}
        </Text>

        <View className="flex-row space-x-4">
          {/* Numbers section (4 digits) */}
          <TouchableOpacity
            className="flex-1"
            disabled={readonly}
            onPress={() => {
              if (ref && 'current' in ref && ref.current) {
                ref.current.focus();
              }
            }}>
            <Animated.View
              style={[
                numberInputStyle,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <TextInput
                ref={ref}
                value={numbers}
                editable={!readonly}
                onChangeText={text => {
                  const newNumbers = text
                    .replace(/[^0-9]/g, '')
                    .substring(0, 4);
                  setNumbers(newNumbers);
                  updateParent(newNumbers, letters);

                  // Automatically move to letters when 4 digits are entered
                  if (newNumbers.length === 4 && text.length > numbers.length) {
                    Keyboard.dismiss();
                    global.setTimeout(() => {
                      handleOpenLetterPicker(0);
                    }, 300);
                  }
                }}
                onFocus={() => {
                  isFocused.value = 1;
                  // Reset letter box animations when focusing on number field
                  letterBoxAnimations.forEach(anim => {
                    anim.value = withTiming(0, {duration: 200});
                  });
                }}
                onBlur={() => {
                  isFocused.value = 0;
                }}
                maxLength={4}
                keyboardType="numeric"
                placeholderTextColor="#6E7074"
                className="flex-1 text-center text-xl leading-6"
                style={{color: '#ffffff'}}
                placeholder="0000"
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Letters section (3 Cyrillic letters) */}
          <View className="flex-row">
            {[0, 1, 2].map(index => (
              <View key={index}>
                <TouchableOpacity
                  disabled={readonly}
                  onPress={() => handleOpenLetterPicker(index)}>
                  <Animated.View style={letterBoxStyles[index]}>
                    <Text className="text-xl text-white">
                      {letters[index] || ''}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {errorString && (
          <Text className="mt-2 text-right text-xs text-red-500">
            {errorString}
          </Text>
        )}

        {/* <AlphaBetList
          isVisible={modalVisible}
          isCarLoan={!isDeposit}
          isDeposit={isDeposit}
          onClose={handleCloseModal}
          onLetterPress={handleLetterPress}
        /> */}
      </View>
    );
  },
);

PlateNumberInput.displayName = 'PlateNumberInput';

export default PlateNumberInput;
