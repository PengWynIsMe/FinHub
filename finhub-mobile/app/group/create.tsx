import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image, // 🆕 Import thêm Image để hiển thị ảnh
} from 'react-native';
import { COLORS } from '@/constants/theme';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // 🆕 Import Image Picker

const CURRENCIES = [
  { code: 'VND', name: 'Viet Nam Dong' },
  { code: 'HKR', name: 'Hong Kong Dollar' },
  { code: 'USD', name: 'Dollar' },
  { code: 'NT$', name: 'Taiwan Dollar' },
  { code: 'J$', name: 'Jamaica Dollar' },
];

export default function CreateGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('VND');
  const [description, setDescription] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  // 🆕 State lưu đường dẫn ảnh nhóm
  const [imageUri, setImageUri] = useState<string | null>(null);

  // 🆕 Hàm mở thư viện và chọn ảnh
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Ép cắt ảnh hình vuông để bo góc cho đẹp
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleConfirm = () => {
    // 🆕 Ghi log thêm cả imageUri để kiểm tra
    console.log('Create group:', { groupName, selectedCurrency, description, imageUri });
    router.push('/group/invite-share');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create a Group</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          
          {/* ─── 🆕 Avatar với tính năng chọn ảnh ─── */}
          <TouchableOpacity 
            style={styles.avatarContainer} 
            activeOpacity={0.8}
            onPress={pickImage} // Gọi hàm chọn ảnh khi bấm vào
          >
            {imageUri ? (
              // Nếu đã có ảnh thì hiển thị ảnh
              <Image source={{ uri: imageUri }} style={styles.uploadedAvatar} />
            ) : (
              // Nếu chưa có ảnh thì hiển thị dấu +
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlus}>+</Text>
              </View>
            )}
            
            {/* Tùy chọn: Thêm một cái badge nhỏ nhắn góc dưới báo hiệu có thể sửa ảnh */}
            {imageUri && (
               <View style={styles.editBadge}>
                 <Text style={{ fontSize: 10, color: '#FFF' }}>✏️</Text>
               </View>
            )}
          </TouchableOpacity>

          {/* Name */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#C7C7CC"
            value={groupName}
            onChangeText={setGroupName}
          />

          {/* Currency */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCurrencyModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.inputText}>
              {selectedCurrency || 'Currency'}
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          {/* Description */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor="#C7C7CC"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Confirm */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency Modal (Giữ nguyên) */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select the currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={styles.currencyItem}
                onPress={() => {
                  setSelectedCurrency(currency.code);
                  setShowCurrencyModal(false);
                }}
              >
                <Text style={styles.currencyText}>
                  {currency.code} ( {currency.name} )
                </Text>

                {selectedCurrency === currency.code && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 20 },
  backButton: { padding: 4 }, backText: { fontSize: 28, color: COLORS.black }, headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.black },
  formCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, alignItems: 'center' },
  
  // ─── STYLES CHO AVATAR ───
  avatarContainer: {
    marginBottom: 24,
    position: 'relative', // Để định vị cái editBadge
  },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8E8ED', alignItems: 'center', justifyContent: 'center' },
  avatarPlus: { fontSize: 36, color: '#C7C7CC', fontWeight: '300' },
  uploadedAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // Bo tròn ảnh
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // ─── CÁC STYLES CŨ (Giữ nguyên) ───
  input: { width: '100%', height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#E5E5EA', paddingHorizontal: 20, fontSize: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white },
  inputText: { flex: 1, fontSize: 16, color: COLORS.black },
  chevron: { fontSize: 20, color: '#C7C7CC' },
  textArea: { height: 100, paddingTop: 16, borderRadius: 20 }, // Sửa bo góc cho textarea một chút cho hợp nhãn
  confirmButton: { width: '100%', height: 50, backgroundColor: COLORS.primary, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.black },
  modalClose: { fontSize: 32, color: COLORS.black, fontWeight: '300' },
  currencyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  currencyText: { fontSize: 16, color: COLORS.black },
  checkMark: { fontSize: 18, color: COLORS.primary, fontWeight: '600' },
});