import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../../src/stores/auth.store";

// ─── Floating Dot Component ──────────────────────────────────────────────
interface FloatingDotProps {
  color: string;
  size: number;
  style: object;
  delay?: number;
}

const FloatingDot: React.FC<FloatingDotProps> = ({ color, size, style, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }],
        },
        style,
      ]}
    />
  );
};

// ─── Phone Illustration ──────────────────────────────────────────────────
const PhoneIllustration = () => (
  <View style={styles.illustrationWrapper}>
    {/* Background circle */}
    <View style={styles.illustrationCircle} />

    {/* Floating dots */}
    <FloatingDot color="#15476C" size={7} style={{ top: 8, left: "58%" }} delay={0} />
    <FloatingDot color="#FF4267" size={18} style={{ top: 0, right: 10 }} delay={500} />
    <FloatingDot color="#0890FE" size={7} style={{ bottom: 20, right: 8 }} delay={1000} />
    <FloatingDot color="#FFAF2A" size={14} style={{ bottom: 8, left: 0 }} delay={1500} />
    <FloatingDot color="#52D5BA" size={7} style={{ top: "55%", left: 16 }} delay={800} />

    {/* Phone card */}
    <View style={styles.phoneCard}>
      <View style={styles.phoneCardLine} />
      <View style={styles.phoneCardBox}>
        <View style={styles.phoneCardCircle} />
      </View>
      <View style={[styles.phoneCardLine, { width: 15, marginBottom: 2 }]} />
      <View style={[styles.phoneCardLine, { width: 11, opacity: 0.4 }]} />
    </View>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const register = useAuthStore(state => state.register);
  const isLoading = useAuthStore(state => state.isLoading);

  const handleRegister = async () => {
    const success = await register(name, email, password);
    if (success) {
      Alert.alert("Thành công", "Đăng ký thành công!", [
        { text: "OK", onPress: () => router.replace("/login") }
      ]);
    } else {
      const errorMsg = useAuthStore.getState().error;
      Alert.alert("Lỗi", errorMsg || "Đăng ký thất bại.");
    }
  };

  // Validation
  const isFormValid = Boolean(name.trim() && email.trim() && password.trim() && agreed);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#15476C" />

      {/* Header Area */}
      <View style={styles.headerArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign up</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeSub}>
          Hello there, create a New account
        </Text>

        <PhoneIllustration />

        <View style={styles.formContainer}>
          {/* Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#CACACA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#CACACA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#CACACA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={18}
                color="#CACACA"
              />
            </TouchableOpacity>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsRow}>
            <Pressable
              style={[styles.checkbox, agreed && styles.checkboxChecked]}
              onPress={() => setAgreed(!agreed)}
            >
              {agreed && <Feather name="check" size={12} color="#fff" />}
            </Pressable>
            <Text style={styles.termsText}>
              By creating an account you agree to our{" "}
              <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.btnSignup, isFormValid && !isLoading ? styles.btnActive : styles.btnDisabled]}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.8}
            onPress={handleRegister}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnText, !isFormValid && styles.btnTextDisabled]}>
                Sign up
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.signinLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#15476C",
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
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#FFFFFF",
  },

  // ── Scroll Content (White Sheet) ──
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 30,
  },
  welcomeSub: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#343434",
    lineHeight: 22,
    marginBottom: 24,
  },

  // ── Illustration ──
  illustrationWrapper: {
    width: 152,
    height: 114,
    alignSelf: "center",
    marginBottom: 32,
    position: "relative",
  },
  illustrationCircle: {
    position: "absolute",
    width: 107,
    height: 103,
    borderRadius: 54,
    backgroundColor: "#F2F1F9",
    top: "5%",
    left: "17%",
  },
  phoneCard: {
    position: "absolute",
    width: 36,
    height: 64,
    backgroundColor: "#5655B9",
    borderRadius: 6,
    top: "10%",
    left: "37%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  phoneCardLine: {
    width: 21,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 2,
    marginBottom: 3,
  },
  phoneCardBox: {
    width: 21,
    height: 19,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  phoneCardCircle: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 4,
  },

  // ── Form Inputs ──
  formContainer: {
    width: "100%",
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 24,
    paddingHorizontal: 20,
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#343434",
    marginBottom: 16,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 48,
    marginBottom: 16, // Khoảng cách tới checkbox
  },
  passwordInput: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#343434",
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Terms & Conditions ──
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#BFBFBF",
    borderRadius: 5,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#15476C",
    borderColor: "#15476C",
  },
  termsText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: "Poppins_600SemiBold",
    color: "#15476C",
  },

  // ── Sign Up Button ──
  btnSignup: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
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
    fontSize: 15,
    color: "#fff",
  },
  btnTextDisabled: {
    color: "#CACACA",
  },

  // ── Sign In Link ──
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  signinText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#666666",
  },
  signinLink: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#15476C",
  },
});