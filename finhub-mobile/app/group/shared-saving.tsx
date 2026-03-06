import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Import Component tái sử dụng
import { BudgetCard, BudgetItem } from '@/components/wallet/BudgetCard';

// ─── DỮ LIỆU GIẢ LẬP (Mục tiêu tiết kiệm) ─────────────────────────────────
const MOCK_SAVING_GOALS: BudgetItem[] = [
  {
    id: 's1',
    name: 'Family Trip to Japan',
    icon: '✈️',
    allocated: 100000000, // Mục tiêu: 100 củ
    spent: 45000000,      // Đã gom được: 45 củ
    color: '#3B82F6',     // Màu xanh dương hy vọng
  },
  {
    id: 's2',
    name: 'New TV for Living Room',
    icon: '📺',
    allocated: 20000000,  // Mục tiêu: 20 củ
    spent: 20000000,      // Đã gom đủ
    color: '#10B981',     // Xanh lá báo hiệu hoàn thành
  },
];

export default function SharedSavingScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<BudgetItem[]>(MOCK_SAVING_GOALS);

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shared Saving Goals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Nút Add New Goal */}
        <TouchableOpacity 
            style={styles.btnAddGoal} 
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: '/group/create-shared',
                params: { type: 'goal', action: 'create' }
              });
            }}
            >
            <Feather name="plus-circle" size={20} color="#15476C" style={{ marginRight: 8 }} />
            <Text style={styles.btnAddGoalText} >Create New Goal</Text>
        </TouchableOpacity>

        {/* Danh sách thẻ mục tiêu */}
        {goals.map((goal) => (
          <BudgetCard 
            key={goal.id} 
            item={goal} 
            onPress={(item) => {
              // Chuyển sang trang detail
              router.push(`/group/saving-detail/${item.id}`);
            }}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20,
  },
  backButton: { paddingRight: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  // Nút thêm goal mang phong cách Outline (Viền) để không tranh chấp với Card
  btnAddGoal: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#15476C',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(21, 71, 108, 0.05)',
  },
  btnAddGoalText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#15476C',
  },
});