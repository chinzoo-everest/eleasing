import {SCREENS} from '@customConfig/route';
import Button from '@components/Button';
import SvgIcon from '@components/SvgIcon';
import {GlobalContext} from '@context/GlobalContext';
import {cn} from '@utils/cn';
import {routePush} from '@utils/routePush';
import React, {useContext, useState} from 'react';
import {View, Text, Linking} from 'react-native';
import Modal from 'react-native-modal';
import {
  getProductColorByType,
  getProductTextColorByType,
} from 'utils/getProductColor';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  prodType: number;
};

const SuccessLoanRequest = ({isVisible, onClose, prodType}: Props) => {
  const context = useContext(GlobalContext);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const handleClose = async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    try {
      await routePush(SCREENS.HOME, {}, true);
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handlePhoneCall = async () => {
    if (isCalling) return;

    setIsCalling(true);
    try {
      await Linking.openURL(
        `tel:${context?.state.configData?.customerPhoneNo}`,
      );
    } catch (error) {
      console.error('Phone call error:', error);
    } finally {
      // Add a small delay before enabling the button again
      // eslint-disable-next-line no-undef
      setTimeout(() => setIsCalling(false), 1000);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      propagateSwipe
      swipeDirection="down"
      style={{margin: 0}}>
      <View className="flex-1 justify-end">
        <View className="rounded-t-xl bg-bgLight">
          <View className="items-center px-4 py-6">
            <Text
              className={cn('mt-5 text-center text-xl font-bold')}
              style={{color: getProductColorByType(prodType)}}>
              Амжилттай
            </Text>
            <SvgIcon name="success_loan_request" className="mt-2" />
            <Text className="mx-5 mt-4 text-center text-sm text-white">
              Таны зээлийн хүсэлт амжилттай үүслээ. Бид судалж дуусаад тун
              удахгүй хариу өгөх болно
            </Text>
            <Button
              text="Ойлголоо"
              onPress={handleClose}
              fillColor={getProductColorByType(prodType)}
              textColor={getProductTextColorByType(prodType)}
              className="mt-10 w-full"
              isLoading={isNavigating}
              disabled={isNavigating}
            />
            <Button
              text={`${context?.state.configData?.customerPhoneNo} дугаарт залгах`}
              onPress={handlePhoneCall}
              fillColor="#1B1F27"
              className="mt-3 w-full"
              isLoading={isCalling}
              disabled={isCalling}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessLoanRequest;
