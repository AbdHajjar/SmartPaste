/**
 * SmartPaste Mobile - Web Preview
 * Quick testing and development preview
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

// Import the main App component
import App from './src/App';
import { theme } from './src/styles/theme';

// Mock providers for web testing
const MockClipboardProvider = ({ children }) => children;
const MockSettingsProvider = ({ children }) => children;
const MockSyncProvider = ({ children }) => children;

const WebPreviewApp = () => {
  return (
    <PaperProvider theme={theme}>
      <MockSettingsProvider>
        <MockSyncProvider>
          <MockClipboardProvider>
            <NavigationContainer>
              <App />
            </NavigationContainer>
          </MockClipboardProvider>
        </MockSyncProvider>
      </MockSettingsProvider>
    </PaperProvider>
  );
};

export default WebPreviewApp;