import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");

  // Nút Send chỉ sáng lên khi người dùng đã nhập số điện thoại
  const isFormValid = phoneNumber.trim().length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
        {/* Dùng status bar chữ tối màu vì nền màn hình màu sáng */}
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* ─── Header ─── */}
        <View style={styles.headerArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={28} color="#343434" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot password</Text>
        </View>

        {/* ─── Content ─── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Label */}
            <Text style={styles.inputLabel}>Type your phone number</Text>

            {/* Phone Input */}
            <TextInput
              style={styles.input}
              placeholder="(+84)"
              placeholderTextColor="#CACACA"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad" // Hiển thị bàn phím số
              autoCapitalize="none"
              autoFocus={true} // Tự động mở bàn phím khi vào trang
            />

            {/* Helper Text */}
            <Text style={styles.helperText}>
              We texted you a code to verify your phone number
            </Text>

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.btnSend,
                isFormValid ? styles.btnActive : styles.btnDisabled,
              ]}
              disabled={!isFormValid}
              activeOpacity={0.8}
              onPress={() => {
                console.log("Send recovery code to:", phoneNumber);
                // Chuyển sang trang nhập OTP (nếu có)
                router.push("/verify-otp"); 
              }}
            >
              <Text
                style={[
                  styles.btnText,
                  !isFormValid && styles.btnTextDisabled,
                ]}
              >
                Send
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Nền trắng chuẩn theo thiết kế
  },

  // ── Header ──
  headerArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: "#343434", // Màu chữ xám đen
  },

  // ── Scroll Content ──
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // ── Input Section ──
  inputLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#999999", // Màu xám nhạt như bản vẽ
    marginBottom: 10,
    marginLeft: 4,
  },
  input: {
    height: 52, // Hơi to hơn 1 chút để bấm thoải mái
    borderWidth: 1.5,
    borderColor: "#E5E5E5", // Viền xám nhạt đồng bộ login/register
    borderRadius: 26, // Bo tròn Pill shape
    paddingHorizontal: 20,
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#343434",
    marginBottom: 24,
  },

  // ── Helper Text ──
  helperText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#343434",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 4,
  },

  // ── Send Button ──
  btnSend: {
    height: 52,
    borderRadius: 26, // Pill shape
    alignItems: "center",
    justifyContent: "center",
  },
  btnActive: {
    backgroundColor: "#15476C", // Xanh chủ đạo
    shadowColor: "#15476C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: "#F2F1F9", // Màu xám tím nhạt lúc chưa nhập
  },
  btnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  btnTextDisabled: {
    color: "#FFFFFF", // Theo mockup, nút mờ nhưng chữ bên trong vẫn màu trắng
  },
});