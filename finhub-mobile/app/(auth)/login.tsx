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
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../../src/stores/auth.store";


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

// ─── Login Illustration ──────────────────────────────────────────────────
const LoginIllustration = () => (
  <View style={styles.illustrationWrapper}>
    <View style={styles.illustrationCircle}>
      <Feather name="lock" size={36} color="#FFFFFF" />
    </View>
    <FloatingDot color="#52D5BA" size={8} style={{ top: "35%", left: "-5%" }} delay={0} />
    <FloatingDot color="#15476C" size={10} style={{ top: "-5%", left: "30%" }} delay={500} />
    <FloatingDot color="#FF4267" size={18} style={{ top: "10%", right: "-10%" }} delay={1000} />
    <FloatingDot color="#C82A75" size={8} style={{ bottom: "25%", right: "-5%" }} delay={800} />
    <FloatingDot color="#FFAF2A" size={14} style={{ bottom: "15%", left: "5%" }} delay={1500} />
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      router.replace("/(tabs)/home");
    } else {
      const errorMsg = useAuthStore.getState().error;
      Alert.alert("Lỗi", errorMsg || "Đăng nhập thất bại.");
    }
  };

  // Ép kiểu về đúng Boolean để tránh render nhầm text
  const isFormValid = Boolean(email.trim() && password.trim());

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#15476C" />

      <View style={styles.headerArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign in</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeSub}>
          Hello there, sign in to{"\n"}continue
        </Text>

        <LoginIllustration />

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#CACACA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

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

          <TouchableOpacity style={styles.forgotPasswordBtn} activeOpacity={0.7}
           onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot your{"\n"}password ?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSignin, isFormValid && !isLoading ? styles.btnActive : styles.btnDisabled]}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.8}
            onPress={handleLogin}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnText, !isFormValid && styles.btnTextDisabled]}>
                Sign in
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.fingerprintBtn} activeOpacity={0.7}>
            <Ionicons name="finger-print" size={56} color="#15476C" />
          </TouchableOpacity>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
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
  illustrationWrapper: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1C6B9A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
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
    marginBottom: 8,
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
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginBottom: 32,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#CACACA",
    textAlign: "right",
    lineHeight: 18,
  },
  btnSignin: {
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
  fingerprintBtn: {
    alignSelf: "center",
    marginBottom: 40,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  signupText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666666",
  },
  signupLink: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#15476C",
  },
});