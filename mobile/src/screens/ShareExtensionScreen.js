import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';

import { ProcessingService } from '../services/ProcessingService';

const { width } = Dimensions.get('window');

const ShareExtensionScreen = ({ navigation, route }) => {
  const { sharedContent } = route.params || {};
  const [content, setContent] = useState(sharedContent || '');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Auto-load clipboard content if no shared content
    if (!sharedContent) {
      loadClipboardContent();
    }
  }, []);

  const loadClipboardContent = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent) {
        setContent(clipboardContent);
      }
    } catch (error) {
      console.error('Error loading clipboard:', error);
    }
  };

  const processContent = async () => {
    if (!content.trim()) {
      Alert.alert('No Content', 'Please enter or paste content to process.');
      return;
    }

    setProcessing(true);
    try {
      const processedResult = await ProcessingService.processContent(content);
      setResult(processedResult);
      
      // Save to clipboard history
      await ProcessingService.saveToHistory({
        content,
        result: processedResult,
        timestamp: Date.now(),
        processed: true,
      });
      
      Alert.alert(
        'Processing Complete!',
        'Content has been processed and saved to your history.',
        [
          { text: 'View Result', onPress: () => showResult(processedResult) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Processing Error', error.message);
    } finally {
      setProcessing(false);
    }
  };

  const showResult = (processedResult) => {
    navigation.navigate('Processing', {
      content,
      result: processedResult
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setString(text);
      Alert.alert('Copied!', 'Content copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy content');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      setContent(clipboardContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to read clipboard');
    }
  };

  const clearContent = () => {
    setContent('');
    setResult(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Icon name="share" size={32} color="#3b82f6" />
            <View style={styles.headerText}>
              <Title style={styles.title}>SmartPaste Share</Title>
              <Paragraph style={styles.subtitle}>
                Process shared content with AI
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Content Input */}
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text style={styles.inputLabel}>Content to Process</Text>
          <TextInput
            mode="outlined"
            placeholder="Paste or type content here..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            style={styles.textInput}
          />
          
          <View style={styles.inputActions}>
            <Button
              mode="outlined"
              onPress={pasteFromClipboard}
              icon="content-paste"
              style={styles.inputButton}
            >
              Paste
            </Button>
            <Button
              mode="outlined"
              onPress={clearContent}
              icon="clear"
              style={styles.inputButton}
            >
              Clear
            </Button>
          </View>
          
          {content.length > 0 && (
            <Text style={styles.characterCount}>
              {content.length} characters
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Processing Status */}
      {processing && (
        <Card style={styles.processingCard}>
          <Card.Content>
            <View style={styles.processingContent}>
              <Icon name="psychology" size={24} color="#3b82f6" />
              <Text style={styles.processingText}>Processing with AI...</Text>
            </View>
            <ProgressBar indeterminate color="#3b82f6" style={styles.progressBar} />
          </Card.Content>
        </Card>
      )}

      {/* Quick Result */}
      {result && !processing && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Icon name="check-circle" size={20} color="#10b981" />
              <Text style={styles.resultTitle}>Processing Complete</Text>
            </View>
            
            <Text style={styles.resultType}>
              Type: {result.handler_type?.toUpperCase() || 'PROCESSED'}
            </Text>
            
            {result.title && (
              <Text style={styles.resultText}>
                Title: {result.title}
              </Text>
            )}
            
            {result.summary && (
              <Text style={styles.resultText}>
                Summary: {result.summary}
              </Text>
            )}
            
            <View style={styles.resultActions}>
              <Button
                mode="contained"
                onPress={() => showResult(result)}
                icon="visibility"
                style={styles.resultButton}
              >
                View Details
              </Button>
              <Button
                mode="outlined"
                onPress={() => copyToClipboard(result.enriched_content || content)}
                icon="content-copy"
                style={styles.resultButton}
              >
                Copy Result
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={processContent}
            disabled={!content.trim() || processing}
            loading={processing}
            icon="auto-awesome"
            style={styles.primaryButton}
          >
            {processing ? 'Processing...' : 'Process with AI'}
          </Button>
          
          <View style={styles.secondaryActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Home')}
              icon="home"
              style={styles.secondaryButton}
            >
              Home
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('History')}
              icon="history"
              style={styles.secondaryButton}
            >
              History
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Tips */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipsText}>
            • Paste URLs to extract titles and summaries{'\n'}
            • Share text to get AI analysis{'\n'}
            • Numbers will be converted automatically{'\n'}
            • Email addresses will be validated
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  inputCard: {
    marginBottom: 16,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  inputButton: {
    flex: 1,
  },
  characterCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  processingCard: {
    marginBottom: 16,
    elevation: 2,
  },
  processingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  processingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  resultCard: {
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#10b981',
  },
  resultType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  resultButton: {
    flex: 1,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  primaryButton: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
  tipsCard: {
    elevation: 1,
    backgroundColor: '#fefce8',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#92400e',
  },
  tipsText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
});

export default ShareExtensionScreen;