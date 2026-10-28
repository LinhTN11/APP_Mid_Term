/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  DefaultTheme: {colors: {background: '#fff', card: '#fff', text: '#000', border: '#ddd', primary: '#000'}},
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({Navigator: ({children}: {children: React.ReactNode}) => children, Screen: () => null}),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
  SafeAreaView: ({children}: {children: React.ReactNode}) => children,
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn().mockResolvedValue('[]'), setItem: jest.fn().mockResolvedValue(undefined)},
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
