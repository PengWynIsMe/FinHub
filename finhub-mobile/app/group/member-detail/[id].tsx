import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const WYN_WALLETS = [
  { id: '2', name: 'Pocket money', icon: '🧸', allocated: 500000, spent: 0, color: '#F59E0B' },
];

const formatVND = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function MemberDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={32} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ─── PROFILE ─── */}
        <View style={styles.profileSection}>
          <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={styles.bigAvatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Wyn</Text>
            
            <View style={styles.roleRow}>
              <Text style={styles.profileRole}>Role : <Text style={styles.profileRoleBold}>Member</Text></Text>
              {/* Nút role */}
              <TouchableOpacity style={styles.swapRoleBtn}>
                <MaterialIcons name="swap-horiz" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Toggle cấp quyền Global View */}
             <TouchableOpacity style={styles.permissionToggle}>
              <Feather name="eye" size={16} color="#10B981" />
              <Text style={styles.permissionText}>Global View Access: ON</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── WALLETS INVOLVED ─── */}
        <Text style={styles.sectionTitle}>Involved Wallets</Text>
        
        {WYN_WALLETS.map((item) => {
          const remaining = item.allocated - item.spent;
          const progress = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
          return (
            <View key={item.id} style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.emoji}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardAllocated}>Allocated: {formatVND(item.allocated)}VNĐ</Text>
                </View>
                <TouchableOpacity><Feather name="more-horizontal" size={20} color="#1F2937" /></TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statLabel}>Spent</Text>
                  <Text style={styles.statValue}>{formatVND(item.spent)}VNĐ</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={styles.statValue}>{formatVND(remaining)}VNĐ</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: item.color }]} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E3F6FF' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingTop: Platform.OS === 'android' ? 40 : 20, 
        paddingBottom: 20 
        },
    backButton: { 
        paddingRight: 12, 
    },
    headerTitle: { 
        fontFamily: 'Poppins_600SemiBold', 
        fontSize: 28, 
        color: '#000000' 
    },
    scrollContent: { paddingHorizontal: 20 },
  
  // Profile
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  bigAvatar: { width: 80, height: 80, borderRadius: 40, marginRight: 20, backgroundColor: '#F3F4F6' },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Poppins_500Medium', fontSize: 24, color: '#1F2937', marginBottom: 4 },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  profileRole: { fontFamily: 'Poppins_400Regular', fontSize: 18, color: '#1F2937' },
  profileRoleBold: { fontFamily: 'Poppins_600SemiBold', color: '#000000' },
  swapRoleBtn: { marginLeft: 16 },
  permissionToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  permissionText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#10B981', marginLeft: 4 },

  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1F2937', marginBottom: 16 },

  // Wallet Card 
  walletCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  walletHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji: { fontSize: 22 },
  cardName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#000000' },
  cardAllocated: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#6B7280' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' },
  statValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#000000' },
  progressContainer: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
});