import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useContext,
} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import SvgIcon from '@components/SvgIcon';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {showToast} from '@utils/showToast';
import {handleErrorExpo} from '@utils/handleErrorOnExpo';
import {CBase64UploadRequest} from '@type/interfaces/Basic';
import {saveContactDocument} from '@services/account.service';
import {GlobalContext} from '@context/GlobalContext';
import {CCustomer} from '@type/interfaces/Customer';

export interface ContractSelfieRef {
  validateAndSave: () => Promise<boolean>;
}

const ContractSelfie = forwardRef<ContractSelfieRef>((_, ref) => {
  const context = useContext(GlobalContext);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(true);
  const [isShowCamera, setIsShowCamera] = useState(false);
  const [isCanSkip, setIsCanSkip] = useState(false);

  useEffect(() => {
    const currentUser: CCustomer = context?.state.currentUser as CCustomer;
    if (currentUser?.SELFIE_URL) {
      setPreviewUrl(currentUser?.SELFIE_URL);
      setIsCanSkip(true);
    }
  }, [context]);

  const handleTakePicture = async () => {
    try {
      if (!permission.granted) {
        const {granted} = await requestPermission();
        if (!granted) {
          return showToast(
            '',
            'Камерлуу хандах эрх олгогдсонгүй. Та дахин оролдоно уу',
            'error',
          );
        }
        return;
      }

      if (!isShowCamera) {
        setIsShowCamera(true);
        return;
      }

      if (!isReady)
        return showToast(
          '',
          'Камер бэлэн болтол түр хүлээгээд дахин оролдоно уу',
          'info',
        );

      setCapturedPhoto(null);

      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3,
          base64: true,
          exif: false,
          isImageMirror: true,
          imageType: 'jpg',
        });
        if (photo.base64) {
          setCapturedPhoto(photo.base64);
          setPreviewUrl(photo.uri);
          setIsShowCamera(false);
        } else {
          showToast(
            '',
            'Зураг авахад алдаа гарлаа. Дахин оролдоно уу',
            'error',
          );
        }
      }
    } catch (error) {
      handleErrorExpo(error, 'ContractSelfie - handleTakePicture');
    }
  };

  const validateAndSave = async (): Promise<boolean> => {
    try {
      if (!capturedPhoto) {
        if (!isCanSkip) {
          showToast('', 'Та сэлфи зургаа дарна уу', 'error');
          return false;
        }
        return true;
      }

      const requestData: CBase64UploadRequest = {
        type: 'SELFIE_PIC',
        descr: 'Сэлфи зураг',
        base64String: capturedPhoto,
      };

      if (!(await saveContactDocument(requestData))) return false;
      showToast('', 'Сэлфи зураг амжилттай хадгалагдлаа', 'success');
      return true;
    } catch (error) {
      handleErrorExpo(error, 'ContractSelfie - sendSelfie');
    }
  };

  useImperativeHandle(ref, () => ({
    validateAndSave,
  }));

  return (
    <View className="mx-4 flex-1">
      <Text className="pr-20 text-left text-sm leading-6 text-white opacity-55">
        Та иргэний үнэмлэхээ урдаа барьсан сэлфи зургаа илгээнэ үү.
      </Text>

      <View className="relative mx-auto mt-10 h-[250] w-[250] overflow-hidden rounded-[40px] bg-bgSecondary">
        {isShowCamera ? (
          <CameraView
            ref={cameraRef}
            style={{flex: 1}}
            facing="front"
            onCameraReady={() => setIsReady(true)}
            focusable={true}
          />
        ) : capturedPhoto ? (
          <Image
            source={{uri: previewUrl}}
            className="h-full w-full rounded-lg"
          />
        ) : previewUrl ? (
          <Image
            source={{uri: previewUrl}}
            className="h-full w-full rounded-lg"
          />
        ) : (
          <View className="flex-1 items-center justify-end">
            <Image
              source={require('@assets/images/selfie_ghost.png')}
              resizeMode="contain"
            />
          </View>
        )}
        <View className="absolute bottom-5 left-0 right-0 mx-auto items-center justify-center">
          <TouchableOpacity
            className="h-16 w-16 items-center justify-center"
            onPress={handleTakePicture}>
            <SvgIcon name="selfie_camera" width={55} height={55} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

ContractSelfie.displayName = 'ContractSelfie';
export default ContractSelfie;
