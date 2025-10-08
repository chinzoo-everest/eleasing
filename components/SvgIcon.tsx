import icons from '@assets/icons';
import React from 'react';
import {SvgProps} from 'react-native-svg';

interface SvgIconProps extends SvgProps {
  name: string;
  className?: string;
}

const SvgIcon = ({name, className, ...props}: SvgIconProps) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon with name "${name}" does not exist.`);
    return null;
  }

  return <IconComponent {...props} className={className} />;
};

export default SvgIcon;
