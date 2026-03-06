import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';

// ─── DỮ LIỆU GIẢ LẬP ────────────────────────────────────────────────────────
const SAVING_DETAIL = {
  id: 's1',
  name: 'Family Trip to Japan',
  icon: '✈️',
  target: 100000000,
  saved: 45000000,
  color: '#3B82F6', 
  status: 'On Track',
};

const CONTRIBUTIONS = [
  {
    id: 'c1',
    title: 'Bonus from work',
    date: 'Today, 10:00 AM',
    amount: 5000000, // Tiền dương (Cộng vào)
    userName: 'Anh Minh',
    userAvatar: 'https://i.pravatar.cc/100?img=11',
  },
  {
    id: 'c2',
    title: 'Saved from grocery',
    date: 'Yesterday, 08:30 PM',
    amount: 200000,
    userName: 'Wyn',
    userAvatar: 'https://i.pravatar.cc/100?img=12',
  },
];

const formatVND = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';
};

export default function SavingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const remaining = SAVING_DETAIL.target - SAVING_DETAIL.saved;
  const progress = Math.min((SAVING_DETAIL.saved / SAVING_DETAIL.target) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Details</Text>
        <TouchableOpacity style={styles.settingButton} activeOpacity={0.7}>
          <Feather name="more-horizontal" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── 1. OVERVIEW CARD ─── */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: SAVING_DETAIL.color + '20' }]}>
              <Text style={styles.emojiIcon}>{SAVING_DETAIL.icon}</Text>
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.goalName}>{SAVING_DETAIL.name}</Text>
              <Text style={styles.goalStatus}>{SAVING_DETAIL.status}</Text>
            </View>
          </View>

          <Text style={styles.label}>Total Saved So Far</Text>
          <Text style={styles.savedAmount}>{formatVND(SAVING_DETAIL.saved)}</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: SAVING_DETAIL.color }]} />
          </View>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue}>{formatVND(SAVING_DETAIL.target)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>{formatVND(remaining)}</Text>
            </View>
          </View>
        </View>

        {/* ─── 2. ACTION BUTTON (Đóng góp) ─── */}
        <TouchableOpacity style={styles.btnContribute} activeOpacity={0.8}>
          <MaterialIcons name="savings" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnContributeText}>Contribute to Goal</Text>
        </TouchableOpacity>

        {/* ─── 3. RECENT CONTRIBUTIONS ─── */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Contributions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {CONTRIBUTIONS.map((tx) => (
            <View key={tx.id} style={styles.historyCard}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: tx.userAvatar }} style={styles.avatarImg} />
              </View>
              
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{tx.title}</Text>
                <Text style={styles.historyDate}>{tx.userName} • {tx.date}</Text>
              </View>

              {/* Số tiền màu XANH LÁ và có dấu CỘNG */}
              <Text style={styles.historyAmount}>+{formatVND(tx.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20,
  },
  backButton: { paddingRight: 8 },
  settingButton: { paddingLeft: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Overview Card
  overviewCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  emojiIcon: { fontSize: 24 },
  cardHeaderInfo: { flex: 1 },
  goalName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  goalStatus: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#3B82F6' },
  
  label: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', marginBottom: 4 },
  savedAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 32, color: '#15476C', marginBottom: 20 },
  
  progressContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  progressBar: { height: '100%', borderRadius: 4 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' },
  statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },

  // Contribute Button
  btnContribute: {
    flexDirection: 'row', backgroundColor: '#10B981', // Màu Xanh Lá cho Hành động tích cực
    height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center',
    marginBottom: 32, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnContributeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  // History List
  historySection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  seeAllText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#15476C' },
  historyCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16,
    borderRadius: 20, marginBottom: 12, alignItems: 'center',
  },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, marginRight: 16, backgroundColor: '#F3F4F6', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  historyInfo: { flex: 1 },
  historyTitle: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', marginBottom: 4 },
  historyDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  
  // Tiền cộng vào màu xanh lá
  historyAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#10B981' },
});