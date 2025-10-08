import React, {ReactElement} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import Checkbox from 'expo-checkbox';

type Props = {
  text?: string | ReactElement;
  textColor?: string;
  fillColor?: string;
  isChecked: boolean;
  disabled?: boolean;
  toggleCheckbox: (value: boolean) => void;
};

const CheckBox = ({
  text,
  textColor = 'white',
  fillColor = '#9C4FDD',
  isChecked,
  toggleCheckbox,
  disabled,
  ...props
}: Props) => {
  return (
    <TouchableOpacity
      onPress={() => toggleCheckbox(!isChecked)}
      style={styles.container}
      disabled={disabled}
      {...props}>
      <Checkbox
        value={isChecked}
        onValueChange={toggleCheckbox}
        color={isChecked ? fillColor : undefined}
        disabled={disabled}
        style={styles.checkbox}
      />

      <Text style={[styles.text, {color: textColor}]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 23,
  },
  text: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default CheckBox;
