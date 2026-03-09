import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function SharedWalletScreen() {
  const router = useRouter();
  
  // 1. Lấy ID của Group từ URL (bắt cả param 'id' hoặc 'groupId')
  const params = useLocalSearchParams();
  const groupId = (params.groupId || params.id) as string;

  // 2. State chứa dữ liệu thật
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Tự động gọi API lấy Ví của Nhóm khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      const fetchWallets = async () => {
        if (!groupId) {
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        try {
          const res = await axiosClient.get(`/Group/${groupId}/wallets`);
          setWallets(res.data);
        } catch (error) {
          console.error("Lỗi lấy danh sách ví chung:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchWallets();
    }, [groupId])
  );

  const renderSharedWalletCard = (item: any) => {
  const remaining = item.allocated - item.spent;
  const progress = item.allocated > 0 ? Math.min((item.spent / item.allocated) * 100, 100) : 0;

  return (
    <TouchableOpacity 
      key={item.id} style={styles.card} activeOpacity={0.9}
      onPress={() => router.push(`/group/wallet-detail/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.emoji}>{item.icon}</Text>
          </View>
          {/* ✅ Name + Allocated + Role badge xếp dọc cùng nhau */}
          <View>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardAllocated}>Allocated: {formatVND(item.allocated)}VNĐ</Text>
            {/* ✅ Role badge chuyển xuống đây, ngay dưới allocated */}
            {item.myRole && (
              <View style={[
                styles.roleBadge, 
                item.myRole === 'Admin' ? styles.roleBadgeAdmin : styles.roleBadgeMember,
                { marginTop: 4, alignSelf: 'flex-start' } // ✅ Không chiếm full width
              ]}>
                <Text style={styles.roleText}>{item.myRole}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Avatar stack — chỉ còn avatars + nút more, không có role badge nữa */}
        <View style={styles.avatarStack}>
          {item.members?.slice(0, 3).map((member: any, index: number) => (
            <View key={member.id} style={[styles.avatarWrapper, { marginLeft: index > 0 ? -10 : 0 }]}>
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Feather name="user" size={14} color="#9CA3AF" />
                </View>
              )}
            </View>
          ))}

          {item.members && item.members.length > 3 ? (
            <View style={[styles.avatarWrapper, { marginLeft: -10, backgroundColor: '#EAF4FA', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#15476C' }}>
                +{item.members.length - 3}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-horizontal" size={16} color="#1F2937" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats + Progress bar giữ nguyên */}
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
      
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#15476C" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              style={styles.btnAddWallet} 
              activeOpacity={0.8}
              onPress={() => {
                  if (!groupId) {
                    alert("Lỗi: Không tìm thấy ID nhóm. Vui lòng quay lại và thử lại!");
                    return;
                  }
                  
                  // 4. QUAN TRỌNG: Truyền groupId sang trang Create Shared Wallet
                  router.push({
                    pathname: '/group/create-shared',
                    params: { type: 'wallet', action: 'create', groupId: groupId }
                  });
              }}
            >
              <Feather name="plus-circle" size={20} color="#15476C" style={{ marginRight: 8 }} />
              <Text style={styles.btnAddWalletText}>Create New Wallet</Text>
            </TouchableOpacity>
            
            {/* 5. Hiển thị UI trống nếu chưa có ví */}
            {wallets.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>Chưa có ví chung nào trong nhóm này.</Text>
            ) : (
                wallets.map(renderSharedWalletCard)
            )}
            
            <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── CSS GIỮ NGUYÊN 100% NHƯ CỦA BẠN ───
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
  btnAddWallet: { flexDirection: 'row', height: 54, borderRadius: 20, borderWidth: 2, borderColor: '#15476C', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: 'rgba(21, 71, 108, 0.05)' },
  btnAddWalletText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#15476C' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  roleBadgeAdmin: { backgroundColor: '#EAF4FA' },
  roleBadgeMember: { backgroundColor: '#F3F4F6' },
  roleText: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#15476C' },
});