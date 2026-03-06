import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axiosClient from '@/api/axiosClient';
import { Alert } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';

const THEME_COLORS = ['#3B82F6', '#10B981', '#FF4267', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function CreateSharedScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  
  
  // ─── 1. PHÂN TÍCH PARAMS TỪ TRANG TRƯỚC TRUYỀN SANG ───
  const params = useLocalSearchParams();
  const type =
  params.type === 'goal'
    ? 'goal'
    : params.type === 'budget'
    ? 'budget'
    : 'wallet'; // Đang thao tác với Goal hay Wallet?
  const action = params.action === 'edit' ? 'edit' : 'create'; // Đang Sửa hay Tạo mới?

  // ─── 2. KHỞI TẠO STATE (Tự động lấy data cũ nếu là chế độ Edit) ───
  const [name, setName] = useState((params.name as string) || '');
  const [amount, setAmount] = useState((params.amount as string) || '');
  const [color, setColor] = useState((params.color as string) || THEME_COLORS[0]);
  const [imageUri, setImageUri] = useState<string | null>((params.imageUri as string) || null);

  // ─── 3. TỰ ĐỘNG THAY ĐỔI TEXT UI THEO NGỮ CẢNH ───
  const isWallet = type === 'wallet';
  const isEdit = action === 'edit';

  const headerTitle = isEdit
  ? `Edit ${type === 'wallet' ? 'Wallet' : type === 'goal' ? 'Goal' : 'Budget'}`
  : `Create New ${type === 'wallet' ? 'Wallet' : type === 'goal' ? 'Goal' : 'Budget'}`;
  const nameLabel =
  type === 'wallet'
    ? 'Wallet Name'
    : type === 'goal'
    ? 'Goal Name'
    : 'Budget Name';
  const namePlaceholder =
  type === 'wallet'
    ? 'e.g. Daily Groceries'
    : type === 'goal'
    ? 'e.g. Family Trip to Japan'
    : 'e.g. Monthly Budget';
  const amountLabel =
  type === 'wallet'
    ? 'Allocated Amount (VNĐ)'
    : type === 'goal'
    ? 'Target Amount (VNĐ)'
    : 'Budget Amount (VNĐ)';

  const isFormValid = name.trim().length > 0 && amount.toString().trim().length > 0;

  // ─── 4. CÁC HÀM XỬ LÝ ───
  const handleAmountChange = (text: string) => {
    setAmount(text.replace(/[^0-9]/g, ''));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // console.log(`Submitting ${action} for ${type}:`, { name, amount, color, imageUri });
    console.log("USER:", user);
    if (type === 'budget' && action === 'create') {
      try {
        const budgetData = {
          name: name,               
          amountLimit: parseFloat(amount),
          color: color,             
          icon: "💰",               
          walletId: user?.primaryWalletId,
          categoryId: "497ef09b-33f7-4ec2-8805-cb86a9a0aae0", 
          budgetType: "mandatory", 
          startDate: new Date().toISOString(),
          endDate: new Date(2026, 11, 31).toISOString(),
          isRolling: true,
          groupId: null 
        };

        console.log("Sending budget data:", budgetData);

        // 2. Gọi API POST sang Backend
        const response = await axiosClient.post('/Budget', budgetData);

        if (response.status === 200 || response.status === 201) {
          Alert.alert("Success", `Đã tạo ngân sách: ${name}`);
          router.replace('/(tabs)/home'); // Quay lại trang Home và làm mới
        }
      } catch (error: any) {
        console.error("Lỗi API:", error.response?.data || error.message);
        Alert.alert("Error", "Không thể lưu ngân sách. Vui lòng kiểm tra kết nối!");
      }
      return; // Kết thúc hàm tại đây
    }

    if (isEdit) {
      // NẾU LÀ SỬA: Lưu xong thì quay lại trang Detail cũ
      router.back();
    } else {
      // NẾU LÀ TẠO MỚI: Giả lập ID mới từ API, đẩy thẳng sang trang Detail
      if (type === 'budget') {
        // 🆕 TRƯỜNG HỢP BUDGET (Từ Home): 
        // Tạo xong quay về Home để xem danh sách hũ mới
        router.back(); 
      } else if (type === 'wallet') {
        // TRƯỜNG HỢP WALLET (Quỹ nhóm):
        // Phi thẳng vào trang Detail để Admin còn thêm thành viên
        const newId = 'new_wallet_123'; // Giả lập ID từ API
        router.replace(`/group/wallet-detail/${newId}`);
      } else if (type === 'goal') {
        // TRƯỜNG HỢP GOAL (Tiết kiệm):
        // Phi vào trang Detail của mục tiêu tiết kiệm
        const newId = 'new_goal_123'; // Giả lập ID từ API
        router.replace(`/group/saving-detail/${newId}`);
      } 
    }
  };

  // ─── 5. RENDER GIAO DIỆN ───
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              
              {/* Chọn Ảnh */}
              <View style={styles.iconSection}>
                <TouchableOpacity 
                  style={[styles.iconPicker, { backgroundColor: imageUri ? 'transparent' : color + '20' }]}
                  activeOpacity={0.7}
                  onPress={pickImage}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                  ) : (
                    <Feather name="image" size={32} color={color} />
                  )}
                  <View style={styles.editIconBadge}>
                    <Feather name="camera" size={12} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.helperText}>Tap to upload photo</Text>
              </View>

              {/* Tên */}
              <Text style={styles.inputLabel}>{nameLabel}</Text>
              <TextInput style={styles.input} placeholder={namePlaceholder} placeholderTextColor="#CACACA" value={name} onChangeText={setName} />

              {/* Số tiền */}
              <Text style={styles.inputLabel}>{amountLabel}</Text>
              <View style={styles.amountInputWrapper}>
                <TextInput style={styles.amountInput} placeholder="0" placeholderTextColor="#CACACA" value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} onChangeText={handleAmountChange} keyboardType="number-pad" />
                <Text style={styles.currencySuffix}>VNĐ</Text>
              </View>

              {/* Bảng Màu */}
              <Text style={styles.inputLabel}>Color Theme</Text>
              <View style={styles.colorPickerRow}>
                {THEME_COLORS.map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorCircleSelected]} onPress={() => setColor(c)} activeOpacity={0.8}>
                    {color === c && <Feather name="check" size={20} color="#FFFFFF" />}
                  </TouchableOpacity>
                ))}
              </View>

            </View>

            {/* Nút Submit */}
            <TouchableOpacity style={[styles.btnSubmit, isFormValid ? styles.btnActive : styles.btnDisabled]} disabled={!isFormValid} activeOpacity={0.8} onPress={handleSubmit}>
              <Text style={[styles.btnText, !isFormValid && styles.btnTextDisabled]}>
                {isEdit
                    ? 'Save Changes'
                    : `Create ${
                        type === 'wallet' ? 'Wallet' : type === 'goal' ? 'Goal' : 'Budget'
                    }`}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// ─── STYLES (Đã làm gọn) ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  backButton: { paddingRight: 8 }, headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  iconSection: { alignItems: 'center', marginBottom: 32 },
  iconPicker: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 8, position: 'relative' },
  uploadedImage: { width: '100%', height: '100%', borderRadius: 44 },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#15476C', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  helperText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  inputLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#9CA3AF', marginBottom: 10, marginLeft: 4 },
  input: { height: 52, borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 26, paddingHorizontal: 20, fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#1F2937', marginBottom: 24 },
  amountInputWrapper: { flexDirection: 'row', alignItems: 'center', height: 60, borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 20, paddingHorizontal: 20, marginBottom: 24, backgroundColor: '#F9FAFB' },
  amountInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: '#15476C' },
  currencySuffix: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#9CA3AF', marginLeft: 8 },
  colorPickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  colorCircleSelected: { borderWidth: 3, borderColor: '#E3F6FF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  btnSubmit: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  btnActive: { backgroundColor: '#15476C', shadowColor: '#15476C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnDisabled: { backgroundColor: '#FFFFFF' },
  btnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  btnTextDisabled: { color: '#CACACA' },
});