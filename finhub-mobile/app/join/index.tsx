import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Keyboard,
  TouchableWithoutFeedback, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

export default function JoinGroupScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Gọi API tham gia nhóm
      await axiosClient.post('/Group/join', { inviteCode: code.trim() });
      
      Alert.alert('Thành công 🎉', 'Chào mừng bạn đã gia nhập nhóm!', [
        { 
          text: 'Tuyệt vời', 
          onPress: () => router.back() // Quay về trang danh sách nhóm
        } 
      ]);
    } catch (error: any) {
      console.error('Lỗi khi join group:', error);
      Alert.alert(
        'Không thể tham gia', 
        error.response?.data?.Message || 'Mã mời không hợp lệ hoặc nhóm không tồn tại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            {/* Illustration Icon */}
            <View style={styles.iconWrapper}>
              <View style={styles.iconCircle}>
                <Feather name="users" size={40} color="#15476C" />
              </View>
              <View style={styles.linkBadge}>
                <Feather name="link" size={16} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.title}>Join a Group</Text>
            <Text style={styles.subtitle}>
              Enter the invite code shared by your friend or family member to join their shared wallet.
            </Text>

            {/* Input Box */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Invite Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste code here (e.g. 123e4567-...)"
                placeholderTextColor="#9CA3AF"
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Nút Join */}
            <TouchableOpacity 
              style={[styles.joinButton, (!code.trim() || isLoading) && styles.joinButtonDisabled]}
              activeOpacity={0.8}
              disabled={!code.trim() || isLoading}
              onPress={handleJoin}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>Join Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 10 },
  backButton: { padding: 4, alignSelf: 'flex-start' },
  
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  
  iconWrapper: { alignSelf: 'center', marginBottom: 24, position: 'relative' },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#E3F6FF', alignItems: 'center', justifyContent: 'center' },
  linkBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#F9FAFB' },
  
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 40, paddingHorizontal: 10 },
  
  inputContainer: { marginBottom: 32 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 8, marginLeft: 4 },
  input: { height: 60, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 20, fontSize: 16, color: '#1F2937', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  
  joinButton: { height: 56, backgroundColor: '#15476C', borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#15476C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  joinButtonDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  joinButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});