import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Alert,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const parseVND = (text: string) => parseInt(text.replace(/[^0-9]/g, '')) || 0;

export default function CreateBudgetScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [amountLimit, setAmountLimit] = useState('');
  const [budgetType, setBudgetType] = useState<'mandatory' | 'non-recurring'>('mandatory');
  
  // State để chọn nguồn tiền (Ví)
  const [myWallets, setMyWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axiosClient.get('/Wallet');
        setMyWallets(res.data);
        if (res.data.length > 0) {
          const defaultWallet = res.data.find((w: any) => w.isDefaultAccount) || res.data[0];
          setSelectedWalletId(defaultWallet.walletId);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách ví:", error);
      } finally {
        setIsLoadingWallets(false);
      }
    };
    fetchWallets();
  }, []);

  const handleCreateBudget = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ngân sách!'); return;
    }
    const amount = parseVND(amountLimit);
    if (amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền lớn hơn 0!'); return;
    }
    if (!selectedWalletId) {
       Alert.alert('Lỗi', 'Vui lòng chọn ví nguồn!'); return;
    }

    setIsSaving(true);
    try {
      await axiosClient.post('/Budget', {
        name: name.trim(),
        walletId: selectedWalletId,
        categoryId: null,
        amountLimit: amount,
        budgetType: budgetType,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().getFullYear(), 11, 31).toISOString(), 
        isRolling: false
      });
      
      Alert.alert('Thành công 🎉', 'Đã phân bổ ngân sách thành công!', [
        { text: 'Về trang chủ', onPress: () => router.push('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Lỗi tạo ngân sách:', error);
      Alert.alert('Lỗi', error.response?.data?.Message || error.response?.data || 'Không thể phân bổ lúc này.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Budget allocation</Text>
          <TouchableOpacity style={[styles.saveButton, isSaving && { opacity: 0.6 }]} onPress={handleCreateBudget} disabled={isSaving}>
            {isSaving ? <ActivityIndicator size="small" color="#15476C" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
              <Text style={styles.inputLabel}>The amount deducted (Amount)</Text>
              <View style={styles.amountInputWrapper}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={amountLimit ? formatVND(parseInt(amountLimit.replace(/\./g, ''))) : ''}
                  onChangeText={setAmountLimit}
                  autoFocus
                />
                <Text style={styles.currencySuffix}>VNĐ</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.inputLabel}>Name</Text>
              <View style={styles.iconNameRow}>
                <View style={styles.iconInputWrapper}>
                  <Text style={styles.iconEmoji}>{budgetType === 'mandatory' ? '💼' : '🛒'}</Text>
                </View>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Shopping..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.inputLabel, {marginBottom: 12}]}>Budget type</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity 
                  style={[styles.typeBtn, budgetType === 'mandatory' && styles.typeBtnActive]}
                  onPress={() => setBudgetType('mandatory')}
                >
                  <Text style={[styles.typeBtnText, budgetType === 'mandatory' && styles.typeBtnTextActive]}>Mandatory</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, budgetType === 'non-recurring' && styles.typeBtnActive]}
                  onPress={() => setBudgetType('non-recurring')}
                >
                  <Text style={[styles.typeBtnText, budgetType === 'non-recurring' && styles.typeBtnTextActive]}>Non-recurring</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.inputLabel, {marginBottom: 12}]}>Which wallet should the money be withdrawn from?</Text>
              {isLoadingWallets ? (
                <ActivityIndicator size="small" color="#15476C" />
              ) : myWallets.length === 0 ? (
                <Text style={{color: '#EF4444', fontFamily: 'Poppins_400Regular'}}>Bạn chưa có ví cá nhân nào để trích tiền!</Text>
              ) : (
                myWallets.map((w) => (
                  <TouchableOpacity 
                    key={w.walletId} 
                    style={[styles.walletItem, selectedWalletId === w.walletId && styles.walletItemActive]}
                    onPress={() => setSelectedWalletId(w.walletId)}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={styles.walletIcon}><Ionicons name="wallet-outline" size={20} color="#15476C" /></View>
                      <View>
                        <Text style={styles.walletName}>{w.name}</Text>
                        <Text style={styles.walletBalance}>Remain: {formatVND(w.currentBalance)}đ</Text>
                      </View>
                    </View>
                    {selectedWalletId === w.walletId && <Feather name="check-circle" size={20} color="#10B981" />}
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={{height: 40}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' }, 
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  saveButton: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  saveButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#15476C' },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  
  inputLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#6B7280', marginBottom: 8 },
  amountInputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  amountInput: { fontFamily: 'Poppins_600SemiBold', fontSize: 40, color: '#10B981', minWidth: 60, textAlign: 'center' },
  currencySuffix: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#9CA3AF', marginLeft: 8, marginTop: 10 },
  
  iconNameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  iconInputWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E3F6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconEmoji: { fontSize: 24 },
  nameInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937' },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#15476C', borderColor: '#15476C' },
  typeBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#6B7280' },
  typeBtnTextActive: { color: '#FFF' },

  walletItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  walletItemActive: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  walletIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  walletName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },
  walletBalance: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' }
});