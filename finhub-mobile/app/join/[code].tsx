// app/(tabs)/group/invite-code.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TextInput
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';

export default function InviteCodeScreen() {
  const [inviteCode] = useState('8422');
  const inviteLink = `https://finhub.app/invite/${inviteCode}`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', 'Invitation code copied to clipboard');
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Copied!', 'Invitation link copied to clipboard');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#dbeafe" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a Group</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          {/* Invitation Code Section */}
          <Text style={styles.label}>Invitation code</Text>
          
          <View style={styles.codeRow}>
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                value={inviteCode}
                editable={false}
                selectTextOnFocus={false}
              />
            </View>
            
            <TouchableOpacity 
              onPress={handleCopyCode}
              style={styles.copyButton}
              activeOpacity={0.8}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>

          {/* Copy Link Button */}
          <TouchableOpacity 
            onPress={handleCopyLink}
            style={styles.linkButton}
            activeOpacity={0.8}
          >
            <Text style={styles.linkButtonText}>Copy Invite Link</Text>
            <Text style={styles.linkIcon}>🔗</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeafe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#dbeafe',
  },
  backButton: {
    marginRight: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1e293b',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeInputContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  codeInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  copyButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: '#bfdbfe',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: {
    color: '#1e3a5f',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  linkIcon: {
    fontSize: 16,
  },
});