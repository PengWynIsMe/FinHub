import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { formatCurrencyVND } from '@/utils/format';
import { getBudgetProgressColor } from '@/utils/format';

// Đã cập nhật Interface để map đúng với Dữ liệu Backend trả về
export interface BudgetItem {
  budgetId: string;     // Backend trả về budgetId chứ không phải id
  name: string;
  icon: string | null;  // Có thể là Feather name, hoặc URI ảnh, hoặc null
  allocated: number;  // Backend trả về amountLimit
  spent?: number; // Backend có thể sẽ trả về spentAmount (nếu chưa có thì tạm để 0)
  color: string;
}

interface BudgetCardProps {
  item: BudgetItem;
  type?: 'budget' | 'saving';
  onPress?: (item: BudgetItem) => void;
  onDelete?: (item: BudgetItem) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ item, onPress, onDelete }) => {
  const allocated = item.allocated || 0;
  const spent = item.spent || 0; 
  const remaining = allocated - spent;
  const progress = allocated > 0 ? (spent / allocated) * 100 : 0;
  const progressColor = getBudgetProgressColor(spent, allocated);
  
  const renderIcon = () => {
    // 1. Nếu là đường dẫn ảnh (có chứa http hoặc file://)
    if (item.icon && (item.icon.startsWith('http') || item.icon.startsWith('file:///'))) {
      return (
        <Image 
          source={{ uri: item.icon }} 
          style={{ width: '100%', height: '100%', borderRadius: RADIUS.md }} 
        />
      );
    }
    
    // 2. Nếu là tên Icon của Feather (chữ thường, ví dụ: 'coffee', 'shopping-cart')
    if (item.icon && /^[a-z\-]+$/.test(item.icon)) {
      return <Feather name={item.icon as any} size={20} color={item.color || COLORS.primary} />;
    }

    // 3. Mặc định (Nếu là emoji cũ hoặc rỗng)
    return <Text style={styles.iconText}>{item.icon || '💰'}</Text>;
  };

  const handleMorePress = () => {
    onDelete && onDelete(item);
  };
  

  return (
    <TouchableOpacity 
      style={styles.budgetCard} 
      activeOpacity={0.9}
      onPress={() => onPress && onPress(item)}
    >
      <View style={styles.budgetCardHeader}>
        {/* KHUNG CHỨA ICON */}
        <View style={[styles.iconContainer, { backgroundColor: (item.color || COLORS.primary) + '20' }]}> 
          {renderIcon()}
        </View>

        <View style={styles.budgetInfo}>
          <Text style={styles.budgetName}>{item.name}</Text>
          <Text style={styles.budgetAllocated}>
            Allocated: {formatCurrencyVND(allocated)}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
          <Feather name="more-horizontal" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>{formatCurrencyVND(spent)}</Text>
        </View>
        <View style={styles.statRightAlign}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={styles.statValue}>
            {formatCurrencyVND(remaining)}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
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
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },
});