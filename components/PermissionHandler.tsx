import {LivenessState, PermissionState} from '@type/interfaces/Liveness';
import {useCameraPermissions} from 'expo-camera';
import {useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import SvgIcon from './SvgIcon';

interface PermissionHandlerProps {
  onPermissionsGranted: () => void;
  onPermissionsDenied: () => void;
  state: LivenessState;
  setState: (state: LivenessState) => void;
}

const PermissionHandler: React.FC<PermissionHandlerProps> = ({
  onPermissionsGranted,
  onPermissionsDenied,
  state,
  setState,
}) => {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [permissionState, setPermissionState] = useState<PermissionState>({
    camera: false,
    microphone: true, // Assume microphone is available for now
  });

  useEffect(() => {
    checkPermissions();
  }, [cameraPermission]);

  const checkPermissions = () => {
    const cameraGranted = cameraPermission?.granted || false;

    setPermissionState({
      camera: cameraGranted,
      microphone: true, // Assume microphone is available
    });

    if (cameraGranted) {
      onPermissionsGranted();
    }
  };

  const requestPermissions = async () => {
    setState(LivenessState.PERMISSION_CHECK);

    try {
      // Request camera permission
      if (!cameraPermission?.granted) {
        const cameraResult = await requestCameraPermission();
        if (!cameraResult.granted) {
          handlePermissionDenied('camera');
          return;
        }
      }

      // Camera permission granted
      setPermissionState({
        camera: true,
        microphone: true, // Assume microphone is available
      });
      onPermissionsGranted();
    } catch (error) {
      console.error('Permission request error:', error);
      handlePermissionDenied('camera');
    }
  };

  const handlePermissionDenied = (type: 'camera') => {
    setState(LivenessState.PERMISSION_DENIED);

    const message = 'Камерын зөвшөөрөл татгалзагдсан';

    Alert.alert(
      'Зөвшөөрөл шаардлагатай',
      `${message}. Нүүрний танин баталгаажуулалт ашиглахын тулд зөвшөөрөл өгөх шаардлагатай.`,
      [
        {
          text: 'Тохиргоо руу орох',
          onPress: () => {
            // Navigate to settings or permission denial screen
            onPermissionsDenied();
          },
        },
        {
          text: 'Цуцлах',
          style: 'cancel',
          onPress: () => {
            router.back();
          },
        },
      ],
    );
  };

  const renderPermissionRequest = () => (
    <View className="flex-1 items-center justify-center bg-bgPrimary p-6">
      <View className="mb-8 items-center justify-center">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-bgLight">
          <SvgIcon name="faceid" width={48} height={48} />
        </View>

        <Text className="mb-4 text-center text-xl font-bold text-white">
          Зөвшөөрөл шаардлагатай
        </Text>

        <Text className="mb-6 text-center text-base leading-6 text-gray-300">
          Нүүрний танин баталгаажуулалтыг ашиглахын тулд камерын зөвшөөрөл
          шаардлагатай
        </Text>

        <View className="w-full space-y-3">
          <View className="flex-row items-center gap-3 rounded-lg bg-bgLight p-3">
            <SvgIcon name="faceid" width={20} height={20} />
            <Text className="flex-1 text-white">
              Камер - нүүрний зургийг авах
            </Text>
            {permissionState.camera && (
              <SvgIcon
                name="check_circle"
                width={20}
                height={20}
                color="#00C7EB"
              />
            )}
          </View>
        </View>
      </View>

      <View className="w-full space-y-4">
        <TouchableOpacity
          className="rounded-lg bg-Primary py-4"
          onPress={requestPermissions}
          activeOpacity={0.8}>
          <Text className="text-center text-lg font-semibold text-white">
            Зөвшөөрөл өгөх
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-lg border border-gray-600 py-4"
          onPress={() => router.back()}
          activeOpacity={0.8}>
          <Text className="text-center text-lg font-semibold text-white">
            Цуцлах
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (
    state === LivenessState.PERMISSION_CHECK ||
    state === LivenessState.PERMISSION_DENIED
  ) {
    return renderPermissionRequest();
  }

  return null;
};

export default PermissionHandler;
