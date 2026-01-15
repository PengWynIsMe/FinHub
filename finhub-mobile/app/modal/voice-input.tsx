import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

export default function VoiceInputScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'vietnamese'>('vietnamese');
  const [isRecording, setIsRecording] = useState(true);

  // Giả lập hiệu ứng sóng âm (Optional: Animation đơn giản)
  // Nếu muốn mượt hơn, sau này chúng ta dùng Reanimated
  const [bars, setBars] = useState([8, 15, 22, 18, 12, 25, 20, 14, 19, 23, 16, 10, 20, 24, 18]);
  
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      // Random chiều cao để tạo hiệu ứng đang nói
      setBars(prev => prev.map(() => Math.floor(Math.random() * 20) + 8));
    }, 150);
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Close Button */}
      <View style={styles.header}>
        <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => router.back()} //Đóng Modal
        >
          <Ionicons name="close" size={24} color="#C0C0C0" />
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            selectedLanguage === 'english' && styles.languageButtonActive,
          ]}
          onPress={() => setSelectedLanguage('english')}
        >
          <Text style={styles.flagIcon}>🇺🇸</Text>
          <Text
            style={[
              styles.languageText,
              selectedLanguage === 'english' && styles.languageTextActive,
            ]}
          >
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageButton,
            selectedLanguage === 'vietnamese' && styles.languageButtonActive,
          ]}
          onPress={() => setSelectedLanguage('vietnamese')}
        >
          <Text style={styles.flagIcon}>🇻🇳</Text>
          <Text
            style={[
              styles.languageText,
              selectedLanguage === 'vietnamese' && styles.languageTextActive,
            ]}
          >
            Tiếng Việt
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voice Wave Animation */}
      <View style={styles.waveContainer}>
        <View style={styles.waveRow}>
          {/* Left dots */}
          <View style={styles.dotsLeft}>
            {[1, 2, 3].map((i) => (
              <View key={`dot-left-${i}`} style={styles.dot} />
            ))}
          </View>

          {/* Center bars (Animated) */}
          <View style={styles.bars}>
            {bars.map((height, i) => (
                <View
                  key={`bar-${i}`}
                  style={[styles.bar, { height: height }]}
                />
              )
            )}
          </View>

          {/* Right dots */}
          <View style={styles.dotsRight}>
            {[1, 2, 3].map((i) => (
              <View key={`dot-right-${i}`} style={styles.dot} />
            ))}
          </View>
        </View>
      </View>

      {/* Transcribed Text */}
      <View style={styles.textContainer}>
        <Text style={styles.transcribedText}>
          {isRecording ? "Đang nghe..." : "Eat fried chicken for 75.000đ"}
        </Text>
      </View>

      {/* Stop/Start Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.stopButton, !isRecording && { backgroundColor: COLORS.budgetTravel }]} 
          onPress={() => setIsRecording(!isRecording)}
          activeOpacity={0.8}
        >
          <View style={styles.stopIconContainer}>
             {isRecording ? (
                <View style={styles.stopIcon} />
             ) : (
                <Ionicons name="mic" size={32} color="white" />
             )}
          </View>
        </TouchableOpacity>
        <Text style={styles.stopText}>
            {isRecording ? "Press to stop" : "Tap to speak"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 60,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  languageButtonActive: {
    backgroundColor: COLORS.primary, // Dùng màu từ Theme
  },
  flagIcon: {
    fontSize: 18,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  languageTextActive: {
    color: '#fff',
  },
  waveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: 100, 
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotsLeft: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dotsRight: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 120, // Chiều cao tối đa của sóng
  },
  bar: {
    width: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 32,
    minHeight: 100,
  },
  transcribedText: {
    fontSize: 20,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  stopIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  stopText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '500',
  },
});