import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Giả lập danh sách Nguồn tiền của người dùng (lấy từ My Accounts)
const MY_ACCOUNTS = [
  { id: 'acc1', name: 'Vietcombank', balance: '15.000.000', icon: '🏦', color: '#10B981' },
  { id: 'acc2', name: 'Cash', balance: '2.000.000', icon: '💵', color: '#F59E0B' },
];

export default function ContributeScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(MY_ACCOUNTS[0]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contribute to Group</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Nhập số tiền */}
        <View style={styles.amountSection}>
          <Text style={styles.label}>Amount to contribute</Text>
          <View style={styles.amountInputWrapper}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <Text style={styles.currencyUnit}>VNĐ</Text>
          </View>
        </View>

        {/* 2. Chọn Nguồn tiền (Đây là chỗ gỡ rối cho bạn!) */}
        <Text style={styles.label}>Select your Source Account</Text>
        {MY_ACCOUNTS.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={[
              styles.accountItem,
              selectedAccount.id === acc.id && styles.selectedAccount
            ]}
            onPress={() => setSelectedAccount(acc)}
          >
            <View style={[styles.iconBox, { backgroundColor: acc.color + '20' }]}>
              <Text style={{ fontSize: 20 }}>{acc.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accName}>{acc.name}</Text>
              <Text style={styles.accBalance}>Balance: {acc.balance}</Text>
            </View>
            {selectedAccount.id === acc.id && (
              <Feather name="check-circle" size={20} color="#15476C" />
            )}
          </TouchableOpacity>
        ))}

        {/* 3. Ghi chú (Optional) */}
        <View style={styles.noteSection}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Fund for dinner, etc."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Nút Confirm */}
        <TouchableOpacity 
          style={[styles.confirmBtn, !amount && styles.disabledBtn]}
          disabled={!amount}
          onPress={() => {
            console.log(`Nạp ${amount} từ ${selectedAccount.name} vào Quỹ Nhóm`);
            router.back();
          }}
        >
          <Text style={styles.confirmBtnText}>Confirm Contribution</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  content: { padding: 20 },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 12, fontWeight: '500' },
  
  amountSection: { alignItems: 'center', marginVertical: 30 },
  amountInputWrapper: { flexDirection: 'row', alignItems: 'baseline' },
  amountInput: { fontSize: 40, fontWeight: '700', color: '#15476C', textAlign: 'center' },
  currencyUnit: { fontSize: 18, fontWeight: '600', color: '#15476C', marginLeft: 8 },

  accountItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: '#F3F4F6', 
    marginBottom: 12 
  },
  selectedAccount: { borderColor: '#15476C', backgroundColor: '#F0F9FF' },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  accName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  accBalance: { fontSize: 13, color: '#6B7280' },

  noteSection: { marginTop: 20 },
  noteInput: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', fontSize: 16, color: '#1F2937' },
  
  confirmBtn: { backgroundColor: '#15476C', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  disabledBtn: { backgroundColor: '#E5E7EB' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});