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

// QUAN TRỌNG: Import Component và Type từ thư mục src
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

// Dữ liệu giả lập
const MOCK_GROUPS: GroupData[] = [
  {
    id: '1',
    name: 'My Family <3',
    role: 'Admin',
    balance: '10,000,000',
    coverImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=200&auto=format&fit=crop',
    members: [
      { id: 'm1', avatar: 'https://i.pravatar.cc/100?img=11' },
      { id: 'm2', avatar: null },
      { id: 'm3', avatar: null },
      { id: 'm4', avatar: null },
    ],
  },
];

export default function GroupScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupData[]>(MOCK_GROUPS); 

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

      {/* RENDER COMPONENT Ở ĐÂY */}
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

      {groups.length > 0 ? renderGroupList() : renderEmptyState()}
    </SafeAreaView>
  );
}

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