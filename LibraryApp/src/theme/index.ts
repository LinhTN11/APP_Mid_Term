import {ViewStyle} from 'react-native';

export const colors = {
  background: '#F5F2E9',
  surface: '#FFFFFF',
  primary: '#234B3A',
  accent: '#B55C3D',
  text: '#202C26',
  muted: '#66746C',
  border: '#DFE5DC',
  danger: '#B3261E',
  disabled: '#D6DAD5',
};

export const spacing = {xs: 4, sm: 8, md: 16, lg: 24, xl: 32};

export const radius = {sm: 10, md: 16, lg: 22, pill: 999};

export const shadow: Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'> = {
  shadowColor: '#20372A',
  shadowOffset: {width: 0, height: 3},
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 3,
};
