import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

import { BudgetCard, BudgetItem } from '@/components/wallet/BudgetCard';

export default function SharedSavingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const groupId = (params.groupId || params.id) as string;

  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  
  // 💡 1. THÊM STATE QUẢN LÝ TABS
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useFocusEffect(
    useCallback(() => {
      const fetchGoals = async () => {
        if (!groupId) {
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        try {
          const res = await axiosClient.get(`/Goal/group/${groupId}`);
          if (Array.isArray(res.data)) {
            setGoals(res.data);
          } else {
            setGoals([]);
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách quỹ:", error);
          setGoals([]); 
        } finally {
          setIsLoading(false);
        }
      };
      fetchGoals();
    }, [groupId])
  );

  // 💡 2. FILTER DANH SÁCH THEO TRẠNG THÁI
  const activeGoals = goals.filter(g => g.status !== 'Completed');
  const historyGoals = goals.filter(g => g.status === 'Completed');
  
  // Danh sách hiện tại đang được chọn để hiển thị
  const displayGoals = activeTab === 'active' ? activeGoals : historyGoals;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shared Saving Goals</Text>
      </View>

      {/* 💡 3. GIAO DIỆN 2 TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'active' && styles.activeTabButton]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Đang thực hiện</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Lịch sử</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#15476C" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Nút Tạo quỹ mới CHỈ HIỆN ở Tab Đang thực hiện */}
          {activeTab === 'active' && (
            <TouchableOpacity 
              style={styles.btnAddGoal} 
              activeOpacity={0.8}
              onPress={() => {
                if (!groupId) return;
                router.push({
                  pathname: '/group/create-shared',
                  params: { type: 'saving', action: 'create', groupId: groupId }
                });
              }}
            >
              <Feather name="plus-circle" size={20} color="#15476C" style={{ marginRight: 8 }} />
              <Text style={styles.btnAddGoalText}>Create New Goal</Text>
            </TouchableOpacity>
          )}

          {/* Hiển thị danh sách dựa trên Tab đang chọn */}
          {displayGoals.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Feather name="archive" size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
              <Text style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Poppins_400Regular' }}>
                {activeTab === 'active' 
                  ? 'Chưa có mục tiêu tiết kiệm nào đang chạy.' 
                  : 'Chưa có quỹ mục tiêu nào được hoàn thành.'}
              </Text>
            </View>
          ) : (
            displayGoals.map((goal) => (
              <BudgetCard 
                key={goal.id} 
                item={goal} 
                onPress={(item) => {
                  router.push(`/group/saving-detail/${goal.id}`);
                }}
              />
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 10,
  },
  backButton: { paddingRight: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  
  // Styles mới cho Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#15476C', // Gạch dưới xanh đậm
  },
  tabText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#9CA3AF',
  },
  activeTabText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#15476C',
  },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
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
  btnAddGoalText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#15476C' },
});