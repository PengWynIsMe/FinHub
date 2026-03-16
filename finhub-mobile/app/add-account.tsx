import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const ACCOUNT_TYPES = [
  { id: 'Bank', name: 'Ngân hàng', icon: '🏦', color: '#10B981' },
  { id: 'Cash', name: 'Tiền mặt', icon: '💵', color: '#F59E0B' },
  { id: 'EWallet', name: 'Ví điện tử', icon: '📱', color: '#EC4899' },
];

export default function AddAccountScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('Bank');
  const [balance, setBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBalanceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue, 10)
        .toLocaleString('vi-VN')
        .replace(/,/g, '.');
      setBalance(formatted);
    } else {
      setBalance('');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên tài khoản!');
      return;
    }

    const rawBalance = parseFloat(balance.replace(/\./g, '')) || 0;

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      await axiosClient.post('/Wallet', {
        Name: name.trim(),
        Type: type,
        Currency: 'VND',
        InitialBalance: rawBalance,
      });

      Alert.alert('Thành công', 'Đã thêm tài khoản mới!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Lỗi khi thêm ví:', error);
      Alert.alert(
        'Lỗi',
        error?.response?.data?.Message || 'Không thể tạo tài khoản lúc này.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add New Account</Text>

        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name</Text>
            <View style={styles.inputWrapper}>
              <Feather
                name="edit-3"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Vietcombank, Momo, Cash..."
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.typeContainer}>
              {ACCOUNT_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[
                    styles.typeCard,
                    type === item.id && {
                      borderColor: '#15476C',
                      backgroundColor: 'rgba(21, 71, 108, 0.05)',
                    },
                  ]}
                  onPress={() => setType(item.id)}
                >
                  <Text style={styles.typeIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.typeName,
                      type === item.id && {
                        color: '#15476C',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <Text style={styles.label}>Initial Balance (Optional)</Text>
            <View style={styles.balanceInputWrapper}>
              <Text style={styles.currencyPrefix}>đ</Text>
              <TextInput
                style={styles.balanceInput}
                placeholder="0"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                value={balance}
                onChangeText={handleBalanceChange}
              />
            </View>
            <Text style={styles.helperText}>
              Bạn có thể nhập số dư hiện có trong thẻ/ví của mình.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!name.trim() || isLoading) && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 10,
    paddingBottom: 20,
  },
  backButton: { paddingRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20 },

  inputGroup: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: '#4B5563', marginBottom: 12 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1F2937', height: '100%' },

  typeContainer: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIcon: { fontSize: 28, marginBottom: 8 },
  typeName: { fontSize: 13, fontWeight: '500', color: '#6B7280' },

  balanceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    height: 80,
    justifyContent: 'center',
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
    marginRight: 8,
    marginTop: -4,
  },
  balanceInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#15476C',
    minWidth: 50,
  },
  helperText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },

  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    backgroundColor: '#E3F6FF',
  },
  saveButton: {
    backgroundColor: '#15476C',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#15476C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
