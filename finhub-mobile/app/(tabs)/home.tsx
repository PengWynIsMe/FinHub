import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { BudgetSummaryCard } from '@/components/wallet/BudgetSummaryCard';
import { BudgetCard } from '@/components/wallet/BudgetCard';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';


import { useAuthStore } from '@/stores/auth.store';
import axiosClient from '@/api/axiosClient';

import { Feather, Ionicons } from '@expo/vector-icons'; 


export default function HomeScreen() {
  const user = useAuthStore((state: { user: any; }) => state.user);
  
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

  // const handleDeleteBudget = async (item: any) => {
  //   try {
  //     // 1. Gọi API Xóa xuống Backend
  //     await axiosClient.delete(`/Budget/${item.budgetId}`);
      
  //     // 2. Cập nhật lại State UI ngay lập tức
  //     setWalletSummary((prev: any) => {
  //       // 🆕 Lấy lại số tiền đã cấp cho hũ này để "hoàn" về ví tổng
  //       const refundedAmount = item.allocated || 0;

  //       return {
  //         ...prev,
  //         // 🆕 Cộng trả tiền về Unallocated Money!
  //         unallocatedMoney: prev.unallocatedMoney + refundedAmount, 
          
  //         mandatory: prev.mandatory.filter((b: any) => b.budgetId !== item.budgetId),
  //         nonRecurring: prev.nonRecurring.filter((b: any) => b.budgetId !== item.budgetId)
  //       };
  //     });

  //   } catch (error) {
  //     console.error("Lỗi khi xóa Budget:", error);
  //     Alert.alert("Lỗi", "Không thể xóa ngân sách lúc này.");
  //   }
  // };

  const handleDeleteBudget = async (item: any) => {
  // ✅ Alert confirm với đúng message yêu cầu
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

              // ✅ Chỉ xóa khỏi list UI
              // KHÔNG cộng lại unallocatedMoney vì giao dịch vẫn còn trong ví
              setWalletSummary((prev: any) => ({
                ...prev,
                mandatory: prev.mandatory.filter((b: any) => b.budgetId !== item.budgetId),
                nonRecurring: prev.nonRecurring.filter((b: any) => b.budgetId !== item.budgetId),
              }));

            } catch (error) {
              console.error("Lỗi khi xóa Budget:", error);
              Alert.alert("Lỗi", "Không thể xóa ngân sách lúc này.");
            }
          },
        },
      ]
    );
  };
  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=15476C&color=fff`;

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
            <Text style={styles.greeting}>Hi, {user?.fullName || 'Guest'}</Text>
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
        
        {/* 2. 🆕 Render danh sách Mandatory thật từ State */}
        <Text style={styles.sectionTitle}>Mandatory fee</Text>
        {walletSummary.mandatory.map((item: any) => (
          <BudgetCard 
            key={item.budgetId} // Dùng budgetId do Backend trả về
            onPress={() => router.push(`/group/wallet-detail/${item.budgetId}`)} 
            onDelete={handleDeleteBudget}
            item={item} 
          />
        ))}

        {/* 3. 🆕 Render danh sách Non-recurring thật từ State */}
        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Non-recurring fee</Text>
        {walletSummary.nonRecurring.map((item: any) => (
          <BudgetCard 
            key={item.budgetId}
            onPress={() => router.push(`/group/wallet-detail/${item.budgetId}`)} 
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
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.md },
  greeting: { color: COLORS.white, fontSize: FONT_SIZE.lg, fontWeight: '600' },
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