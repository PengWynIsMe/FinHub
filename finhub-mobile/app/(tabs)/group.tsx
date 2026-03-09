import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axiosClient from '@/api/axiosClient';

import { GroupCard, GroupData } from "@/components/group/GroupCard"; 

const COLORS = {
  primary: '#15476C',
  background: '#E3F6FF',
  white: '#FFFFFF',
  cardBlue: '#B8D8EC',
  textDark: '#1F2937',
  textGray: '#9CA3AF',
  btnCreate: '#98C1E5',
  btnJoin: '#EAF4FA',
};

export default function GroupScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupData[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // 🆕 TỰ ĐỘNG LẤY DATA THẬT KHI VÀO MÀN HÌNH
  useFocusEffect(
    useCallback(() => {
      const fetchGroups = async () => {
        try {
          const res = await axiosClient.get('/Group');
          setGroups(res.data);
        } catch (error) {
          console.error("Lỗi lấy danh sách nhóm:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchGroups();
    }, [])
  );

  const renderGroupList = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnCreate} activeOpacity={0.8}
         onPress={() => router.push("/group/create")}
        >
          <Text style={styles.btnCreateText}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnJoin} activeOpacity={0.8}
        onPress={() => console.log('Join Group')}
        >
          <Text style={styles.btnJoinText}>Join</Text>
        </TouchableOpacity>
      </View>

      {/* RENDER COMPONENT */}
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContent}>
      <TouchableOpacity
        style={[styles.card, styles.cardBlue]}
        activeOpacity={0.8}
        onPress={() => router.push('/group/create')}
      >
        <Text style={styles.cardTitle}>Create a Group</Text>
        <Text style={styles.cardDescription}>
          Start a new shared wallet for your family, friends, or projects.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.cardWhite]}
        activeOpacity={0.8}
        onPress={() => console.log('Join Group')}
      >
        <Text style={styles.cardTitleDark}>Join a Group</Text>
        <Text style={styles.cardDescriptionGray}>
          Use an invite code or link to join an existing shared wallet.
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role management</Text>
      </View>

      {/* Nếu đang tải thì quay đều */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        groups.length > 0 ? renderGroupList() : renderEmptyState()
      )}
      
    </SafeAreaView>
  );
}

// ─── CSS GIỮ NGUYÊN 100% CỦA BẠN ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20,
  },
  backButton: { paddingRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  actionRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  btnCreate: {
    flex: 1, height: 52, backgroundColor: COLORS.btnCreate,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  btnCreateText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  btnJoin: {
    flex: 1, height: 52, backgroundColor: COLORS.btnJoin,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  btnJoinText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  emptyContent: { flex: 1, padding: 20 },
  card: { borderRadius: 16, padding: 24, marginBottom: 16 },
  cardBlue: { backgroundColor: COLORS.cardBlue },
  cardWhite: { backgroundColor: COLORS.white },
  cardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  cardTitleDark: { fontSize: 20, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  cardDescription: { fontSize: 14, color: COLORS.white, lineHeight: 20 },
  cardDescriptionGray: { fontSize: 14, color: COLORS.textGray, lineHeight: 20 },
});