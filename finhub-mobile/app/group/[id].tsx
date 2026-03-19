import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function GroupManagementScreen() {
  const router = useRouter();
  
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const MANAGEMENT_MENUS = [
    {
      id: 'members',
      title: 'Member Management',
      subtitle: 'Manage group members',
      icon: '👥',
      route: '/group/members',
    },
    {
      id: 'wallet',
      title: 'Shared Wallet',
      subtitle: 'Manage group expenses',
      icon: '📈',
      route: '/group/shared-wallet', 
    },
    {
      id: 'saving',
      title: 'Shared Saving Goals',
      subtitle: 'Track shared goals',
      icon: '🎯',
      route: '/group/shared-saving',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name || 'My Group'}</Text>
        </View>

        {/* noti */}
        <TouchableOpacity 
          style={styles.bellButton} 
          activeOpacity={0.7}
          onPress={() => router.push({
            pathname: '/group/notifications',
            params: { name: name } 
          })}
        >
          <Feather name="bell" size={24} color="#9CA3AF" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ─── Content ─── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {MANAGEMENT_MENUS.map((menu) => (
          <TouchableOpacity 
            key={menu.id} 
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => {
              if (menu.route) {
                router.push({
                  pathname: menu.route as any, 
                  params: { id: id }      
                });
              }
            }}
          >
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>{menu.title}</Text>
              <Text style={styles.cardSubtitle}>{menu.subtitle}</Text>
            </View>
            
            <View style={styles.illustrationBox}>
              <Text style={styles.emojiPlaceholder}>{menu.icon}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { paddingRight: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 22, color: '#1F2937' },
  bellButton: { position: 'relative', padding: 4, backgroundColor: '#FFFFFF', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#FF4267', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E3F6FF' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 24, paddingHorizontal: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTextContent: { flex: 1, paddingRight: 16 },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1F2937', marginBottom: 6 },
  cardSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' },
  illustrationBox: { width: 80, height: 60, alignItems: 'flex-end', justifyContent: 'center' },
  emojiPlaceholder: { fontSize: 40 },
  cardImage: { width: 80, height: 60, resizeMode: 'contain' },
});