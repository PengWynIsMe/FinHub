import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // 👈 Thêm useLocalSearchParams
import { COLORS } from '@/constants/theme';

export default function GroupMembersScreen() {
  const router = useRouter();
  
  // 💡 Hứng tham số groupName từ màn hình trước truyền sang
  const { groupName } = useLocalSearchParams<{ groupName: string }>();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleConfirm = () => {
    router.push('/group/invite-success');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create a Group</Text>

          <TouchableOpacity onPress={() => router.push('/(tabs)/group')}>
            <Text style={styles.skipButton}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Success Card */}
        <View style={styles.successCard}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Text style={styles.successCheck}>✓</Text>
          </View>

          <Text style={styles.successTitle}>Group Created!</Text>
          <Text style={styles.successSubtitle}>
            {/* 💡 Hiển thị tên nhóm động ở đây (Nếu không có thì để mặc định) */}
            Success! Your group <Text style={{fontWeight: 'bold', color: COLORS.primary}}>"{groupName || 'New Group'}"</Text> is ready. Now, let's add members.
          </Text>

          {/* Frequent Contacts Dropdown */}
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>Frequent Contacts</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#C7C7CC"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.orText}>or</Text>

          {/* Phone Input */}
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#C7C7CC"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Invite Button */}
          <TouchableOpacity style={styles.inviteButton} activeOpacity={0.8} onPress={handleConfirm}>
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>

          {/* Share Link Button */}
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
            <Text style={styles.shareButtonText}>
              Share Invite Link or Code
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            People you've shared with before will appear here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Giữ nguyên Stylesheet của bạn
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 4 },
  backText: { fontSize: 28, color: COLORS.black },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.black },
  skipButton: { fontSize: 16, color: COLORS.black, fontWeight: '500' },
  successCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successCheck: { fontSize: 40, color: COLORS.white, fontWeight: '700' },
  successTitle: { fontSize: 22, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  successSubtitle: { fontSize: 14, color: COLORS.gray500, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  dropdown: { width: '100%', height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#E5E5EA', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: COLORS.white },
  dropdownText: { fontSize: 16, color: '#C7C7CC' },
  chevron: { fontSize: 20, color: '#C7C7CC' },
  input: { width: '100%', height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#E5E5EA', paddingHorizontal: 20, fontSize: 16, marginBottom: 16, backgroundColor: COLORS.white },
  orText: { fontSize: 14, color: COLORS.gray500, marginVertical: 4 },
  inviteButton: { width: '100%', height: 50, backgroundColor: COLORS.primary, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 12 },
  inviteButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  shareButton: { width: '100%', height: 50, backgroundColor: '#E3F6FF', borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  shareButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  footerText: { fontSize: 12, color: COLORS.gray500, textAlign: 'center', lineHeight: 18 },
});