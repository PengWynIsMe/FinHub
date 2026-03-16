import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Image, Modal, ActivityIndicator, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'; 
import axiosClient from '@/api/axiosClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; // 💡 IMPORT THƯ VIỆN QR

export default function MemberManagementScreen() {
  const router = useRouter();
  
  // Hứng id của nhóm từ màn hình trước truyền sang
  const { id } = useLocalSearchParams<{ id: string }>();

  const [members, setMembers] = useState<any[]>([]);
  const [groupInfo, setGroupInfo] = useState<any>({
  removeModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  removeModalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginHorizontal: 32, width: '85%' },
  removeModalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 8 },
  removeModalMessage: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 20 },
  removeModalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  removeModalCancel: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6' },
  removeModalCancelText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#374151' },
  removeModalConfirm: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FF4267' },
  removeModalConfirmText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#fff' },
});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [myRole, setMyRole] = useState<string>('Member');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // 💡 LẤY DỮ LIỆU THẬT TỪ API
  const fetchMembers = async () => {
    if (!id) {
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không tìm thấy ID của nhóm!');
      return;
    }
    
    try {
      const res = await axiosClient.get(`/Group/${id}/members`);
      setGroupInfo({
        name: res.data.groupName,
        inviteCode: res.data.inviteCode
      });
      setMembers(res.data.members);
      // Lấy role của user hiện tại từ API (nếu backend trả về)
      setMyRole(res.data.myRole ?? 'Member');
    } catch (error) {
      console.error("Lỗi lấy thành viên:", error);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu thành viên');
    } finally {
      setIsLoading(false); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchMembers();
    }, [id])
  );

  // 💡 HÀM COPY MÃ MỜI
  const handleCopyCode = async () => {
    if (groupInfo.inviteCode) {
      await Clipboard.setStringAsync(groupInfo.inviteCode);
      Alert.alert('Đã copy', 'Mã mời đã được sao chép vào khay nhớ tạm!');
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    try {
      await axiosClient.delete(`/Group/${id}/members/${selectedMember.id}`);
      setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
    } catch (error: any) {
      Alert.alert("Lỗi", error?.response?.data?.Message ?? "Không thể xóa thành viên.");
    } finally {
      setShowRemoveModal(false);
      setSelectedMember(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#15476C" />
      </SafeAreaView>
    );
  }

  // 💡 DATA NHÚNG VÀO MÃ QR ĐỂ APP HIỂU ĐÂY LÀ LỜI MỜI VÀO NHÓM
  const inviteQrData = JSON.stringify({
    action: 'join_group',
    groupId: id,
    inviteCode: groupInfo.inviteCode,
    groupName: groupInfo.name
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Management</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── Group Summary Info ─── */}
        <View style={styles.groupSummaryRow}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=200&auto=format&fit=crop' }} 
            style={styles.groupImage} 
          />
          <Text style={styles.groupName}>{groupInfo.name || 'Group Name'}</Text>
        </View>

        {/* ─── NÚT ADD MEMBER (Mở Modal xem Code & QR) ─── */}
        <TouchableOpacity 
          style={styles.addCard} 
          activeOpacity={0.8}
          onPress={() => setAddModalVisible(true)}
        >
          <View style={styles.addCircle}>
            <Feather name="plus" size={24} color="#FFFFFF" />
          </View>
          <Text style={{marginTop: 12, fontFamily: 'Poppins_500Medium', color: '#6B7280'}}>Invite Members</Text>
        </TouchableOpacity>

        {/* ─── Danh sách thành viên ─── */}
        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <Image source={{ uri: member.avatar }} style={styles.avatarImg} />
            
            <View style={styles.memberInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.memberName}>{member.name}</Text>
                {member.canViewAll && (
                  <View style={styles.globalViewBadge}>
                    <Feather name="shield" size={12} color="#F59E0B" />
                  </View>
                )}
              </View>
              
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>
                  Role : <Text style={styles.roleBold}>{member.role}</Text>
                </Text>
              </View>
            </View>

            {myRole === 'Admin' && member.role !== 'Admin' && (
              <TouchableOpacity
                style={styles.moreButton}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedMember(member);
                  setShowRemoveModal(true);
                }}
              >
                <Feather name="more-horizontal" size={24} color="#1F2937" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── MODAL: HIỂN THỊ MÃ MỜI VÀ QR CODE ─── */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite to Group</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeModalBtn}>
                <Feather name="x" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Quét mã QR hoặc chia sẻ mã Code này để mời bạn bè tham gia nhóm của bạn.
            </Text>

            {/* 💡 VÙNG VẼ QR CODE */}
            {groupInfo.inviteCode ? (
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={inviteQrData}
                  size={180}
                  color="#15476C"
                  backgroundColor="#FFFFFF"
                  logo={{ uri: 'https://ui-avatars.com/api/?name=G&background=15476C&color=fff' }} 
                  logoSize={36}
                  logoBackgroundColor='#fff'
                  logoBorderRadius={18}
                />
              </View>
            ) : null}

            {/* 💡 Ô Hiển thị Mã Text để Copy (Dự phòng) */}
            <TouchableOpacity 
                style={styles.codeContainer} 
                activeOpacity={0.7} 
                onPress={handleCopyCode}
            >
                <Text style={styles.codeText}>{groupInfo.inviteCode}</Text>
                <Feather name="copy" size={20} color="#15476C" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnSubmit}
              activeOpacity={0.8}
              onPress={() => setAddModalVisible(false)}
            >
              <Text style={styles.btnText}>Done</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* ─── MODAL XÁC NHẬN XÓA THÀNH VIÊN ─── */}
      {showRemoveModal && (
        <View style={styles.removeModalOverlay}>
          <View style={styles.removeModalBox}>
            <Text style={styles.removeModalTitle}>Xóa thành viên?</Text>
            <Text style={styles.removeModalMessage}>
              Bạn có chắc muốn xóa <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{selectedMember?.name}</Text> khỏi nhóm không?
            </Text>
            <View style={styles.removeModalActions}>
              <TouchableOpacity
                style={styles.removeModalCancel}
                onPress={() => { setShowRemoveModal(false); setSelectedMember(null); }}
              >
                <Text style={styles.removeModalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeModalConfirm} onPress={handleRemoveMember}>
                <Text style={styles.removeModalConfirmText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

// ─── STYLES (Cập nhật để hiển thị QR Code đẹp hơn) ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  groupSummaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  groupImage: { width: 60, height: 60, borderRadius: 12, marginRight: 16 },
  groupName: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  addCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  addCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#AFAEE1', alignItems: 'center', justifyContent: 'center' },
  memberCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  avatarImg: { width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: '#F3F4F6' },
  memberInfo: { flex: 1, justifyContent: 'center' },
  memberName: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#1F2937' },
  globalViewBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  rolePill: { backgroundColor: '#7D96A7', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#FFFFFF' },
  roleBold: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  moreButton: { padding: 8, alignSelf: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  closeModalBtn: { padding: 4 },
  modalSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 20, textAlign: 'center' },
  
  // 💡 STYLE CHO BỌC QR CODE
  qrCodeWrapper: { alignSelf: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, marginBottom: 20 },

  codeContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  codeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937', flex: 1, marginRight: 10, textAlign: 'center', letterSpacing: 2 },
  
  btnSubmit: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: '#15476C' },
  btnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  removeModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  removeModalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginHorizontal: 32, width: '85%' },
  removeModalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 8 },
  removeModalMessage: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 20 },
  removeModalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  removeModalCancel: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6' },
  removeModalCancelText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#374151' },
  removeModalConfirm: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FF4267' },
  removeModalConfirmText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#fff' },
});