import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, Modal, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';
import { useAuthStore } from '@/stores/auth.store';
import { getBudgetProgressColor } from '@/utils/format';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';

export default function WalletDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state: any) => state.user);

  // 🆕 STATE CHO DỮ LIỆU THẬT
  const [budgetDetail, setBudgetDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // 🆕 GỌI API LẤY CHI TIẾT
  useEffect(() => {
    const fetchBudgetDetail = async () => {
      try {
        const res = await axiosClient.get(`/Budget/${id}`);
        setBudgetDetail(res.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu ngân sách.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchBudgetDetail();
  }, [id]);

  // Hiển thị màn hình Loading trong lúc đợi API
  if (isLoading || !budgetDetail) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#15476C" />
      </SafeAreaView>
    );
  }

  // 🆕 TÍNH TOÁN DỰA TRÊN DỮ LIỆU THẬT
  const remaining = budgetDetail.allocated - budgetDetail.spent;
  const progress = budgetDetail.allocated > 0 ? Math.min((budgetDetail.spent / budgetDetail.allocated) * 100, 100) : 0;
  const themeColor = budgetDetail.color || '#10B981';
  const progressColor = getBudgetProgressColor(budgetDetail.spent, budgetDetail.allocated);

  // 🆕 LOGIC RENDER ICON/IMAGE
  const renderIcon = () => {
    const icon = budgetDetail.icon;
    if (icon && (icon.startsWith('http') || icon.startsWith('file:///'))) {
      return <Image source={{ uri: icon }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />;
    }
    if (icon && /^[a-z\-]+$/.test(icon)) {
      return <Feather name={icon as any} size={24} color={themeColor} />;
    }
    return <Text style={styles.emojiIcon}>{icon || '💰'}</Text>;
  };

  // Tạm thời hiển thị chính bạn là Member duy nhất (Chờ ghép Group sau)
  const MEMBERS = [{ 
    id: user?.userId || 'u1', 
    name: user?.fullName || 'Me', 
    avatar: user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'Me'}&background=15476C&color=fff` 
  }];

  const TRANSACTIONS : any[] = budgetDetail?.transactions ?? [];
  const memberTransactions = selectedMember 
    ? TRANSACTIONS.filter((t: any) => t.userName === selectedMember.name) 
    : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Details</Text>
        
        <TouchableOpacity 
          style={styles.settingButton} 
          activeOpacity={0.7}
          onPress={() => router.push(`/group/wallet-settings/${id}`)}
        >
          <Feather name="settings" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── 1. OVERVIEW CARD ─── */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <TouchableOpacity 
              style={styles.iconBoxWrapper} 
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: '/group/create-shared',
                  params: { action: 'edit', type: 'budget', id: budgetDetail.id, name: budgetDetail.name, amount: budgetDetail.allocated, color: budgetDetail.color, imageUri: budgetDetail.icon }
                });
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: themeColor + '20' }]}>
                {renderIcon()}
              </View>
              <View style={styles.editIconBadge}>
                <Feather name="camera" size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.cardHeaderInfo}>
              <Text style={styles.walletName}>{budgetDetail.name}</Text>
              <Text style={styles.walletStatus}>Active</Text>
            </View>
            
            <TouchableOpacity style={styles.moreOptionsBtn}>
              <Feather name="more-horizontal" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.remainingLabel}>Remaining Balance</Text>
          <Text style={styles.remainingAmount}>{formatVND(remaining)}</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: progressColor }]} />
          </View>
          
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>{formatVND(budgetDetail.spent)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Allocated</Text>
              <Text style={styles.statValue}>{formatVND(budgetDetail.allocated)}</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. PARTICIPANTS ─── */}
        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.participantList}>
            <TouchableOpacity style={styles.btnAddParticipant} activeOpacity={0.7}>
              <Feather name="plus" size={20} color="#15476C" />
            </TouchableOpacity>

            {MEMBERS.map(member => (
              <TouchableOpacity 
                key={member.id} 
                style={styles.participantAvatar}
                activeOpacity={0.8}
                onPress={() => setSelectedMember(member)}
              >
                 <Image source={{ uri: member.avatar }} style={styles.pImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── 3. ACTION BUTTON (Add Expense) ─── */}
        <TouchableOpacity style={styles.btnAddExpense} activeOpacity={0.8}>
          <Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnAddExpenseText}>Add Expense</Text>
        </TouchableOpacity>

        {/* ─── 4. RECENT TRANSACTIONS ─── */}
        <View style={styles.transactionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {TRANSACTIONS.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>Chưa có giao dịch nào.</Text>
          ) : (
            TRANSACTIONS.map((tx) => (
              <View key={tx.id} style={styles.transactionCard}>
                <View style={styles.txIconContainer}>
                  <Image 
                    source={{ uri: tx.userAvatar }} 
                    style={styles.txAvatar} 
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>
                    {tx.note || tx.categoryName || 'Chi tiêu'}
                  </Text>
                  <Text style={styles.txDate}>{tx.userName} • {tx.date}</Text>
                </View>
                <Text style={styles.txAmount}>{formatVND(tx.amount)}</Text>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── POPUP: GIAO DỊCH THÀNH VIÊN ─── */}
      <Modal visible={!!selectedMember} transparent={true} animationType="fade" onRequestClose={() => setSelectedMember(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMember?.name}'s Expenses</Text>
              <TouchableOpacity onPress={() => setSelectedMember(null)} style={{ padding: 4 }}>
                <Feather name="x" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {memberTransactions.length > 0 ? (
                memberTransactions.map(tx => (
                  <View key={tx.id} style={styles.modalTxRow}>
                    <View style={{ flex: 1, paddingRight: 16 }}>
                      <Text style={styles.modalTxTitle}>{tx.title}</Text>
                      <Text style={styles.modalTxDate}>{tx.date}</Text>
                    </View>
                    <Text style={styles.modalTxAmount}>{formatVND(tx.amount)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.modalEmptyText}>No recent expenses.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ĐẦY ĐỦ ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 }, settingButton: { paddingLeft: 8 }, headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  iconBoxWrapper: { position: 'relative', marginRight: 16 },
  editIconBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#15476C', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  moreOptionsBtn: { padding: 4, marginLeft: 8 },
  
  overviewCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 }, iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, emojiIcon: { fontSize: 24 }, cardHeaderInfo: { flex: 1 }, walletName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' }, walletStatus: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#10B981' }, remainingLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', marginBottom: 4 }, remainingAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 32, color: '#15476C', marginBottom: 20 }, progressContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }, progressBar: { height: '100%', borderRadius: 4 }, statsRow: { flexDirection: 'row', justifyContent: 'space-between' }, statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' }, statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },

  participantsSection: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 12 },
  participantList: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 20 },
  btnAddParticipant: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#15476C', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21, 71, 108, 0.05)' },
  participantAvatar: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF' },
  pImg: { width: '100%', height: '100%' },

  btnAddExpense: { flexDirection: 'row', backgroundColor: '#15476C', height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 32, shadowColor: '#15476C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnAddExpenseText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  transactionSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAllText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#15476C' },
  transactionCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center' },
  txIconContainer: { width: 48, height: 48, borderRadius: 24, marginRight: 16, backgroundColor: '#F3F4F6', overflow: 'hidden' },
  txAvatar: { width: '100%', height: '100%' },
  txInfo: { flex: 1 },
  txTitle: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', marginBottom: 4 },
  txDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  txAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#FF4267' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  modalTxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTxTitle: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937' },
  modalTxDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  modalTxAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#FF4267' },
  modalEmptyText: { fontFamily: 'Poppins_400Regular', color: '#9CA3AF', textAlign: 'center', marginTop: 20 },
});