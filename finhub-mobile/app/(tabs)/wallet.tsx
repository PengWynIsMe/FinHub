import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>💰</Text>
        <Text style={styles.title}>Wallet Screen</Text>
        <Text style={styles.subtitle}>Manage your wallets</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
});