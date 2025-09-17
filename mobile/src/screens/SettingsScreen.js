import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  List,
  Switch,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
  Portal,
  Modal,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen() {
  const { settings, updateSetting, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const theme = useTheme();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExportSettings = () => {
    const exported = exportSettings();
    // In a real app, you'd share this via the share API
    Alert.alert(
      'Settings Exported',
      'Settings have been exported to clipboard',
      [
        {
          text: 'OK',
          onPress: () => {
            // Copy to clipboard
            // Clipboard.setString(exported);
          }
        }
      ]
    );
  };

  const handleImportSettings = async () => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Please enter settings to import');
      return;
    }

    const success = await importSettings(importText);
    if (success) {
      Alert.alert('Success', 'Settings imported successfully');
      setShowImportModal(false);
      setImportText('');
    } else {
      Alert.alert('Error', 'Invalid settings format');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSettings
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 16,
    },
    card: {
      marginBottom: 12,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      margin: 20,
      borderRadius: 8,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
      gap: 8,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* General Settings */}
        <View style={styles.section}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>General</Title>
              <List.Item
                title="Auto Start"
                description="Start monitoring on app launch"
                right={() => (
                  <Switch
                    value={settings.autoStart}
                    onValueChange={(value) => updateSetting('autoStart', value)}
                  />
                )}
              />
              <List.Item
                title="Show Notifications"
                description="Display notifications for processed content"
                right={() => (
                  <Switch
                    value={settings.showNotifications}
                    onValueChange={(value) => updateSetting('showNotifications', value)}
                  />
                )}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Content Processing */}
        <View style={styles.section}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Content Processing</Title>
              <List.Item
                title="URL Processing"
                description="Extract titles and summaries from URLs"
                right={() => (
                  <Switch
                    value={settings.enableUrlProcessing}
                    onValueChange={(value) => updateSetting('enableUrlProcessing', value)}
                  />
                )}
              />
              <List.Item
                title="Text Processing"
                description="Analyze and summarize text content"
                right={() => (
                  <Switch
                    value={settings.enableTextProcessing}
                    onValueChange={(value) => updateSetting('enableTextProcessing', value)}
                  />
                )}
              />
              <List.Item
                title="Number Processing"
                description="Convert units and measurements"
                right={() => (
                  <Switch
                    value={settings.enableNumberProcessing}
                    onValueChange={(value) => updateSetting('enableNumberProcessing', value)}
                  />
                )}
              />
              <List.Item
                title="Image Processing"
                description="Extract text from images using OCR"
                right={() => (
                  <Switch
                    value={settings.enableImageProcessing}
                    onValueChange={(value) => updateSetting('enableImageProcessing', value)}
                  />
                )}
              />
              <List.Item
                title="Code Processing"
                description="Detect and analyze code snippets"
                right={() => (
                  <Switch
                    value={settings.enableCodeProcessing}
                    onValueChange={(value) => updateSetting('enableCodeProcessing', value)}
                  />
                )}
              />
              <List.Item
                title="Email Processing"
                description="Validate and analyze email addresses"
                right={() => (
                  <Switch
                    value={settings.enableEmailProcessing}
                    onValueChange={(value) => updateSetting('enableEmailProcessing', value)}
                  />
                )}
              />
              <List.Item
                title="Math Processing"
                description="Evaluate mathematical expressions"
                right={() => (
                  <Switch
                    value={settings.enableMathProcessing}
                    onValueChange={(value) => updateSetting('enableMathProcessing', value)}
                  />
                )}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Synchronization</Title>
              <List.Item
                title="Enable Sync"
                description="Synchronize data between devices"
                right={() => (
                  <Switch
                    value={settings.enableSync}
                    onValueChange={(value) => updateSetting('enableSync', value)}
                  />
                )}
              />
              {settings.enableSync && (
                <>
                  <List.Item
                    title="Sync Provider"
                    description={`Current: ${settings.syncProvider}`}
                    onPress={() => {
                      // Show sync provider selection
                    }}
                  />
                  <List.Item
                    title="Sync Interval"
                    description={`Every ${settings.syncInterval / 60} minutes`}
                    onPress={() => {
                      // Show interval selection
                    }}
                  />
                </>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Privacy</Title>
              <List.Item
                title="Enable History"
                description="Save clipboard history"
                right={() => (
                  <Switch
                    value={settings.enableHistory}
                    onValueChange={(value) => updateSetting('enableHistory', value)}
                  />
                )}
              />
              <List.Item
                title="Max History Items"
                description={`Keep last ${settings.maxHistoryItems} items`}
                onPress={() => {
                  // Show number picker
                }}
              />
              <List.Item
                title="Clear History on Exit"
                description="Remove all history when app closes"
                right={() => (
                  <Switch
                    value={settings.clearHistoryOnExit}
                    onValueChange={(value) => updateSetting('clearHistoryOnExit', value)}
                  />
                )}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Performance Settings */}
        <View style={styles.section}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Performance</Title>
              <List.Item
                title="Background Processing"
                description="Process content in background"
                right={() => (
                  <Switch
                    value={settings.backgroundProcessing}
                    onValueChange={(value) => updateSetting('backgroundProcessing', value)}
                  />
                )}
              />
              <List.Item
                title="Cache Size"
                description={`${settings.cacheSize} MB`}
                onPress={() => {
                  // Show cache size picker
                }}
              />
              <List.Item
                title="Processing Timeout"
                description={`${settings.processingTimeout} seconds`}
                onPress={() => {
                  // Show timeout picker
                }}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Advanced</Title>
              <Divider style={{ marginVertical: 8 }} />
              
              <Button
                mode="outlined"
                onPress={handleExportSettings}
                style={{ marginBottom: 8 }}
              >
                Export Settings
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowImportModal(true)}
                style={{ marginBottom: 8 }}
              >
                Import Settings
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleResetSettings}
                buttonColor={theme.colors.errorContainer}
                textColor={theme.colors.onErrorContainer}
              >
                Reset to Defaults
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Import Settings Modal */}
      <Portal>
        <Modal
          visible={showImportModal}
          onDismiss={() => setShowImportModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Import Settings</Title>
          <Paragraph style={{ marginBottom: 16 }}>
            Paste your exported settings JSON below:
          </Paragraph>
          
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={8}
            value={importText}
            onChangeText={setImportText}
            placeholder="Paste settings JSON here..."
            style={{ marginBottom: 16 }}
          />
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowImportModal(false)}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleImportSettings}
            >
              Import
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}