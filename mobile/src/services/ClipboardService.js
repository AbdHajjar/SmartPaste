/**
 * SmartPaste Mobile - Clipboard Service
 * Native clipboard integration with monitoring
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

class ClipboardService {
  constructor() {
    this.listeners = new Set();
    this.isMonitoring = false;
    this.currentContent = '';
    this.monitoringInterval = null;
    
    // For future native module integration
    this.nativeClipboardModule = null;
    this.eventEmitter = null;
    
    this.setupNativeModule();
  }

  setupNativeModule() {
    try {
      // Check if native module is available
      if (NativeModules.SmartPasteClipboard) {
        this.nativeClipboardModule = NativeModules.SmartPasteClipboard;
        this.eventEmitter = new NativeEventEmitter(this.nativeClipboardModule);
        
        // Listen to native clipboard changes
        this.eventEmitter.addListener('ClipboardChanged', this.handleNativeClipboardChange.bind(this));
      }
    } catch (error) {
      console.log('Native clipboard module not available, using polling fallback');
    }
  }

  handleNativeClipboardChange(event) {
    const { content, timestamp } = event;
    this.currentContent = content;
    this.notifyListeners(content, timestamp);
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    if (this.nativeClipboardModule) {
      // Use native monitoring if available
      try {
        await this.nativeClipboardModule.startMonitoring();
        console.log('Started native clipboard monitoring');
        return;
      } catch (error) {
        console.error('Failed to start native monitoring:', error);
      }
    }
    
    // Fallback to polling
    this.startPollingMonitoring();
  }

  async stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.nativeClipboardModule) {
      try {
        await this.nativeClipboardModule.stopMonitoring();
        console.log('Stopped native clipboard monitoring');
      } catch (error) {
        console.error('Failed to stop native monitoring:', error);
      }
    }
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  startPollingMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Get initial content
    this.getCurrentContent().then(content => {
      this.currentContent = content;
    });
    
    // Poll for changes every 500ms
    this.monitoringInterval = setInterval(async () => {
      try {
        const content = await this.getCurrentContent();
        if (content !== this.currentContent && content.trim()) {
          const previousContent = this.currentContent;
          this.currentContent = content;
          
          // Only notify if content actually changed
          if (previousContent !== content) {
            this.notifyListeners(content, Date.now());
          }
        }
      } catch (error) {
        console.error('Error polling clipboard:', error);
      }
    }, 500);
    
    console.log('Started polling clipboard monitoring');
  }

  async getCurrentContent() {
    try {
      if (Platform.OS === 'ios') {
        // On iOS, check if clipboard has content
        const hasContent = await Clipboard.hasString();
        if (!hasContent) return '';
      }
      
      const content = await Clipboard.getString();
      return content || '';
    } catch (error) {
      console.error('Error getting clipboard content:', error);
      return '';
    }
  }

  async setContent(content) {
    try {
      await Clipboard.setString(content);
      this.currentContent = content;
      return true;
    } catch (error) {
      console.error('Error setting clipboard content:', error);
      return false;
    }
  }

  async hasContent() {
    try {
      if (Platform.OS === 'ios' && Clipboard.hasString) {
        return await Clipboard.hasString();
      }
      
      const content = await this.getCurrentContent();
      return content.trim().length > 0;
    } catch (error) {
      console.error('Error checking clipboard content:', error);
      return false;
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(content, timestamp = Date.now()) {
    const clipboardData = {
      content,
      timestamp,
      id: `clipboard_${timestamp}`,
      type: this.detectContentType(content),
    };
    
    this.listeners.forEach(callback => {
      try {
        callback(clipboardData);
      } catch (error) {
        console.error('Error in clipboard listener:', error);
      }
    });
  }

  detectContentType(content) {
    if (!content || typeof content !== 'string') return 'unknown';
    
    const trimmed = content.trim();
    
    // URL detection
    if (this.isUrl(trimmed)) return 'url';
    
    // Email detection
    if (this.isEmail(trimmed)) return 'email';
    
    // Number detection
    if (this.isNumber(trimmed)) return 'number';
    
    // Code detection (basic)
    if (this.isCode(trimmed)) return 'code';
    
    // Image path detection
    if (this.isImagePath(trimmed)) return 'image';
    
    // Default to text
    return 'text';
  }

  isUrl(text) {
    try {
      const url = new URL(text);
      return ['http:', 'https:', 'ftp:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  isEmail(text) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  }

  isNumber(text) {
    // Check for numbers with units, decimals, etc.
    const numberRegex = /^-?\d+(\.\d+)?(\s*(°[CF]|kg|g|lb|oz|m|cm|mm|ft|in|l|ml|gal))?$/i;
    return numberRegex.test(text) || !isNaN(parseFloat(text));
  }

  isCode(text) {
    // Basic code detection
    const codeIndicators = [
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+.*from/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /<\w+.*>/,
      /\{\s*".*":\s*".*"\s*\}/,
    ];
    
    return codeIndicators.some(regex => regex.test(text));
  }

  isImagePath(text) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
    return imageExtensions.test(text);
  }

  // Utility methods for manual clipboard operations
  async copyText(text) {
    return await this.setContent(text);
  }

  async pasteText() {
    return await this.getCurrentContent();
  }

  async clearClipboard() {
    return await this.setContent('');
  }

  // Statistics and monitoring info
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      hasNativeSupport: !!this.nativeClipboardModule,
      listenerCount: this.listeners.size,
      currentContentLength: this.currentContent.length,
      lastUpdate: this.lastUpdateTime || null,
    };
  }
}

// Export singleton instance
export default new ClipboardService();