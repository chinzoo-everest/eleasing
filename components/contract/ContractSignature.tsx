import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Dimensions, Text, View, TouchableOpacity} from 'react-native';
import Signature, {SignatureViewRef} from 'react-native-signature-canvas';
import SvgIcon from '@components/SvgIcon';
import {saveContactDocument} from '@services/account.service';
import {CBase64UploadRequest} from '@type/interfaces/Basic';
import {showToast} from '@utils/showToast';
import {cn} from '@utils/cn';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {routePush} from '@utils/routePush';
import {SCREENS} from '@customConfig/route';

const ContractSignature = forwardRef((_, ref) => {
  const signatureRef = useRef<SignatureViewRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const screenHeight = Dimensions.get('window').height;

  const handleOK = async (signature: string) => {
    setIsLoading(true);
    try {
      const base64Signature = signature.replace('data:image/png;base64,', '');

      const uploadSignature = async (type: string, descr: string) => {
        const requestData: CBase64UploadRequest = {
          type,
          descr,
          base64String: base64Signature,
        };
        return await saveContactDocument(requestData);
      };

      await uploadSignature('SIGNATURE1', 'Гарын үсэг 1');
      await uploadSignature('SIGNATURE2', 'Гарын үсэг 2');
      await uploadSignature('SIGNATURE3', 'Гарын үсэг 3');

      showToast('', 'Амжилттай хадгалагдлаа', 'success');
      await routePush(SCREENS.CONTRACT);
    } catch (error) {
      handleErrorExpo(error, 'ContractSignature - handleOK');
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndSave = async () => {
    if (isLoading) return false;
    setIsLoading(true);

    try {
      if (!hasSignature) {
        showToast('Анхааруулга', 'Гарын үсгээ зурна уу', 'error');
        return false;
      }

      await signatureRef.current?.readSignature();
      return true;
    } catch (error) {
      handleErrorExpo(error, 'ContractSignature - validateAndSave');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({validateAndSave}));

  return (
    <View className="flex-1">
      <Text className="-mt-3 text-sm text-white opacity-50">
        Та өөрийн баталгаат гарын үсэгээ зурна уу.
      </Text>
      <View className="relative mt-8 overflow-hidden rounded-lg bg-bgLight px-4">
        <View
          className={cn(
            '-mx-10 -mb-20 -mt-5 overflow-hidden rounded-2xl',
            screenHeight < 700 ? 'h-[250px]' : 'h-[300px]',
          )}>
          <Signature
            ref={signatureRef}
            descriptionText=""
            clearText=""
            confirmText=""
            onOK={handleOK}
            backgroundColor="#222630"
            penColor="#ffffff"
            webStyle={'.m-signature-pad {height: 100%; border: none; }'}
            onEmpty={() => setHasSignature(false)}
            onEnd={() => setHasSignature(true)}
            onClear={() => setHasSignature(false)}
          />
        </View>
        <View className="absolute inset-0 bottom-5 flex flex-col items-center justify-end">
          <TouchableOpacity
            onPress={() => signatureRef.current?.clearSignature()}>
            <SvgIcon
              name="remove_signature"
              height={56}
              color="#fff"
              width={56}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

ContractSignature.displayName = 'ContractSignature';
export default ContractSignature;
