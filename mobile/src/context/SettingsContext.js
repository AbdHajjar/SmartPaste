import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const DEFAULT_SETTINGS = {
  // General Settings
  autoStart: false,
  minimizeToTray: true,
  showNotifications: true,
  
  // Content Processing
  enableUrlProcessing: true,
  enableTextProcessing: true,
  enableNumberProcessing: true,
  enableImageProcessing: Platform.OS === 'ios', // OCR usually better on iOS
  enableCodeProcessing: true,
  enableEmailProcessing: true,
  enableMathProcessing: true,
  
  // URL Handler Settings
  urlTimeout: 10,
  extractMetadata: true,
  generateSummary: true,
  extractKeywords: true,
  
  // Text Handler Settings
  detectLanguage: true,
  summarizeText: true,
  minSummaryLength: 100,
  
  // Number Handler Settings
  convertTemperature: true,
  convertLength: true,
  convertWeight: true,
  convertVolume: true,
  
  // Sync Settings
  enableSync: false,
  syncProvider: 'cloud', // 'cloud', 'local', 'custom'
  syncInterval: 300, // seconds
  
  // Privacy Settings
  enableHistory: true,
  maxHistoryItems: 100,
  clearHistoryOnExit: false,
  
  // UI Settings
  theme: 'auto', // 'light', 'dark', 'auto'
  language: 'auto',
  compactView: false,
  
  // Performance
  backgroundProcessing: true,
  cacheSize: 50, // MB
  processingTimeout: 30, // seconds
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    await saveSettings(newSettings);
  };

  const updateSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
  };

  const resetSettings = async () => {
    await saveSettings(DEFAULT_SETTINGS);
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (settingsJson) => {
    try {
      const imported = JSON.parse(settingsJson);
      const validatedSettings = { ...DEFAULT_SETTINGS, ...imported };
      await saveSettings(validatedSettings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  };

  const getHandlerConfig = (handlerName) => {
    const handlerSettings = {};
    const prefix = handlerName.toLowerCase();
    
    Object.keys(settings).forEach(key => {
      if (key.startsWith(prefix)) {
        const configKey = key.replace(prefix, '').toLowerCase();
        handlerSettings[configKey] = settings[key];
      }
    });
    
    return handlerSettings;
  };

  const value = {
    settings,
    isLoading,
    updateSetting,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    getHandlerConfig,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};