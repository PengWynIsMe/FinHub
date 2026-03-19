import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function QrPaymentScreen() {
  const router = useRouter();
  
  // 💡 LẤY DỮ LIỆU TỪ MÀN HÌNH SCAN TRUYỀN SANG
  const params = useLocalSearchParams();
  
  const [billInfo, setBillInfo] = useState({
    merchantName: (params.merchantName as string) || "Cửa hàng Đồ Chơi MyKingdom",
    amount: params.amount ? parseInt(params.amount as string) : 300000,
    qrPayload: (params.qrPayload as string) || "VIETQR_PAYLOAD_STRING_HERE"
  });

  const [budgets, setBudgets] = useState<any[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. LẤY DANH SÁCH VÍ/NGÂN SÁCH (Dùng chung API với màn hình Create cũ)
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axiosClient.get('/Budget/all-accessible');
        setBudgets(res.data);
        if (res.data.length > 0) setSelectedBudgetId(res.data[0].id);
      } catch (error) {
        console.error("Lỗi lấy danh sách nguồn tiền:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
  const remainingMoney = selectedBudget ? (selectedBudget.allocated - selectedBudget.spent) : 0;

  // ─── 💡 LOGIC CỐT LÕI: QUYẾT ĐỊNH NÚT BẤM DỰA VÀO TIỀN THẬT ───
  let buttonConfig = {
    text: "Đang tải...",
    color: "#9CA3AF",
    icon: "loader",
    actionType: "None"
  };

  if (selectedBudget) {
    if (selectedBudget.isGroupWallet) {
      // 🔵 TRƯỜNG HỢP 1: DÙNG QUỸ NHÓM (Bố mẹ giữ tiền)
      if (billInfo.amount > remainingMoney) {
        // 1A. Vượt quá hạn mức của Quỹ Nhóm
        buttonConfig = {
          text: "Exceeded limit! Send the request",
          color: "#EF4444", // Hiện nút Đỏ cảnh báo nguy hiểm
          icon: "alert-octagon",
          actionType: "PayForMe" // Vẫn gửi Request, nhưng con đã nhận thức được là mình đang xin lố tiền
        };
      } else {
        // 1B. Trong hạn mức Quỹ Nhóm
        buttonConfig = {
          text: "Gửi yêu cầu nhờ Bố/Mẹ thanh toán",
          color: "#F59E0B", // Màu Cam bình thường
          icon: "send",
          actionType: "PayForMe"
        };
      }
    } else {
      // 🟢 TRƯỜNG HỢP 2: DÙNG VÍ CÁ NHÂN (Con tự giữ tiền thật)
      if (billInfo.amount > remainingMoney) {
        // 2A. Ví cá nhân không đủ tiền hoặc vượt ngân sách cho phép
        buttonConfig = {
          text: "Không đủ ngân sách! Xin tài trợ",
          color: "#EF4444", // Màu Đỏ báo hết tiền
          icon: "alert-circle",
          actionType: "PayForMe"
        };
      } else {
        // 2B. Ví cá nhân đủ tiền
        buttonConfig = {
          text: "Confirm by your balance",
          color: "#10B981", // Màu Xanh an toàn
          icon: "check-circle",
          actionType: "SelfPay"
        };
      }
    }
  }

  // 2. HÀM XỬ LÝ KHI BẤM NÚT
  const handlePaymentAction = async () => {
    setIsProcessing(true);
    
    try {
      if (buttonConfig.actionType === "SelfPay") {
        // GHI NHẬN TỰ THANH TOÁN (Giống hệt luồng Create Transaction cũ)
        await axiosClient.post('/Transaction', {
          walletId: selectedBudget.walletId,
          budgetId: selectedBudget.id,
          amount: billInfo.amount,
          type: 'Expense',
          note: `Thanh toán QR tại ${billInfo.merchantName}`,
          evaluation: 'Need'
        });
        Alert.alert("Thành công", "Đã ghi nhận giao dịch vào sổ tay!", [{ text: "OK", onPress: () => router.back() }]);
      } 
      else if (buttonConfig.actionType === "PayForMe") {
        // 💡 GỬI YÊU CẦU: CHỈ CẦN TRUYỀN WALLET ID
        await axiosClient.post('/PaymentRequest', {
          walletId: selectedBudget.walletId, // Chắc chắn luôn có khi chọn thẻ
          amount: billInfo.amount,
          merchantInfo: billInfo.qrPayload,
          note: `Con cần thanh toán tại ${billInfo.merchantName}`,
          requestType: 'PayForMe'
        });
        
        Alert.alert("Đã gửi!", "Yêu cầu đã được gửi đến Phụ huynh. Chờ Mẹ quét mã trả tiền nhé!", [
          { text: "Về trang chủ", onPress: () => router.push('/(tabs)/home') }
        ]);
      }
    } catch (error: any) {
      console.error("Lỗi xử lý:", error);
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="x" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HÓA ĐƠN CỬA HÀNG */}
        <View style={styles.billCard}>
          <View style={styles.storeIconWrapper}>
            <Ionicons name="storefront" size={32} color="#15476C" />
          </View>
          <Text style={styles.storeName}>{billInfo.merchantName}</Text>
          <Text style={styles.billAmount}>{formatVND(billInfo.amount)} <Text style={{fontSize: 20}}>VNĐ</Text></Text>
          
          <View style={styles.dashedLine} />
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Invoice code</Text>
            <Text style={styles.billValue}>#QR-982374</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Time</Text>
            <Text style={styles.billValue}>Today, 14:30</Text>
          </View>
        </View>

        {/* CHỌN NGUỒN TIỀN */}
        <Text style={styles.sectionTitle}>Select the source of funds to deduct</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#15476C" style={{ marginTop: 20 }} />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.walletScroll}
            contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 4 }} // Chống lẹm đổ bóng
          >
            {budgets.map((b) => {
              const bRemaining = b.allocated - b.spent;
              const isSelected = selectedBudgetId === b.id;
              
              return (
                <TouchableOpacity 
                  key={b.id} 
                  style={[styles.walletCard, isSelected && styles.walletCardActive]}
                  onPress={() => setSelectedBudgetId(b.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.walletHeader}>
                    {/* 💡 SỬA LẠI HỘP CHỨA ICON Ở ĐÂY */}
                    <View style={[styles.walletIconBox, isSelected && styles.walletIconBoxActive]}>
                      {b.icon && b.icon.startsWith('http') ? (
                        <Image 
                          source={{ uri: b.icon }} 
                          style={{ width: '100%', height: '100%', borderRadius: 16 }} 
                        />
                      ) : (
                        <Text style={{fontSize: 22}}>{b.icon || '💼'}</Text>
                      )}
                    </View>

                    {/* Các Badge góc phải (Nhóm & Tick chọn) giữ nguyên */}
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {b.isGroupWallet && (
                        <View style={styles.groupBadge}>
                          <Feather name="users" size={12} color="#15476C" />
                        </View>
                      )}
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Feather name="check" size={12} color="#FFF" />
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={{ flex: 1 }} />

                  {/* Thông tin tên và số dư */}
                  <Text style={[styles.walletName, isSelected && {color: '#1F2937'}]} numberOfLines={1}>
                    {b.name}
                  </Text>
                  <Text style={[styles.walletBalance, bRemaining < billInfo.amount && {color: '#FF4267'}]}>
                    Re: {formatVND(bRemaining)}đ
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        )}

      </ScrollView>

      {/* DYNAMIC BUTTON TỰ ĐỘNG THAY ĐỔI DƯỚI ĐÁY */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.dynamicButton, { backgroundColor: buttonConfig.color }, isProcessing && { opacity: 0.7 }]}
          onPress={handlePaymentAction}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name={buttonConfig.icon as any} size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.dynamicButtonText}>{buttonConfig.text}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  // Bill Card
  billCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  storeIconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E3F6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  storeName: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#6B7280', marginBottom: 8 },
  billAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 36, color: '#1F2937' },
  dashedLine: { width: '100%', height: 1, borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed', marginVertical: 20 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  billLabel: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF' },
  billValue: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#1F2937' },

  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937', marginBottom: 16 },
  
  // Wallet Cards
  walletScroll: { overflow: 'visible', marginHorizontal: -4 },
  walletCard: { 
    width: 156, 
    height: 124, 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 24, 
    marginRight: 16, 
    borderWidth: 2, 
    borderColor: 'transparent',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 10, 
    elevation: 2 
  },
  walletCardActive: { 
    borderColor: '#15476C', 
    backgroundColor: '#F0F9FF', 
    shadowOpacity: 0.1, 
    elevation: 4 
  },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  walletIconBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  walletIconBoxActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  groupBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#D1E5F4', alignItems: 'center', justifyContent: 'center' },
  checkBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4 },
  walletName: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#6B7280', marginBottom: 4 },
  walletBalance: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#10B981' },
  // Footer Button
  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  dynamicButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  dynamicButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' }
});