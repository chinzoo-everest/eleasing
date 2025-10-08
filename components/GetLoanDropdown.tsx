import React from 'react';
import {Text, View} from 'react-native';
import SvgIcon from './SvgIcon';
import {Dropdown} from 'react-native-element-dropdown';
import {Config} from '@customConfig/config';

type Props = {
  items: any[];
  title: string;
  selectedValue: any;
  selectedValueLabel: string;
  prodType?: string;
  onChange: (value: string) => void;
};

const GetLoanDropdown = ({
  items,
  title,
  selectedValue,
  selectedValueLabel,
  onChange,
  prodType,
}: Props) => {
  const getProductArrowColor = (prodType: number) => {
    if (prodType === Config.CAR_PROD_TYPE) {
      return 'arrow_car';
    }
    if (prodType === Config.PHONE_PROD_TYPE) {
      return 'arrow_phone';
    }
    if (prodType === Config.DEPOSIT_PROD_TYPE) {
      return 'arrow_deposit';
    }
    return 'arrow_car';
  };

  return (
    <View className="rounded-lg py-3">
      <Text className="font-inter text-sm text-white">{title}</Text>
      <View className="mt-4 items-center justify-center">
        <Dropdown
          iconStyle={{
            width: 0,
            height: 0,
          }}
          style={{
            backgroundColor: '#222630',
            borderRadius: 25,
            width: 140,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            paddingLeft: 40,
          }}
          selectedTextStyle={{
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            fontSize: 18,
            lineHeight: 45,
          }}
          containerStyle={{
            shadowOpacity: 0,
            elevation: 1,
            borderRadius: 6,
            backgroundColor: '#222630',
          }}
          itemTextStyle={{
            paddingHorizontal: 10,
            color: 'gray',
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
          }}
          itemContainerStyle={{
            borderRadius: 6,
            backgroundColor: 'transparent',
          }}
          data={items.map(item => ({
            label: item,
            value: item,
          }))}
          labelField="label"
          valueField="value"
          value={{
            label: selectedValueLabel,
            value: selectedValue,
          }}
          renderRightIcon={() => (
            <SvgIcon
              style={{paddingRight: 40}}
              name={getProductArrowColor(Number(prodType))}
            />
          )}
          onChange={item => onChange(item.value)}
        />
      </View>
    </View>
  );
};

export default GetLoanDropdown;
