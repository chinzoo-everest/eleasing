import React, {forwardRef, useState, useEffect} from 'react';
import {Text, TouchableOpacity, View, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {cn} from '@utils/cn';
import Modal from 'react-native-modal';

type Props = {
  label: string;
  value?: Date;
  buttonColor?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  errorString?: string;
  readonly?: boolean;
  onChange?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
};

const SettingsDatePicker = forwardRef(
  (
    {
      label,
      value,
      buttonColor,
      placeholder,
      placeholderTextColor,
      backgroundColor,
      borderColor,
      errorString,
      readonly,
      onChange,
      className,
      minDate,
      maxDate,
      ...props
    }: Props,
    ref: any,
  ) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const isFocused = useSharedValue(0);
    const [dateValue, setDateValue] = useState(value || new Date());

    // Update dateValue when value prop changes
    useEffect(() => {
      if (value) {
        setDateValue(value);
      }
    }, [value]);

    // Format date for display - using direct values to avoid timezone issues
    const formatDate = (date: Date | undefined): string => {
      if (!date) return placeholder || 'YYYY-MM-DD';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    const borderAnimatedStyle = useAnimatedStyle(() => {
      return {
        borderWidth: withTiming(isFocused.value ? 2 : 1, {duration: 200}),
        borderColor: withTiming(
          isFocused.value ? borderColor || '#A069F9' : '#FFFFFF99',
          {
            duration: 200,
          },
        ),
      };
    });

    const handleDateChange = (event: any, selectedDate?: Date) => {
      if (selectedDate) {
        // Fix for timezone issue
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        // Create a new date with only year, month, day without time
        const normalizedDate = new Date(year, month, day, 12);

        if (Platform.OS === 'android') {
          setShowDatePicker(false);
        }

        setDateValue(normalizedDate);

        if (onChange) {
          onChange(normalizedDate);
        }

        // For iOS, we need to hide the picker manually with a button
        if (Platform.OS === 'ios') {
          isFocused.value = 1;
        } else {
          isFocused.value = 0;
        }
      }
    };

    const handlePress = () => {
      if (!readonly) {
        setShowDatePicker(true);
        isFocused.value = 1;
      }
    };

    const closeIOSPicker = () => {
      setShowDatePicker(false);
      isFocused.value = 0;
    };

    const confirmIOSDate = () => {
      if (onChange) {
        // Fix for timezone issue (iOS)
        const year = dateValue.getFullYear();
        const month = dateValue.getMonth();
        const day = dateValue.getDate();

        // Set time to noon to avoid timezone issues
        const normalizedDate = new Date(year, month, day, 12);

        onChange(normalizedDate);
      }
      closeIOSPicker();
    };

    return (
      <View className={cn(className)} {...props}>
        <TouchableOpacity
          className="flex-col items-start"
          onPress={handlePress}
          disabled={readonly}>
          <Text className={cn('mb-1.5 text-sm text-white')}>{label}</Text>
          <Animated.View
            style={[
              borderAnimatedStyle,
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: backgroundColor || '#0B0B13',
                marginBottom: -10,
                borderRadius: 12,
                padding: 1,
              },
            ]}>
            <View
              className="h-[50px] w-full flex-1 justify-center"
              style={{marginLeft: 8, marginVertical: 3}}>
              <Text
                style={{
                  color: dateValue ? '#FFFFFF' : placeholderTextColor || '#666',
                }}>
                {formatDate(dateValue)}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
        <Text className="mt-4 text-right text-xs text-red-500">
          {errorString}
        </Text>

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dateValue}
            mode="date"
            textColor="#FFFFFF"
            display="default"
            onChange={handleDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )}

        {Platform.OS === 'ios' && (
          <Modal
            isVisible={showDatePicker}
            onBackdropPress={closeIOSPicker}
            onSwipeComplete={closeIOSPicker}
            swipeDirection="down"
            style={{justifyContent: 'flex-end', margin: 0}}>
            <View className="rounded-t-[20px] bg-[#1A1A23] p-5 shadow-md">
              <DateTimePicker
                testID="dateTimePicker"
                value={dateValue}
                mode="date"
                display="spinner"
                textColor="#FFFFFF"
                onChange={handleDateChange}
                style={{height: 200, width: '100%'}}
                minimumDate={minDate}
                maximumDate={maxDate}
              />
              <TouchableOpacity
                className="mt-2.5 items-center rounded-[10px] p-4"
                style={{backgroundColor: buttonColor || '#A069F9'}}
                onPress={confirmIOSDate}>
                <Text className="font-bold text-black">Сонгох</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </View>
    );
  },
);

SettingsDatePicker.displayName = 'SettingsDatePicker';

export default SettingsDatePicker;
