import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { formatCurrencyVND } from '@/utils/format';

interface BudgetSummaryCardProps {
  unallocatedMoney: number; 
  monthlySpending: number;  
  onAllocatePress: () => void; 
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  unallocatedMoney,
  monthlySpending,
  onAllocatePress,
}) => {
  return (
    <View style={styles.summaryCard}>
      {/* --- Tiền chưa phân bổ --- */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Unallocated money</Text>
        <Feather name="alert-circle" size={16} color={COLORS.gray500} />
      </View>
      <Text style={styles.summaryAmountLarge}>
        {formatCurrencyVND(unallocatedMoney)}
      </Text>

      {/* --- Chi tiêu tháng này --- */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Spending this month</Text>
        <Feather name="bar-chart-2" size={16} color={COLORS.gray500} />
      </View>
      <Text style={styles.summaryAmountMedium}>
        {formatCurrencyVND(monthlySpending)}
      </Text>

      <TouchableOpacity
        style={styles.allocateButton}
        activeOpacity={0.8}
        onPress={onAllocatePress} 
      >
        <Text style={styles.allocateButtonText}>ALLOCATE MONEY →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    color: COLORS.gray600,
    fontSize: FONT_SIZE.md,
  },
  summaryAmountLarge: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  summaryAmountMedium: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  allocateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  allocateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
});