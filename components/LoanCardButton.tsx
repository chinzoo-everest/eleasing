import React from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import SvgIcon from './SvgIcon';

const buttonColors = [
  {background: '#D3ABF1', border: '#E5CEF7', divider: '#A78BCF'},
  {background: '#92E1EE', border: '#CAF3F9', divider: '#62B0C8'},
  {background: '#FFF4D1', border: '#FDF7E3', divider: '#E3C254'},
  {background: '#FFE3E1', border: '#FFD3D0', divider: '#D97A72'},
];

const LoanCardButton = ({
  mode,
  onPress,
  index,
}: {
  mode: 'get' | 'renew';
  onPress: () => void;
  index: number;
}) => {
  if (mode === 'get') return null;

  const {background, border, divider} =
    buttonColors[index % buttonColors.length];
  const {width} = Dimensions.get('window');
  const guidelineBaseWidth = 428;

  const scale = (size: number) => (width / guidelineBaseWidth) * size;

  return (
    <TouchableOpacity onPress={onPress} style={{marginVertical: scale(5)}}>
      <View className="mt-1.5 px-3">
        <View
          className="w-full flex-row items-center justify-between self-center rounded-full border-[3px] px-2 py-2 shadow-sm"
          style={{backgroundColor: background, borderColor: border}}>
          <View
            className="flex h-full items-center justify-center border-r px-2"
            style={{borderColor: divider}}>
            <SvgIcon name="renew_button" />
          </View>
          <Text className="flex-1 text-center text-base font-medium text-black">
            Эрх шинэчлэх
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LoanCardButton;
