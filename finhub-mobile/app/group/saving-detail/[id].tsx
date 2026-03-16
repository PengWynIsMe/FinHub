import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, Modal, TextInput,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const parseVND = (text: string) => parseInt(text.replace(/[^0-9]/g, '')) || 0;

export default function SavingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ─── STATE QUẢN LÝ DỮ LIỆU ───
  const [goal, setGoal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── STATE CHO CÁC MODAL & ACTION ───
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTotalTarget, setEditTotalTarget] = useState('0');
  const [editMembers, setEditMembers] = useState<any[]>([]);

  const [isContributeModalVisible, setContributeModalVisible] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [myWallets, setMyWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [isContributing, setIsContributing] = useState(false);
  
  // State cho lúc bấm End Goal
  const [isEndingGoal, setIsEndingGoal] = useState(false);

  // 1. FETCH DỮ LIỆU TỪ BACKEND
  const fetchGoalDetail = async () => {
    try {
      const res = await axiosClient.get(`/Goal/${id}`);
      setGoal(res.data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết mục tiêu:", error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu mục tiêu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyWallets = async () => {
    try {
      const res = await axiosClient.get('/Wallet'); 
      const wallets = res.data.wallets || res.data; 
      setMyWallets(wallets);
      if (wallets.length > 0) {
        setSelectedWalletId(wallets[0].walletId); 
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách ví:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchGoalDetail();
        fetchMyWallets();
      }
    }, [id])
  );

  // 2. XỬ LÝ KẾT THÚC MỤC TIÊU (END GOAL)
  const handleEndGoal = () => {
    Alert.alert(
      "Kết thúc Mục tiêu 🎯",
      "Toàn bộ số tiền sẽ được gom lại và tạo thành một Ví chung mới cho nhóm. Bạn có chắc chắn muốn kết thúc?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Chuyển thành Ví", 
          style: "destructive",
          onPress: async () => {
            setIsEndingGoal(true);
            try {
              const res = await axiosClient.post(`/Goal/${id}/end`);
              Alert.alert('Tuyệt vời 🎉', 'Đã chuyển quỹ thành công! Bạn có thể xem ví mới ở trang Shared Wallet.');
              fetchGoalDetail(); // Tải lại dữ liệu để UI cập nhật trạng thái "Completed"
            } catch (error: any) {
              console.error('Lỗi end goal:', error);
              // Backend sẽ trả về lỗi 403 nếu người bấm không phải Admin
              Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể kết thúc quỹ lúc này.');
            } finally {
              setIsEndingGoal(false);
            }
          }
        }
      ]
    );
  };

  // 3. XỬ LÝ CHỈNH SỬA ĐỊNH MỨC
  const openEditModal = () => {
    if (!goal) return;
    setEditTotalTarget(goal.totalTarget.toString());
    setEditMembers(JSON.parse(JSON.stringify(goal.members || []))); 
    setEditModalVisible(true);
  };

  const handleMemberTargetChange = (memberId: string, text: string) => {
    const num = parseVND(text);
    const updatedMembers = editMembers.map(m => m.id === memberId ? { ...m, target: num } : m);
    setEditMembers(updatedMembers);
    const newTotal = updatedMembers.reduce((sum, m) => sum + m.target, 0);
    setEditTotalTarget(newTotal.toString());
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await axiosClient.put(`/Goal/${id}/settings`, {
        targetAmount: parseInt(editTotalTarget),
        members: editMembers.map(m => ({ userId: m.id, target: m.target }))
      });
      Alert.alert('Thành công', 'Đã cập nhật định mức quỹ!');
      setEditModalVisible(false);
      fetchGoalDetail();
    } catch (error) {
      console.error('Lỗi lưu cài đặt:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt lúc này.');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. XỬ LÝ NỘP TIỀN
  const handleContribute = async () => {
    const amount = parseVND(contributeAmount);
    if (amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!'); return;
    }
    if (!selectedWalletId) {
      Alert.alert('Lỗi', 'Vui lòng chọn ví để trích tiền!'); return;
    }

    setIsContributing(true);
    try {
      await axiosClient.post(`/Goal/${id}/contribute`, {
        amount: amount,
        sourceWalletId: selectedWalletId,
        note: `Đóng góp từ App vào quỹ`
      });
      
      Alert.alert('Tuyệt vời 🎉', 'Bạn đã đóng góp thành công!');
      setContributeModalVisible(false);
      setContributeAmount('');
      fetchGoalDetail(); 
      fetchMyWallets(); 
    } catch (error: any) {
      console.error('Lỗi nộp tiền:', error);
      Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể nộp tiền lúc này. Số dư có thể không đủ.');
    } finally {
      setIsContributing(false);
    }
  };

  if (isLoading || !goal) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#15476C" />
      </SafeAreaView>
    );
  }

  const totalProgress = goal.totalTarget > 0 ? Math.min((goal.totalSaved / goal.totalTarget) * 100, 100) : 0;
  const isCompleted = goal.status === 'Completed'; // Cờ kiểm tra trạng thái hoàn thành

  const renderMemberProgress = (member: any) => {
    const targetAmt = goal.goalType === 'Split' ? member.target : goal.totalTarget;
    const progress = targetAmt > 0 ? Math.min((member.contributed / targetAmt) * 100, 100) : 0;
    const barColor = progress === 100 ? '#10B981' : (progress > 50 ? '#3B82F6' : '#F59E0B');

    return (
      <View key={member.id} style={styles.memberProgressCard}>
        <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
        <View style={styles.memberProgressInfo}>
          <View style={styles.memberProgressHeader}>
            <Text style={styles.memberName}>{member.name}</Text>
            {progress === 100 && <Feather name="check-circle" size={16} color="#10B981" style={{marginLeft: 4}}/>}
          </View>
          <Text style={styles.memberAmountText}>
            <Text style={{color: barColor, fontFamily: 'Poppins_600SemiBold'}}>{formatVND(member.contributed)}đ</Text>
            {goal.goalType === 'Split' && ` / ${formatVND(member.target)}đ`}
          </Text>
          <View style={styles.miniProgressContainer}>
            <View style={[styles.miniProgressBar, { width: `${progress}%`, backgroundColor: barColor }]} />
          </View>
        </View>
        <Text style={[styles.percentText, { color: barColor }]}>{Math.round(progress)}%</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Detail</Text>
        
        {/* 💡 Chỉ hiện nút Cài đặt (Răng cưa) nếu quỹ đang Active */}
        {!isCompleted ? (
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Feather name="settings" size={24} color="#1F2937" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} /> // Giữ bố cục cân đối
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        
        {/* THẺ TỔNG QUAN */}
        <View style={[styles.overviewCard, isCompleted && { borderColor: '#10B981', borderWidth: 2 }]}>
          <View style={styles.iconCircle}>
            <Text style={styles.goalIcon}>{goal.icon}</Text>
          </View>
          <Text style={styles.goalName}>{goal.name}</Text>
          <View style={styles.badgeType}>
            <Text style={styles.badgeTypeText}>
              {goal.goalType === 'Split' ? '🎯 Định mức cá nhân' : '💸 Góp tùy tâm'}
            </Text>
          </View>
          
          <View style={styles.totalAmountRow}>
            <Text style={styles.totalSaved}>{formatVND(goal.totalSaved)}đ</Text>
            <Text style={styles.totalTarget}> / {formatVND(goal.totalTarget)}đ</Text>
          </View>

          <View style={styles.mainProgressContainer}>
            <View style={[styles.mainProgressBar, { width: `${totalProgress}%`, backgroundColor: isCompleted ? '#9CA3AF' : '#10B981' }]} />
          </View>
          <Text style={[styles.mainProgressText, isCompleted && { color: '#9CA3AF' }]}>
            {Math.round(totalProgress)}% {isCompleted ? 'Finished' : 'Completed'}
          </Text>
        </View>

        {/* 💡 ĐIỀU CHỈNH UI THEO TRẠNG THÁI (STATUS) */}
        {isCompleted ? (
          // NẾU ĐÃ KẾT THÚC: Hiện Badge Hoàn thành
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={24} color="#10B981" />
            <Text style={styles.completedBadgeText}>Quỹ mục tiêu này đã kết thúc</Text>
          </View>
        ) : (
          // NẾU ĐANG CHẠY: Hiện 2 nút Đóng góp & Kết thúc
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.btnContribute, { flex: 2 }]} 
              activeOpacity={0.8}
              onPress={() => setContributeModalVisible(true)}
            >
              <Ionicons name="wallet-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.btnContributeText}>Đóng góp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnEndGoal, { flex: 1 }]} 
              activeOpacity={0.8}
              onPress={handleEndGoal}
              disabled={isEndingGoal}
            >
              {isEndingGoal ? <ActivityIndicator color="#FF4267" /> : (
                <>
                  <Feather name="flag" size={18} color="#FF4267" style={{marginRight: 4}} />
                  <Text style={styles.btnEndGoalText}>Kết thúc</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TIẾN ĐỘ THÀNH VIÊN */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {goal.goalType === 'Split' ? 'Tiến độ từng người' : 'Thành viên đóng góp'}
          </Text>
        </View>
        <View style={styles.membersListContainer}>
          {goal.members?.map(renderMemberProgress)}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ─── MODAL 1: CHỈNH SỬA ĐỊNH MỨC (GIỮ NGUYÊN) ─── */}
      <Modal visible={isEditModalVisible} transparent={true} animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Điều chỉnh định mức</Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeModalBtn}>
                    <Feather name="x" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                  {goal.goalType === 'Flexible' ? (
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Tổng quỹ mục tiêu</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput style={styles.editInput} keyboardType="numeric" value={formatVND(parseInt(editTotalTarget) || 0)} onChangeText={(txt) => setEditTotalTarget(parseVND(txt).toString())} />
                        <Text style={styles.currencySuffix}>đ</Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.helperText}>Thay đổi số tiền mà mỗi thành viên cần đóng góp.</Text>
                      {editMembers.map((m) => (
                        <View key={m.id} style={styles.editRow}>
                          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                            <Image source={{ uri: m.avatar }} style={styles.editAvatar} />
                            <Text style={styles.editLabelName} numberOfLines={1}>{m.name}</Text>
                          </View>
                          <View style={styles.inputWrapper}>
                            <TextInput style={styles.editInput} keyboardType="numeric" value={formatVND(m.target)} onChangeText={(txt) => handleMemberTargetChange(m.id, txt)} />
                            <Text style={styles.currencySuffix}>đ</Text>
                          </View>
                        </View>
                      ))}
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>TỔNG QUỸ MỚI:</Text>
                        <Text style={styles.summaryValue}>{formatVND(parseInt(editTotalTarget))} VNĐ</Text>
                      </View>
                    </>
                  )}
                </ScrollView>

                <TouchableOpacity style={[styles.btnSave, isSaving && {opacity: 0.7}]} onPress={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSaveText}>Lưu thay đổi</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── MODAL 2: ĐÓNG GÓP TIỀN (GIỮ NGUYÊN) ─── */}
      <Modal visible={isContributeModalVisible} transparent={true} animationType="fade" onRequestClose={() => setContributeModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.modalOverlay, {justifyContent: 'center', paddingHorizontal: 20}]}>
              <View style={[styles.modalContent, { borderRadius: 24, paddingBottom: 24 }]}>
                
                <Text style={[styles.modalTitle, {textAlign: 'center', marginBottom: 8}]}>Đóng góp quỹ</Text>
                <Text style={{textAlign: 'center', color: '#6B7280', marginBottom: 20, fontFamily: 'Poppins_400Regular'}}>
                  Nhập số tiền và chọn nguồn tiền để góp.
                </Text>
                
                <View style={[styles.inputWrapper, {width: '100%', height: 64, marginBottom: 24, justifyContent: 'center'}]}>
                  <TextInput style={[styles.editInput, {fontSize: 28, textAlign: 'center'}]} keyboardType="numeric" placeholder="0" placeholderTextColor="#9CA3AF" autoFocus value={contributeAmount ? formatVND(parseInt(contributeAmount.replace(/\./g, ''))) : ''} onChangeText={setContributeAmount} />
                  <Text style={[styles.currencySuffix, {fontSize: 20, position: 'absolute', right: 20}]}>VNĐ</Text>
                </View>

                <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1F2937', marginBottom: 12}}>Trích tiền từ ví:</Text>
                {myWallets.length === 0 ? (
                  <Text style={{color: '#FF4267', fontFamily: 'Poppins_400Regular', marginBottom: 20}}>Bạn chưa có ví cá nhân nào để trích tiền!</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 24}}>
                    {myWallets?.map(w => (
                      <TouchableOpacity key={w.walletId || w.id} style={[{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: '#F3F4F6', marginRight: 12, backgroundColor: '#F9FAFB', minWidth: 120 }, selectedWalletId === (w.walletId || w.id) && { borderColor: '#15476C', backgroundColor: '#E3F6FF' }]} onPress={() => setSelectedWalletId(w.walletId || w.id)} activeOpacity={0.8}>
                        <Text style={[{fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#4B5563', marginBottom: 4}, selectedWalletId === (w.walletId || w.id) && { color: '#15476C' }]}>{w.name}</Text>
                        <Text style={{fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#10B981'}}>{formatVND(w.currentBalance || 0)}đ</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <View style={{flexDirection: 'row', gap: 12}}>
                  <TouchableOpacity style={[styles.btnSave, {flex: 1, backgroundColor: '#F3F4F6'}]} onPress={() => setContributeModalVisible(false)}><Text style={[styles.btnSaveText, {color: '#1F2937'}]}>Hủy</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.btnSave, {flex: 1}, (!selectedWalletId || !contributeAmount || isContributing) && {opacity: 0.5}]} disabled={!selectedWalletId || !contributeAmount || isContributing} onPress={handleContribute}>
                    {isContributing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnSaveText}>Xác nhận</Text>}
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ─── STYLES BỔ SUNG THÊM NÚT END GOAL VÀ BADGE HOÀN THÀNH ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  backButton: { padding: 4 }, editButton: { padding: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  overviewCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E3F6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  goalIcon: { fontSize: 32 },
  goalName: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  badgeType: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 20 },
  badgeTypeText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#6B7280' },
  totalAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  totalSaved: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#15476C' },
  totalTarget: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#9CA3AF' },
  mainProgressContainer: { width: '100%', height: 12, backgroundColor: '#F3F4F6', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  mainProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 6 },
  mainProgressText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#10B981', alignSelf: 'flex-end' },

  // 💡 Hàng chứa 2 Nút Đóng góp & Kết thúc
  actionButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  btnContribute: { flexDirection: 'row', backgroundColor: '#15476C', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnContributeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  btnEndGoal: { flexDirection: 'row', backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FFE4E6', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnEndGoalText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#FF4267' },

  // 💡 Badge Hoàn thành Quỹ
  completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', paddingVertical: 16, borderRadius: 20, marginBottom: 32, borderWidth: 1, borderColor: '#D1FAE5' },
  completedBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#059669', marginLeft: 8 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937' },
  
  membersListContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 32 },
  memberProgressCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#E5E7EB' },
  memberProgressInfo: { flex: 1, marginRight: 12 },
  memberProgressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  memberName: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#1F2937' },
  memberAmountText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 6 },
  miniProgressContainer: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  miniProgressBar: { height: '100%', borderRadius: 3 },
  percentText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, width: 40, textAlign: 'right' },

  // Modals Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  closeModalBtn: { padding: 4 },
  helperText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  editAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  editLabelName: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', flex: 1 },
  editLabel: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 44, width: 140 },
  editInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#15476C', textAlign: 'right', padding: 0 },
  currencySuffix: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#9CA3AF', marginLeft: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginBottom: 24 },
  summaryLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#6B7280' },
  summaryValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#FF4267' },
  btnSave: { height: 54, borderRadius: 27, backgroundColor: '#15476C', alignItems: 'center', justifyContent: 'center' },
  btnSaveText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
});