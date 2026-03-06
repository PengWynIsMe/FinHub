import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Khai báo Type/Interface để dùng chung
export type Member = {
  id: string;
  avatar: string | null;
};

export type GroupData = {
  id: string;
  name: string;
  role: string;
  balance: string;
  coverImage: string;
  members: Member[];
};

// Khai báo Props cho Component
interface GroupCardProps {
  group: GroupData;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity 
      style={styles.groupCard}
      activeOpacity={0.8}
      onPress={() => {
        // Chuyển hướng sang trang chi tiết và truyền theo params (id và tên nhóm)
        router.push({
          pathname: '/group/[id]',
          params: { id: group.id, name: group.name }
        });
      }}
    >
      <View style={styles.cardTop}>
        <Image source={{ uri: group.coverImage }} style={styles.coverImage} />
        
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Feather name="eye" size={20} color="#6B7280" />
          </View>

          <View style={styles.avatarsContainer}>
            {group.members.map((member, index) => (
              <View 
                key={member.id} 
                style={[
                  styles.avatarWrapper, 
                  { marginLeft: index > 0 ? -12 : 0 }
                ]}
              >
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.detailText}>
          Your role : <Text style={styles.detailBold}>{group.role}</Text>
        </Text>
        <Text style={styles.detailText}>
          Available balance : <Text style={styles.detailBold}>{group.balance}</Text> VND
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', marginBottom: 16 },
  coverImage: { width: 80, height: 80, borderRadius: 16, marginRight: 16 },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  groupName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  avatarsContainer: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    borderColor: '#FFFFFF', backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: '#EAF4FA' },
  cardBottom: { gap: 8 },
  detailText: { fontSize: 14, color: '#4B5563' },
  detailBold: { fontWeight: '700', color: '#000000' },
});