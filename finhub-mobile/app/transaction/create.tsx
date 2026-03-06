import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import axiosClient from '@/api/axiosClient';
import { useAuthStore } from '@/stores/auth.store';

export default function ManualInputScreen() {
  const user = useAuthStore((state: any) => state.user);

  const [activeTab, setActiveTab] = useState<'moneyOut' | 'moneyIn'>('moneyOut');
  
  // 1. ĐÃ SỬA: Bỏ số 75.000 và Eating đi, để rỗng ban đầu!
  const [amount, setAmount] = useState(''); 
  const [note, setNote] = useState('');     
  
  const [budgets, setBudgets] = useState<any[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<'Need' | 'Want'>('Need');
  const [isLoading, setIsLoading] = useState(true);

  // FETCH DATA BUDGET
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axiosClient.get('/Budget/summary');
        const allBudgets = [...(res.data.mandatory || []), ...(res.data.nonRecurring || [])];
        setBudgets(allBudgets);
        if (allBudgets.length > 0) {
          setSelectedBudget(allBudgets[0].budgetId);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách Budget:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  // 2. LOGIC THANH CHẠY (PROGRESS BAR) CHUẨN XÁC
  const rawAmount = parseFloat(amount.replace(/\./g, '')) || 0;
  
  // Lấy dữ liệu của hũ ngân sách đang được chọn
  const activeBudgetObj = budgets.find(b => b.budgetId === selectedBudget);
  const allocated = activeBudgetObj?.allocated || 0;
  const currentSpent = activeBudgetObj?.spent || 0;

  // Nếu là Chi (moneyOut) -> Cộng thêm tiền vào mức Đã Tiêu. 
  // Nếu Thu (moneyIn) -> Trừ bớt tiền Đã Tiêu đi.
  const previewSpent = activeTab === 'moneyOut' 
    ? currentSpent + rawAmount 
    : currentSpent - rawAmount;
  
  const remainingAmount = allocated - previewSpent; 
  
  // Ép phần trăm từ 0% đến 100% để thanh màu không bị trào ra ngoài UI
  const spentPercentage = allocated > 0 
    ? Math.max(0, Math.min((previewSpent / allocated) * 100, 100)) 
    : 0;

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue).toLocaleString('vi-VN').replace(/,/g, '.');
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  const handleSave = async () => {
    if (!amount || amount === '0') {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
      return;
    }
    try {
      const transactionData = {
        walletId: user?.primaryWalletId,
        budgetId: selectedBudget,
        amount: rawAmount,
        type: activeTab === 'moneyOut' ? 'Expense' : 'Income',
        note: note,
        evaluation: activeTab === 'moneyOut' ? evaluation : null
      };

      await axiosClient.post('/Transaction', transactionData);
      
      Keyboard.dismiss();
      Alert.alert('Thành công', 'Đã lưu giao dịch!');
      router.back();
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể lưu giao dịch lúc này.');
    }
  };

  const renderIcon = (icon: string | null, color: string) => {
    if (icon && (icon.startsWith('http') || icon.startsWith('file:///'))) {
      return <Image source={{ uri: icon }} style={{ width: 24, height: 24, borderRadius: 8 }} />;
    }
    if (icon && /^[a-z\-]+$/.test(icon)) {
      return <Feather name={icon as any} size={20} color={color} />;
    }
    return <Text style={{ fontSize: 20 }}>{icon || '💰'}</Text>;
  };

  const activeColor = activeTab === 'moneyOut' ? '#EF4444' : '#10B981';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.headerArea}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => setActiveTab('moneyOut')}
                style={[styles.toggleButton, activeTab === 'moneyOut' && styles.toggleButtonActive]}
              >
                <Feather name="arrow-up-right" size={16} color={activeTab === 'moneyOut' ? COLORS.white : COLORS.gray600} />
                <Text style={[styles.toggleText, activeTab === 'moneyOut' && styles.toggleTextActive]}>Money out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('moneyIn')}
                style={[styles.toggleButton, activeTab === 'moneyIn' && styles.toggleButtonActive]}
              >
                <Feather name="arrow-down-left" size={16} color={activeTab === 'moneyIn' ? COLORS.white : COLORS.gray600} />
                <Text style={[styles.toggleText, activeTab === 'moneyIn' && styles.toggleTextActive]}>Money in</Text>
              </TouchableOpacity>
          </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              
              <View style={styles.centerContent}>
                  <Text style={{ fontSize: 60, marginBottom: 16 }}>🦊</Text>
                  
                  <View style={styles.amountInputWrapper}>
                      <Text style={[styles.amountPrefix, { color: activeColor }]}>
                          {activeTab === 'moneyOut' ? '-' : '+'}
                      </Text>
                      <TextInput 
                          value={amount}
                          onChangeText={handleAmountChange}
                          keyboardType="numeric"
                          style={[styles.amountInput, { color: activeColor }]}
                          placeholder="0"
                          placeholderTextColor="#E5E7EB"
                      />
                      <Text style={[styles.amountSuffix, { color: activeColor }]}>VND</Text>
                  </View>
                  
                  <View style={styles.noteInputContainer}>
                      <TextInput
                          value={note}
                          onChangeText={setNote}
                          placeholder="Add note"
                          placeholderTextColor="#9CA3AF"
                          style={styles.noteInput}
                      />
                      <Feather name="edit-2" size={14} color="#9CA3AF" style={{ marginLeft: 8 }} />
                  </View>

                  <TouchableOpacity 
                      style={[styles.saveButton, { backgroundColor: activeColor }]}
                      onPress={handleSave}
                      activeOpacity={0.8}
                  >
                      <Text style={styles.saveButtonText}>Confirm Transaction</Text>
                      <Feather name="check" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
              </View>

              <View style={styles.bottomSheet}>
                  
                  {/* 3. THANH PROGRESS BAR MỚI NHẤT */}
                  <View style={[
                      styles.progressBarContainer, 
                      { backgroundColor: activeTab === 'moneyOut' ? '#FCA5A5' : '#86EFAC' }
                  ]}>
                      <View style={[
                          styles.progressBarFill, 
                          { width: `${spentPercentage}%`, backgroundColor: activeTab === 'moneyOut' ? '#EF4444' : '#16A34A' }
                      ]} />
                      
                      <View style={styles.progressTextContainer}>
                          <View>
                              <Text style={styles.progressLabel}>Spent</Text>
                              <Text style={styles.progressValue}>{previewSpent.toLocaleString('vi-VN')} VND</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                              <Text style={styles.progressLabel}>Remaining</Text>
                              <Text style={styles.progressValue}>{remainingAmount.toLocaleString('vi-VN')} VND</Text>
                          </View>
                      </View>
                  </View>

                  {/* CHỌN NEED/WANT */}
                  {activeTab === 'moneyOut' && (
                    <View style={styles.evaluationWrapper}>
                      <Text style={styles.sectionTitle}>Evaluation</Text>
                      <View style={styles.evalContainer}>
                        <TouchableOpacity 
                          style={[styles.evalBtn, evaluation === 'Need' && styles.evalBtnActive]}
                          onPress={() => setEvaluation('Need')}
                        >
                          <Text style={[styles.evalText, evaluation === 'Need' && styles.evalTextActive]}>👍 Need</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.evalBtn, evaluation === 'Want' && styles.evalBtnActive]}
                          onPress={() => setEvaluation('Want')}
                        >
                          <Text style={[styles.evalText, evaluation === 'Want' && styles.evalTextActive]}>💖 Want</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* DANH SÁCH BUDGET */}
                  <View style={styles.categoriesWrapper}>
                      <Text style={styles.sectionTitle}>Select Budget</Text>
                      {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : (
                        <View style={styles.categoriesContainer}>
                            {budgets.map((b) => (
                                <TouchableOpacity
                                  key={b.budgetId}
                                  onPress={() => {
                                      Keyboard.dismiss(); 
                                      setSelectedBudget(b.budgetId);
                                  }}
                                  style={[
                                    styles.categoryButton, 
                                    selectedBudget === b.budgetId && styles.categoryButtonActive
                                  ]}
                                >
                                  {renderIcon(b.icon, selectedBudget === b.budgetId ? COLORS.primary : COLORS.black)}
                                  <Text style={[
                                    styles.categoryButtonText, 
                                    selectedBudget === b.budgetId && { color: COLORS.primary, fontWeight: '700' }
                                  ]}>
                                    {b.name}
                                  </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                      )}
                  </View>
                  
                  <View style={{ height: 40 }} />
              </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF6FF' },
  headerArea: { alignItems: 'center', paddingTop: 50 },
  closeButton: { position: 'absolute', left: 10, top: 52, zIndex: 10, padding: 8 },
  toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999, padding: 4 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 999 },
  toggleButtonActive: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  toggleTextActive: { color: COLORS.white },
  
  centerContent: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 30 },
  amountInputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  amountInput: { fontSize: 48, fontWeight: 'bold', minWidth: 50, textAlign: 'center', padding: 0 },
  amountPrefix: { fontSize: 48, fontWeight: 'bold', marginRight: 4 },
  amountSuffix: { fontSize: 20, fontWeight: '600', marginLeft: 8, marginTop: 18 },
  noteInputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4, minWidth: 120, justifyContent: 'center', marginBottom: 24 },
  noteInput: { fontSize: 18, color: '#4B5563', fontWeight: '500', textAlign: 'center' },
  saveButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  bottomSheet: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10, flex: 1 },
  
  /* ĐÃ SỬA LẠI CSS THANH PROGRESS BAR */
  progressBarContainer: {
    height: 60, 
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 0,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
  },
  progressTextContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressLabel: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
  progressValue: { fontSize: 14, color: COLORS.white, fontWeight: 'bold' },
  
  evaluationWrapper: { paddingHorizontal: 24, paddingTop: 24 },
  evalContainer: { flexDirection: 'row', gap: 12 },
  evalBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#F9FAFB' },
  evalBtnActive: { borderColor: COLORS.primary, backgroundColor: '#E3F6FF' },
  evalText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  evalTextActive: { color: COLORS.primary, fontWeight: '700' },

  categoriesWrapper: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent' },
  categoryButtonActive: { backgroundColor: '#E3F6FF', borderColor: COLORS.primary },
  categoryButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.black },
});