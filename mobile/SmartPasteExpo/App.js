/**
 * SmartPaste Mobile - Expo Version
 * Device Testing Ready
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { 
  Provider as PaperProvider, 
  Card, 
  Button, 
  Switch, 
  Surface,
  Chip,
  IconButton,
  useTheme
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    surface: '#ffffff',
    background: '#f8fafc',
    text: '#1e293b',
    onSurface: '#64748b',
  },
};

const SmartPasteApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');
  const [stats, setStats] = useState({
    processed: 47,
    urls: 12,
    texts: 8,
    numbers: 5
  });

  const [settings, setSettings] = useState({
    autoStart: true,
    notifications: true,
    urlProcessing: true,
    textProcessing: true,
    numberProcessing: false,
    imageProcessing: true,
  });

  // Clipboard monitoring simulation
  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(async () => {
        try {
          const content = await Clipboard.getStringAsync();
          if (content !== clipboardContent && content.trim()) {
            setClipboardContent(content);
            // Simulate processing
            setTimeout(() => {
              setStats(prev => ({
                ...prev,
                processed: prev.processed + 1
              }));
            }, 1000);
          }
        } catch (error) {
          console.log('Clipboard access error:', error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, clipboardContent]);

  const handleCopyTest = async () => {
    const testContent = `Test content ${Date.now()}`;
    await Clipboard.setStringAsync(testContent);
    Alert.alert('Test Content Copied', 'Check if monitoring detects the change!');
  };

  const HomeScreen = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <MaterialIcons name="content-paste" size={80} color={theme.colors.primary} />
        <Text style={styles.appTitle}>SmartPaste</Text>
        <Text style={styles.subtitle}>Intelligent Clipboard Assistant</Text>
      </View>

      {/* Monitoring Status */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.monitoringSection}>
            <View>
              <Text style={styles.cardTitle}>Clipboard Monitoring</Text>
              <Text style={styles.cardSubtitle}>
                {isMonitoring ? '🟢 Active' : '🔴 Inactive'}
              </Text>
            </View>
            <Switch
              value={isMonitoring}
              onValueChange={setIsMonitoring}
              trackColor={{ false: '#e2e8f0', true: theme.colors.secondary }}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Today's Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.processed}</Text>
              <Text style={styles.statLabel}>Processed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.urls}</Text>
              <Text style={styles.statLabel}>URLs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.texts}</Text>
              <Text style={styles.statLabel}>Texts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.numbers}</Text>
              <Text style={styles.statLabel}>Numbers</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Current Clipboard */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Current Clipboard</Text>
          <Surface style={styles.clipboardDisplay}>
            <Text style={styles.clipboardText}>
              {clipboardContent || 'No content detected'}
            </Text>
          </Surface>
          <Button 
            mode="outlined" 
            onPress={handleCopyTest}
            style={styles.testButton}
          >
            Copy Test Content
          </Button>
        </Card.Content>
      </Card>

      {/* Features */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <FeatureItem icon="link" title="URL Processing" enabled={settings.urlProcessing} />
            <FeatureItem icon="text-fields" title="Text Analysis" enabled={settings.textProcessing} />
            <FeatureItem icon="calculate" title="Number Convert" enabled={settings.numberProcessing} />
            <FeatureItem icon="image" title="Image OCR" enabled={settings.imageProcessing} />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const SettingsScreen = () => (
    <ScrollView style={styles.screen}>
      <Text style={styles.screenTitle}>Settings</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>General</Text>
          <SettingRow
            title="Auto Start"
            subtitle="Start monitoring on app launch"
            value={settings.autoStart}
            onValueChange={(value) => setSettings(prev => ({ ...prev, autoStart: value }))}
          />
          <SettingRow
            title="Notifications"
            subtitle="Show processing notifications"
            value={settings.notifications}
            onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Content Processing</Text>
          <SettingRow
            title="URL Processing"
            subtitle="Extract titles and summaries"
            value={settings.urlProcessing}
            onValueChange={(value) => setSettings(prev => ({ ...prev, urlProcessing: value }))}
          />
          <SettingRow
            title="Text Processing"
            subtitle="Language detection and analysis"
            value={settings.textProcessing}
            onValueChange={(value) => setSettings(prev => ({ ...prev, textProcessing: value }))}
          />
          <SettingRow
            title="Number Processing"
            subtitle="Unit conversions"
            value={settings.numberProcessing}
            onValueChange={(value) => setSettings(prev => ({ ...prev, numberProcessing: value }))}
          />
          <SettingRow
            title="Image Processing"
            subtitle="OCR text extraction"
            value={settings.imageProcessing}
            onValueChange={(value) => setSettings(prev => ({ ...prev, imageProcessing: value }))}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>SmartPaste Mobile</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0 (Expo)</Text>
            <Button mode="outlined" style={styles.aboutButton}>
              View on GitHub
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const FeatureItem = ({ icon, title, enabled }) => (
    <View style={[styles.featureItem, { opacity: enabled ? 1 : 0.6 }]}>
      <MaterialIcons 
        name={icon} 
        size={24} 
        color={enabled ? theme.colors.primary : theme.colors.onSurface} 
      />
      <Text style={styles.featureTitle}>{title}</Text>
      <View style={[styles.featureStatus, { backgroundColor: enabled ? theme.colors.secondary : '#e2e8f0' }]} />
    </View>
  );

  const SettingRow = ({ title, subtitle, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e2e8f0', true: theme.colors.secondary }}
      />
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        
        {/* Header */}
        <Surface style={styles.appHeader}>
          <Text style={styles.headerTitle}>
            {currentScreen === 'home' ? 'SmartPaste' : 'Settings'}
          </Text>
        </Surface>

        {/* Content */}
        {currentScreen === 'home' ? <HomeScreen /> : <SettingsScreen />}

        {/* Bottom Navigation */}
        <Surface style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navItem, currentScreen === 'home' && styles.navItemActive]}
            onPress={() => setCurrentScreen('home')}
          >
            <MaterialIcons 
              name="home" 
              size={24} 
              color={currentScreen === 'home' ? theme.colors.primary : theme.colors.onSurface} 
            />
            <Text style={[
              styles.navLabel, 
              currentScreen === 'home' && styles.navLabelActive
            ]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, currentScreen === 'settings' && styles.navItemActive]}
            onPress={() => setCurrentScreen('settings')}
          >
            <MaterialIcons 
              name="settings" 
              size={24} 
              color={currentScreen === 'settings' ? theme.colors.primary : theme.colors.onSurface} 
            />
            <Text style={[
              styles.navLabel, 
              currentScreen === 'settings' && styles.navLabelActive
            ]}>Settings</Text>
          </TouchableOpacity>
        </Surface>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  appHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  monitoringSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  clipboardDisplay: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  clipboardText: {
    fontSize: 14,
    color: '#64748b',
    minHeight: 40,
  },
  testButton: {
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    alignItems: 'center',
    width: '22%',
    padding: 8,
  },
  featureTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    color: '#64748b',
  },
  featureStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  aboutVersion: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  aboutButton: {
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    // Active styling handled by color
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#64748b',
  },
  navLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default SmartPasteApp;
