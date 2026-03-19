import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const SuccessIllustration = () => (
  <View style={styles.illustrationContainer}>
    <View style={styles.backgroundBlob} />

    <View style={styles.shieldContainer}>
      <MaterialCommunityIcons name="shield-check" size={80} color="#15476C" />
    </View>
    <View style={styles.lockIcon}>
      <Feather name="lock" size={24} color="#FFAF2A" />
    </View>
    <View style={styles.keyIcon}>
      <MaterialCommunityIcons name="key" size={32} color="#FFAF2A" />
    </View>
  </View>
);

export default function ChangePasswordSuccessScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── Header ─── */}
      <View style={styles.headerArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/login")} 
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={28} color="#343434" />
        </TouchableOpacity>
      </View>

      {/* ─── Content ─── */}
      <View style={styles.content}>
        <SuccessIllustration />

        <Text style={styles.title}>
          Change password{"\n"}successfully!
        </Text>

        <Text style={styles.subtitle}>
          You have successfully changed password.{"\n"}
          Please use the new password when Sign in.
        </Text>
      </View>

      {/* ─── Footer / Button ─── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnOk}
          activeOpacity={0.8}
          onPress={() => {
            router.push("/login");
          }}
        >
          <Text style={styles.btnText}>Ok</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerArea: {
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: -40, 
  },
  
  illustrationContainer: {
    width: 200,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "relative",
  },
  backgroundBlob: {
    position: "absolute",
    bottom: 20,
    width: 180,
    height: 60,
    backgroundColor: "#F2F1F9",
    borderRadius: 30, 
  },
  shieldContainer: {
    zIndex: 10,
    marginBottom: 10,
  },
  lockIcon: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  keyIcon: {
    position: "absolute",
    bottom: 15,
    left: 40,
    transform: [{ rotate: "45deg" }],
  },

  // ── Typography ──
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: "#15476C", 
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  btnOk: {
    height: 52,
    backgroundColor: "#15476C",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#15476C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});