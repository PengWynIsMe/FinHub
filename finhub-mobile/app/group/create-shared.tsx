import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, Platform, KeyboardAvoidingView, Keyboard, Image, ActivityIndicator, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axiosClient from '@/api/axiosClient';
import { useAuthStore } from '@/stores/auth.store';

const THEME_COLORS = ['#3B82F6', '#10B981', '#FF4267', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function CreateSharedScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  
  const params = useLocalSearchParams();
  const type = params.type === 'goal' ? 'goal' : params.type === 'budget' ? 'budget' : 'wallet';
  const action = params.action === 'edit' ? 'edit' : 'create';
  const groupId = params.groupId as string; // 👈 Lấy groupId từ params

  const [name, setName] = useState((params.name as string) || '');
  const [amount, setAmount] = useState((params.amount as string) || '');
  const [color, setColor] = useState((params.color as string) || THEME_COLORS[0]);
  const [imageUri, setImageUri] = useState<string | null>((params.imageUri as string) || null);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budgetType, setBudgetType] = useState<'mandatory' | 'non-recurring'>('mandatory');
  const [isLoadingCat, setIsLoadingCat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type === 'budget') {
      const fetchCategories = async () => {
        setIsLoadingCat(true);
        try {
          const res = await axiosClient.get('/Category');
          const expenseCats = res.data.filter((c: any) => c.type === 'Expense');
          setCategories(expenseCats);
        } catch (error) {
          console.error("Lỗi lấy danh mục:", error);
        } finally {
          setIsLoadingCat(false);
        }
      };
      fetchCategories();
    }
  }, [type]);

  const isWallet = type === 'wallet';
  const isEdit = action === 'edit';

  const headerTitle = isEdit ? `Edit ${type}` : `Create New ${type}`;
  const nameLabel = type === 'wallet' ? 'Wallet Name' : type === 'goal' ? 'Goal Name' : 'Budget Name';
  const namePlaceholder = type === 'wallet' ? 'e.g. Quỹ ăn nhậu' : type === 'goal' ? 'e.g. Family Trip to Japan' : 'e.g. Tiền chợ tháng 3';
  const amountLabel = type === 'wallet' ? 'Initial Balance (Tùy chọn)' : type === 'goal' ? 'Target Amount (VNĐ)' : 'Budget Amount (VNĐ)';

  // 🆕 FIX BUG 3: Logic bật nút Save (Ví thì chỉ cần tên, không ép nhập tiền)
  const hasValidAmount = amount.toString().trim().length > 0;
  const hasNameOrCategory = name.trim().length > 0 || selectedCategory !== null;
  
  let isFormValid = false;
  if (type === 'budget') {
    isFormValid = hasValidAmount && hasNameOrCategory;
  } else if (type === 'wallet') {
    isFormValid = name.trim().length > 0; // Ví chung chỉ cần có tên là được
  } else {
    isFormValid = hasValidAmount && name.trim().length > 0;
  }

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
    setIsSubmitting(true);

    try {
      // ─── 1. XỬ LÝ TẠO VÍ CHUNG (SHARED WALLET) ───
      if (type === 'wallet' && action === 'create') {
        if (!groupId) {
          Alert.alert("Lỗi", "Không tìm thấy thông tin Nhóm (GroupId)!");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          name: name,
          color: color,
          icon: imageUri || "💼" 
        };

        await axiosClient.post(`/Group/${groupId}/wallets`, payload);
        
        Alert.alert("Thành công", "Đã tạo ví chung!");
        router.back(); // Quay về danh sách ví chung
        return;
      }

      // ─── 2. XỬ LÝ TẠO BUDGET (Giữ nguyên logic cũ của bạn) ───
      if (type === 'budget' && action === 'create') {
        const selectedCatObj = categories.find(c => c.categoryId === selectedCategory);
        const finalIcon = imageUri || selectedCatObj?.icon || "dollar-sign";

        const finalName = name.trim().length > 0 
          ? name 
          : (selectedCatObj?.name || 'Unnamed Budget');


        const budgetData = {
          name: finalName,               
          amountLimit: parseFloat(amount),
          color: color,             
          icon: finalIcon, 
          walletId: user?.primaryWalletId, 
          categoryId: selectedCategory || null, 
          budgetType: budgetType,       
          startDate: new Date().toISOString(),
          endDate: new Date(2026, 11, 31).toISOString(),
          isRolling: true,
          groupId: null 
        };

        const response = await axiosClient.post('/Budget', budgetData);
        if (response.status === 200 || response.status === 201) {
          Alert.alert("Success", `Đã tạo ngân sách thành công!`);
          router.replace('/(tabs)/home'); 
        }
        return; 
      }
      
      // Xử lý Goal hoặc Edit (Mặc định)
      if (isEdit) {
        router.back();
      } else {
        if (type === 'goal') router.replace(`/group/saving-detail/new_goal_123`);
      }

    } catch (error: any) {
      console.error("Lỗi API chi tiết:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể lưu dữ liệu. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCatIcon = categories.find(c => c.categoryId === selectedCategory)?.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" 
        >
          <View style={styles.formCard}>
            
            <View style={styles.iconSection}>
              <TouchableOpacity 
                style={[styles.iconPicker, { backgroundColor: imageUri ? 'transparent' : color + '20' }]}
                activeOpacity={0.7}
                onPress={pickImage}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                ) : selectedCatIcon ? (
                  <Feather name={selectedCatIcon as any} size={36} color={color} />
                ) : (
                  <Feather name="camera" size={32} color={color} />
                )}
                <View style={styles.editIconBadge}>
                  <Feather name="edit-2" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.helperText}>Tap to upload custom photo</Text>
            </View>

            <Text style={styles.inputLabel}>{nameLabel}</Text>
            <TextInput style={styles.input} placeholder={namePlaceholder} placeholderTextColor="#CACACA" value={name} onChangeText={setName} />

            {/* Chỉ hiện Amount Input nếu không phải tạo Wallet, hoặc vẫn muốn hiện cho đồng bộ UI thì để nguyên */}
            {type !== 'wallet' && (
              <>
                <Text style={styles.inputLabel}>{amountLabel}</Text>
                <View style={styles.amountInputWrapper}>
                  <TextInput style={styles.amountInput} placeholder="0" placeholderTextColor="#CACACA" value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} onChangeText={handleAmountChange} keyboardType="number-pad" />
                  <Text style={styles.currencySuffix}>VNĐ</Text>
                </View>
              </>
            )}

            {type === 'budget' && (
              <>
                <Text style={styles.inputLabel}>Budget Type</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity 
                    style={[styles.typeBtn, budgetType === 'mandatory' && styles.typeBtnActive]} 
                    onPress={() => setBudgetType('mandatory')}
                  >
                    <Text style={[styles.typeBtnText, budgetType === 'mandatory' && styles.typeBtnTextActive]}>Mandatory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeBtn, budgetType === 'non-recurring' && styles.typeBtnActive]} 
                    onPress={() => setBudgetType('non-recurring')}
                  >
                    <Text style={[styles.typeBtnText, budgetType === 'non-recurring' && styles.typeBtnTextActive]}>Non-recurring</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Category</Text>
                {isLoadingCat ? (
                  <ActivityIndicator size="small" color="#15476C" />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                    {categories.map((cat) => (
                      <TouchableOpacity 
                        key={cat.categoryId} 
                        style={[styles.catItem, selectedCategory === cat.categoryId && { borderColor: color, backgroundColor: color + '10' }]}
                        onPress={() => setSelectedCategory(selectedCategory === cat.categoryId ? null : cat.categoryId)}
                      >
                        <Feather name={cat.icon as any} size={24} color={selectedCategory === cat.categoryId ? color : '#9CA3AF'} />
                        <Text style={[styles.catText, selectedCategory === cat.categoryId && { color: color }]}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            <Text style={[styles.inputLabel, {marginTop: type==='wallet'? 0 : 16}]}>Color Theme</Text>
            <View style={styles.colorPickerRow}>
              {THEME_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorCircleSelected]} onPress={() => setColor(c)} activeOpacity={0.8}>
                  {color === c && <Feather name="check" size={20} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>

          </View>

          <TouchableOpacity 
            style={[styles.btnSubmit, isFormValid && !isSubmitting ? styles.btnActive : styles.btnDisabled]} 
            disabled={!isFormValid || isSubmitting} 
            activeOpacity={0.8} 
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color={isFormValid ? "#FFFFFF" : "#15476C"} />
            ) : (
              <Text style={[styles.btnText, !isFormValid && styles.btnTextDisabled]}>
                {isEdit ? 'Save Changes' : `Create ${type === 'wallet' ? 'Wallet' : type === 'goal' ? 'Goal' : 'Budget'}`}
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBtn: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  typeBtnActive: { borderColor: '#15476C', backgroundColor: '#15476C' },
  typeBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#9CA3AF' },
  typeBtnTextActive: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold' },
  catScroll: { flexDirection: 'row', paddingVertical: 4 },
  catItem: { alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E5E5', marginRight: 12, backgroundColor: '#FFFFFF' },
  catText: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 4 },
  colorPickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  colorCircleSelected: { borderWidth: 3, borderColor: '#E3F6FF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  btnSubmit: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  btnActive: { backgroundColor: '#15476C', shadowColor: '#15476C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnDisabled: { backgroundColor: '#F3F4F6' },
  btnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  btnTextDisabled: { color: '#9CA3AF' },
});