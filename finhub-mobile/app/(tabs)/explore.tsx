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

// --- mockdata
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

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ─── AI Assistant ─── */}
      <TouchableOpacity
        style={styles.aiContainer}
        activeOpacity={0.8}
        onPress={() => {
          console.log("Mở trợ lý AI...");
          router.push("/modal/ai-assistant");
        }}
      >

        <View style={styles.chatBubble}>
          <Text style={styles.chatText}>Hello there! 🙋‍♂️</Text>
        </View>
        
        {/* Linh vật */}
        <View style={styles.dogAvatarContainer}>
          <Text style={styles.dogEmoji}>🦊</Text> 
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F6FF", 
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18, 
    color: "#343434",
    lineHeight: 28,
    marginBottom: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 24,
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
    width: "33.33%", 
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F4F6F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconText: {
    fontSize: 24,
  },
  menuLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: "#000000",
    textAlign: "center",
    lineHeight: 16,
  },

  // ── AI Assistant ──
  aiContainer: {
    position: "absolute",
    bottom: 120,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    zIndex: 100,
  },
  chatBubble: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 15,
    marginRight: 8,
    marginBottom: 10,
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
    backgroundColor: "#FFFFFF", 
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