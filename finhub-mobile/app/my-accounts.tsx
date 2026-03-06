import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── DỮ LIỆU GIẢ LẬP NGUỒN TIỀN (ACCOUNTS) ──────────────────────────────
const MOCK_ACCOUNTS = [
  {
    id: 'acc1',
    name: 'Vietcombank',
    type: 'Bank Account',
    balance: 15000000,
    icon: '🏦',
    color: '#10B981', // Xanh lá
    isDefault: true,
  },
  {
    id: 'acc2',
    name: 'Cash in Wallet',
    type: 'Cash',
    balance: 2000000,
    icon: '💵',
    color: '#F59E0B', // Cam
    isDefault: false,
  },
  {
    id: 'acc3',
    name: 'MoMo E-Wallet',
    type: 'E-Wallet',
    balance: 500000,
    icon: '📱',
    color: '#EC4899', // Hồng
    isDefault: false,
  },
];

const formatVND = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';
};

export default function MyAccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);

  // Tính tổng tài sản từ tất cả các nguồn
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Hàm thay đổi ví mặc định
  const handleSetDefault = (id: string) => {
    const updatedAccounts = accounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id, // Chỉ set true cho ID được chọn, các ID khác false
    }));
    setAccounts(updatedAccounts);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Accounts</Text>
        
        {/* Nút thêm nhanh trên Header */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Feather name="plus" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── 1. TỔNG TÀI SẢN (TOTAL BALANCE CARD) ─── */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Asset Balance</Text>
          <Text style={styles.totalAmount}>{formatVND(totalBalance)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Accounts</Text>

        {/* ─── 3. NÚT ADD ACCOUNT TÁI SỬ DỤNG STYLE DASHED ─── */}
        <TouchableOpacity 
          style={styles.btnAddAccount} 
          activeOpacity={0.8}
          onPress={() => {
            console.log('Sang trang tạo Nguồn tiền mới');
            // router.push('/add-account');
          }}
        >
          <Feather name="plus-circle" size={20} color="#15476C" style={{ marginRight: 8 }} />
          <Text style={styles.btnAddAccountText}>Add New Account</Text>
        </TouchableOpacity>
        {/* ─── 2. DANH SÁCH NGUỒN TIỀN ─── */}
        {accounts.map((acc) => (
          <TouchableOpacity 
            key={acc.id} 
            style={[styles.accountCard, acc.isDefault && styles.accountCardDefault]}
            activeOpacity={0.8}
            onPress={() => {
              // Có thể mở popup edit hoặc chuyển sang trang sửa thông tin nguồn tiền
              console.log('Chỉnh sửa nguồn tiền:', acc.name);
            }}
          >
            {/* Cụm Icon & Info */}
            <View style={styles.accHeader}>
              <View style={[styles.iconBox, { backgroundColor: acc.color + '20' }]}>
                <Text style={styles.emojiIcon}>{acc.icon}</Text>
              </View>
              
              <View style={styles.accInfo}>
                <Text style={styles.accName}>{acc.name}</Text>
                <Text style={styles.accType}>{acc.type}</Text>
              </View>

              {/* Checkbox Đặt làm mặc định */}
              <TouchableOpacity 
                style={styles.defaultToggle}
                onPress={() => handleSetDefault(acc.id)}
                activeOpacity={0.7}
              >
                {acc.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Feather name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                ) : (
                  <View style={styles.setDefaultBtn}>
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Cụm số dư */}
            <View style={styles.accFooter}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue}>{formatVND(acc.balance)}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' }, // Dùng màu nền xanh nhạt đặc trưng của app
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 },
  addButton: { paddingLeft: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Total Card (Màu xanh đậm cho xịn)
  totalCard: {
    backgroundColor: '#15476C',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#15476C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  totalLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#E3F6FF', opacity: 0.9, marginBottom: 8 },
  totalAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 32, color: '#FFFFFF' },

  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 16 },

  // Account Card
  accountCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 2, borderColor: 'transparent' },
  accountCardDefault: { borderColor: '#10B981' }, // Viền xanh lá nếu là Default

  accHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  emojiIcon: { fontSize: 24 },
  accInfo: { flex: 1 },
  accName: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937' },
  accType: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' },
  
  // Default Toggle
  defaultToggle: { marginLeft: 8 },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  defaultBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#10B981', marginLeft: 4 },
  setDefaultBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F3F4F6' },
  setDefaultText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#6B7280' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

  accFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' },
  balanceValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },

  // Add Account Button
  btnAddAccount: { flexDirection: 'row', height: 54, borderRadius: 20, borderWidth: 2, borderColor: '#15476C', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21, 71, 108, 0.05)', marginTop: 8, marginBottom: 20 },
  btnAddAccountText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#15476C' },
});