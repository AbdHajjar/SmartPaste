import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  Portal,
  Modal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';

import { useClipboard } from '../context/ClipboardContext';
import { useSettings } from '../context/SettingsContext';
import { ClipboardService } from '../services/ClipboardService';
import { ProcessingService } from '../services/ProcessingService';

const HomeScreen = ({ navigation }) => {
  const { clipboardHistory, isMonitoring, toggleMonitoring } = useClipboard();
  const { settings } = useSettings();
  const [currentClipboard, setCurrentClipboard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [quickProcessModal, setQuickProcessModal] = useState(false);

  useEffect(() => {
    loadCurrentClipboard();
    const interval = setInterval(loadCurrentClipboard, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCurrentClipboard = async () => {
    try {
      const content = await Clipboard.getString();
      if (content !== currentClipboard) {
        setCurrentClipboard(content);
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
    }
  };

  const processCurrentClipboard = async () => {
    if (!currentClipboard.trim()) {
      Alert.alert('No Content', 'Clipboard is empty or contains only whitespace.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ProcessingService.processContent(currentClipboard);
      
      navigation.navigate('Processing', { 
        content: currentClipboard,
        result: result 
      });
    } catch (error) {
      Alert.alert('Processing Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCurrentClipboard();
    setRefreshing(false);
  };

  const getRecentItems = () => {
    return clipboardHistory.slice(0, 5);
  };

  const getStatsData = () => {
    const today = new Date().toDateString();
    const todayItems = clipboardHistory.filter(item => 
      new Date(item.timestamp).toDateString() === today
    ).length;
    
    const processedItems = clipboardHistory.filter(item => item.processed).length;
    
    return {
      total: clipboardHistory.length,
      today: todayItems,
      processed: processedItems,
    };
  };

  const stats = getStatsData();
  const recentItems = getRecentItems();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.title}>📋 SmartPaste</Title>
          <Paragraph style={styles.subtitle}>
            Intelligent clipboard assistant
          </Paragraph>
        </View>

        {/* Monitoring Status */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <Icon
                  name={isMonitoring ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={isMonitoring ? '#10b981' : '#ef4444'}
                />
                <Text style={styles.statusText}>
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
                </Text>
              </View>
              <Button
                mode={isMonitoring ? 'outlined' : 'contained'}
                onPress={toggleMonitoring}
                compact
              >
                {isMonitoring ? 'Pause' : 'Start'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.today}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.processed}</Text>
              <Text style={styles.statLabel}>Processed</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Current Clipboard */}
        <Card style={styles.clipboardCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Current Clipboard</Title>
            {currentClipboard ? (
              <>
                <View style={styles.clipboardContent}>
                  <Text style={styles.clipboardText} numberOfLines={3}>
                    {currentClipboard}
                  </Text>
                </View>
                <View style={styles.clipboardActions}>
                  <Button
                    mode="contained"
                    onPress={processCurrentClipboard}
                    loading={isProcessing}
                    disabled={isProcessing}
                    style={styles.processButton}
                  >
                    🧠 Process Content
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setQuickProcessModal(true)}
                    style={styles.quickButton}
                  >
                    ⚡ Quick Actions
                  </Button>
                </View>
              </>
            ) : (
              <Paragraph style={styles.emptyClipboard}>
                No content in clipboard
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Recent Items */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <View style={styles.recentHeader}>
              <Title style={styles.cardTitle}>Recent Items</Title>
              <Button
                mode="text"
                onPress={() => navigation.navigate('History')}
                compact
              >
                View All
              </Button>
            </View>
            
            {recentItems.length > 0 ? (
              recentItems.map((item, index) => (
                <TouchableOpacity
                  key={item.timestamp}
                  style={styles.recentItem}
                  onPress={() => {
                    Clipboard.setString(item.content);
                    Alert.alert('Copied!', 'Content copied to clipboard');
                  }}
                >
                  <View style={styles.recentItemHeader}>
                    <Chip
                      icon={item.processed ? 'check' : 'clock-outline'}
                      style={[
                        styles.recentChip,
                        { backgroundColor: item.processed ? '#dcfce7' : '#fef3c7' }
                      ]}
                    >
                      {item.result?.handler_type || 'pending'}
                    </Chip>
                    <Text style={styles.recentTime}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.recentContent} numberOfLines={2}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Paragraph style={styles.emptyRecent}>
                No recent items
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Quick Process Modal */}
      <Portal>
        <Modal
          visible={quickProcessModal}
          onDismiss={() => setQuickProcessModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              onPress={() => {
                setQuickProcessModal(false);
                // Implement URL extraction
              }}
              style={styles.quickActionButton}
            >
              🔗 Extract URL Info
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setQuickProcessModal(false);
                // Implement text summary
              }}
              style={styles.quickActionButton}
            >
              📝 Summarize Text
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setQuickProcessModal(false);
                // Implement number conversion
              }}
              style={styles.quickActionButton}
            >
              🔢 Convert Numbers
            </Button>
          </View>
          <Button
            mode="outlined"
            onPress={() => setQuickProcessModal(false)}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="content-paste"
        onPress={processCurrentClipboard}
        loading={isProcessing}
        disabled={!currentClipboard.trim() || isProcessing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  statusCard: {
    margin: 16,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  clipboardCard: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  clipboardContent: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  clipboardText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  clipboardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  processButton: {
    flex: 1,
  },
  quickButton: {
    flex: 1,
  },
  emptyClipboard: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
  },
  recentCard: {
    margin: 16,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentChip: {
    height: 24,
  },
  recentTime: {
    fontSize: 12,
    color: '#64748b',
  },
  recentContent: {
    fontSize: 14,
    color: '#374151',
  },
  emptyRecent: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  quickActions: {
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    marginVertical: 4,
  },
  modalCloseButton: {
    marginTop: 8,
  },
});

export default HomeScreen;