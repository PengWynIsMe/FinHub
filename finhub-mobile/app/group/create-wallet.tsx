import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Alert,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

export default function CreateSharedWalletScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ví chung!');
      return;
    }

    setIsSaving(true);
    try {
      // Gọi API tạo Shared Wallet theo đúng chuẩn GroupController.cs
      await axiosClient.post(`/Group/${groupId}/wallets`, {
        name: name.trim(),
      });
      
      Alert.alert('Thành công 🎉', 'Đã tạo Ví chung mới cho nhóm!', [
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
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Shared Wallet</Text>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]} 
            onPress={handleCreate} 
            disabled={isSaving}
          >
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
                    placeholder="Vd: Quỹ ăn uống chung..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                </View>
              </View>
            </View>

            <Text style={styles.helperText}>
              Ví chung là nơi để mọi thành viên trong nhóm có thể sử dụng tiền cùng nhau. Mọi giao dịch nạp/rút đều được ghi nhận công khai.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' }, // Theo tone màu của shared-wallet
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, 
  },
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
  
  helperText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 10, paddingHorizontal: 10, lineHeight: 20 }
});