import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
} from "react-native";

// --- Dữ liệu giả lập (Sau này có icon bạn thay vào thẻ Text nhé) ---
const features = [
  { id: "interface", label: "Interface", icon: "📱" },
  { id: "category", label: "Category", icon: "🗂️" },
  { id: "calculate", label: "Calculate\nSpending", icon: "🧮" },
  { id: "shopping", label: "Shopping List", icon: "🛍️" },
];

const utilities = [
  { id: "explore_ai", label: "Explore AI", icon: "✨" },
  { id: "export_data", label: "Export Data", icon: "📊" },
  { id: "exchange_rates", label: "Exchange\nrates", icon: "💱" },
  { id: "investment", label: "Investment", icon: "💡" },
];

export default function ExploreScreen() {
  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={() => console.log(`Maps to ${item.label}`)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Feature Section ─── */}
        <Text style={styles.sectionTitle}>Feature</Text>
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {features.map(renderMenuItem)}
          </View>
        </View>

        {/* ─── Utilities Section ─── */}
        <Text style={styles.sectionTitle}>Utilities</Text>
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            {utilities.map(renderMenuItem)}
          </View>
        </View>

        {/* Khoảng trống dưới cùng lớn hơn để cuộn thoải mái */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ─── AI Assistant Floating Button ─── */}
      <TouchableOpacity
        style={styles.aiContainer}
        activeOpacity={0.8}
        onPress={() => {
          console.log("Mở trợ lý AI...");
          router.push("/modal/ai-assistant");
          // Gắn router mở modal AI ở đây
        }}
      >
        {/* Bóng thoại chuẩn theo Figma: 15px 15px 0px 15px */}
        <View style={styles.chatBubble}>
          <Text style={styles.chatText}>Hello there! 🙋‍♂️</Text>
        </View>
        
        {/* Avatar Cún */}
        <View style={styles.dogAvatarContainer}>
          <Text style={styles.dogEmoji}>🦊</Text> 
          {/* Lưu ý: Bạn có thể thay bằng thẻ <Image> khi có file Cún thật */}
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F6FF", // Mã màu nền trích xuất từ Figma
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18, // Đưa về 18px theo đúng Figma
    color: "#343434",
    lineHeight: 28,
    marginBottom: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10, // Figma để 5px nhưng 10px sẽ giúp app nhìn hiện đại hơn một chút
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 24,
    // Đổ bóng nhẹ cho Card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  menuItem: {
    width: "33.33%", // 3 cột
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F4F6F8", // Có thể thay bằng trong suốt nếu icon đã có nền
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconText: {
    fontSize: 24,
  },
  menuLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11, // Figma để 8px (quá nhỏ để đọc trên mobile), tôi tăng lên 11px cho UX tốt nhất
    color: "#000000",
    textAlign: "center",
    lineHeight: 16,
  },

  // ── AI Assistant Styles ──
  aiContainer: {
    position: "absolute",
    bottom: 120, // ⬆️ Đã đẩy lên cao hơn nhiều để không sát thanh Navigation
    right: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    zIndex: 100,
  },
  chatBubble: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    // Bo góc chuẩn Figma: Trái trên, Phải trên, Phải dưới(0), Trái dưới
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 15,
    marginRight: 8,
    marginBottom: 10,
    // Đổ bóng bong bóng
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#000000",
  },
  dogAvatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#FFFFFF", // Thay nền cam thành trắng/trong suốt nếu icon là ảnh PNG
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dogEmoji: {
    fontSize: 28,
  },
});