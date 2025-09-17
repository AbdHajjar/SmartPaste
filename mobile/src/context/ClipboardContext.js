import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import BackgroundJob from 'react-native-background-job';

import { ProcessingService } from '../services/ProcessingService';
import { SyncService } from '../services/SyncService';

const ClipboardContext = createContext();

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};

export const ClipboardProvider = ({ children }) => {
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastClipboard, setLastClipboard] = useState('');

  useEffect(() => {
    loadClipboardHistory();
    loadMonitoringState();
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }, [isMonitoring]);

  const loadClipboardHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('clipboard_history');
      if (stored) {
        setClipboardHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading clipboard history:', error);
    }
  };

  const saveClipboardHistory = async (history) => {
    try {
      await AsyncStorage.setItem('clipboard_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving clipboard history:', error);
    }
  };

  const loadMonitoringState = async () => {
    try {
      const stored = await AsyncStorage.getItem('is_monitoring');
      if (stored !== null) {
        setIsMonitoring(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading monitoring state:', error);
    }
  };

  const saveMonitoringState = async (state) => {
    try {
      await AsyncStorage.setItem('is_monitoring', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving monitoring state:', error);
    }
  };

  const startMonitoring = () => {
    const backgroundOptions = {
      taskName: 'clipboard-monitor',
      taskTitle: 'SmartPaste Clipboard Monitor',
      taskDesc: 'Monitoring clipboard for intelligent content analysis',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      }
    };

    BackgroundJob.start(backgroundOptions);
    
    // Set up clipboard monitoring
    const monitoringInterval = setInterval(async () => {
      try {
        const currentClipboard = await Clipboard.getString();
        
        if (currentClipboard && currentClipboard !== lastClipboard) {
          setLastClipboard(currentClipboard);
          await handleNewClipboardContent(currentClipboard);
        }
      } catch (error) {
        console.error('Error in clipboard monitoring:', error);
      }
    }, 1000);

    // Store interval ID for cleanup
    BackgroundJob.registerTask({
      taskName: 'clipboard-monitor',
      taskFunc: () => {
        // Background task logic
      }
    });
  };

  const stopMonitoring = () => {
    BackgroundJob.stop();
  };

  const handleNewClipboardContent = async (content) => {
    const newItem = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      processed: false,
      result: null,
    };

    const updatedHistory = [newItem, ...clipboardHistory].slice(0, 100); // Keep last 100 items
    setClipboardHistory(updatedHistory);
    await saveClipboardHistory(updatedHistory);

    // Process content in background
    try {
      const result = await ProcessingService.processContent(content);
      await updateItemResult(newItem.id, result);
    } catch (error) {
      console.error('Error processing content:', error);
    }

    // Sync with other devices if enabled
    SyncService.syncClipboardItem(newItem);
  };

  const updateItemResult = async (itemId, result) => {
    const updatedHistory = clipboardHistory.map(item => 
      item.id === itemId 
        ? { ...item, processed: true, result }
        : item
    );
    
    setClipboardHistory(updatedHistory);
    await saveClipboardHistory(updatedHistory);
  };

  const toggleMonitoring = async () => {
    const newState = !isMonitoring;
    setIsMonitoring(newState);
    await saveMonitoringState(newState);
  };

  const addClipboardItem = async (content) => {
    await handleNewClipboardContent(content);
  };

  const removeClipboardItem = async (itemId) => {
    const updatedHistory = clipboardHistory.filter(item => item.id !== itemId);
    setClipboardHistory(updatedHistory);
    await saveClipboardHistory(updatedHistory);
  };

  const clearHistory = async () => {
    setClipboardHistory([]);
    await saveClipboardHistory([]);
  };

  const value = {
    clipboardHistory,
    isMonitoring,
    toggleMonitoring,
    addClipboardItem,
    removeClipboardItem,
    clearHistory,
    updateItemResult,
  };

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
};