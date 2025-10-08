import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

type Props = {
  text?: string;
  textColor?: string;
  disabled?: boolean;
  onPress?: () => void;
};

const TransparentButton = ({
  text,
  textColor = '#6265FE',
  disabled = false,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}>
      <Text
        className="text-xs"
        style={{
          color: textColor,
          fontFamily: 'PlayRegular',
          letterSpacing: -0.75,
        }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default TransparentButton;
