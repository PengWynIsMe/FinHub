import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Import các hằng số và hàm tiện ích từ Clean Architecture layers
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { formatCurrencyVND } from '@/utils/format';

// Định nghĩa Interface cho dữ liệu đầu vào
// (Sau này bạn có thể chuyển interface này vào 'src/domain/entities/Budget.ts')
export interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  allocated: number;
  spent: number;
  color: string;
}

interface BudgetCardProps {
  item: BudgetItem;
  onPress?: (item: BudgetItem) => void; // Thêm callback để xử lý khi user bấm vào card
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ item, onPress }) => {
  // Logic tính toán hiển thị (Presentation Logic)
  const remaining = item.allocated - item.spent;
  const progress = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;

  return (
    <TouchableOpacity 
      style={styles.budgetCard} 
      activeOpacity={0.9}
      onPress={() => onPress && onPress(item)}
    >
      {/* --- Header Row: Icon + Tên + Menu --- */}
      <View style={styles.budgetCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '33' }]}> 
          {/* Note: '33' là thêm độ trong suốt (alpha) cho mã màu HEX */}
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>

        <View style={styles.budgetInfo}>
          <Text style={styles.budgetName}>{item.name}</Text>
          <Text style={styles.budgetAllocated}>
            Allocated: {formatCurrencyVND(item.allocated)}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-horizontal" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {/* --- Stats Row: Số tiền đã chi & Còn lại --- */}
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>{formatCurrencyVND(item.spent)}</Text>
        </View>
        <View style={styles.statRightAlign}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={styles.statValue}>
            {formatCurrencyVND(remaining)}
          </Text>
        </View>
      </View>

      {/* --- Progress Bar --- */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(progress, 100)}%`, // Đảm bảo không vượt quá 100%
              backgroundColor: item.color,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

// Styles riêng biệt cho Component này
const styles = StyleSheet.create({
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Shadow cho Android
    elevation: 3,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: FONT_SIZE.xxl,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.black,
  },
  budgetAllocated: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    padding: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.black,
  },
  statRightAlign: {
    alignItems: 'flex-end',
  },
  progressBarContainer: {
    height: 6, // Tăng nhẹ độ dày để nhìn rõ hơn
    backgroundColor: COLORS.gray200,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },
});