import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

// ─── THÔNG SỐ KHUNG QUÉT ───
const SCAN_FRAME_SIZE = width * 0.7; // Tăng lên 70% màn hình cho dễ quét
const CUTOUT_RADIUS = 24; // Độ bo tròn của cái lỗ hổng
const BORDER_WIDTH = 1000; // Viền khổng lồ để che toàn màn hình

export default function ScanScreen() {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<'QR' | 'OCR'>('QR'); 
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const scanLinePosition = useRef(new Animated.Value(0)).current;

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

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true); 
    Alert.alert(
      "Đã quét được mã!",
      `Nội dung: ${data}`,
      [
        { text: "Quét lại", onPress: () => setScanned(false) },
        { text: "Xử lý", onPress: () => { console.log("Dữ liệu QR:", data); router.back(); } }
      ]
    );
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
      
      {/* 1. CAMERA THẬT (DƯỚI CÙNG) */}
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="back"
        enableTorch={isFlashOn}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned || scanMode === 'OCR' ? undefined : handleBarCodeScanned}
      />

      {/* 2. LỚP PHỦ TỐI CÓ LỖ HỔNG BO TRÒN BÊN TRONG (Massive Border Trick) */}
      <View style={styles.maskContainer}>
        <View style={styles.cutout} />
      </View>

      {/* 3. KHUNG SÁNG, GÓC VIỀN VÀ TIA LASER */}
      <View style={styles.scanFrameWrapper}>
        <View style={styles.scanFrame}>
          {/* 4 Góc trắng bo theo khung */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Tia Laser */}
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLinePosition }] }]} />
        </View>
      </View>

      {/* 4. HEADER (NÚT X VÀ FLASH - ĐÃ ĐƯỢC ĐẨY XUỐNG) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="x" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsFlashOn(!isFlashOn)} style={styles.iconBtn}>
          <Ionicons name={isFlashOn ? "flash" : "flash-off"} size={26} color={isFlashOn ? "#F59E0B" : "#FFF"} />
        </TouchableOpacity>
      </View>

      {/* 5. TEXT HƯỚNG DẪN */}
      <Text style={styles.instructionText}>
        {scanMode === 'QR' ? 'Đưa mã QR vào khung hình' : 'Đưa hóa đơn vào khung hình'}
      </Text>

      {/* 6. BOTTOM CONTROLS */}
      <View style={styles.bottomSection}>
        {/* TABS CHẾ ĐỘ QUÉT */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, scanMode === 'QR' && styles.tabBtnActive]}
            onPress={() => setScanMode('QR')}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={scanMode === 'QR' ? '#FFF' : '#9CA3AF'} />
            <Text style={[styles.tabText, scanMode === 'QR' && styles.tabTextActive]}>QR Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, scanMode === 'OCR' && styles.tabBtnActive]}
            onPress={() => setScanMode('OCR')}
          >
            <Ionicons name="receipt-outline" size={20} color={scanMode === 'OCR' ? '#FFF' : '#9CA3AF'} />
            <Text style={[styles.tabText, scanMode === 'OCR' && styles.tabTextActive]}>Scan Receipt</Text>
          </TouchableOpacity>
        </View>

        {/* NÚT THƯ VIỆN & MÃ CỦA TÔI */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImageFromGallery}>
            <View style={styles.actionIconBox}>
              <Feather name="image" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionBtnText}>Thư viện</Text>
          </TouchableOpacity>

          {scanMode === 'QR' && (
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionIconBox}>
                <Ionicons name="qr-code" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionBtnText}>Mã của tôi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionBtn: { backgroundColor: '#15476C', padding: 12, borderRadius: 20, marginTop: 10 },
  permissionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  // ─── MASK CONTAINER TRICK (Bo góc mượt mà) ───
  maskContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cutout: {
    width: SCAN_FRAME_SIZE + BORDER_WIDTH * 2,
    height: SCAN_FRAME_SIZE + BORDER_WIDTH * 2,
    borderWidth: BORDER_WIDTH,
    borderColor: 'rgba(0,0,0,0.65)',
    borderRadius: BORDER_WIDTH + CUTOUT_RADIUS, // Bí quyết làm viền trong bo góc
    position: 'absolute',
  },

  // ─── KHUNG QUÉT CHÍNH (Góc trắng + Laser) ───
  scanFrameWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    backgroundColor: 'transparent',
    borderRadius: CUTOUT_RADIUS,
    overflow: 'hidden', // Ép laser và góc trắng không lọt ra ngoài vùng bo
  },
  
  // 4 Góc trắng
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FFF', borderWidth: 4 },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: CUTOUT_RADIUS },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: CUTOUT_RADIUS },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: CUTOUT_RADIUS },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: CUTOUT_RADIUS },

  // Tia Laser
  scanLine: { width: '100%', height: 3, backgroundColor: '#38BDF8', shadowColor: '#38BDF8', shadowOpacity: 1, shadowRadius: 10, elevation: 5 },

  // ─── HEADER (ĐÃ ĐẨY XUỐNG TRÁNH TAI THỎ) ───
  header: { 
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 40) + 20, // Tự căn chuẩn theo iOS/Android
    left: 20,
    right: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    zIndex: 10,
  },
  iconBtn: { padding: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 24 },

  // ─── TEXT HƯỚNG DẪN ───
  instructionText: { 
    position: 'absolute',
    top: (height / 2) + (SCAN_FRAME_SIZE / 2) + 30, // Nằm ngay dưới khung quét
    width: '100%',
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '500', 
    textAlign: 'center', 
    zIndex: 10,
  },

  // ─── BOTTOM CONTROLS ───
  bottomSection: { 
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 0,
    right: 0,
    alignItems: 'center', 
    zIndex: 10,
  },
  
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, padding: 6, marginBottom: 30 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24 },
  tabBtnActive: { backgroundColor: '#15476C' }, 
  tabText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  tabTextActive: { color: '#FFF' },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 60, width: '100%' },
  actionBtn: { alignItems: 'center', justifyContent: 'center' },
  actionIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '500', marginTop: 10 },
});