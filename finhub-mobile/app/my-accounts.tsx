import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

// Map type → icon/color vì Backend không trả icon/color
const ACCOUNT_STYLE: Record<string, { icon: string; color: string }> = {
  Bank:     { icon: '🏦', color: '#10B981' },
  Cash:     { icon: '💵', color: '#F59E0B' },
  EWallet:  { icon: '📱', color: '#EC4899' },
  default:  { icon: '💳', color: '#6366F1' },
};

const formatVND = (amount: number) =>
  amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';

export default function MyAccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      const fetchAccounts = async () => {
        setIsLoading(true);
        try {
          const res = await axiosClient.get('/Wallet');
          setAccounts(res.data);
        } catch (error) {
          console.error('Lỗi lấy danh sách ví:', error);
          Alert.alert('Lỗi', 'Không thể tải danh sách tài khoản.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAccounts();
    }, [])
  );

  // ✅ Set default wallet qua API
  const handleSetDefault = async (walletId: string) => {
    try {
      await axiosClient.patch(`/Wallet/${walletId}/set-default`);
      // Cập nhật UI ngay lập tức
      setAccounts(prev =>
        prev.map(acc => ({ ...acc, isDefaultAccount: acc.walletId === walletId }))
      );
    } catch (error) {
      console.error('Lỗi set default:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật ví mặc định.');
    }
  };

  // 💡 XÓA VÍ
  const handleDeleteWallet = (walletId: string, walletName: string, isDefault: boolean) => {
    // Không cho phép xóa ví mặc định
    if (isDefault) {
      Alert.alert('Không thể xóa', 'Đây là tài khoản mặc định. Vui lòng chọn tài khoản khác làm mặc định trước khi xóa.');
      return;
    }

    Alert.alert(
      'Xóa tài khoản',
      `Bạn có chắc chắn muốn xóa tài khoản "${walletName}" không?\n\nMọi giao dịch liên quan đến ví này có thể sẽ bị ảnh hưởng.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Gọi API xóa ví
              await axiosClient.delete(`/Wallet/${walletId}`);
              
              // Cập nhật UI ngay lập tức
              setAccounts(prev => prev.filter(acc => acc.walletId !== walletId));
              Alert.alert('Thành công', 'Đã xóa tài khoản!');
            } catch (error: any) {
              console.error('Lỗi khi xóa ví:', error);
              Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể xóa tài khoản lúc này.');
            }
          }
        }
      ]
    );
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#15476C" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Accounts</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => router.push('/add-account')}>
          <Feather name="plus" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ─── TỔNG TÀI SẢN ─── */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Asset Balance</Text>
          <Text style={styles.totalAmount}>{formatVND(totalBalance)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Accounts</Text>

        <TouchableOpacity style={styles.btnAddAccount} activeOpacity={0.8} onPress={() => router.push('/add-account')}>
          <Feather name="plus-circle" size={20} color="#15476C" style={{ marginRight: 8 }} />
          <Text style={styles.btnAddAccountText}>Add New Account</Text>
        </TouchableOpacity>

        {/* ─── DANH SÁCH VÍ THẬT ─── */}
        {accounts.map((acc) => {
          const style = ACCOUNT_STYLE[acc.type] ?? ACCOUNT_STYLE.default;

          return (
            <TouchableOpacity
              key={acc.walletId}
              style={[styles.accountCard, acc.isDefaultAccount && styles.accountCardDefault]}
              activeOpacity={0.8}
            >
              <View style={styles.accHeader}>
                <View style={[styles.iconBox, { backgroundColor: style.color + '20' }]}>
                  <Text style={styles.emojiIcon}>{style.icon}</Text>
                </View>

                <View style={styles.accInfo}>
                  <Text style={styles.accName}>{acc.name}</Text>
                  <Text style={styles.accType}>{acc.type}</Text>
                </View>

                {/* 💡 Chứa cả Nút Set Default và Nút 3 chấm */}
                <View style={styles.rightActions}>
                  <TouchableOpacity
                    style={styles.defaultToggle}
                    onPress={() => handleSetDefault(acc.walletId)}
                    activeOpacity={0.7}
                  >
                    {acc.isDefaultAccount ? (
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

                  {/* 💡 NÚT 3 CHẤM */}
                  <TouchableOpacity 
                    style={styles.moreButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Ngăn bấm nhầm vào cả card
                      handleDeleteWallet(acc.walletId, acc.name, acc.isDefaultAccount);
                    }}
                  >
                    <Feather name="more-horizontal" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

              </View>

              <View style={styles.divider} />

              <View style={styles.accFooter}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceValue}>{formatVND(acc.currentBalance || 0)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 },
  addButton: { paddingLeft: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  totalCard: { backgroundColor: '#15476C', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 32, shadowColor: '#15476C', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  totalLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#E3F6FF', opacity: 0.9, marginBottom: 8 },
  totalAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 32, color: '#FFFFFF' },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 16 },
  accountCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 2, borderColor: 'transparent' },
  accountCardDefault: { borderColor: '#10B981' },
  accHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  emojiIcon: { fontSize: 24 },
  accInfo: { flex: 1 },
  accName: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937' },
  accType: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' },
  
  // 💡 Bọc cả nút Set Default và 3 chấm
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  defaultToggle: { },
  moreButton: { padding: 8, marginLeft: 4 }, // Căn lề cho nút 3 chấm
  
  defaultBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  defaultBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#10B981', marginLeft: 4 },
  setDefaultBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F3F4F6' },
  setDefaultText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  accFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' },
  balanceValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  btnAddAccount: { flexDirection: 'row', height: 54, borderRadius: 20, borderWidth: 2, borderColor: '#15476C', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21, 71, 108, 0.05)', marginTop: 8, marginBottom: 20 },
  btnAddAccountText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#15476C' },
});