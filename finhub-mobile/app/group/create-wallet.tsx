import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Alert,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const parseVND = (text: string) => parseInt(text.replace(/[^0-9]/g, '')) || 0;

export default function CreateSharedWalletScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState(''); // 💡 Thêm state cho Hạn mức
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ví chung!'); return;
    }
    const amount = parseVND(allocatedAmount);
    if (amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập hạn mức lớn hơn 0!'); return;
    }

    setIsSaving(true);
    try {
      // 💡 Gửi thêm allocatedAmount xuống Backend
      await axiosClient.post(`/Group/${groupId}/wallets`, {
        name: name.trim(),
        allocatedAmount: amount 
      });
      
      Alert.alert('Thành công 🎉', 'Đã tạo Ví chung và cấp hạn mức cho nhóm!', [
        { text: 'Tuyệt vời', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Lỗi tạo ví chung:', error);
      Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể tạo ví lúc này.');
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
          <Text style={styles.headerTitle}>Create Shared Wallet</Text>
          <TouchableOpacity style={[styles.saveButton, isSaving && { opacity: 0.6 }]} onPress={handleCreate} disabled={isSaving}>
            {isSaving ? <ActivityIndicator size="small" color="#15476C" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.content}>
            
            <View style={styles.card}>
              <View style={styles.iconNameRow}>
                <View style={styles.iconInputWrapper}>
                  <Text style={styles.iconEmoji}>💼</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.inputLabel}>Tên ví chung</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Vd: Quỹ ăn vặt của con..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                </View>
              </View>
            </View>

            {/* 💡 Ô NHẬP HẠN MỨC (ALLOCATED AMOUNT) */}
            <View style={styles.card}>
              <Text style={[styles.inputLabel, {marginBottom: 12}]}>Hạn mức cấp phép (Allocated)</Text>
              <View style={styles.amountInputWrapper}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={allocatedAmount ? formatVND(parseInt(allocatedAmount.replace(/\./g, ''))) : ''}
                  onChangeText={setAllocatedAmount}
                />
                <Text style={styles.currencySuffix}>VNĐ</Text>
              </View>
              <Text style={styles.helperText}>
                Đây là số tiền tối đa được phép chi tiêu. Hiện tại số dư thực tế trong ví sẽ là 0đ cho đến khi bạn nạp tiền vào.
              </Text>
            </View>

          </View>
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
  content: { paddingHorizontal: 20, paddingTop: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  iconNameRow: { flexDirection: 'row', alignItems: 'center' },
  iconInputWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E3F6FF', alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 28 },
  inputLabel: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#6B7280', marginBottom: 4 },
  nameInput: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', padding: 0, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', height: 36 },
  
  // 💡 STYLES CHO Ô NHẬP HẠN MỨC
  amountInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 64, marginBottom: 12 },
  amountInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: '#10B981', padding: 0 },
  currencySuffix: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#9CA3AF', marginLeft: 8 },
  helperText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF', lineHeight: 20 }
});