import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AiAssistantScreen() {
  const [inputText, setInputText] = useState("");

  // Các câu hỏi gợi ý (Suggested Prompts)
  const suggestions = [
    "Where should I reduce my spending on?",
    "How can I save more?",
    "Can you list out my biggest expense last week?",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={28} color="#343434" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            
            {/* ─── Chat History Area ─── */}
            <ScrollView
              contentContainerStyle={styles.chatScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* User Bubble */}
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>
                  What would you like to know?
                </Text>
              </View>

              {/* Wyn Avatar Illustration */}
              <View style={styles.avatarSection}>
                <View style={styles.dogAvatar}>
                  {/* Placeholder Avatar - Thay bằng Image thật sau */}
                  <Text style={{ fontSize: 60 }}>🐶</Text>
                </View>
                {/* Bóng mờ dưới Avatar */}
                <View style={styles.avatarShadow} />
              </View>

              {/* Divider Line */}
              <View style={styles.divider} />

              {/* AI Bubble (Wyn) */}
              <View style={styles.aiBubble}>
                <Text style={styles.aiBubbleText}>
                  Hello there, how can I help you?{"\n"}
                  Feel free to ask me anything to get personalised insights on your financial data
                </Text>
              </View>
            </ScrollView>

            {/* ─── Bottom Input Area ─── */}
            <View style={styles.bottomSection}>
              
              {/* Suggested Prompts (Scroll ngang) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContainer}
              >
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionPill}
                    activeOpacity={0.7}
                    onPress={() => setInputText(item)}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Input Row */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ask Wyn"
                  placeholderTextColor="#A0A0A0"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline={false}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (inputText.trim()) {
                      console.log("Gửi tin nhắn:", inputText);
                      setInputText("");
                      Keyboard.dismiss();
                    }
                  }}
                >
                  <Ionicons name="send" size={20} color="#007AFF" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>

              {/* Disclaimer */}
              <Text style={styles.disclaimerText}>
                Wyn is still learning so he can make mistakes
              </Text>

            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  
  // ── Header ──
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    alignSelf: "flex-start",
  },

  // ── Chat Area ──
  chatScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  
  // User Bubble
  userBubble: {
    backgroundColor: "#E8E8E8", // Màu xám theo thiết kế
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4, // Góc nhọn chỉ định người nói
    alignSelf: "flex-end",
    marginBottom: 40,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubbleText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#343434",
    lineHeight: 22,
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  dogAvatar: {
    marginBottom: 8,
    // Ở đây bạn có thể cấu hình width, height nếu dùng <Image> thật
  },
  avatarShadow: {
    width: 60,
    height: 12,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 100, // Tạo hình Elip giả bóng
    transform: [{ scaleY: 0.5 }], // Ép dẹp thành hình elip
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 24,
  },

  // AI Bubble
  aiBubble: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  aiBubbleText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#343434",
    lineHeight: 22,
  },

  // ── Bottom Area ──
  bottomSection: {
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 10 : 20,
    backgroundColor: "#FFFFFF",
  },
  
  // Prompts
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10, // Khoảng cách giữa các pill
  },
  suggestionPill: {
    backgroundColor: "#15476C",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  suggestionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#FFFFFF",
  },

  // Input Row
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#E8E8E8", // Xám nhạt
    borderRadius: 25,
    paddingHorizontal: 20,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#343434",
    marginRight: 12,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Disclaimer
  disclaimerText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 8,
  },
});