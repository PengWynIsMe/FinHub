import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

// ─── DỮ LIỆU GIẢ LẬP ────────────────────────────────────────────────────────
const MOCK_MEMBERS = [
  {
    id: '1',
    name: 'Anh Minh',
    role: 'Admin',
    balance: '500.000',
    avatar: 'https://i.pravatar.cc/100?img=11',
    canViewAll: true, // Quyền xem toàn bộ ví
  },
  {
    id: '2',
    name: 'Wyn',
    role: 'Member',
    balance: '500.000',
    avatar: 'https://i.pravatar.cc/100?img=12',
    canViewAll: false,
  },
];

export default function MemberManagementScreen() {
  const router = useRouter();
  const [members, setMembers] = useState(MOCK_MEMBERS);
  
  // ─── STATE QUẢN LÝ MODAL THÊM THÀNH VIÊN ───
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [inviteInput, setInviteInput] = useState('');

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
          <Text style={styles.groupName}>My Family {'<'}3</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.eyeIcon}>
            <Feather name="eye" size={24} color="#8A92A6" />
          </TouchableOpacity>
        </View>

        {/* ─── NÚT ADD MEMBER (Mở Modal) ─── */}
        <TouchableOpacity 
          style={styles.addCard} 
          activeOpacity={0.8}
          onPress={() => setAddModalVisible(true)} // 🆕 Kích hoạt Modal
        >
          <View style={styles.addCircle}>
            <Feather name="plus" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* ─── Danh sách thành viên ─── */}
        {members.map((member) => (
          <TouchableOpacity 
            key={member.id} 
            style={styles.memberCard}
            activeOpacity={0.8}
            onPress={() => router.push(`/group/member-detail/${member.id}`)} // 🆕 Chuyển sang trang Detail
          >
            <Image source={{ uri: member.avatar }} style={styles.avatarImg} />
            
            <View style={styles.memberInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.memberName}>{member.name}</Text>
                {/* 🆕 Hiển thị Badge nếu có quyền Global View */}
                {member.canViewAll && (
                  <View style={styles.globalViewBadge}>
                    <Feather name="eye" size={12} color="#F59E0B" />
                  </View>
                )}
              </View>
              
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>
                  Role : <Text style={styles.roleBold}>{member.role}</Text>
                </Text>
              </View>

              <Text style={styles.balanceText}>
                Balance: {member.balance}
              </Text>
            </View>

            <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
              <Feather name="more-horizontal" size={24} color="#1F2937" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── 🆕 MODAL: THÊM THÀNH VIÊN MỚI ─── */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                
                {/* Header Modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add New Member</Text>
                  <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeModalBtn}>
                    <Feather name="x" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Form nhập liệu */}
                <Text style={styles.inputLabel}>Invite via Email or Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or phone number"
                  placeholderTextColor="#CACACA"
                  value={inviteInput}
                  onChangeText={setInviteInput}
                  autoCapitalize="none"
                />

                {/* Nút Send Invite */}
                <TouchableOpacity 
                  style={[styles.btnSubmit, inviteInput.trim() ? styles.btnActive : styles.btnDisabled]}
                  activeOpacity={0.8}
                  disabled={!inviteInput.trim()}
                  onPress={() => {
                    console.log("Inviting:", inviteInput);
                    setInviteInput('');
                    setAddModalVisible(false);
                  }}
                >
                  <Text style={[styles.btnText, !inviteInput.trim() && styles.btnTextDisabled]}>
                    Send Invite
                  </Text>
                </TouchableOpacity>

                {/* Hoặc Share Link */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.btnShareLink} activeOpacity={0.7}>
                  <Feather name="link" size={20} color="#15476C" style={{ marginRight: 8 }} />
                  <Text style={styles.btnShareLinkText}>Share Invite Link</Text>
                </TouchableOpacity>

              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Group Summary
  groupSummaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  groupImage: { width: 60, height: 60, borderRadius: 12, marginRight: 16 },
  groupName: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937' },
  eyeIcon: { padding: 8 },

  // Add Card
  addCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  addCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#AFAEE1', alignItems: 'center', justifyContent: 'center' },

  // Member Card
  memberCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  avatarImg: { width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: '#F3F4F6' },
  memberInfo: { flex: 1, justifyContent: 'center' },
  memberName: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#1F2937' },
  globalViewBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  rolePill: { backgroundColor: '#7D96A7', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  roleText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#FFFFFF' }, // Chữ trắng trên nền pill xám nhìn sẽ rõ hơn
  roleBold: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  balanceText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#1F2937' },
  moreButton: { padding: 8, alignSelf: 'flex-start' },

  // ─── STYLES CHO MODAL THÊM THÀNH VIÊN ───
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1F2937' },
  closeModalBtn: { padding: 4 },
  
  inputLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#4B5563', marginBottom: 8 },
  input: { height: 54, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, fontFamily: 'Poppins_400Regular', fontSize: 15, color: '#1F2937', marginBottom: 24, backgroundColor: '#F9FAFB' },
  
  btnSubmit: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  btnActive: { backgroundColor: '#15476C' },
  btnDisabled: { backgroundColor: '#E5E7EB' },
  btnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  btnTextDisabled: { color: '#9CA3AF' },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#9CA3AF', marginHorizontal: 16 },

  btnShareLink: { flexDirection: 'row', height: 54, borderRadius: 27, borderWidth: 2, borderColor: '#15476C', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21, 71, 108, 0.05)' },
  btnShareLinkText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#15476C' },
});