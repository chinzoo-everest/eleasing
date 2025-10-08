import React, {useEffect} from 'react';
import {Image, Text, View, BackHandler, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import Button from '@components/Button';
import {
  getProductColorByType,
  getProductTextColorByType,
} from 'utils/getProductColor';

type Props = {
  title: string;
  prodType?: number;
  description: string;
  buttonOnPress?: () => void;
  isConfirmation: boolean;
  isVisible: boolean;
  onClose: () => void;
  callBack?: () => void;
};

const Confirmation = ({
  title,
  prodType,
  description,
  buttonOnPress,
  isConfirmation,
  isVisible,
  onClose,
  callBack,
}: Props) => {
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isVisible, onClose]);

  return (
    <View className="absolute h-full w-full">
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        swipeDirection="down"
        backdropColor="rgba(0,0,0,0.7)"
        style={{justifyContent: 'center', margin: 0}}>
        <View className="mx-4 rounded-3xl bg-bgLight p-6">
          <Text
            className="mt-6 text-center text-xl font-bold"
            style={{
              color: getProductColorByType(Number(prodType)),
            }}>
            {title}
          </Text>

          {!prodType && (
            <Image
              source={require('@assets/images/magphone.png')}
              resizeMode="contain"
              className="my-6 h-40 w-40 self-center"
            />
          )}

          <Text className="mt-5 px-6 text-center text-base text-white">
            {description}
          </Text>

          <View className="mb-6 mt-8 w-full flex-row justify-center px-4">
            {isConfirmation && (
              <Button
                text="Үгүй"
                className="mr-4 flex-1"
                isSecondary
                onPress={onClose}
                textColor="white"
                fillColor="#2A2A2A"
              />
            )}
            <Button
              text={isConfirmation ? 'Тийм' : 'Эхлүүлэх'}
              className="flex-1"
              isTextBold
              onPress={() => {
                if (typeof callBack === 'function') {
                  callBack();
                }
                if (typeof buttonOnPress === 'function') {
                  buttonOnPress();
                }
              }}
              fillColor={getProductColorByType(Number(prodType))}
              textColor={getProductTextColorByType(Number(prodType))}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Confirmation;
