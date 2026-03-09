import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Alert, LayoutAnimation, UIManager, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Kích hoạt LayoutAnimation cho Android (Để hiệu ứng xổ xuống mượt mà)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ContributeScreen() {
  const router = useRouter();
  const { walletId, walletName } = useLocalSearchParams<{ walletId: string, walletName: string }>();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  const [myAccounts, setMyAccounts] = useState<any[]>([]);
  const [expandedWalletId, setExpandedWalletId] = useState<string | null>(null); // Trạng thái xổ ra
  const [selectedSource, setSelectedSource] = useState<any>(null); // Nguồn tiền được chọn (Ví hoặc Budget)

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        // Lấy danh sách Ví & Budget cá nhân (Gọi 2 API cùng lúc)
        const [walletsRes, budgetsRes] = await Promise.all([
          axiosClient.get('/Wallet'),
          axiosClient.get('/Budget/summary') // Tận dụng API này để lấy budget cá nhân
        ]);

        // Gắn Budgets vào trong từng Wallet tương ứng
        const walletsWithBudgets = walletsRes.data.map((w: any) => ({
          ...w,
          budgets: [
            ...budgetsRes.data.mandatory.filter((b: any) => b.walletId === w.walletId),
            ...budgetsRes.data.nonRecurring.filter((b: any) => b.walletId === w.walletId)
          ]
        }));

        setMyAccounts(walletsWithBudgets);
        if (walletsWithBudgets.length > 0) {
            setExpandedWalletId(walletsWithBudgets[0].walletId);
            setSelectedSource({ type: 'wallet', data: walletsWithBudgets[0] });
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải danh sách nguồn tiền.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSources();
  }, []);

  const handleAmountChange = (text: string) => setAmount(text.replace(/[^0-9]/g, ''));

  const toggleExpand = (walletId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedWalletId(expandedWalletId === walletId ? null : walletId);
  };

  const handleContribute = async () => {
    if (!selectedSource || !amount) return;
    const numAmount = parseInt(amount);

    setIsSubmitting(true);
    try {
      const payload = {
        sourceWalletId: selectedSource.type === 'wallet' ? selectedSource.data.walletId : selectedSource.data.walletId, 
        // Nếu API C# của bạn hỗ trợ trừ thẳng từ Budget, có thể gửi thêm SourceBudgetId ở đây
        destinationWalletId: walletId,
        amount: numAmount,
        note: note || `Nạp tiền từ ${selectedSource.data.name}`
      };

      await axiosClient.post('/Wallet/contribute', payload);
      
      Alert.alert("Thành công", `Đã nạp ${formatVND(numAmount)} VNĐ vào quỹ!`);
      router.back();
    } catch (error) {
      Alert.alert("Lỗi", "Giao dịch thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#15476C" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="x" size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Contribute to {walletName || 'Group'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nhập số tiền */}
        <View style={styles.amountSection}>
          <Text style={styles.label}>Amount to contribute</Text>
          <View style={styles.amountInputWrapper}>
            <TextInput style={styles.amountInput} placeholder="0" keyboardType="numeric" value={amount ? formatVND(parseInt(amount)) : ''} onChangeText={handleAmountChange} autoFocus />
            <Text style={styles.currencyUnit}>VNĐ</Text>
          </View>
        </View>

        {/* Danh sách Nguồn tiền dạng Accordion */}
        <Text style={styles.label}>Select your Source Account</Text>
        
        {myAccounts.map((wallet) => {
          const isExpanded = expandedWalletId === wallet.walletId;
          const isWalletSelected = selectedSource?.type === 'wallet' && selectedSource?.data.walletId === wallet.walletId;

          return (
            <View key={wallet.walletId} style={styles.accordionGroup}>
              {/* Thẻ Ví (Header) */}
              <TouchableOpacity 
                style={[styles.walletHeader, isWalletSelected && styles.selectedItem]} 
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedSource({ type: 'wallet', data: wallet });
                  toggleExpand(wallet.walletId);
                }}
              >
                <View style={styles.headerLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#10B98120' }]}><Text style={{ fontSize: 20 }}>🏦</Text></View>
                  <View>
                    <Text style={styles.accName}>{wallet.name}</Text>
                    <Text style={styles.accBalance}>Balance: {formatVND(wallet.currentBalance)}</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isWalletSelected && <Feather name="check-circle" size={20} color="#15476C" style={{ marginRight: 12 }} />}
                  <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {/* Danh sách Budget (Body xổ ra) */}
              {isExpanded && wallet.budgets && wallet.budgets.length > 0 && (
                <View style={styles.budgetsContainer}>
                  {wallet.budgets.map((budget: any) => {
                    const isBudgetSelected = selectedSource?.type === 'budget' && selectedSource?.data.budgetId === budget.budgetId;
                    return (
                      <TouchableOpacity 
                        key={budget.budgetId} 
                        style={[styles.budgetItem, isBudgetSelected && styles.selectedItem]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedSource({ type: 'budget', data: budget })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={styles.budgetDot} />
                          <View>
                            <Text style={styles.budgetName}>{budget.name}</Text>
                            <Text style={styles.budgetBalance}>Remaining: {formatVND(budget.allocated - budget.spent)}</Text>
                          </View>
                        </View>
                        {isBudgetSelected && <Feather name="check" size={18} color="#15476C" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.noteSection}>
          <Text style={styles.label}>Note</Text>
          <TextInput style={styles.noteInput} placeholder="Ví dụ: Đóng quỹ tháng 10..." value={note} onChangeText={setNote} />
        </View>

        <TouchableOpacity 
          style={[styles.confirmBtn, (!amount || isSubmitting) && styles.disabledBtn]}
          disabled={!amount || isSubmitting}
          onPress={handleContribute}
        >
          {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmBtnText}>Confirm Contribution</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  content: { padding: 20 },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 12, fontWeight: '500' },
  
  amountSection: { alignItems: 'center', marginVertical: 30 },
  amountInputWrapper: { flexDirection: 'row', alignItems: 'baseline' },
  amountInput: { fontSize: 40, fontWeight: '700', color: '#15476C', textAlign: 'center', minWidth: 60 },
  currencyUnit: { fontSize: 18, fontWeight: '600', color: '#15476C', marginLeft: 8 },

  // Styles cho Accordion
  accordionGroup: { marginBottom: 12, borderRadius: 16, borderWidth: 1.5, borderColor: '#F3F4F6', overflow: 'hidden' },
  walletHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  accName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  accBalance: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  budgetsContainer: { backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 8 },
  budgetItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 20 },
  budgetDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 12 },
  budgetName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  budgetBalance: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  selectedItem: { backgroundColor: '#F0F9FF', borderColor: '#15476C' },

  noteSection: { marginTop: 20 },
  noteInput: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', fontSize: 16, color: '#1F2937' },
  
  confirmBtn: { backgroundColor: '#15476C', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  disabledBtn: { backgroundColor: '#E5E7EB' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});