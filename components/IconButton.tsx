import React from 'react';
import {TouchableOpacity} from 'react-native';
import SvgIcon from './SvgIcon';
import {cn} from '@utils/cn';

type Props = {
  icon?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

const IconButton = ({icon, onPress, disabled = false, className}: Props) => {
  const renderIcon = () => {
    switch (icon) {
      case 'faceid':
        return <SvgIcon name="faceid" />;
      case 'fingerprint':
        return <SvgIcon name="fingerprint" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'items-center justify-center rounded-xl bg-[#1E222B]',
        disabled && 'opacity-50',
        className,
      )}>
      {renderIcon()}
    </TouchableOpacity>
  );
};

export default IconButton;
