import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

// MOCK DATA MỚI CHO TAB TOTAL FUNDS (Tạm giữ nguyên vì chúng ta đang focus vào Expense Request)
const MOCK_FUND_ALERTS = [
  {
    id: 'alert1',
    walletName: 'Daily Wallet',
    alertMessage: 'Today is exceed the limit',
    amount: -80000,
    sourceWallet: 'Pocket Money',
    lastTransactionBy: 'Anh Minh',
  }
];

const formatVND = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';
};

export default function GroupNotificationsScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const [activeTab, setActiveTab] = useState<'request' | 'funds'>('request');

  // ─── 💡 STATE CHO DỮ LIỆU THẬT ───
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. GỌI API LẤY DANH SÁCH REQUEST
  useFocusEffect(
    useCallback(() => {
      const fetchRequests = async () => {
        setIsLoading(true);
        try {
          const res = await axiosClient.get('/Notification/requests');
          setRequests(res.data);
        } catch (error) {
          console.error('Lỗi lấy danh sách yêu cầu:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRequests();
    }, [])
  );

  // 2. HÀM XỬ LÝ ACCEPT (DUYỆT CHI TIÊU)
  const handleAccept = async (notificationId: string) => {
    try {
      await axiosClient.put(`/Notification/${notificationId}/accept`);
      Alert.alert('Thành công', 'Đã duyệt giao dịch. Tiền trong ví đã được trừ!');
      // Xóa item khỏi danh sách trên UI ngay lập tức
      setRequests(prev => prev.filter(req => req.id !== notificationId));
    } catch (error: any) {
      console.error('Lỗi duyệt:', error);
      Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể duyệt giao dịch lúc này.');
    }
  };

  // 3. HÀM XỬ LÝ REJECT (TỪ CHỐI CHI TIÊU)
  const handleReject = (notificationId: string) => {
    Alert.alert(
      'Từ chối',
      'Bạn có chắc chắn muốn từ chối yêu cầu chi tiêu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Từ chối', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/Notification/${notificationId}/reject`);
              // Xóa item khỏi danh sách trên UI
              setRequests(prev => prev.filter(req => req.id !== notificationId));
            } catch (error: any) {
              console.error('Lỗi từ chối:', error);
              Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể từ chối lúc này.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#15476C" />
      
      {/* ─── DARK HEADER & TABS ─── */}
      <SafeAreaView style={styles.darkHeaderSection}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name || 'My Family <3'}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'request' && styles.activeTabButton]}
            onPress={() => setActiveTab('request')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'request' && styles.activeTabText]}>
              Expense Request
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'funds' && styles.activeTabButton]}
            onPress={() => setActiveTab('funds')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'funds' && styles.activeTabText]}>
              Total Funds
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ─── LIGHT BLUE CONTENT AREA ─── */}
      <View style={styles.contentSection}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#15476C" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {activeTab === 'request' ? (
              /* ─── TAB 1: EXPENSE REQUEST (RENDER TỪ DỮ LIỆU THẬT) ─── */
              requests.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 40 }}>
                  Không có yêu cầu chi tiêu nào đang chờ duyệt.
                </Text>
              ) : (
                requests.map((req) => (
                  <View key={req.id} style={styles.card}>
                    {/* Nút Reject (Dấu X) */}
                    <TouchableOpacity 
                      style={styles.closeButton} 
                      activeOpacity={0.6}
                      onPress={() => handleReject(req.id)}
                    >
                      <Feather name="x" size={12} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.cardRowTop}>
                      <View style={styles.userInfo}>
                        <Image source={{ uri: req.userAvatar }} style={styles.userAvatar} />
                        <Text style={styles.userName}>{req.userName}</Text>
                      </View>
                      {/* Nút Accept */}
                      <TouchableOpacity 
                        style={styles.btnAccept} 
                        activeOpacity={0.8}
                        onPress={() => handleAccept(req.id)}
                      >
                        <Text style={styles.btnAcceptText}>Accept</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardRowBottom}>
                      <View style={styles.detailLeft}>
                        <Text style={styles.reqTitle}>{req.title}</Text>
                        <Text style={styles.reqSubtitle}>{req.category}</Text>
                        <Text style={styles.reqDate}>{req.date}</Text>
                      </View>

                      <View style={styles.detailRight}>
                        <Text style={styles.reqAmount}>{formatVND(req.amount)}</Text>
                        <View style={styles.walletInfo}>
                          <Text style={styles.coinEmoji}>🪙</Text>
                          <Text style={styles.walletNameText}>{req.walletName}</Text>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                          <Feather name="edit-2" size={14} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )
            ) : (
              /* ─── TAB 2: TOTAL FUNDS (ALERTS) ─── */
              MOCK_FUND_ALERTS.map((alert) => (
                <View key={alert.id} style={styles.card}>
                  <TouchableOpacity style={styles.closeButton} activeOpacity={0.6}>
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.alertRow}>
                    <Text style={styles.alertWalletName}>{alert.walletName}</Text>
                    <Text style={styles.reqAmount}>{formatVND(alert.amount)}</Text>
                  </View>

                  <View style={[styles.alertRow, { marginBottom: 16 }]}>
                    <Text style={styles.alertMessage}>{alert.alertMessage}</Text>
                    <View style={styles.walletInfo}>
                      <Text style={styles.coinEmoji}>🪙</Text>
                      <Text style={styles.walletNameText}>{alert.sourceWallet}</Text>
                    </View>
                  </View>

                  <Text style={styles.alertFooter}>
                    Last transaction created by <Text style={styles.alertFooterBold}>{alert.lastTransactionBy}</Text>
                  </Text>
                </View>
              ))
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ─── STYLES GIỮ NGUYÊN 100% TỪ BẢN GỐC CỦA BẠN ───
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#15476C' },
  darkHeaderSection: { backgroundColor: '#15476C', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  backButton: { paddingRight: 16 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#FFFFFF' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#FFFFFF' },
  tabText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' },
  activeTabText: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  contentSection: { flex: 1, backgroundColor: '#E3F6FF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  closeButton: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E3F6FF', zIndex: 10 },
  cardRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#F3F4F6' },
  userName: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#1F2937' },
  btnAccept: { backgroundColor: '#15476C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  btnAcceptText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#FFFFFF' },
  cardRowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLeft: { flex: 1 },
  reqTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937', marginBottom: 4 },
  reqSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginBottom: 4 },
  reqDate: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  detailRight: { alignItems: 'flex-end' },
  reqAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FF4267', marginBottom: 4 },
  walletInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  coinEmoji: { fontSize: 12, marginRight: 4 },
  walletNameText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' },
  editButton: { padding: 4 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  alertWalletName: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937' },
  alertMessage: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  alertFooter: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280' },
  alertFooterBold: { fontFamily: 'Poppins_600SemiBold', color: '#1F2937' },
});