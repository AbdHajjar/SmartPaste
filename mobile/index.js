/**
 * SmartPaste Mobile App
 * React Native Entry Point
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import App from './src/App';
import { ClipboardProvider } from './src/context/ClipboardContext';
import { SyncProvider } from './src/context/SyncContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { theme } from './src/styles/theme';

const SmartPasteApp = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SettingsProvider>
          <SyncProvider>
            <ClipboardProvider>
              <NavigationContainer>
                <App />
              </NavigationContainer>
            </ClipboardProvider>
          </SyncProvider>
        </SettingsProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

AppRegistry.registerComponent('SmartPaste', () => SmartPasteApp);

export default SmartPasteApp;