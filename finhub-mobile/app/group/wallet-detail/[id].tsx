import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, ActivityIndicator, Alert
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';
import { useAuthStore } from '@/stores/auth.store';
import { getBudgetProgressColor } from '@/utils/format';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';

export default function SharedWalletDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // ID Của Ví
  const user = useAuthStore((state: any) => state.user);

  const [walletDetail, setWalletDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. GỌI API LẤY CHI TIẾT VÍ
  useFocusEffect(
    useCallback(() => {
      const fetchWalletDetail = async () => {
        try {
          const res = await axiosClient.get(`/Wallet/${id}`);
          setWalletDetail(res.data);
        } catch (error) {
          console.error("Lỗi lấy chi tiết ví:", error);
          Alert.alert("Lỗi", "Không thể tải dữ liệu ví chung.");
          router.back();
        } finally {
          setIsLoading(false);
        }
      };
      if (id) fetchWalletDetail();
    }, [id])
  );

  if (isLoading || !walletDetail) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#15476C" />
      </SafeAreaView>
    );
  }

  // 2. TÍNH TOÁN DỮ LIỆU
  const spent = walletDetail.spent || 0;
  const availableBalance = walletDetail.balance || 0;
  const totalFund = availableBalance + spent;
  const progress = walletDetail.allocated > 0 ? Math.min((walletDetail.spent / walletDetail.allocated) * 100, 100) : 0;
  const themeColor = walletDetail.color || '#15476C';
  const progressColor = getBudgetProgressColor(walletDetail.spent, walletDetail.allocated);
  const TRANSACTIONS = walletDetail.transactions ?? [];
  const MEMBERS = walletDetail.members ?? [];

  // Tìm Role của User hiện tại (Lấy từ mảng MEMBERS trả về)
  const myMemberInfo = MEMBERS.find((m: any) => m.id === user?.userId);
  // Nếu API chưa trả về Role, ta mặc định người tạo (Admin) là có name "Admin", hoặc bạn có thể gọi thêm logic tùy ý.
  // Tạm thời, nếu không tìm thấy role, ta sẽ show "Member"
  const myRole = myMemberInfo?.role || (MEMBERS[0]?.id === user?.userId ? 'Admin' : 'Member');


  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shared Wallet</Text>
        
        <TouchableOpacity 
          style={styles.settingButton} 
          activeOpacity={0.7}
          onPress={() => router.push(`/group/wallet-settings/${id}`)}
        >
          <Feather name="settings" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── OVERVIEW CARD ─── */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: themeColor + '20' }]}>
              <Text style={styles.emojiIcon}>{walletDetail.icon || '💼'}</Text>
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.walletName}>{walletDetail.name}</Text>
              
              {/* Badge Role */}
              <View style={[styles.roleBadge, myRole === 'Admin' ? styles.roleBadgeAdmin : styles.roleBadgeMember]}>
                <Text style={styles.roleText}>{myRole}</Text>
              </View>
            </View>
          </View>
          
          {/* 💡 VỊ TRÍ 1: Số to ở giữa là Available Balance (Số dư khả dụng) */}
          <Text style={styles.remainingLabel}>Available Balance</Text>
          <Text style={styles.remainingAmount}>{formatVND(availableBalance)}</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: progressColor }]} />
          </View>
          
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>{formatVND(spent)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {/* 💡 VỊ TRÍ 2: Thay Allocated bằng Total Fund (Tổng quỹ) */}
              <Text style={styles.statLabel}>Total Fund</Text>
              <Text style={styles.statValue}>{formatVND(totalFund)}</Text>
            </View>
          </View>
        </View>

        {/* ─── PARTICIPANTS ─── */}
        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.participantList}>
            <TouchableOpacity style={styles.btnAddParticipant} activeOpacity={0.7}>
              <Feather name="plus" size={20} color="#15476C" />
            </TouchableOpacity>

            {MEMBERS.map((member: any) => (
              <TouchableOpacity key={member.id} style={styles.participantAvatar} activeOpacity={0.8}>
                 <Image 
                    source={{ uri: member.avatar || `https://ui-avatars.com/api/?name=${member.name || 'User'}&background=15476C&color=fff` }} 
                    style={styles.pImg} 
                  />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── ACTION BUTTONS (Nạp tiền & Chi tiêu) ─── */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#10B981', shadowColor: '#10B981' }]} 
            activeOpacity={0.8}
            onPress={() => router.push({ 
              pathname: '/group/contribute', 
              params: { walletId: id, walletName: walletDetail.name } 
            })}
          >
            <Feather name="arrow-down-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnActionText}>Top-up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#FF4267', shadowColor: '#FF4267' }]} activeOpacity={0.8}>
            <Feather name="arrow-up-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnActionText}>Expense</Text>
          </TouchableOpacity>
        </View>

        {/* ─── RECENT TRANSACTIONS ─── */}
        <View style={styles.transactionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {TRANSACTIONS.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>Chưa có giao dịch nào.</Text>
          ) : (
            TRANSACTIONS.map((tx: any) => (
              <View key={tx.id} style={styles.transactionCard}>
                <View style={styles.txIconContainer}>
                  <Image source={{ uri: tx.userAvatar }} style={styles.txAvatar} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.note}</Text>
                  <Text style={styles.txDate}>{tx.userName} • {tx.date}</Text>
                </View>

                {/* 💡 VẤN ĐỀ 3: Check tx.type là Income (+) Xanh, hay Expense (-) Đỏ */}
                <Text style={[styles.txAmount, { color: tx.type === 'Income' ? '#10B981' : '#FF4267' }]}>
                  {tx.type === 'Income' ? '+' : '-'}{formatVND(tx.amount)}
                </Text>

              </View>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 }, settingButton: { paddingLeft: 8 }, headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  overviewCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 }, 
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }, 
  emojiIcon: { fontSize: 24 }, 
  cardHeaderInfo: { flex: 1, alignItems: 'flex-start' }, 
  walletName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 4 }, 
  
  // 💡 Bổ sung CSS cho Role Badge
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  roleBadgeAdmin: { backgroundColor: '#EAF4FA' },
  roleBadgeMember: { backgroundColor: '#F3F4F6' },
  roleText: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#15476C' },

  remainingLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', marginBottom: 4 }, 
  remainingAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 32, color: '#15476C', marginBottom: 20 }, 
  progressContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }, 
  progressBar: { height: '100%', borderRadius: 4 }, 
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' }, 
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' }, 
  statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },

  participantsSection: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 12 },
  participantList: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 20 },
  btnAddParticipant: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#15476C', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21, 71, 108, 0.05)' },
  participantAvatar: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF' },
  pImg: { width: '100%', height: '100%' },

  actionButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  btnAction: { flex: 1, flexDirection: 'row', height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnActionText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  transactionSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAllText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#15476C' },
  transactionCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center' },
  txIconContainer: { width: 48, height: 48, borderRadius: 24, marginRight: 16, backgroundColor: '#F3F4F6', overflow: 'hidden' },
  txAvatar: { width: '100%', height: '100%' },
  txInfo: { flex: 1 },
  txTitle: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', marginBottom: 4 },
  txDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  txAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
});