import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StatusBar, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { BudgetSummaryCard } from '@/components/wallet/BudgetSummaryCard';
import { BudgetCard } from '@/components/wallet/BudgetCard';
import { router, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons'; 

import { useAuthStore } from '@/stores/auth.store';
import axiosClient from '@/api/axiosClient';

export default function HomeScreen() {
  // Lấy thông tin user từ Zustand store
  const user = useAuthStore((state: any) => state.user);
  
  const [walletSummary, setWalletSummary] = useState({
    unallocatedMoney: 0,
    monthlySpending: 0,
    mandatory: [],   
    nonRecurring: []   
  });

  useFocusEffect(
    useCallback(() => {
      const fetchWalletSummary = async () => {
        try {
          const response = await axiosClient.get('/Budget/summary');
          setWalletSummary(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin ví:", error);
        }
      };

      fetchWalletSummary();
    }, []) 
  );

  const handleAllocate = () => {
    router.push({
      pathname: '/group/create-shared',
      params: { type: 'budget', action: 'create' }
    });
  };

  const handleDeleteBudget = async (item: any) => {
    Alert.alert(
      "Xóa ngân sách",
      "Bạn có chắc muốn xóa ngân sách này? Các giao dịch cũ vẫn sẽ được lưu lại trong lịch sử ví của bạn.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosClient.delete(`/Budget/${item.budgetId}`);
              
              // Cập nhật lại UI ngay lập tức
              setWalletSummary((prev: any) => ({
                ...prev,
                mandatory: prev.mandatory.filter((b: any) => b.budgetId !== item.budgetId),
                nonRecurring: prev.nonRecurring.filter((b: any) => b.budgetId !== item.budgetId),
              }));
              Alert.alert("Thành công", "Đã xóa ngân sách!");
            } catch (error) {
              console.error("Lỗi khi xóa Budget:", error);
              Alert.alert("Lỗi", "Không thể xóa ngân sách lúc này.");
            }
          },
        },
      ]
    );
  };

  // 💡 TỐI ƯU LOGIC HIỂN THỊ TÊN & AVATAR
  // Ưu tiên lấy Name (hoặc Nickname/FullName tùy DB của bạn)
  const displayName = user?.fullName || user?.nickname || user?.email?.split('@')[0] || 'Guest';
  
  // Tự động tạo Avatar xịn xò từ chữ cái đầu của tên
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=15476C&color=fff&bold=true`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <TouchableOpacity 
            style={styles.userInfo}
            activeOpacity={0.7}
            onPress={() => router.push('/profile')}
          >
            <Image 
              source={{ uri: user?.avatarUrl || defaultAvatar }} 
              style={styles.avatar} 
            />
            {/* 💡 SỬ DỤNG BIẾN displayName ĐÃ XỬ LÝ */}
            <Text style={styles.greeting} numberOfLines={1}>
              Hi, {displayName}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
             <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
               <Feather name="bell" size={24} color={COLORS.white} />
             </TouchableOpacity>

             <TouchableOpacity 
                style={styles.headerButton} 
                activeOpacity={0.7}
                onPress={() => router.push('/scan')}
              >
               <Ionicons name="scan" size={24} color={COLORS.white} />
             </TouchableOpacity>
          </View>
        </View>

        <BudgetSummaryCard 
            unallocatedMoney={walletSummary.unallocatedMoney}
            monthlySpending={walletSummary.monthlySpending}
            onAllocatePress={handleAllocate}
        />
      </View>

      {/* Body Section */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Mandatory fee</Text>
        {walletSummary.mandatory.map((item: any) => (
          <BudgetCard 
            key={item.budgetId} 
            onPress={() => router.push(`/group/budget-detail/${item.budgetId}`)} 
            onDelete={handleDeleteBudget}
            item={item} 
          />
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Non-recurring fee</Text>
        {walletSummary.nonRecurring.map((item: any) => (
          <BudgetCard 
            key={item.budgetId}
            onPress={() => router.push(`/group/budget-detail/${item.budgetId}`)} 
            onDelete={handleDeleteBudget}
            item={item} 
          />
        ))}
        
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.md },
  greeting: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: '600', flexShrink: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: SPACING.sm, 
  },
  scrollView: { flex: 1, paddingHorizontal: SPACING.xl },
  scrollContent: { paddingTop: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  sectionTitleSpacing: { marginTop: SPACING.sm },
});