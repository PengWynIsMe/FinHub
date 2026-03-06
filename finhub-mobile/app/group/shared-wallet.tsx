import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// ─── DỮ LIỆU GIẢ LẬP MỚI (Bổ sung members) ─────────────────────────────────
const MOCK_SHARED_WALLETS = [
  {
    id: '1',
    name: 'Daily wallet',
    icon: '🥗',
    allocated: 100000,
    spent: 180000,
    color: '#FF4267',
    members: [
      { id: 'm1', avatar: 'https://i.pravatar.cc/100?img=11' },
      { id: 'm2', avatar: 'https://i.pravatar.cc/100?img=12' },
      { id: 'm3', avatar: null },
    ],
  },
  {
    id: '2',
    name: 'Pocket money',
    icon: '🧸',
    allocated: 500000,
    spent: 0,
    color: '#F59E0B',
    members: [
      { id: 'm2', avatar: 'https://i.pravatar.cc/100?img=12' },
    ],
  },
];

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function SharedWalletScreen() {
  const router = useRouter();
  const [wallets] = useState(MOCK_SHARED_WALLETS);

  // Component Thẻ Ví nội bộ (Có Avatar)
  const renderSharedWalletCard = (item: any) => {
    const remaining = item.allocated - item.spent;
    const progress = item.allocated > 0 ? Math.min((item.spent / item.allocated) * 100, 100) : 0;

    return (
      <TouchableOpacity 
        key={item.id} style={styles.card} activeOpacity={0.9}
        onPress={() => router.push(`/group/wallet-detail/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          {/* Cụm Icon & Info */}
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.emoji}>{item.icon}</Text>
            </View>
            <View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardAllocated}>Allocated: {formatVND(item.allocated)}VNĐ</Text>
            </View>
          </View>

          {/* Cụm Avatar chồng lên nhau */}
          <View style={styles.avatarStack}>
            {item.members.slice(0, 3).map((member: any, index: number) => (
              <View key={member.id} style={[styles.avatarWrapper, { marginLeft: index > 0 ? -10 : 0 }]}>
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-horizontal" size={16} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats & Progress (Giữ nguyên logic cũ) */}
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>{formatVND(item.spent)}VNĐ</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, remaining < 0 && { color: '#FF4267' }]}>
              {formatVND(remaining)}VNĐ
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: item.color }]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shared Wallet</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.btnAddWallet} 
          activeOpacity={0.8}
          onPress={() => {
             // Điều hướng đến file create-shared và truyền param type='wallet'
             router.push({
               pathname: '/group/create-shared',
               params: { type: 'wallet', action: 'create' }
             });
          }}
        >
          <Feather name="plus-circle" size={20} color="#15476C" style={{ marginRight: 8 }} />
          <Text style={styles.btnAddWalletText}>Create New Wallet</Text>
        </TouchableOpacity>
        {wallets.map(renderSharedWalletCard)}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji: { fontSize: 22 },
  cardName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },
  cardAllocated: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' },
  
  // Hiệu ứng chồng Avatar
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#F3F4F6', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: '#E5E7EB' },
  moreBtn: { marginLeft: 8 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1F2937' },
  progressContainer: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  btnAddWallet: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#15476C',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(21, 71, 108, 0.05)',
  },
  btnAddWalletText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#15476C',
  },
});