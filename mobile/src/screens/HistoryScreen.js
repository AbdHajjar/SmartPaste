import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Chip,
  FAB,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';

import { useClipboard } from '../context/ClipboardContext';

const { width } = Dimensions.get('window');

const HistoryScreen = ({ navigation }) => {
  const { clipboardHistory, deleteItem, clearHistory } = useClipboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - in real app you'd reload from storage
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredHistory = clipboardHistory.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'processed' && item.processed) ||
      (filterType === 'unprocessed' && !item.processed) ||
      (filterType === 'urls' && item.result?.handler_type === 'url') ||
      (filterType === 'text' && item.result?.handler_type === 'text');
    
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = async (content) => {
    try {
      await Clipboard.setString(content);
      Alert.alert('Copied!', 'Content copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy content');
    }
  };

  const shareContent = async (content) => {
    try {
      const shareOptions = {
        title: 'Share from SmartPaste',
        message: content,
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this clipboard item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.timestamp) },
      ]
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all clipboard history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setDetailModal(true);
  };

  const getItemIcon = (item) => {
    if (!item.processed) return 'clock-outline';
    
    switch (item.result?.handler_type) {
      case 'url': return 'link';
      case 'text': return 'text';
      case 'number': return 'calculator';
      case 'email': return 'email';
      case 'image': return 'image';
      default: return 'file-document';
    }
  };

  const getItemColor = (item) => {
    if (!item.processed) return '#fbbf24';
    
    switch (item.result?.handler_type) {
      case 'url': return '#3b82f6';
      case 'text': return '#10b981';
      case 'number': return '#8b5cf6';
      case 'email': return '#f59e0b';
      case 'image': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderHistoryItem = ({ item, index }) => (
    <Card style={styles.historyItem}>
      <TouchableOpacity onPress={() => openDetailModal(item)}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <View style={styles.itemMeta}>
              <Icon
                name={getItemIcon(item)}
                size={20}
                color={getItemColor(item)}
              />
              <Text style={styles.itemTime}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: item.processed ? '#dcfce7' : '#fef3c7' }]}
              textStyle={{ fontSize: 10 }}
            >
              {item.processed ? 'Processed' : 'Pending'}
            </Chip>
          </View>
          
          <Text style={styles.itemContent} numberOfLines={3}>
            {item.content}
          </Text>
          
          {item.result && (
            <View style={styles.resultPreview}>
              <Text style={styles.resultType}>
                {item.result.handler_type?.toUpperCase() || 'PROCESSED'}
              </Text>
              {item.result.title && (
                <Text style={styles.resultTitle} numberOfLines={1}>
                  {item.result.title}
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.itemActions}>
            <Button
              mode="text"
              onPress={() => copyToClipboard(item.content)}
              compact
              icon="content-copy"
            >
              Copy
            </Button>
            <Button
              mode="text"
              onPress={() => shareContent(item.content)}
              compact
              icon="share"
            >
              Share
            </Button>
            <Button
              mode="text"
              onPress={() => confirmDelete(item)}
              compact
              icon="delete"
              textColor="#ef4444"
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const FilterChips = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'All' },
        { key: 'processed', label: 'Processed' },
        { key: 'unprocessed', label: 'Pending' },
        { key: 'urls', label: 'URLs' },
        { key: 'text', label: 'Text' },
      ].map((filter) => (
        <Chip
          key={filter.key}
          selected={filterType === filter.key}
          onPress={() => setFilterType(filter.key)}
          style={styles.filterChip}
        >
          {filter.label}
        </Chip>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.title}>📋 Clipboard History</Title>
        <Paragraph style={styles.subtitle}>
          {filteredHistory.length} items
        </Paragraph>
      </View>

      {/* Search */}
      <Searchbar
        placeholder="Search clipboard items..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Filters */}
      <FilterChips />

      {/* History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.timestamp.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="inbox" size={64} color="#cbd5e1" />
              <Title style={styles.emptyTitle}>No Items Found</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery 
                  ? 'No items match your search criteria'
                  : 'Your clipboard history will appear here'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Detail Modal */}
      <Portal>
        <Modal
          visible={detailModal}
          onDismiss={() => setDetailModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedItem && (
            <>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>Item Details</Title>
                <TouchableOpacity onPress={() => setDetailModal(false)}>
                  <Icon name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalInfo}>
                <List.Item
                  title="Created"
                  description={new Date(selectedItem.timestamp).toLocaleString()}
                  left={props => <List.Icon {...props} icon="calendar" />}
                />
                <List.Item
                  title="Type"
                  description={selectedItem.result?.handler_type || 'Text'}
                  left={props => <List.Icon {...props} icon={getItemIcon(selectedItem)} />}
                />
                <List.Item
                  title="Status"
                  description={selectedItem.processed ? 'Processed' : 'Pending'}
                  left={props => <List.Icon {...props} icon="check-circle" />}
                />
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalContentTitle}>Content:</Text>
                <Text style={styles.modalContentText}>
                  {selectedItem.content}
                </Text>
              </View>
              
              {selectedItem.result && (
                <View style={styles.modalResult}>
                  <Text style={styles.modalContentTitle}>Processing Result:</Text>
                  {selectedItem.result.title && (
                    <Text style={styles.resultTitle}>
                      Title: {selectedItem.result.title}
                    </Text>
                  )}
                  {selectedItem.result.summary && (
                    <Text style={styles.resultSummary}>
                      Summary: {selectedItem.result.summary}
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => {
                    copyToClipboard(selectedItem.content);
                    setDetailModal(false);
                  }}
                  style={styles.modalButton}
                >
                  Copy to Clipboard
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    shareContent(selectedItem.content);
                    setDetailModal(false);
                  }}
                  style={styles.modalButton}
                >
                  Share
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>

      {/* Clear All FAB */}
      {clipboardHistory.length > 0 && (
        <FAB
          style={styles.fab}
          icon="delete-sweep"
          onPress={confirmClearAll}
          label="Clear All"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    marginRight: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  historyItem: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTime: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  statusChip: {
    height: 24,
  },
  itemContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 8,
  },
  resultPreview: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  resultType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  resultTitle: {
    fontSize: 12,
    color: '#475569',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: 16,
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ef4444',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  modalTitle: {
    fontSize: 20,
  },
  modalInfo: {
    paddingHorizontal: 20,
  },
  modalContent: {
    padding: 20,
  },
  modalContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  modalContentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  modalResult: {
    padding: 20,
    paddingTop: 0,
  },
  resultSummary: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default HistoryScreen;