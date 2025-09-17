import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  Chip,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';

const { width } = Dimensions.get('window');

const ProcessingScreen = ({ navigation, route }) => {
  const { content, result } = route.params || {};
  const [processing, setProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Analyzing content...');
  const [processedResult, setProcessedResult] = useState(null);
  
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    simulateProcessing();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const simulateProcessing = async () => {
    const steps = [
      { step: 'Analyzing content...', progress: 0.2 },
      { step: 'Detecting content type...', progress: 0.4 },
      { step: 'Processing with AI...', progress: 0.7 },
      { step: 'Generating insights...', progress: 0.9 },
      { step: 'Complete!', progress: 1.0 },
    ];

    for (const { step, progress } of steps) {
      setCurrentStep(step);
      setProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Set the final result
    setProcessedResult(result || generateMockResult(content));
    setProcessing(false);
  };

  const generateMockResult = (content) => {
    if (!content) return null;

    // Simple content type detection
    const isUrl = content.includes('http') || content.includes('www.');
    const isEmail = content.includes('@') && content.includes('.');
    const hasNumbers = /\d/.test(content);
    
    if (isUrl) {
      return {
        handler_type: 'url',
        title: 'Webpage Analysis',
        summary: 'URL detected and analyzed',
        enriched_content: content,
        metadata: {
          domain: content.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)?.[1] || 'Unknown',
          type: 'URL'
        }
      };
    } else if (isEmail) {
      return {
        handler_type: 'email',
        title: 'Email Address',
        summary: 'Email address detected',
        enriched_content: content,
        metadata: {
          domain: content.split('@')[1],
          type: 'Email'
        }
      };
    } else if (hasNumbers) {
      return {
        handler_type: 'number',
        title: 'Number Analysis',
        summary: 'Numbers detected in content',
        enriched_content: content,
        metadata: {
          numbers_found: content.match(/\d+/g)?.length || 0,
          type: 'Number'
        }
      };
    } else {
      return {
        handler_type: 'text',
        title: 'Text Analysis',
        summary: `Text content with ${content.split(' ').length} words`,
        enriched_content: content,
        metadata: {
          word_count: content.split(' ').length,
          char_count: content.length,
          type: 'Text'
        }
      };
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setString(text);
      // Could show a toast here
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const getHandlerIcon = (type) => {
    switch (type) {
      case 'url': return 'link';
      case 'email': return 'email';
      case 'number': return 'calculator';
      case 'text': return 'text-fields';
      default: return 'description';
    }
  };

  const getHandlerColor = (type) => {
    switch (type) {
      case 'url': return '#3b82f6';
      case 'email': return '#f59e0b';
      case 'number': return '#8b5cf6';
      case 'text': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (processing) {
    return (
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.processingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Card style={styles.processingCard}>
            <Card.Content style={styles.processingContent}>
              {/* Processing Animation */}
              <View style={styles.processingIcon}>
                <Icon name="psychology" size={64} color="#3b82f6" />
              </View>
              
              <Title style={styles.processingTitle}>Processing Content</Title>
              <Paragraph style={styles.processingSubtitle}>
                AI is analyzing your clipboard content
              </Paragraph>
              
              {/* Progress */}
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={progress} 
                  color="#3b82f6" 
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              
              <Text style={styles.currentStep}>{currentStep}</Text>
              
              {/* Original Content Preview */}
              <View style={styles.contentPreview}>
                <Text style={styles.previewLabel}>Processing:</Text>
                <Text style={styles.previewText} numberOfLines={3}>
                  {content}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <Icon 
                name={getHandlerIcon(processedResult?.handler_type)}
                size={32}
                color={getHandlerColor(processedResult?.handler_type)}
              />
              <View style={styles.headerText}>
                <Title style={styles.resultTitle}>
                  {processedResult?.title || 'Processing Complete'}
                </Title>
                <Chip
                  icon="check"
                  style={[
                    styles.statusChip,
                    { backgroundColor: getHandlerColor(processedResult?.handler_type) + '20' }
                  ]}
                  textStyle={{ color: getHandlerColor(processedResult?.handler_type) }}
                >
                  {processedResult?.handler_type?.toUpperCase() || 'PROCESSED'}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Original Content */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="content-paste" size={20} color="#64748b" />
              <Text style={styles.sectionTitle}>Original Content</Text>
            </View>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{content}</Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => copyToClipboard(content)}
              style={styles.copyButton}
              icon="content-copy"
            >
              Copy Original
            </Button>
          </Card.Content>
        </Card>

        {/* Processing Results */}
        {processedResult && (
          <>
            {/* Summary */}
            <Card style={styles.sectionCard}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Icon name="auto-awesome" size={20} color="#64748b" />
                  <Text style={styles.sectionTitle}>AI Analysis</Text>
                </View>
                <Text style={styles.summaryText}>
                  {processedResult.summary}
                </Text>
              </Card.Content>
            </Card>

            {/* Metadata */}
            {processedResult.metadata && (
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <Icon name="info" size={20} color="#64748b" />
                    <Text style={styles.sectionTitle}>Details</Text>
                  </View>
                  <View style={styles.metadataContainer}>
                    {Object.entries(processedResult.metadata).map(([key, value]) => (
                      <View key={key} style={styles.metadataRow}>
                        <Text style={styles.metadataKey}>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </Text>
                        <Text style={styles.metadataValue}>{value}</Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Enhanced Content */}
            {processedResult.enriched_content && processedResult.enriched_content !== content && (
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <Icon name="enhanced-encryption" size={20} color="#64748b" />
                    <Text style={styles.sectionTitle}>Enhanced Content</Text>
                  </View>
                  <View style={styles.contentBox}>
                    <Text style={styles.contentText}>
                      {processedResult.enriched_content}
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => copyToClipboard(processedResult.enriched_content)}
                    style={styles.copyButton}
                    icon="content-copy"
                  >
                    Copy Enhanced
                  </Button>
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {/* Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.actionButton}
                icon="arrow-back"
              >
                Back to Home
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('History')}
                style={styles.actionButton}
                icon="history"
              >
                View History
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingCard: {
    width: '100%',
    maxWidth: 400,
    elevation: 4,
  },
  processingContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  processingIcon: {
    marginBottom: 24,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  currentStep: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  contentPreview: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
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
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#374151',
  },
  contentBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  copyButton: {
    marginTop: 8,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  metadataContainer: {
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metadataKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  actionsCard: {
    margin: 16,
    marginBottom: 32,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
});

export default ProcessingScreen;