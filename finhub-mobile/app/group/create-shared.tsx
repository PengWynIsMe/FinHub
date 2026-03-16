import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, TextInput, Image, ActivityIndicator,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const parseVND = (text: string) => parseInt(text.replace(/[^0-9]/g, '')) || 0;

export default function CreateSharedScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  // ─── STATE QUẢN LÝ DỮ LIỆU FORM ───
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [goalType, setGoalType] = useState<'Flexible' | 'Split'>('Flexible');
  
  // Dùng cho Flexible
  const [flexibleTarget, setFlexibleTarget] = useState(''); 
  
  // Dùng cho Split
  const [members, setMembers] = useState<any[]>([]); 

  // 1. TỰ ĐỘNG LẤY DANH SÁCH THÀNH VIÊN NHÓM ĐỂ CHUẨN BỊ CHO CHẾ ĐỘ SPLIT
  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!groupId) return;
      try {
        // Tận dụng API GetMyGroups để lọc ra nhóm hiện tại và lấy Members
        const res = await axiosClient.get('/Group');
        const currentGroup = res.data.find((g: any) => g.id === groupId);
        
        if (currentGroup && currentGroup.members) {
          // Khởi tạo target = 0 cho tất cả thành viên
          const mappedMembers = currentGroup.members.map((m: any) => ({
            userId: m.id,
            name: m.name || m.fullName,
            avatar: m.avatar || `https://ui-avatars.com/api/?name=${m.name}&background=15476C&color=fff`,
            target: 0
          }));
          setMembers(mappedMembers);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin nhóm:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    fetchGroupMembers();
  }, [groupId]);

  // 2. XỬ LÝ KHI GÕ TIỀN CHO TỪNG THÀNH VIÊN (CHẾ ĐỘ SPLIT)
  const handleMemberTargetChange = (userId: string, text: string) => {
    const num = parseVND(text);
    setMembers(prev => prev.map(m => m.userId === userId ? { ...m, target: num } : m));
  };

  // Tính tổng tiền nếu đang ở chế độ Split
  const totalSplitTarget = members.reduce((sum, m) => sum + m.target, 0);

  // 3. GỬI DATA LÊN BACKEND ĐỂ TẠO GOAL
  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên mục tiêu!');
      return;
    }

    let finalTotal = goalType === 'Flexible' ? parseVND(flexibleTarget) : totalSplitTarget;
    if (finalTotal <= 0) {
      Alert.alert('Lỗi', 'Số tiền mục tiêu phải lớn hơn 0!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        groupId,
        name: name.trim(),
        icon: icon.trim() || '🎯',
        goalType,
        targetAmount: goalType === 'Flexible' ? finalTotal : 0,
        members: goalType === 'Split' ? members.map(m => ({ userId: m.userId, target: m.target })) : []
      };

      await axiosClient.post('/Goal', payload);
      
      Alert.alert('Thành công 🎉', 'Đã tạo quỹ mục tiêu mới!', [
        { text: 'Tuyệt vời', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Lỗi tạo quỹ:', error);
      Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể tạo quỹ lúc này.');
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
          <Text style={styles.headerTitle}>Create Saving Goal</Text>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]} 
            onPress={handleCreate} 
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator size="small" color="#15476C" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* ─── CARD 1: THÔNG TIN CƠ BẢN ─── */}
            <View style={styles.card}>
              <View style={styles.iconNameRow}>
                <View style={styles.iconInputWrapper}>
                  <TextInput
                    style={styles.iconInput}
                    value={icon}
                    onChangeText={setIcon}
                    maxLength={2} // Chỉ cho nhập 1-2 emoji
                    placeholder="🎯"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.inputLabel}>Tên quỹ mục tiêu</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Vd: Quỹ đi Đà Lạt..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            {/* ─── CARD 2: CHỌN LOẠI QUỸ ─── */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Hình thức góp quỹ</Text>
              
              <View style={styles.typeContainer}>
                {/* Option 1: Flexible */}
                <TouchableOpacity 
                  style={[styles.typeBox, goalType === 'Flexible' && styles.typeBoxActive]}
                  onPress={() => setGoalType('Flexible')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, goalType === 'Flexible' && styles.radioCircleActive]}>
                    {goalType === 'Flexible' && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.typeTitle, goalType === 'Flexible' && styles.typeTitleActive]}>💸 Góp tùy tâm</Text>
                  <Text style={styles.typeDesc}>Mọi người góp chung vào một quỹ tổng, không bắt buộc định mức cá nhân.</Text>
                </TouchableOpacity>

                {/* Option 2: Split */}
                <TouchableOpacity 
                  style={[styles.typeBox, goalType === 'Split' && styles.typeBoxActive]}
                  onPress={() => setGoalType('Split')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, goalType === 'Split' && styles.radioCircleActive]}>
                    {goalType === 'Split' && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.typeTitle, goalType === 'Split' && styles.typeTitleActive]}>🎯 Chia định mức</Text>
                  <Text style={styles.typeDesc}>Thiết lập số tiền cụ thể mà mỗi thành viên cần phải đóng góp.</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ─── CARD 3: THIẾT LẬP SỐ TIỀN ─── */}
            <View style={styles.card}>
              {goalType === 'Flexible' ? (
                // UI CHO FLEXIBLE MODE
                <View>
                  <Text style={styles.sectionTitle}>Tổng quỹ mục tiêu</Text>
                  <View style={styles.bigInputWrapper}>
                    <TextInput
                      style={styles.bigInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#D1D5DB"
                      value={flexibleTarget ? formatVND(parseInt(flexibleTarget.replace(/\./g, ''))) : ''}
                      onChangeText={(txt) => setFlexibleTarget(txt)}
                    />
                    <Text style={styles.currencySuffixBig}>VNĐ</Text>
                  </View>
                </View>
              ) : (
                // UI CHO SPLIT MODE
                <View>
                  <Text style={styles.sectionTitle}>Chia định mức thành viên</Text>
                  {isLoadingMembers ? (
                    <ActivityIndicator size="small" color="#15476C" style={{ marginTop: 10 }} />
                  ) : (
                    <>
                      {members.map((m) => (
                        <View key={m.userId} style={styles.memberRow}>
                          <Image source={{ uri: m.avatar }} style={styles.memberAvatar} />
                          <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                          <View style={styles.smallInputWrapper}>
                            <TextInput
                              style={styles.smallInput}
                              keyboardType="numeric"
                              placeholder="0"
                              value={m.target > 0 ? formatVND(m.target) : ''}
                              onChangeText={(txt) => handleMemberTargetChange(m.userId, txt)}
                            />
                            <Text style={styles.currencySuffixSmall}>đ</Text>
                          </View>
                        </View>
                      ))}

                      {/* Hiển thị tự động tính tổng */}
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>TỔNG CỘNG:</Text>
                        <Text style={styles.summaryValue}>{formatVND(totalSplitTarget)} VNĐ</Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// ─── STYLES ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  saveButton: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#E3F6FF', borderRadius: 16 },
  saveButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#15476C' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  
  // Basic Info
  iconNameRow: { flexDirection: 'row', alignItems: 'center' },
  iconInputWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E3F6FF', alignItems: 'center', justifyContent: 'center' },
  iconInput: { fontSize: 32, textAlign: 'center' },
  inputLabel: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#6B7280', marginBottom: 4 },
  nameInput: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', padding: 0, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', height: 36 },
  
  // Goal Type
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937', marginBottom: 16 },
  typeContainer: { gap: 12 },
  typeBox: { borderWidth: 2, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, backgroundColor: '#F9FAFB' },
  typeBoxActive: { borderColor: '#15476C', backgroundColor: '#E3F6FF' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', position: 'absolute', top: 16, right: 16, alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: '#15476C' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#15476C' },
  typeTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#4B5563', marginBottom: 4 },
  typeTitleActive: { color: '#15476C' },
  typeDesc: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280', paddingRight: 24 },
  
  // Flexible Target
  bigInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 64 },
  bigInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: '#10B981', padding: 0 },
  currencySuffixBig: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#9CA3AF', marginLeft: 8 },
  
  // Split Target
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#E5E7EB' },
  memberName: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', paddingRight: 8 },
  smallInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 44, width: 130 },
  smallInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#10B981', textAlign: 'right', padding: 0 },
  currencySuffixSmall: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#9CA3AF', marginLeft: 4 },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  summaryLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#6B7280' },
  summaryValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#10B981' },
});