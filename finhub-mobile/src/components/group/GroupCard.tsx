import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosClient from '@/api/axiosClient'; // Đảm bảo đường dẫn này đúng với dự án của bạn

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
  // Thêm prop onSuccess để màn hình cha (danh sách nhóm) biết mà gọi API load lại data sau khi xóa
  onSuccess?: () => void; 
}

export const GroupCard = ({ group, onSuccess }: GroupCardProps) => {
  const router = useRouter();
  
  // Trạng thái quản lý ẩn/hiện số dư
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // 💡 LOGIC XỬ LÝ KHI BẤM NÚT 3 CHẤM
  const handleMoreOptions = () => {
    const isAdmin = group.role === 'Admin';
    
    // Tự động đổi nội dung cảnh báo dựa theo Role
    const title = isAdmin ? 'Giải tán nhóm' : 'Rời khỏi nhóm';
    const message = isAdmin
        ? `Bạn có chắc chắn muốn giải tán nhóm "${group.name}" không?\n\nSố dư hiện tại sẽ hoàn về ví mặc định của chủ nhóm.`
        : `Bạn có chắc chắn muốn rời khỏi nhóm "${group.name}" không?`;

    Alert.alert(
        title,
        message,
        [
            { text: 'Hủy', style: 'cancel' },
            {
                text: isAdmin ? 'Giải tán' : 'Rời nhóm',
                style: 'destructive', // Nút màu đỏ (trên iOS) để cảnh báo hành động nguy hiểm
                onPress: async () => {
                    try {
                        // Gọi API Xóa / Rời nhóm mà chúng ta vừa viết bên C#
                        await axiosClient.delete(`/Group/${group.id}/leave`);
                        
                        Alert.alert(
                          'Thành công', 
                          isAdmin ? 'Đã giải tán nhóm và hoàn tiền!' : 'Đã rời khỏi nhóm!'
                        );
                        
                        // Kích hoạt hàm load lại danh sách từ màn hình cha (nếu có)
                        if (onSuccess) {
                          onSuccess();
                        }
                    } catch (error: any) {
                        console.error('Lỗi khi rời/xóa nhóm:', error);
                        Alert.alert(
                          'Lỗi', 
                          error.response?.data?.Message || 'Không thể thực hiện yêu cầu lúc này.'
                        );
                    }
                }
            }
        ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.groupCard}
      activeOpacity={0.8}
      onPress={() => {
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
            {/* 1. Nhóm Tên và Icon Mắt */}
            <View style={styles.nameAndEyeWrapper}>
              <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={(e) => {
                  e.stopPropagation(); 
                  setIsBalanceHidden(!isBalanceHidden);
                }}
              >
                <Feather name={isBalanceHidden ? "eye-off" : "eye"} size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* 2. Nút 3 chấm mở hộp thoại */}
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={(e) => {
                e.stopPropagation(); // Ngăn nhảy trang khi bấm 3 chấm
                handleMoreOptions(); // 👈 Gọi logic xử lý
              }}
            >
              <Feather name="more-horizontal" size={20} color="#6B7280" />
            </TouchableOpacity>
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
          Available balance : <Text style={styles.detailBold}>
            {isBalanceHidden ? '******' : group.balance}
          </Text> VND
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
  nameAndEyeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
    paddingRight: 8,
  },
  groupName: { fontSize: 16, fontWeight: '700', color: '#1F2937', flexShrink: 1 },
  eyeButton: { padding: 4, marginLeft: 4 },
  moreButton: { padding: 4 },
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