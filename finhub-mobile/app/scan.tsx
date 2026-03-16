import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-native-qrcode-svg';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Dimensions, Animated, StatusBar, Alert, Platform, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import axiosClient from '@/api/axiosClient';

const { width, height } = Dimensions.get('window');

// ─── THÔNG SỐ KHUNG QUÉT ───
const SCAN_FRAME_SIZE = width * 0.7; 
const CUTOUT_RADIUS = 24; 
const BORDER_WIDTH = 1000; 

export default function ScanScreen() {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<'QR' | 'OCR'>('QR'); 
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const scanLinePosition = useRef(new Animated.Value(0)).current;

  // ─── STATE CHO TÍNH NĂNG "MÃ CỦA TÔI" ───
  const [isMyQrVisible, setIsMyQrVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({ id: '', name: '', avatar: '' });

  // 💡 Lấy thông tin Profile thực tế từ Backend khi vừa vào màn hình
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axiosClient.get('/User/me');
        setUserInfo({
          id: res.data.userId, // Map đúng với thuộc tính UserId của C#
          name: res.data.fullName, 
          avatar: res.data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.fullName)}&background=15476C&color=fff`
        });
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
      }
    };
    fetchMyProfile();
  }, []);

  // 💡 Dữ liệu nhúng vào QR Code
  const myQrData = JSON.stringify({
    action: 'transfer',
    userId: userInfo.id,
    name: userInfo.name
  });

  // Hiệu ứng Tia Laser
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: SCAN_FRAME_SIZE - 4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanLinePosition]);

  // 💡 HÀM GIẢI MÃ VIETQR (CHUẨN EMVCo) ĐỂ LẤY SỐ TIỀN VÀ TÊN QUÁN
  const parseVietQR = (payload: string) => {
    let amount = 0;
    let merchantName = "Cửa hàng (VietQR)";

    try {
      let i = 0;
      while (i < payload.length) {
        const tag = payload.substring(i, i + 2);
        const len = parseInt(payload.substring(i + 2, i + 4), 10);
        const value = payload.substring(i + 4, i + 4 + len);

        if (tag === '54') { // Tag 54 trong EMVCo luôn là Số tiền (Transaction Amount)
          amount = parseFloat(value);
        } else if (tag === '59') { // Tag 59 thường là Tên người nhận (Merchant Name)
          merchantName = value;
        }

        i += 4 + len;
      }
    } catch (error) {
      console.log("Không thể parse EMVCo:", error);
    }
    return { amount, merchantName };
  };
  // 💡 HÀM TỔNG HỢP: XỬ LÝ TẤT CẢ CÁC LOẠI MÃ QR KHI QUÉT ĐƯỢC
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true); 
    
    try {
      const parsedData = JSON.parse(data);
      
      // 1. LUỒNG CHUYỂN TIỀN CÁ NHÂN
      if (parsedData.action === 'transfer') {
        Alert.alert(
          "Nhận diện tài khoản!", 
          `Bạn đang chuyển tiền cho: ${parsedData.name}`,
          [
            { text: "Hủy", onPress: () => setScanned(false), style: 'cancel' },
            { text: "Tiếp tục", onPress: () => {
              console.log("Điều hướng tới userId:", parsedData.userId);
              router.back();
            }}
          ]
        );
      } 
      // 2. LUỒNG THAM GIA NHÓM (QUÉT MÃ MỜI)
      else if (parsedData.action === 'join_group') {
        Alert.alert(
          "Lời mời vào nhóm", 
          `Bạn được mời tham gia nhóm: ${parsedData.groupName || 'Mới'}`,
          [
            { text: "Hủy", onPress: () => setScanned(false), style: 'cancel' },
            { text: "Tham gia ngay", onPress: async () => {
                try {
                  await axiosClient.post('/Group/join', { inviteCode: parsedData.inviteCode });
                  Alert.alert("Thành công 🎉", "Bạn đã tham gia nhóm thành công!", [
                    { text: "Xem nhóm", onPress: () => router.back() }
                  ]);
                } catch (error: any) {
                  Alert.alert("Lỗi", error.response?.data?.Message || "Không thể tham gia.", [
                    { text: "Đóng", onPress: () => setScanned(false) }
                  ]);
                }
            }}
          ]
        );
      } 
      // 3. LUỒNG THANH TOÁN (MOCK DATA TỪ WEB JSON)
      else if (parsedData.action === 'payment') {
        router.push({
          pathname: '/qr-payment',
          params: {
            merchantName: parsedData.merchantName,
            amount: parsedData.amount,
            qrPayload: data // Truyền cục data sang
          }
        });
      }
      else {
        // Mã JSON lạ
        Alert.alert("Quét thành công", data, [{ text: "OK", onPress: () => setScanned(false) }]);
      }
    } catch (e) {
      // 4. LUỒNG QUÉT MÃ VIETQR THẬT (ĐỌC SỐ TIỀN THỰC TẾ TỪ MÃ)
      const vietQrData = parseVietQR(data);

      Alert.alert(
        "Nhận diện VietQR", 
        `Thanh toán cho: ${vietQrData.merchantName}\nSố tiền: ${vietQrData.amount.toLocaleString('vi-VN')}đ\n\nBạn có muốn tiếp tục?`,
        [
          { text: "Hủy", onPress: () => setScanned(false), style: 'cancel' },
          { text: "Tiếp tục", onPress: () => {
              // Bay sang trang qr-payment với DỮ LIỆU THẬT bóc từ mã QR
              router.push({
                pathname: '/qr-payment',
                params: {
                  merchantName: vietQrData.merchantName,
                  amount: vietQrData.amount, // 👈 SỐ TIỀN THẬT ĐÂY RỒI!
                  qrPayload: data
                }
              });
          }}
        ]
      );
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cấp quyền', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh!');
      return;
    }
    setScanned(true); 
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      Alert.alert("Đã chọn ảnh!", `Đường dẫn: ${result.assets[0].uri}`, [
        { text: "OK", onPress: () => setScanned(false) }
      ]);
    } else {
      setScanned(false);
    }
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Feather name="camera-off" size={60} color="#6B7280" style={{ marginBottom: 20 }} />
        <Text style={{ color: '#FFF', marginBottom: 20 }}>Cần quyền truy cập Camera để quét mã</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Cấp quyền Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="back"
        enableTorch={isFlashOn}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned || scanMode === 'OCR' ? undefined : handleBarCodeScanned}
      />

      <View style={styles.maskContainer}>
        <View style={styles.cutout} />
      </View>

      <View style={styles.scanFrameWrapper}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLinePosition }] }]} />
        </View>
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="x" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsFlashOn(!isFlashOn)} style={styles.iconBtn}>
          <Ionicons name={isFlashOn ? "flash" : "flash-off"} size={26} color={isFlashOn ? "#F59E0B" : "#FFF"} />
        </TouchableOpacity>
      </View>

      <Text style={styles.instructionText}>
        {scanMode === 'QR' ? 'Đưa mã QR vào khung hình' : 'Đưa hóa đơn vào khung hình'}
      </Text>

      <View style={styles.bottomSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabBtn, scanMode === 'QR' && styles.tabBtnActive]} onPress={() => setScanMode('QR')}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={scanMode === 'QR' ? '#FFF' : '#9CA3AF'} />
            <Text style={[styles.tabText, scanMode === 'QR' && styles.tabTextActive]}>QR Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabBtn, scanMode === 'OCR' && styles.tabBtnActive]} onPress={() => setScanMode('OCR')}>
            <Ionicons name="receipt-outline" size={20} color={scanMode === 'OCR' ? '#FFF' : '#9CA3AF'} />
            <Text style={[styles.tabText, scanMode === 'OCR' && styles.tabTextActive]}>Scan Receipt</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImageFromGallery}>
            <View style={styles.actionIconBox}>
              <Feather name="image" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionBtnText}>Thư viện</Text>
          </TouchableOpacity>

          {/* 💡 NÚT MỞ MÃ QR CỦA TÔI */}
          {scanMode === 'QR' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setIsMyQrVisible(true)}>
              <View style={styles.actionIconBox}>
                <Ionicons name="qr-code" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionBtnText}>Mã của tôi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── MODAL: MÃ QR CỦA TÔI ─── */}
      <Modal visible={isMyQrVisible} transparent={true} animationType="slide" onRequestClose={() => setIsMyQrVisible(false)}>
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20}}>
              <Text style={styles.qrModalTitle}>Mã nhận tiền</Text>
              <TouchableOpacity onPress={() => setIsMyQrVisible(false)} style={{padding: 4}}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={myQrData}
                size={220}
                color="#15476C"
                backgroundColor="#FFFFFF"
                logo={{ uri: userInfo.avatar || 'https://ui-avatars.com/api/?name=U' }} 
                logoSize={46}
                logoBackgroundColor='#fff'
                logoBorderRadius={23}
              />
            </View>

            <Text style={styles.qrUserName}>{userInfo.name || 'Đang tải...'}</Text>
            <Text style={styles.qrHelperText}>Đưa mã này cho người khác quét để nhận tiền nhanh chóng.</Text>

            <TouchableOpacity style={styles.btnDownloadQr} onPress={() => Alert.alert('Thành công', 'Tính năng tải mã đang được phát triển!')}>
              <Feather name="download" size={20} color="#15476C" style={{marginRight: 8}} />
              <Text style={styles.btnDownloadText}>Tải mã xuống</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionBtn: { backgroundColor: '#15476C', padding: 12, borderRadius: 20, marginTop: 10 },
  permissionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  maskContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  cutout: { width: SCAN_FRAME_SIZE + BORDER_WIDTH * 2, height: SCAN_FRAME_SIZE + BORDER_WIDTH * 2, borderWidth: BORDER_WIDTH, borderColor: 'rgba(0,0,0,0.65)', borderRadius: BORDER_WIDTH + CUTOUT_RADIUS, position: 'absolute' },
  scanFrameWrapper: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  scanFrame: { width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE, backgroundColor: 'transparent', borderRadius: CUTOUT_RADIUS, overflow: 'hidden' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FFF', borderWidth: 4 },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: CUTOUT_RADIUS },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: CUTOUT_RADIUS },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: CUTOUT_RADIUS },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: CUTOUT_RADIUS },
  scanLine: { width: '100%', height: 3, backgroundColor: '#38BDF8', shadowColor: '#38BDF8', shadowOpacity: 1, shadowRadius: 10, elevation: 5 },
  header: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 40) + 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  iconBtn: { padding: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 24 },
  instructionText: { position: 'absolute', top: (height / 2) + (SCAN_FRAME_SIZE / 2) + 30, width: '100%', color: '#FFF', fontSize: 16, fontWeight: '500', textAlign: 'center', zIndex: 10 },
  bottomSection: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 30, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, padding: 6, marginBottom: 30 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24 },
  tabBtnActive: { backgroundColor: '#15476C' }, 
  tabText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  tabTextActive: { color: '#FFF' },
  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 60, width: '100%' },
  actionBtn: { alignItems: 'center', justifyContent: 'center' },
  actionIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '500', marginTop: 10 },

  // ─── STYLES CHO MODAL QR ───
  qrModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrModalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center' },
  qrModalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937' },
  qrCodeWrapper: { padding: 16, backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, marginBottom: 20 },
  qrUserName: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#15476C', marginBottom: 8 },
  qrHelperText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 10 },
  btnDownloadQr: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F6FF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16 },
  btnDownloadText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#15476C' },
});