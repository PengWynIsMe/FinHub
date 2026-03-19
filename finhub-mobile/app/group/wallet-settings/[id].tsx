import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ScrollView, Platform, Switch, Image, TextInput,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const MEMBERS = [
  { id: 'm1', name: 'Anh Minh', role: 'Admin', avatar: 'https://i.pravatar.cc/100?img=11' },
  { id: 'm2', name: 'Wyn', role: 'Member', avatar: 'https://i.pravatar.cc/100?img=12' },
];

const formatVND = (amount: number) => amount.toLocaleString('vi-VN').replace(/,/g, '.');

export default function WalletSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(false);
  
  // 💡 State thông minh cho 2 Option: % hoặc VNĐ
  const [inputType, setInputType] = useState<'percent' | 'amount'>('amount');
  const [inputValue, setInputValue] = useState('');
  const [totalFunds, setTotalFunds] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchSettings = async () => {
        if (!id) return;
        try {
          const res = await axiosClient.get(`/Wallet/${id}/settings`);
          setAlertEnabled(res.data.alertEnabled);
          setTotalFunds(res.data.totalFunds || 0);
          
          if (res.data.maxAmount > 0) {
            setInputType('amount');
            setInputValue(formatVND(res.data.maxAmount));
          }
        } catch (error) {
          console.error("Lỗi lấy cài đặt ví:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSettings();
    }, [id])
  );

  const isPercent = inputType === 'percent';
  const numericValue = parseFloat(inputValue.replace(/\./g, '')) || 0;
  
  // final result
  const finalAmount = isPercent ? (numericValue / 100) * totalFunds : numericValue;
  
  const equivalentDisplay = isPercent
    ? `≈ ${formatVND(finalAmount)} VNĐ`
    : `≈ ${totalFunds > 0 ? ((numericValue / totalFunds) * 100).toFixed(1) : 0}% of total funds`;

  const handleInputChange = (text: string) => {
    if (isPercent) {
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      if (num > 100) setInputValue('100');
      else setInputValue(num ? num.toString() : '');
    } else {
      const num = text.replace(/[^0-9]/g, '');
      if (num) setInputValue(formatVND(parseInt(num)));
      else setInputValue('');
    }
  };

  const handleSave = async () => {
    if (alertEnabled && finalAmount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng thiết lập hạn mức lớn hơn 0.');
      return;
    }

    setIsSaving(true);
    try {
      await axiosClient.put(`/Wallet/${id}/settings`, {
        alertEnabled: alertEnabled,
        maxAmount: finalAmount 
      });
      Alert.alert('Thành công', 'Đã cập nhật giới hạn chi tiêu!');
      router.back();
    } catch (error) {
      console.error('Lỗi lưu cài đặt:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt lúc này.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#15476C" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* ─── HEADER ─── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet Settings</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator size="small" color="#15476C" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* ─── SMART APPROVAL SETTINGS ─── */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Smart Approval Workflow</Text>
              <Text style={styles.helperText}>Require members to send an expense request to the Admin if their transaction exceeds the limit.</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.rowLeft}>
                  <Feather name="shield" size={20} color="#F59E0B" />
                  <Text style={styles.settingLabel}>Require Approval</Text>
                </View>
                <Switch 
                  value={alertEnabled} 
                  onValueChange={setAlertEnabled} 
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                />
              </View>

              {alertEnabled && (
                <View style={styles.thresholdContainer}>
                  <View style={styles.thresholdHeader}>
                    <Text style={styles.thresholdLabel}>Max Amount Limit</Text>
                    
                    {/* Toggle Option % hoặc VNĐ */}
                    <View style={styles.toggleGroup}>
                      <TouchableOpacity 
                        style={[styles.toggleBtn, isPercent && styles.toggleActive]}
                        onPress={() => { setInputType('percent'); setInputValue(''); }}
                      >
                        <Text style={[styles.toggleText, isPercent && styles.toggleTextActive]}>%</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.toggleBtn, !isPercent && styles.toggleActive]}
                        onPress={() => { setInputType('amount'); setInputValue(''); }}
                      >
                        <Text style={[styles.toggleText, !isPercent && styles.toggleTextActive]}>VNĐ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.thresholdInputWrapper}>
                    <Text style={styles.thresholdPrefix}>{'>'}</Text>
                    <TextInput
                      style={styles.thresholdInput}
                      value={inputValue}
                      onChangeText={handleInputChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#D1D5DB"
                    />
                    <Text style={styles.thresholdSuffix}>{isPercent ? '%' : 'VNĐ'}</Text>
                  </View>

                  {/* quy đổi xấp xỉ bên dưới */}
                  {inputValue !== '' && (
                    <Text style={styles.approxText}>{equivalentDisplay}</Text>
                  )}
                </View>
              )}
            </View>

            {/* ─── MANAGE MEMBERS ─── */}
            {/* <View style={styles.card}>
              <Text style={styles.sectionTitle}>Manage Members</Text>
              {MEMBERS.map(member => (
                <View key={member.id} style={styles.memberRow}>
                  <Image source={{ uri: member.avatar }} style={styles.mAvatar} />
                  <View style={styles.mInfo}>
                    <Text style={styles.mName}>{member.name}</Text>
                    <Text style={styles.mRole}>{member.role}</Text>
                  </View>
                  {member.role !== 'Admin' && (
                    <TouchableOpacity style={styles.removeBtn}>
                      <Feather name="trash-2" size={20} color="#FF4267" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View> */}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 }, 
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  saveButton: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  saveButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#15476C' },
  
  scrollContent: { paddingHorizontal: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 20 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 8 },
  helperText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF', marginBottom: 20, lineHeight: 20 },
  
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#1F2937', marginLeft: 12 },
  
  // Threshold Box
  thresholdContainer: { backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  thresholdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  thresholdLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#4B5563' },
  
  toggleGroup: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 8, padding: 2 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  toggleActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#6B7280' },
  toggleTextActive: { color: '#1F2937' },

  thresholdInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#D1D5DB' },
  thresholdPrefix: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#FF4267', marginRight: 8 },
  thresholdInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#FF4267', padding: 0 },
  thresholdSuffix: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FF4267', marginLeft: 8 },
  
  approxText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF', marginTop: 8, textAlign: 'right', fontStyle: 'italic' },

  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  mAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  mInfo: { flex: 1 },
  mName: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937' },
  mRole: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  removeBtn: { padding: 8, backgroundColor: '#FFF1F2', borderRadius: 12 },
});