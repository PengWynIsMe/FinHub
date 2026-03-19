import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, Image, StatusBar, ActivityIndicator, Alert, Modal
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function GroupNotificationsScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  
  const [activeTab, setActiveTab] = useState<'request' | 'qr_payments' | 'funds'>('request');

  const [requests, setRequests] = useState<any[]>([]); 
  const [qrRequests, setQrRequests] = useState<any[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);

  const [selectedQrRequest, setSelectedQrRequest] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'request') {
        const res = await axiosClient.get('/Notification/requests');
        setRequests(res.data);
      } else if (activeTab === 'qr_payments') {
        const res = await axiosClient.get('/PaymentRequest/pending');
        setQrRequests(res.data);
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptExpense = async (id: string) => {
    try {
      await axiosClient.put(`/Notification/${id}/accept`);
      Alert.alert('Thành công', 'Đã duyệt chi tiêu ảo!');
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.Message);
    }
  };

  const handleRejectExpense = async (id: string) => {
    try {
      await axiosClient.delete(`/Notification/${id}/reject`);
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {}
  };

  const handleApproveQrPayment = async (id: string) => {
    try {
      await axiosClient.put(`/PaymentRequest/${id}/approve`);
      Alert.alert('Hoàn tất 🎉', 'Đã ghi nhận thanh toán thành công vào hệ thống quỹ nhóm!');
      setQrRequests(prev => prev.filter(req => req.id !== id));
      setSelectedQrRequest(null); 
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.Message || 'Không thể duyệt lúc này.');
    }
  };

  const handleRejectQrPayment = async (id: string) => {
    try {
      await axiosClient.delete(`/PaymentRequest/${id}/reject`);
      Alert.alert('Đã từ chối', 'Đã từ chối yêu cầu thanh toán của thành viên.');
      setQrRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {}
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#15476C" />
      
      <SafeAreaView style={styles.darkHeaderSection}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name || 'My Family'}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'request' && styles.activeTabButton]} onPress={() => setActiveTab('request')}>
            <Text style={[styles.tabText, activeTab === 'request' && styles.activeTabText]}>Expenses</Text>
          </TouchableOpacity>
          
          {/* Thanh toán QR thật */}
          <TouchableOpacity style={[styles.tabButton, activeTab === 'qr_payments' && styles.activeTabButton]} onPress={() => setActiveTab('qr_payments')}>
            <Text style={[styles.tabText, activeTab === 'qr_payments' && styles.activeTabText]}>QR Pay</Text>
          </TouchableOpacity>

          {/* Cảnh báo */}
          <TouchableOpacity style={[styles.tabButton, activeTab === 'funds' && styles.activeTabButton]} onPress={() => setActiveTab('funds')}>
            <Text style={[styles.tabText, activeTab === 'funds' && styles.activeTabText]}>Alerts</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.contentSection}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#15476C" /></View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* ─── TAB 1: EXPENSE REQUEST (CŨ) ─── */}
            {activeTab === 'request' && (
              requests.map((req) => (
                <View key={req.id} style={styles.card}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => handleRejectExpense(req.id)}>
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.cardRowTop}>
                    <View style={styles.userInfo}>
                      <Image source={{ uri: req.userAvatar }} style={styles.userAvatar} />
                      <Text style={styles.userName}>{req.userName}</Text>
                    </View>
                    <TouchableOpacity style={styles.btnAccept} onPress={() => handleAcceptExpense(req.id)}>
                      <Text style={styles.btnAcceptText}>Duyệt</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardRowBottom}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.reqTitle}>{req.title}</Text>
                      <Text style={styles.reqSubtitle}>{req.category}</Text>
                    </View>
                    <View style={styles.detailRight}>
                      <Text style={styles.reqAmount}>{formatVND(req.amount)}đ</Text>
                      <Text style={styles.walletNameText}>{req.walletName}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            {/* ─── Tạo Qr ─── */}
            {activeTab === 'qr_payments' && (
              qrRequests.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 40 }}>Không có yêu cầu thanh toán nào.</Text>
              ) : (
                qrRequests.map((req) => (
                  <View key={req.id} style={styles.card}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => handleRejectQrPayment(req.id)}>
                      <Feather name="x" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <View style={styles.cardRowTop}>
                      <View style={styles.userInfo}>
                        <Image source={{ uri: req.requesterAvatar }} style={styles.userAvatar} />
                        <View>
                          <Text style={styles.userName}>{req.requesterName}</Text>
                          <Text style={{fontSize: 12, color: '#6B7280'}}>{req.date}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 16}}>
                      <Text style={{fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#4B5563', fontStyle: 'italic'}}>"{req.note}"</Text>
                    </View>

                    <View style={[styles.cardRowBottom, {alignItems: 'center'}]}>
                      <View style={styles.detailLeft}>
                        <Text style={styles.reqTitle}>Thanh toán hóa đơn</Text>
                        <Text style={[styles.reqAmount, {color: '#F59E0B', fontSize: 20}]}>{formatVND(req.amount)}đ</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.btnAccept, {backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center'}]} 
                        onPress={() => setSelectedQrRequest(req)}
                      >
                        <Ionicons name="qr-code" size={16} color="#FFF" style={{marginRight: 6}} />
                        <Text style={styles.btnAcceptText}>Pay</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>

      <Modal visible={!!selectedQrRequest} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16}}>
              <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 18}}>Store invoice</Text>
              <TouchableOpacity onPress={() => setSelectedQrRequest(null)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{color: '#6B7280', textAlign: 'center', marginBottom: 20}}>
              Please use your Bank App or MoMo to scan the QR code below and pay the store.
            </Text>

            <View style={{padding: 16, backgroundColor: '#FFF', borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, marginBottom: 20}}>
              {/* Giả lập vẽ lại mã VietQR của cửa hàng từ MerchantInfo */}
              <QRCode
                value={selectedQrRequest?.merchantInfo || 'Lỗi mã QR'}
                size={200}
                color="#1F2937"
              />
            </View>

            <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#1F2937', marginBottom: 20}}>
              {selectedQrRequest ? formatVND(selectedQrRequest.amount) : '0'} VNĐ
            </Text>

            <TouchableOpacity 
              style={{backgroundColor: '#15476C', paddingVertical: 14, width: '100%', borderRadius: 16, alignItems: 'center'}}
              onPress={() => handleApproveQrPayment(selectedQrRequest.id)}
            >
              <Text style={{color: '#FFF', fontFamily: 'Poppins_600SemiBold', fontSize: 16}}>
                Money transferred
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#15476C' },
  darkHeaderSection: { backgroundColor: '#15476C', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  backButton: { paddingRight: 16 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#FFFFFF' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#FFFFFF' },
  tabText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' },
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
  detailRight: { alignItems: 'flex-end' },
  reqAmount: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FF4267', marginBottom: 4 },
  walletNameText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center' },
});