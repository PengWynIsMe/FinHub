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

export default function VerifyOtpScreen() {
  const [code, setCode] = useState("");

  // Nút Change Password chỉ sáng lên khi đã nhập đủ mã (ví dụ mã 4 số)
  const isFormValid = code.trim().length >= 4;

  // Trong thực tế, số điện thoại này sẽ được truyền qua từ trang trước
  // thông qua router params hoặc state management (Zustand).
  const maskedPhoneNumber = "(+84) 0398829xxx"; 

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
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
            <Text style={styles.inputLabel}>Type a code</Text>

            {/* Input Row: OTP Input & Resend Button */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="0000"
                placeholderTextColor="#CACACA"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad" // Bàn phím số cho việc nhập mã
                maxLength={6} // Thường OTP dài 4-6 số
                autoFocus={true}
              />
              <TouchableOpacity style={styles.btnResend} activeOpacity={0.8}>
                <Text style={styles.btnResendText}>Resend</Text>
              </TouchableOpacity>
            </View>

            {/* Helper Texts */}
            <Text style={styles.helperText}>
              We texted you a code to verify your phone number{" "}
              <Text style={styles.highlightText}>{maskedPhoneNumber}</Text>
            </Text>

            <Text style={styles.subHelperText}>
              This code will expire 10 minutes after this message. If you don't get a message.
            </Text>

            {/* Change Password Button */}
            <TouchableOpacity
              style={[
                styles.btnChangePassword,
                isFormValid ? styles.btnActive : styles.btnDisabled,
              ]}
              disabled={!isFormValid}
              activeOpacity={0.8}
              onPress={() => {
                console.log("Verify code and proceed:", code);
                // Tại đây, sau khi xác thực OTP thành công, 
                // bạn có thể điều hướng user sang trang đặt mật khẩu mới 
                router.push("/change-password");
              }}
            >
              <Text
                style={[
                  styles.btnText,
                  !isFormValid && styles.btnTextDisabled,
                ]}
              >
                Change password
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
    backgroundColor: "#FFFFFF",
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
    color: "#343434",
  },

  // ── Scroll Content ──
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  // ── Input Section ──
  inputLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#999999",
    marginBottom: 10,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // Tạo khoảng cách giữa ô nhập và nút Resend
    marginBottom: 24,
  },
  input: {
    flex: 1, // Chiếm toàn bộ không gian còn lại
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 26,
    paddingHorizontal: 20,
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#343434",
  },
  btnResend: {
    height: 52,
    paddingHorizontal: 24,
    backgroundColor: "#15476C",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  btnResendText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },

  // ── Texts ──
  helperText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#888888", // Màu xám trung tính
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  highlightText: {
    color: "#4A47A3", // Màu tím/navy nhạt như trong thiết kế cho SĐT
    fontFamily: "Poppins_600SemiBold",
  },
  subHelperText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#999999",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 4,
  },

  // ── Change Password Button ──
  btnChangePassword: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  btnActive: {
    backgroundColor: "#15476C",
    shadowColor: "#15476C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: "#F2F1F9",
  },
  btnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  btnTextDisabled: {
    color: "#CACACA",
  },
});