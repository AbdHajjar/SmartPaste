/**
 * SmartPaste Mobile - Notification Service
 * Cross-platform notification management
 */

import { Platform, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.hasPermission = false;
    this.configure();
  }

  configure() {
    if (Platform.OS === 'android') {
      PushNotification.configure({
        onRegister: function (token) {
          console.log('Notification token:', token);
        },
        onNotification: function (notification) {
          console.log('Notification received:', notification);
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: false, // We'll request manually
      });

      // Create default channel for Android
      PushNotification.createChannel(
        {
          channelId: 'smartpaste-default',
          channelName: 'SmartPaste Notifications',
          channelDescription: 'Default notifications for SmartPaste',
          playSound: false,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );

      // Create processing channel
      PushNotification.createChannel(
        {
          channelId: 'smartpaste-processing',
          channelName: 'Content Processing',
          channelDescription: 'Notifications for content processing',
          playSound: false,
          importance: 3,
          vibrate: false,
        },
        (created) => console.log(`Processing channel created: ${created}`)
      );
    }

    this.isInitialized = true;
  }

  async requestPermission() {
    try {
      if (Platform.OS === 'ios') {
        const permissions = await PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true,
        });
        this.hasPermission = permissions.alert || permissions.badge;
        return this.hasPermission;
      } else {
        // Android - permissions are requested via PushNotification.configure
        PushNotification.requestPermissions();
        this.hasPermission = true; // Assume granted for Android
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async checkPermission() {
    if (Platform.OS === 'ios') {
      return new Promise((resolve) => {
        PushNotificationIOS.checkPermissions((permissions) => {
          this.hasPermission = permissions.alert || permissions.badge;
          resolve(this.hasPermission);
        });
      });
    }
    return this.hasPermission;
  }

  showProcessingNotification(content, type = 'processing') {
    if (!this.hasPermission) return;

    const title = this.getProcessingTitle(type);
    const message = this.getProcessingMessage(content, type);

    if (Platform.OS === 'ios') {
      PushNotificationIOS.presentLocalNotification({
        alertTitle: title,
        alertBody: message,
        userInfo: {
          type: 'processing',
          contentType: type,
        },
      });
    } else {
      PushNotification.localNotification({
        channelId: 'smartpaste-processing',
        title,
        message,
        playSound: false,
        vibrate: false,
        ongoing: type === 'processing',
        autoCancel: type !== 'processing',
        userInfo: {
          type: 'processing',
          contentType: type,
        },
      });
    }
  }

  showResultNotification(result, contentType) {
    if (!this.hasPermission) return;

    const title = `${contentType} Processed`;
    let message = 'Content has been processed and enhanced';

    // Customize message based on result
    if (result.title) {
      message = `Title: ${result.title.substring(0, 50)}...`;
    } else if (result.summary) {
      message = `Summary: ${result.summary.substring(0, 50)}...`;
    } else if (result.conversions && result.conversions.length > 0) {
      message = `${result.conversions.length} conversions found`;
    }

    this.showNotification(title, message, {
      type: 'result',
      contentType,
      result,
    });
  }

  showErrorNotification(error, contentType) {
    if (!this.hasPermission) return;

    const title = 'Processing Error';
    const message = `Failed to process ${contentType}: ${error.message || 'Unknown error'}`;

    this.showNotification(title, message, {
      type: 'error',
      contentType,
      error: error.message,
    }, true);
  }

  showNotification(title, message, userInfo = {}, isError = false) {
    if (!this.hasPermission) {
      // Fallback to alert if no permission
      Alert.alert(title, message);
      return;
    }

    if (Platform.OS === 'ios') {
      PushNotificationIOS.presentLocalNotification({
        alertTitle: title,
        alertBody: message,
        userInfo,
      });
    } else {
      PushNotification.localNotification({
        channelId: 'smartpaste-default',
        title,
        message,
        playSound: isError,
        vibrate: isError,
        autoCancel: true,
        userInfo,
      });
    }
  }

  cancelProcessingNotifications() {
    if (Platform.OS === 'android') {
      PushNotification.cancelAllLocalNotifications();
    } else {
      PushNotificationIOS.removeAllDeliveredNotifications();
    }
  }

  getProcessingTitle(type) {
    const titles = {
      url: '🔗 Processing URL',
      text: '📝 Analyzing Text',
      number: '🔢 Converting Numbers',
      image: '🖼️ Extracting Text',
      code: '💻 Analyzing Code',
      email: '📧 Processing Email',
      math: '🧮 Calculating Math',
      processing: '⚡ Processing Content',
    };
    return titles[type] || '⚡ Processing Content';
  }

  getProcessingMessage(content, type) {
    const preview = content.length > 30 ? content.substring(0, 30) + '...' : content;
    
    const messages = {
      url: `Fetching page info for: ${preview}`,
      text: `Analyzing text content: ${preview}`,
      number: `Converting measurements: ${preview}`,
      image: `Extracting text from image`,
      code: `Analyzing code snippet: ${preview}`,
      email: `Processing email: ${preview}`,
      math: `Evaluating expression: ${preview}`,
      processing: `Processing: ${preview}`,
    };
    
    return messages[type] || `Processing: ${preview}`;
  }

  // Scheduled notifications for background processing
  scheduleBackgroundNotification(title, message, seconds = 5) {
    if (!this.hasPermission) return;

    const date = new Date(Date.now() + seconds * 1000);

    if (Platform.OS === 'ios') {
      PushNotificationIOS.scheduleLocalNotification({
        alertTitle: title,
        alertBody: message,
        fireDate: date.toISOString(),
      });
    } else {
      PushNotification.localNotificationSchedule({
        channelId: 'smartpaste-default',
        title,
        message,
        date,
      });
    }
  }

  // Badge management (iOS mainly)
  setBadgeCount(count) {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    }
  }

  clearBadge() {
    this.setBadgeCount(0);
  }

  // Service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasPermission: this.hasPermission,
      platform: Platform.OS,
    };
  }
}

export default new NotificationService();