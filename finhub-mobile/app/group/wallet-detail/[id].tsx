import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// ─── DỮ LIỆU GIẢ LẬP ────────────────────────────────────────────────────────
const WALLET_DETAIL = {
  id: '1', name: 'Daily wallet', icon: '🥗', allocated: 1000000, spent: 450000, color: '#10B981',
};

const MEMBERS = [
  { id: 'm1', name: 'Anh Minh', avatar: 'https://i.pravatar.cc/100?img=11' },
  { id: 'm2', name: 'Wyn', avatar: 'https://i.pravatar.cc/100?img=12' },
];

const TRANSACTIONS = [
  { id: 't1', title: 'Lunch at KFC', amount: -150000, userId: 'm1', userName: 'Anh Minh', userAvatar: 'https://i.pravatar.cc/100?img=11', date: 'Today, 12:30 PM' },
  { id: 't2', title: 'Groceries', amount: -300000, userId: 'm2', userName: 'Wyn', userAvatar: 'https://i.pravatar.cc/100?img=12', date: 'Yesterday, 09:00 AM' },
];

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';

export default function WalletDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // State quản lý Popup hiển thị giao dịch của từng thành viên
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const remaining = WALLET_DETAIL.allocated - WALLET_DETAIL.spent;
  const progress = Math.min((WALLET_DETAIL.spent / WALLET_DETAIL.allocated) * 100, 100);

  // Lọc giao dịch theo người được chọn (cho Popup)
  const memberTransactions = selectedMember 
    ? TRANSACTIONS.filter(t => t.userId === selectedMember.id)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Details</Text>
        
        {/* Nút Settings chuyển sang trang Quản lý */}
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
                // Chuyển sang trang Create và truyền params báo hiệu đây là chế độ Edit
                router.push({
                  pathname: '/group/create-goal',
                  params: { 
                    isEditing: 'true',
                    id: WALLET_DETAIL.id,
                    name: WALLET_DETAIL.name,
                    allocated: WALLET_DETAIL.allocated,
                    color: WALLET_DETAIL.color,
                    icon: WALLET_DETAIL.icon
                  }
                });
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: WALLET_DETAIL.color + '20' }]}>
                <Text style={styles.emojiIcon}>{WALLET_DETAIL.icon}</Text>
              </View>
              {/* Badge Camera nhỏ góc dưới */}
              <View style={styles.editIconBadge}>
                <Feather name="camera" size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.cardHeaderInfo}>
              <Text style={styles.walletName}>{WALLET_DETAIL.name}</Text>
              <Text style={styles.walletStatus}>Active</Text>
            </View>
            <TouchableOpacity 
              style={styles.moreOptionsBtn}
              activeOpacity={0.7}
              onPress={() => {
                // Tương tự, bấm 3 chấm cũng đưa qua trang Edit
                router.push({
                  pathname: '/group/create-goal',
                  params: { 
                    isEditing: 'true',
                    id: WALLET_DETAIL.id,
                    name: WALLET_DETAIL.name,
                    allocated: WALLET_DETAIL.allocated,
                    color: WALLET_DETAIL.color,
                    icon: WALLET_DETAIL.icon
                  }
                });
              }}
            >
              <Feather name="more-horizontal" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          <Text style={styles.remainingLabel}>Remaining Balance</Text>
          <Text style={styles.remainingAmount}>{formatVND(remaining)}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: WALLET_DETAIL.color }]} />
          </View>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>{formatVND(WALLET_DETAIL.spent)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Allocated</Text>
              <Text style={styles.statValue}>{formatVND(WALLET_DETAIL.allocated)}</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. PARTICIPANTS (Avatar cuộn ngang & Popup) ─── */}
        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.participantList}>
            
            {/* Nút Add nằm đầu tiên cực kỳ tiện lợi */}
            <TouchableOpacity style={styles.btnAddParticipant} activeOpacity={0.7}>
              <Feather name="plus" size={20} color="#15476C" />
            </TouchableOpacity>

            {/* Danh sách Avatar */}
            {MEMBERS.map(member => (
              <TouchableOpacity 
                key={member.id} 
                style={styles.participantAvatar}
                activeOpacity={0.8}
                onPress={() => setSelectedMember(member)} // Mở Popup check giao dịch
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

        {/* ─── 4. RECENT TRANSACTIONS (Lịch sử chi tiêu chung) ─── */}
        <View style={styles.transactionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.txIconContainer}>
                <Image source={{ uri: tx.userAvatar }} style={styles.txAvatar} />
              </View>
              
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txDate}>{tx.userName} • {tx.date}</Text>
              </View>

              <Text style={styles.txAmount}>{formatVND(tx.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── POPUP: GIAO DỊCH CỦA TỪNG THÀNH VIÊN ─── */}
      <Modal
        visible={!!selectedMember}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedMember(null)}
      >
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
  
  // Overview
  overviewCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 }, iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }, emojiIcon: { fontSize: 24 }, cardHeaderInfo: { flex: 1 }, walletName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' }, walletStatus: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#10B981' }, remainingLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', marginBottom: 4 }, remainingAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 32, color: '#15476C', marginBottom: 20 }, progressContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }, progressBar: { height: '100%', borderRadius: 4 }, statsRow: { flexDirection: 'row', justifyContent: 'space-between' }, statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' }, statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },

  // Participants
  participantsSection: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 12 },
  participantList: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 20 },
  btnAddParticipant: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#15476C', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21, 71, 108, 0.05)' },
  participantAvatar: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF' },
  pImg: { width: '100%', height: '100%' },

  // Add Expense Button
  btnAddExpense: { flexDirection: 'row', backgroundColor: '#15476C', height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 32, shadowColor: '#15476C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnAddExpenseText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  // Recent Transactions
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

  // Modal Popup
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