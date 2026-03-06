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

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Tuỳ chọn ẩn/hiện mk

  // Validate: Cả 2 ô đều phải có dữ liệu và phải trùng khớp nhau
  const isFormValid =
    newPassword.length >= 6 && newPassword === confirmPassword;

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
          <Text style={styles.headerTitle}>Change password</Text>
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
            {/* New Password Input */}
            <Text style={styles.inputLabel}>Type your new password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                placeholder="*************"
                placeholderTextColor="#CACACA"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password Input */}
            <Text style={styles.inputLabel}>Confirm password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                placeholder="*************"
                placeholderTextColor="#CACACA"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              style={[
                styles.btnSubmit,
                isFormValid ? styles.btnActive : styles.btnDisabled,
              ]}
              disabled={!isFormValid}
              activeOpacity={0.8}
              onPress={() => {
                console.log("Password changed successfully!");
                // Điều hướng sang màn hình Success
                router.push("/change-password-success");
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

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  headerArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: { padding: 8, marginRight: 4 },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: "#343434",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  inputLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#999999",
    marginBottom: 10,
    marginLeft: 4,
  },
  passwordWrapper: {
    marginBottom: 24,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 26,
    paddingHorizontal: 20,
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#343434",
  },
  btnSubmit: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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