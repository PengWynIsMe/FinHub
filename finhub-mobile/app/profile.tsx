import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, TextInput, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axiosClient from '@/api/axiosClient';
import { useAuthStore } from '@/stores/auth.store';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  
  const authUser = useAuthStore((state: any) => state.user);
  const updateUser = useAuthStore((state: any) => state.updateUser);
  // 💡 Lấy hàm logout từ Zustand Store
  const logout = useAuthStore((state: any) => state.logout);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get('/User/me');
        const u = res.data;
        setName(u.fullName || '');
        setNickname(u.nickname || '');
        setAvatarUri(u.avatarUrl || null);
      } catch (error) {
        console.error('Lỗi lấy profile:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosClient.put('/User/me', { fullName: name, nickname });
      updateUser({ fullName: name, nickname });
      Alert.alert('Thành công', 'Đã cập nhật thông tin!');
      router.back();
    } catch (error) {
      console.error('Lỗi lưu profile:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin lúc này.');
    } finally {
      setIsSaving(false);
    }
  };

  // 💡 Hàm xử lý Đăng xuất
  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive", // Nút màu đỏ
          onPress: async () => {
            try {
              await logout(); // Gọi hàm xóa token trong store
              router.replace('/(auth)/login'); // Đẩy về trang Login dựa theo cấu trúc thư mục của bạn
            } catch (error) {
              console.error("Lỗi khi đăng xuất:", error);
            }
          }
        }
      ]
    );
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=15476C&color=fff`;

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
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? <ActivityIndicator size="small" color="#15476C" />
              : <Text style={styles.saveButtonText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* ─── PROFILE CARD ─── */}
            <View style={styles.card}>
              <View style={styles.avatarSection}>
                <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8} onPress={pickImage}>
                  <Image source={{ uri: avatarUri || defaultAvatar }} style={styles.avatarImg} />
                  <View style={styles.editBadge}>
                    <Feather name="camera" size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.helperText}>Tap to change avatar</Text>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />

              <Text style={styles.inputLabel}>Nickname</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="What should we call you?"
              />
            </View>

            {/* ─── SETTINGS MENU ─── */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/my-accounts')}>
                <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={22} color="#0284C7" />
                </View>
                <View style={styles.menuTextContent}>
                  <Text style={styles.menuTitle}>My Accounts</Text>
                  <Text style={styles.menuSubtitle}>Manage Cash, Banks, E-wallets</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Feather name="settings" size={20} color="#D97706" />
                </View>
                <View style={styles.menuTextContent}>
                  <Text style={styles.menuTitle}>Preferences</Text>
                  <Text style={styles.menuSubtitle}>Currency, Language</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={[styles.menuIconBox, { backgroundColor: '#D1FAE5' }]}>
                  <Feather name="shield" size={20} color="#059669" />
                </View>
                <View style={styles.menuTextContent}>
                  <Text style={styles.menuTitle}>Security</Text>
                  <Text style={styles.menuSubtitle}>App PIN, Biometrics</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* 💡 GẮN HÀM XỬ LÝ VÀO NÚT LOGOUT */}
            <TouchableOpacity 
              style={styles.logoutButton} 
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E3F6FF', borderRadius: 16, minWidth: 60, alignItems: 'center' },
  saveButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#15476C' },
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, position: 'relative', marginBottom: 8, borderWidth: 3, borderColor: '#E3F6FF' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 50 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#15476C', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  helperText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' },
  inputLabel: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#6B7280', marginBottom: 8, marginLeft: 4 },
  input: { height: 50, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuIconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuTextContent: { flex: 1 },
  menuTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' },
  menuSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  logoutButton: { marginTop: 16, paddingVertical: 16, borderRadius: 20, backgroundColor: '#FFF1F2', alignItems: 'center' },
  logoutText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FF4267' },
});