import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CreateGroupScreen() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode] = useState('8422');
  const inviteLink = `https://finhub.app/invite/${inviteCode}`;

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', 'Invitation code copied to clipboard');
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Copied!', 'Invitation link copied to clipboard');
  };

  const handleSkip = () => {
    router.push('/(tabs)/group/manage');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#dbeafe" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create a Group</Text>
          </View>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content - Success State */}
        <View style={styles.content}>
          <View style={styles.card}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={40} color="white" />
            </View>

            <Text style={styles.title}>Invitation sent</Text>
            <Text style={styles.subtitle}>Success! The invitation sent!</Text>
            <Text style={styles.subtitle}>Do you want add more members</Text>

            <TouchableOpacity
              onPress={handleInvite}
              style={styles.primaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowInviteModal(true)}
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Share Invite Link or Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Invite Code Modal */}
      <Modal
        visible={showInviteModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#dbeafe" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowInviteModal(false)}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create a Group</Text>
          </View>

          {/* Modal Content */}
          <View style={styles.modalContent}>
            <View style={styles.modalCard}>
              <Text style={styles.label}>Invitation code</Text>

              <View style={styles.codeRow}>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{inviteCode}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={styles.copyButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleCopyLink}
                style={styles.linkButton}
                activeOpacity={0.8}
              >
                <Text style={styles.linkButtonText}>Copy Invite Link</Text>
                <Ionicons name="link" size={16} color="#1e3a5f" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a5f',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: '#1e3a5f',
    borderRadius: 50,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 25,
    paddingVertical: 16,
    width: '100%',
    marginTop: 24,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#bfdbfe',
    borderRadius: 25,
    paddingVertical: 16,
    width: '100%',
  },
  secondaryButtonText: {
    color: '#1e3a5f',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#dbeafe',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
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
  codeContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  copyButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
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
});
