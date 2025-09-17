/**
 * SmartPaste Mobile - About Screen
 * App Information, Credits, and Support
 */

import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import {
  Appbar,
  List,
  Text,
  Surface,
  Chip,
  Button,
  useTheme,
  Avatar,
  Card,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AboutScreen = ({ navigation }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const appVersion = '1.0.0';
  const buildNumber = '2024.1';
  const reactNativeVersion = '0.72.0';

  const features = [
    { name: 'URL Processing', icon: 'link', color: '#3b82f6' },
    { name: 'Text Analysis', icon: 'text', color: '#10b981' },
    { name: 'Number Conversion', icon: 'calculator', color: '#f59e0b' },
    { name: 'Image OCR', icon: 'image', color: '#8b5cf6' },
    { name: 'Code Detection', icon: 'code-tags', color: '#ef4444' },
    { name: 'Email Parsing', icon: 'email', color: '#06b6d4' },
    { name: 'Math Processing', icon: 'function', color: '#ec4899' },
    { name: 'History Sync', icon: 'sync', color: '#84cc16' },
  ];

  const contributors = [
    { name: 'SmartPaste Team', role: 'Core Development', avatar: 'account-group' },
    { name: 'Community', role: 'Testing & Feedback', avatar: 'account-multiple' },
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="About SmartPaste" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* App Info Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.appInfoContent}>
            <View style={styles.appIconContainer}>
              <Avatar.Icon
                size={80}
                icon="clipboard-text"
                style={[styles.appIcon, { backgroundColor: theme.colors.primary }]}
              />
            </View>
            
            <Text variant="headlineMedium" style={styles.appName}>
              SmartPaste
            </Text>
            
            <Text variant="bodyLarge" style={styles.appTagline}>
              Intelligent Clipboard Assistant
            </Text>
            
            <View style={styles.versionContainer}>
              <Chip icon="tag" compact>Version {appVersion}</Chip>
              <Chip icon="hammer" compact>Build {buildNumber}</Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Description */}
        <Surface style={styles.section}>
          <List.Subheader>About</List.Subheader>
          <View style={styles.sectionContent}>
            <Text variant="bodyMedium" style={styles.description}>
              SmartPaste is an intelligent clipboard assistant that automatically enriches 
              your clipboard content with contextual information. From extracting web page 
              titles to converting units and analyzing text, SmartPaste makes your copy-paste 
              workflow smarter and more efficient.
            </Text>
          </View>
        </Surface>

        {/* Features */}
        <Surface style={styles.section}>
          <List.Subheader>Features</List.Subheader>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon
                  name={feature.icon}
                  size={24}
                  color={feature.color}
                  style={styles.featureIcon}
                />
                <Text variant="bodySmall" style={styles.featureText}>
                  {feature.name}
                </Text>
              </View>
            ))}
          </View>
        </Surface>

        {/* Technical Info */}
        <Surface style={styles.section}>
          <List.Subheader>Technical Information</List.Subheader>
          
          <List.Item
            title="Platform"
            description={Platform.OS === 'ios' ? 'iOS' : 'Android'}
            left={(props) => <List.Icon {...props} icon="cellphone" />}
          />
          
          <List.Item
            title="React Native"
            description={`Version ${reactNativeVersion}`}
            left={(props) => <List.Icon {...props} icon="react" />}
          />
          
          <List.Item
            title="Architecture"
            description="Multi-platform ecosystem"
            left={(props) => <List.Icon {...props} icon="layers" />}
          />
          
          <List.Item
            title="Processing"
            description="Local AI & cloud integration"
            left={(props) => <List.Icon {...props} icon="brain" />}
          />
        </Surface>

        {/* Contributors */}
        <Surface style={styles.section}>
          <List.Subheader>Contributors</List.Subheader>
          
          {contributors.map((contributor, index) => (
            <List.Item
              key={index}
              title={contributor.name}
              description={contributor.role}
              left={(props) => <List.Icon {...props} icon={contributor.avatar} />}
            />
          ))}
        </Surface>

        {/* Links */}
        <Surface style={styles.section}>
          <List.Subheader>Links</List.Subheader>
          
          <List.Item
            title="Documentation"
            description="User guides and API docs"
            left={(props) => <List.Icon {...props} icon="book-open" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => handleLinkPress('https://smartpaste.dev/docs')}
          />
          
          <List.Item
            title="Source Code"
            description="GitHub repository"
            left={(props) => <List.Icon {...props} icon="github" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => handleLinkPress('https://github.com/smartpaste/smartpaste')}
          />
          
          <List.Item
            title="Report Issues"
            description="Bug reports and feature requests"
            left={(props) => <List.Icon {...props} icon="bug" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => handleLinkPress('https://github.com/smartpaste/smartpaste/issues')}
          />
          
          <List.Item
            title="Privacy Policy"
            description="How we handle your data"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => handleLinkPress('https://smartpaste.dev/privacy')}
          />
        </Surface>

        {/* Support */}
        <Surface style={styles.section}>
          <List.Subheader>Support</List.Subheader>
          
          <View style={styles.supportButtons}>
            <Button
              mode="outlined"
              icon="heart"
              onPress={() => handleLinkPress('https://smartpaste.dev/support')}
              style={styles.supportButton}
            >
              Support Development
            </Button>
            
            <Button
              mode="outlined"
              icon="star"
              onPress={() => {
                const storeUrl = Platform.OS === 'ios' 
                  ? 'https://apps.apple.com/app/smartpaste'
                  : 'https://play.google.com/store/apps/details?id=com.smartpaste';
                handleLinkPress(storeUrl);
              }}
              style={styles.supportButton}
            >
              Rate App
            </Button>
          </View>
        </Surface>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text variant="bodySmall" style={styles.copyrightText}>
            © 2024 SmartPaste Team. All rights reserved.
          </Text>
          <Text variant="bodySmall" style={styles.copyrightText}>
            Made with ❤️ for productivity enthusiasts
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionContent: {
    padding: 16,
  },
  appInfoContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appIcon: {
    backgroundColor: theme.colors.primary,
  },
  appName: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  appTagline: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
  },
  versionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  description: {
    lineHeight: 24,
    color: theme.colors.onSurfaceVariant,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  featureItem: {
    alignItems: 'center',
    width: '22%',
    minWidth: 70,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
  supportButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  supportButton: {
    flex: 1,
  },
  copyright: {
    padding: 24,
    alignItems: 'center',
  },
  copyrightText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default AboutScreen;