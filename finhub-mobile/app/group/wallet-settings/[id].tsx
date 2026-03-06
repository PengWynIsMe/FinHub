import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  Switch, 
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const MEMBERS = [
  { id: 'm1', name: 'Anh Minh', role: 'Admin', avatar: 'https://i.pravatar.cc/100?img=11' },
  { id: 'm2', name: 'Wyn', role: 'Member', avatar: 'https://i.pravatar.cc/100?img=12' },
];

export default function WalletSettingsScreen() {
  const router = useRouter();
  
  // State quản lý bật/tắt cảnh báo
  const [alertEnabled, setAlertEnabled] = useState(true);
  
  // State quản lý con số phần trăm do người dùng tự nhập (mặc định 50)
  const [threshold, setThreshold] = useState('50');

  // Hàm xử lý chỉ cho phép nhập số
  const handleThresholdChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    // Tùy chọn: Bạn có thể chặn không cho nhập quá 100 nếu muốn
    if (numericValue === '' || parseInt(numericValue) <= 100) {
      setThreshold(numericValue);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet Settings</Text>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* ─── ALERT SETTINGS ─── */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Alert Threshold</Text>
              <Text style={styles.helperText}>Get notified when a single transaction exceeds a percentage of the total budget.</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.rowLeft}>
                  <Feather name="bell" size={20} color="#F59E0B" />
                  <Text style={styles.settingLabel}>Unusual Tx Alert</Text>
                </View>
                <Switch 
                  value={alertEnabled} 
                  onValueChange={setAlertEnabled} 
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                />
              </View>

              {/* 🆕 Ô nhập liệu Threshold xuất hiện khi bật Switch */}
              {alertEnabled && (
                <View style={styles.thresholdBox}>
                  <Text style={styles.thresholdLabel}>Threshold</Text>
                  
                  <View style={styles.thresholdInputWrapper}>
                    <Text style={styles.thresholdPrefix}>{'>'}</Text>
                    <TextInput
                      style={styles.thresholdInput}
                      value={threshold}
                      onChangeText={handleThresholdChange}
                      keyboardType="number-pad"
                      maxLength={3} // Tối đa 3 chữ số (100)
                      selectTextOnFocus={true} // Bấm vào là bôi đen số cũ luôn cho tiện sửa
                    />
                    <Text style={styles.thresholdSuffix}>%</Text>
                    <Feather name="edit-2" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
                  </View>
                </View>
              )}
            </View>

            {/* ─── MANAGE MEMBERS (XÓA THÀNH VIÊN) ─── */}
            <View style={styles.card}>
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
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 }, headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 20 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 8 },
  helperText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF', marginBottom: 20 },
  
  // Alert Row
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#1F2937', marginLeft: 12 },
  
  // 🆕 Styles mới cho ô nhập Threshold
  thresholdBox: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#F9FAFB', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 12, 
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thresholdLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#1F2937' },
  thresholdInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdPrefix: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FF4267', marginRight: 4 },
  thresholdInput: {
    fontFamily: 'Poppins_600SemiBold', 
    fontSize: 16, 
    color: '#FF4267',
    padding: 0, // Xóa padding mặc định của TextInput trên Android
    minWidth: 24, // Để có chỗ gõ kể cả khi xóa hết số
    textAlign: 'center',
    // borderBottomWidth: 1, // Tạo đường gạch chân mỏng để gợi ý người dùng có thể nhập
    borderBottomColor: '#FF4267',
  },
  thresholdSuffix: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FF4267', marginLeft: 2 },

  // Members Row
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  mAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  mInfo: { flex: 1 },
  mName: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937' },
  mRole: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  removeBtn: { padding: 8, backgroundColor: '#FFF1F2', borderRadius: 12 },
});