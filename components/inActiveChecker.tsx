import React from 'react';
import {LogOutUser} from '@services/auth.service';
import {showToast} from '@utils/showToast';
import {usePathname} from 'expo-router';
import ReactNativeInactivityFixed from './ReactNativeInactivityFixed';

const InactivityWrapper = ({children}: {children: React.ReactNode}) => {
  const pathname = usePathname();

  const onAction = () => {
    if (
      [
        '/auth/login',
        '/auth/register',
        '/auth/resetPass',
        '/auth/renewAccount',
        '/auth/verifyDevice',
        '/auth/onboarding',
        '/auth/verifyOtp',
      ].includes(pathname)
    ) {
      return;
    }
    showToast('', 'Сервер лүү хандах хүчинтэй хугацаа дууссан байна', 'error');
    LogOutUser();
  };

  return (
    <ReactNativeInactivityFixed
      isActive={true}
      onInactive={onAction}
      timeForInactivity={300000}
      restartTimerOnActivityAfterExpiration={true}
      loop={false}>
      {children}
    </ReactNativeInactivityFixed>
  );
};

export default InactivityWrapper;
