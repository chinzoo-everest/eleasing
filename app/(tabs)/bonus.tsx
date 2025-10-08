import {useGlobalContext} from '@hooks/useGlobalContext';

import {useFocusEffect} from '@react-navigation/native';
import {loadBonusRequest} from '@services/basic.service';
import {loadCustomerData} from '@services/home.service';
import {CCustomer, CCustProd} from '@type/interfaces/Customer';

import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {showToast} from '@utils/showToast';
import React, {useCallback, useState} from 'react';
import {Dimensions, Text, View} from 'react-native';

const BonusScreen = ({navigation}: any) => {
  const {dispatch, state} = useGlobalContext();
  const windowWidth = Dimensions.get('window').width;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [custProd, setCustProd] = useState<CCustProd[]>([]);
  const [currentItem, setCurrentItem] = useState<CCustProd>();
  const [currentCustomer, setCurrentCustomer] = useState<CCustomer>();
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonOnPress, setButtonOnPress] = useState<() => void>();

  const loadData = useCallback(async () => {
    try {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setCustProd([]);
      const result = await loadCustomerData(dispatch);
      if (result?.customer) {
        setCurrentCustomer(result.customer);
      }
      if (result?.cust_prod) {
        setCustProd(result.cust_prod.filter(item => item.USE_BONUS === 'Y'));
        setCurrentItem(result.cust_prod[0]);
      }
    } catch (error) {
      handleErrorExpo(error, 'loadData');
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleIncreaseAmt = () => {
    const config = state.comboValue.bonus_config.find(
      item => item.B_TYPE === 'INC_LOAN',
    );
    if (!config) {
      showToast('', 'Тохиргоо олдсонгүй', 'error');
      return;
    }
    if (currentCustomer?.BONUS === undefined || config.BONUS === undefined) {
      showToast(
        '',
        'Бонус оноо эсвэл тохиргооны мэдээлэл дутуу байна',
        'error',
      );
      return;
    }
    if (currentCustomer.BONUS < config.BONUS) {
      showToast('', 'Бонус оноо хүрэлцэхгүй байна', 'error');
      return;
    }

    setTitle('');
    setDescription(
      `Та ${config.BONUS} бонус оноо ашиглан зээлийн эрхээ ${config.AMT} ₮-өөр нэмэгдүүлэх үү ?`,
    );
    setButtonOnPress(() => proceedIncrease);
    setIsConfirmationVisible(true);
  };

  const proceedIncrease = async () => {
    setIsConfirmationVisible(false);
    try {
      setIsSubmitting(true);
      const result = await loadBonusRequest(
        (currentItem?.ID || 0).toString(),
        'INC_LOAN',
      );
      if (result) {
        showToast('Таны зээлийн эрх амжилттай нэмэгдлээ');
        await loadData();
      }
    } catch (error) {
      handleErrorExpo(error, 'proceedIncrease');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecreaseInterest = () => {
    const config = state.comboValue.bonus_config.find(
      item => item.B_TYPE === 'DEC_INT',
    );
    if (!config) {
      showToast('', 'Тохиргоо олдсонгүй', 'error');
      return;
    }
    if (currentCustomer?.BONUS === undefined || config.BONUS === undefined) {
      showToast(
        '',
        'Бонус оноо эсвэл тохиргооны мэдээлэл дутуу байна',
        'error',
      );
      return;
    }
    if (currentCustomer.BONUS < config.BONUS) {
      showToast('', 'Бонус оноо хүрэлцэхгүй байна', 'error');
      return;
    }

    setTitle('');
    setDescription(
      `Та зээлийн хүүгээ ${config.BONUS} бонус оноо ашиглан ${config.AMT} хувиар бууруулах уу ?`,
    );
    setButtonOnPress(() => proceedDecrease);
    setIsConfirmationVisible(true);
  };

  const proceedDecrease = async () => {
    setIsConfirmationVisible(false);
    try {
      setIsSubmitting(true);
      const result = await loadBonusRequest(
        (currentItem?.ID || 0).toString(),
        'DEC_INT',
      );
      if (result) {
        showToast('Таны зээлийн хүү амжилттай буурлаа');
        await loadData();
      }
    } catch (error) {
      handleErrorExpo(error, 'proceedDecrease');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-bgPrimary">
      <Text className="text-white opacity-50">Тун удахгүй</Text>
      {/* <SafeAreaView>
        <Header title={''} onBack={router.back} bgColor="#0B0B13" />
      </SafeAreaView>
      <ScrollView
        className="flex-1 pt-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isSubmitting}
            colors={['#34837B']}
            onRefresh={loadData}
          />
        }>
        <SafeAreaView style={{flex: 1}}>
          <View className="flex-1">
            <View className="mx-4 flex-row items-center justify-between rounded-xl px-6 pb-2">
              <Text className="text-sm font-bold text-white">
                Таны цуглуулсан оноо {currentCustomer?.BONUS || 0}
              </Text>
            </View>
            {custProd.length > 0 && (
              <View className="shadow-sm">
                <Carousel
                  loop={false}
                  width={windowWidth}
                  onSnapToItem={index => setCurrentItem(custProd[index])}
                  height={400}
                  autoPlay={false}
                  data={custProd}
                  mode="parallax"
                  modeConfig={{
                    parallaxScrollingScale: 0.93,
                    parallaxScrollingOffset: 125,
                  }}
                  panGestureHandlerProps={{
                    activeOffsetX: [-10, 10],
                  }}
                  renderItem={({item}) => (
                    <BonusCard
                      source={item}
                      navigation={navigation}
                      cardWidth={custProd.length > 1 ? undefined : 425}
                    />
                  )}
                />
              </View>
            )}
          </View>
          <Confirmation
            isVisible={isConfirmationVisible}
            onClose={() => setIsConfirmationVisible(false)}
            title={title}
            description={description}
            buttonOnPress={buttonOnPress}
            isConfirmation={true}
          />
        </SafeAreaView>
      </ScrollView> */}
    </View>
  );
};

export default BonusScreen;
