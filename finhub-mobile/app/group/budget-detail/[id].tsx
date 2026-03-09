import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';
import { getBudgetProgressColor } from '@/utils/format';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';

export default function BudgetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [budgetDetail, setBudgetDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. GỌI API LẤY CHI TIẾT BUDGET
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

  if (isLoading || !budgetDetail) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#15476C" />
      </SafeAreaView>
    );
  }

  const remaining = budgetDetail.allocated - budgetDetail.spent;
  const progress = budgetDetail.allocated > 0 ? Math.min((budgetDetail.spent / budgetDetail.allocated) * 100, 100) : 0;
  const themeColor = budgetDetail.color || '#10B981';
  const progressColor = getBudgetProgressColor(budgetDetail.spent, budgetDetail.allocated);
  const TRANSACTIONS: any[] = budgetDetail.transactions ?? [];

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

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Details</Text>
        
        <TouchableOpacity style={styles.settingButton}>
          <Feather name="settings" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── 1. OVERVIEW CARD ─── */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: themeColor + '20' }]}>
              {renderIcon()}
            </View>

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

        {/* ─── 2. ACTION BUTTON (Add Expense) ─── */}
        <TouchableOpacity style={styles.btnAddExpense} activeOpacity={0.8}>
          <Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnAddExpenseText}>Add Expense</Text>
        </TouchableOpacity>

        {/* ─── 3. RECENT TRANSACTIONS ─── */}
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
                   {/* Dùng icon túi xách thay cho Avatar user vì đây là quỹ cá nhân */}
                   <Feather name="shopping-bag" size={20} color="#9CA3AF" />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>
                    {tx.note || tx.categoryName || 'Chi tiêu'}
                  </Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={styles.txAmount}>{formatVND(tx.amount)}</Text>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ĐẦY ĐỦ ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 }, settingButton: { paddingLeft: 8 }, headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  moreOptionsBtn: { padding: 4, marginLeft: 8 },
  
  overviewCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 }, 
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }, 
  emojiIcon: { fontSize: 24 }, 
  cardHeaderInfo: { flex: 1 }, 
  walletName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' }, 
  walletStatus: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#10B981' }, 
  remainingLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', marginBottom: 4 }, 
  remainingAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 32, color: '#15476C', marginBottom: 20 }, 
  progressContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }, 
  progressBar: { height: '100%', borderRadius: 4 }, 
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' }, 
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' }, 
  statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },

  btnAddExpense: { flexDirection: 'row', backgroundColor: '#15476C', height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 32, shadowColor: '#15476C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnAddExpenseText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  transactionSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  seeAllText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#15476C' },
  transactionCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center' },
  txIconContainer: { width: 48, height: 48, borderRadius: 24, marginRight: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', marginBottom: 4 },
  txDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  txAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#FF4267' },
});