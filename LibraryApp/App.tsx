import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BookDetailScreen from './src/screens/BookDetailScreen';
import BookFormScreen from './src/screens/BookFormScreen';
import BookListScreen from './src/screens/BookListScreen';
import {RootStackParamList} from './src/navigation/types';
import {LibraryProvider} from './src/state/LibraryContext';
import {colors} from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: colors.background, card: colors.background, text: colors.text, border: colors.border, primary: colors.primary},
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator
            initialRouteName="BookList"
            screenOptions={{
              headerStyle: {backgroundColor: colors.background},
              headerTintColor: colors.primary,
              headerTitleStyle: {color: colors.text, fontSize: 18, fontWeight: '700'},
              headerShadowVisible: false,
              contentStyle: {backgroundColor: colors.background},
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="BookList" component={BookListScreen} options={{title: 'Thư viện'}} />
            <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{title: 'Chi tiết sách'}} />
            <Stack.Screen name="BookForm" component={BookFormScreen} options={({route}) => ({title: route.params?.bookId ? 'Sửa sách' : 'Thêm sách'})} />
          </Stack.Navigator>
        </NavigationContainer>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
